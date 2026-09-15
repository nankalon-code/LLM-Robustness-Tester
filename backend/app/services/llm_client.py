import httpx
from typing import List, Dict, Any, Optional
from app.config import settings

class LLMClient:
    """
    Unified LLM client supporting local Ollama (Llama 3, Qwen 2.5) and Cloud Groq API endpoints.
    Allows specifying models in 'provider:model_name' format:
      - 'ollama:llama3.1:8b'
      - 'qwen:qwen2.5:7b' (via Ollama local engine)
      - 'groq:llama-3.1-70b-versatile' / 'groq:llama3-8b-8192'
    """
    def __init__(self, provider: str = None, host: str = None, default_model: str = None):
        self.provider = provider or settings.LLM_PROVIDER
        self.host = host or settings.OLLAMA_HOST
        self.default_model = default_model or settings.DEFAULT_MODEL
        self.groq_api_key = settings.GROQ_API_KEY

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

        if target_provider == "groq" and self.groq_api_key:
            return await self._call_groq(messages, model_name, system_prompt, temperature)
        else:
            # Both 'ollama' and 'qwen' run locally via Ollama host endpoint
            return await self._call_ollama(messages, model_name, system_prompt, temperature)

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

        async with httpx.AsyncClient(timeout=120.0) as client:
            try:
                response = await client.post(f"{self.host}/api/chat", json=payload)
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
        if groq_model in ["llama3-8b", "llama3.1-8b"]:
            groq_model = "llama3-8b-8192"
        elif groq_model in ["llama3-70b", "llama3.1-70b"]:
            groq_model = "llama-3.1-70b-versatile"

        payload = {
            "model": groq_model,
            "messages": formatted_messages,
            "temperature": temperature
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            try:
                response = await client.post(
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
