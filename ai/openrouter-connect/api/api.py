import json
import os

import requests
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("API_KEY")

response = requests.post(
    url="https://openrouter.ai/api/v1/chat/completions",
    headers={
        "Authorization": f"Bearer {api_key}",
    },
    data=json.dumps(
        {
            "model": "openai/gpt-5.2",
            "messages": [{"role": "user", "content": "Will I marry with Luiza?"}],
        }
    ),
    timeout=30,
)

data = response.json()
message = data["choices"][0]["message"]["content"]

print(message)
