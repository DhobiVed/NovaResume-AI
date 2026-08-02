import sys
import asyncio

sys.stdout.reconfigure(encoding='utf-8')
from app.models.model_manager import model_manager

import os
model_manager.update_api_key(os.getenv('GROQ_API_KEY', ''))

async def main():
    print("Testing live Groq API key...")
    async for token in model_manager.stream_chat_completion(
        messages=[{"role": "user", "content": "Hello! Confirm NovaChat AI is online with your new API key in 10 words."}]
    ):
        print(token, end="", flush=True)
    print("\n--- Live Test Successful ---")

if __name__ == "__main__":
    asyncio.run(main())
