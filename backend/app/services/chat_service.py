import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


def ask_gemini(question, context):

    prompt = f"""
You are an AI assistant that answers questions using the provided document context.

Instructions:
- Use ONLY the information present in the context.
- If the user asks for a summary or asks what the document is about, summarize the context.
- Do not make up information.
- If the answer truly cannot be found in the context, reply:
  "I couldn't find that information in the uploaded document."

Context:
{context}

Question:
{question}

Answer:
"""

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt
    )

    print("Gemini Response:")
    print(response.text)

    return response.text