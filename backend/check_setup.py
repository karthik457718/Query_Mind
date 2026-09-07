import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from groq import Groq
import resend

load_dotenv()

print("FastAPI and SQLAlchemy imported successfully")

groq_key = os.getenv("GROQ_API_KEY")
if groq_key:
    client = Groq(api_key=groq_key)
    print("Groq client initialized")
else:
    print("GROQ_API_KEY missing in .env")

resend_key = os.getenv("RESEND_API_KEY")
if resend_key:
    resend.api_key = resend_key
    print("Resend API key loaded")
else:
    print("RESEND_API_KEY missing in .env")

if os.getenv("JWT_SECRET"):
    print("JWT secret loaded")
else:
    print("JWT_SECRET missing in .env")

app_db_url = os.getenv("APP_DATABASE_URL")
if app_db_url:
    try:
        engine = create_engine(app_db_url)
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 'Postgres connection OK' AS status"))
            print(result.fetchone()[0])
    except Exception as e:
        print(f"Postgres connection failed (fine if Postgres isn't installed yet): {e}")
