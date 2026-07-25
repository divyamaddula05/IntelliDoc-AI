from google import genai
from google.genai import errors
import os
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def ask_gemini(question, context):
    prompt = f"""
You are an AI assistant that answers questions using the provided document context.

Context:
{context}

Question:
{question}

Answer:
"""

    try:
        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=prompt
        )
        return response.text

    except errors.ServerError:
        return "Gemini is currently experiencing high demand. Please try again in a few moments."

    except Exception as e:
        print(e)
        return f"Error: {e}"