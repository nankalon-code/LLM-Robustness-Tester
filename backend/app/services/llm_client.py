import httpx
from typing import List, Dict, Any, Optional
from app.config import settings

class LLMClient:
    """
    Unified LLM client abstraction layer.
    Supports Ollama locally by default, or Groq API if configured via env var.
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

        if self.provider.lower() == "groq" and self.groq_api_key:
            return await self._call_groq(messages, selected_model, system_prompt, temperature)
        else:
            return await self._call_ollama(messages, selected_model, system_prompt, temperature)

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
                # Return fallback response if Ollama service is unreachable during scaffolding/testing
                return f"[LLM Simulation Fallback: Target processed prompt. Error communicating with Ollama host at {self.host}: {str(e)}]"

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
        payload = {
            "model": model or "llama3-8b-8192",
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
