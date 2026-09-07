import os
from dotenv import load_dotenv

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
FERNET_KEY = os.getenv("FERNET_KEY")