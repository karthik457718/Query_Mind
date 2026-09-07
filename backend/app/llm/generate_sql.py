import os
from groq import Groq
from app.llm.prompt import build_sql_prompt

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

MODEL_NAME = "openai/gpt-oss-120b"


def generate_sql(schema_text: str, user_question: str, history: list[dict] | None = None) -> str:
    prompt = build_sql_prompt(schema_text, user_question, history=history)

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[{"role": "user", "content": prompt}],
        temperature=0,  # deterministic — we want consistent SQL, not creative variation
        max_tokens=500,
    )

    sql = response.choices[0].message.content.strip()

    # Strip markdown code fences if the model adds them despite instructions
    if sql.startswith("```"):
        sql = sql.strip("`")
        if sql.lower().startswith("sql"):
            sql = sql[3:].strip()

    return sql

