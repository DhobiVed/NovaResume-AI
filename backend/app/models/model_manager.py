import os
import sys
from typing import AsyncGenerator, List, Dict, Any, Optional
import groq
from groq import Groq
from app.core.config import settings

class ModelManager:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.GROQ_API_KEY
        self._groq_client = None

    @property
    def groq_client(self) -> Groq:
        if not self._groq_client:
            self._groq_client = Groq(api_key=self.api_key)
        return self._groq_client

    def update_api_key(self, new_key: str):
        self.api_key = new_key
        self._groq_client = Groq(api_key=new_key)

    def get_supported_models(self) -> List[Dict[str, Any]]:
        return settings.SUPPORTED_MODELS

    async def stream_chat_completion(
        self,
        messages: List[Dict[str, str]],
        model_name: str = settings.DEFAULT_MODEL,
        temperature: float = 0.7,
        max_tokens: int = 4096
    ) -> AsyncGenerator[str, None]:
        if not self.api_key or self.api_key.strip() == "" or self.api_key == "YOUR_GROQ_API_KEY":
            yield "\n\n⚠️ **Groq API Key Required**: Please configure your Groq API key in Settings (top right gear icon) or `.env` to start chatting."
            return

        valid_model_ids = [m["id"] for m in settings.SUPPORTED_MODELS]
        requested_model = model_name if model_name in valid_model_ids else settings.DEFAULT_MODEL

        # Fallback chain if primary model hits rate limit
        fallback_models = [requested_model, "llama-3.1-8b-instant", "gemma2-9b-it", "mixtral-8x7b-32768"]
        candidate_models = list(dict.fromkeys(fallback_models))

        for idx, current_model in enumerate(candidate_models):
            try:
                stream = self.groq_client.chat.completions.create(
                    model=current_model,
                    messages=messages,
                    temperature=temperature,
                    max_tokens=max_tokens,
                    stream=True
                )
                
                if idx > 0:
                    yield f"*(Auto-fallback to `{current_model}` due to rate limit on primary model)*\n\n"

                for chunk in stream:
                    if chunk.choices and chunk.choices[0].delta and chunk.choices[0].delta.content:
                        content_token = chunk.choices[0].delta.content
                        yield content_token
                return # Successful completion

            except groq.RateLimitError:
                if idx < len(candidate_models) - 1:
                    continue # Try next candidate model in fallback chain
                else:
                    yield (
                        "\n\n⚠️ **Rate Limit Reached**: The free Groq API key has reached its daily token limit across all models.\n\n"
                        "**How to fix in 10 seconds:**\n"
                        "1. Get a free API key at [console.groq.com](https://console.groq.com/keys)\n"
                        "2. Click **Settings (⚙️)** in top right of NovaChat AI\n"
                        "3. Paste your key into **Custom Groq API Key**"
                    )
                    return
            except groq.AuthenticationError:
                yield (
                    "\n\n⚠️ **Authentication Error**: The Groq API key is invalid or expired.\n\n"
                    "Please click **Settings (⚙️)** in top right and enter your personal Groq API key."
                )
                return
            except groq.APIConnectionError:
                yield "\n\n⚠️ **Connection Error**: Unable to reach Groq API servers. Please check your internet connection."
                return
            except Exception as e:
                clean_err_msg = str(e).encode('utf-8', errors='ignore').decode('utf-8')
                yield f"\n\n⚠️ **Model Error ({current_model})**: {clean_err_msg}"
                return

    def get_completion(
        self,
        messages: List[Dict[str, str]],
        model_name: str = settings.DEFAULT_MODEL,
        temperature: float = 0.7,
        max_tokens: int = 4096
    ) -> str:
        if not self.api_key:
            return "Groq API Key not configured."
        try:
            response = self.groq_client.chat.completions.create(
                model=model_name,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                stream=False
            )
            return response.choices[0].message.content or ""
        except Exception as e:
            clean_err_msg = str(e).encode('utf-8', errors='ignore').decode('utf-8')
            return f"Error executing LLM call: {clean_err_msg}"

model_manager = ModelManager()
