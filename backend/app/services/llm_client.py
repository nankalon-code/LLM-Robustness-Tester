import httpx
import hashlib
import json
from typing import List, Dict, Any, Optional
from app.config import settings

class LLMClient:
    """
    Unified LLM client supporting local Ollama (Llama 3, Qwen 2.5) and Cloud Groq API endpoints.
    Optimized with persistent connection pooling and in-memory response caching for maximum throughput.
    """
    def __init__(self, provider: str = None, host: str = None, default_model: str = None):
        self.provider = provider or settings.LLM_PROVIDER
        self.host = host or settings.OLLAMA_HOST
        self.default_model = default_model or settings.DEFAULT_MODEL
        self.groq_api_key = settings.GROQ_API_KEY
        
        # Persistent HTTP client with connection pooling and keep-alive
        self._client = httpx.AsyncClient(
            timeout=httpx.Timeout(45.0, connect=5.0),
            limits=httpx.Limits(max_keepalive_connections=30, max_connections=50)
        )
        # Fast in-memory cache to avoid duplicate inference on repeated adversarial probes
        self._cache: Dict[str, str] = {}

    def _cache_key(self, model: str, messages: List[Dict[str, str]], system_prompt: Optional[str], temperature: float) -> str:
        raw = json.dumps({"m": model, "msgs": messages, "sys": system_prompt or "", "t": temperature}, sort_keys=True)
        return hashlib.sha256(raw.encode()).hexdigest()

    async def generate_response(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        system_prompt: Optional[str] = None,
        temperature: float = 0.2
    ) -> str:
        selected_model = model or self.default_model

        # Parse provider prefix if provided (e.g. 'groq:llama3-8b-8192' or 'qwen:qwen2.5:7b')
        target_provider = self.provider.lower()
        model_name = selected_model

        if ":" in selected_model and not selected_model.startswith("http"):
            parts = selected_model.split(":", 1)
            prefix = parts[0].lower()
            if prefix in ["groq", "ollama", "qwen"]:
                target_provider = prefix
                model_name = parts[1]

        cache_k = self._cache_key(model_name, messages, system_prompt, temperature)
        if cache_k in self._cache:
            return self._cache[cache_k]

        if target_provider == "groq" and self.groq_api_key:
            res = await self._call_groq(messages, model_name, system_prompt, temperature)
        else:
            # Fall back to installed local model if a cloud/uninstalled model name was passed
            if model_name in ["llama-3.1-8b-instant", "llama3.1:8b", "llama3:8b", "qwen-2.5-32b", "llama-3.3-70b-versatile"]:
                model_name = "qwen2.5:3b"
            # Both 'ollama' and 'qwen' run locally via Ollama host endpoint
            res = await self._call_ollama(messages, model_name, system_prompt, temperature)

        if res and not res.startswith("[") and not res.startswith("Error"):
            self._cache[cache_k] = res
        return res

    async def _call_ollama(
        self,
        messages: List[Dict[str, str]],
        model: str,
        system_prompt: Optional[str],
        temperature: float
    ) -> str:
        formatted_messages = []
        if system_prompt:
            formatted_messages.append({"role": "system", "content": system_prompt})
        formatted_messages.extend(messages)

        payload = {
            "model": model,
            "messages": formatted_messages,
            "stream": False,
            "options": {
                "temperature": temperature
            }
        }

        try:
            response = await self._client.post(f"{self.host}/api/chat", json=payload)
            if response.status_code == 200:
                data = response.json()
                return data.get("message", {}).get("content", "")
            else:
                return f"[Ollama Error: Status {response.status_code} - {response.text}]"
        except Exception as e:
            return f"[LLM Simulation Fallback ({model}): Target processed adversarial prompt. Error connecting to Ollama at {self.host}: {str(e)}]"

    async def _call_groq(
        self,
        messages: List[Dict[str, str]],
        model: str,
        system_prompt: Optional[str],
        temperature: float
    ) -> str:
        formatted_messages = []
        if system_prompt:
            formatted_messages.append({"role": "system", "content": system_prompt})
        formatted_messages.extend(messages)

        headers = {
            "Authorization": f"Bearer {self.groq_api_key}",
            "Content-Type": "application/json"
        }
        
        # Default Groq model mapping if short name passed
        groq_model = model
        if groq_model in ["llama3-8b", "llama3.1-8b", "llama-3.1-8b"]:
            groq_model = "llama-3.1-8b-instant"
        elif groq_model in ["llama3-70b", "llama3.1-70b", "llama3.3-70b", "llama-3.3-70b"]:
            groq_model = "llama-3.3-70b-versatile"
        elif groq_model in ["qwen", "qwen2.5", "qwen-2.5", "qwen2.5-32b", "qwen-2.5-32b"]:
            groq_model = "qwen-2.5-32b"

        payload = {
            "model": groq_model,
            "messages": formatted_messages,
            "temperature": temperature
        }

        try:
            response = await self._client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers=headers,
                json=payload
            )
            if response.status_code == 200:
                data = response.json()
                return data["choices"][0]["message"]["content"]
            else:
                return f"[Groq Error: Status {response.status_code} - {response.text}]"
        except Exception as e:
            return f"[Groq Connection Error: {str(e)}]"

llm_client = LLMClient()
