import os
from groq import Groq
from app.safety.validator import validate_sql

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

MODEL_NAME = "openai/gpt-oss-120b"


def build_retry_prompt(schema_text: str, question: str, failed_sql: str, error_msg: str) -> str:
    return f"""You are an expert SQL generator. You previously generated a SQL query to answer a user's question, but the database rejected it with an error. 
Please fix the query.

Rules:
- Only generate SELECT statements.
- Output ONLY the raw SQL query. Do not include explanations or markdown code fences.

Schema:
{schema_text}

User question: {question}

Failed SQL:
{failed_sql}

Database error:
{error_msg}

Fixed SQL query:"""


def retry_sql(schema_text: str, question: str, failed_sql: str, error_msg: str) -> str:
    prompt = build_retry_prompt(schema_text, question, failed_sql, error_msg)

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
        max_tokens=500,
    )

    sql = response.choices[0].message.content.strip()

    if sql.startswith("```"):
        sql = sql.strip("`")
        if sql.lower().startswith("sql"):
            sql = sql[3:].strip()

    return validate_sql(sql)
