import os
from typing import Tuple
from app.config import settings
import logging

logger = logging.getLogger(__name__)

class AiService:
    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.default_model = settings.OPENAI_MODEL or "gpt-4o-mini"
        self._client = None
        if self.api_key and not self.api_key.startswith("sk-proj-your"):
            try:
                from openai import OpenAI
                self._client = OpenAI(api_key=self.api_key)
            except Exception as e:
                logger.error(f"Failed to initialize OpenAI client: {e}")

    def generate_completion(
        self,
        prompt: str,
        system_prompt: str = "You are a helpful, accurate, and concise AI assistant.",
        model: str = None,
        temperature: float = 0.7
    ) -> Tuple[str, str, int]:
        target_model = model or self.default_model

        if self._client:
            try:
                response = self._client.chat.completions.create(
                    model=target_model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=temperature,
                )
                text = response.choices[0].message.content or ""
                tokens = response.usage.total_tokens if response.usage else len(prompt.split()) + len(text.split())
                return text, target_model, tokens
            except Exception as e:
                logger.error(f"OpenAI API call failed: {e}")
                # Fallback response indicating error or development mode
                fallback_text = (
                    f"⚠️ [Backend OpenAI Service Notification]\n"
                    f"Error connecting to OpenAI: {str(e)}\n\n"
                    f"Processed Prompt: {prompt}\n\n"
                    f"System: Set a valid OPENAI_API_KEY in your environment or secrets."
                )
                return fallback_text, target_model, 0

        # Development mock response if OpenAI key is not yet set
        demo_response = (
            f"🤖 [OpenAI GPT Service - {target_model} Mode]\n\n"
            f"Received user prompt: \"{prompt}\"\n\n"
            f"System context applied: \"{system_prompt}\"\n\n"
            f"The OpenAI backend router processed your query successfully! "
            f"To connect to live OpenAI servers, add your `OPENAI_API_KEY` to `.env` or the environment variables."
        )
        return demo_response, target_model, len(prompt.split()) * 2 + 40

ai_service = AiService()
