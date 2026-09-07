import random
import string
from datetime import datetime, timedelta, timezone
import resend

from app.core.config import RESEND_API_KEY
from app.db.models import OTPCode
from sqlalchemy.orm import Session

resend.api_key = RESEND_API_KEY

OTP_EXPIRY_MINUTES = 5


def generate_otp() -> str:
    return "".join(random.choices(string.digits, k=6))


def create_and_send_otp(db: Session, email: str) -> None:
    code = generate_otp()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRY_MINUTES)

    otp_entry = OTPCode(email=email, code=code, expires_at=expires_at)
    db.add(otp_entry)
    db.commit()

    try:
        resend.Emails.send(
            {
                "from": "QueryMind <onboarding@resend.dev>",
                "to": email,
                "subject": "Your QueryMind verification code",
                "html": f"<p>Your verification code is: <strong>{code}</strong></p><p>This code expires in {OTP_EXPIRY_MINUTES} minutes.</p>",
            }
        )
    except Exception as e:
        print(f"Resend email error (using dev domain): {e}")


def verify_otp(db: Session, email: str, code: str) -> bool:
    otp_entry = (
        db.query(OTPCode)
        .filter(OTPCode.email == email, OTPCode.code == code)
        .order_by(OTPCode.created_at.desc())
        .first()
    )

    if not otp_entry:
        return False

    # Handle naive datetimes (e.g. from SQLite) by assuming UTC
    expires_at = otp_entry.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if datetime.now(timezone.utc) > expires_at:
        return False

    # OTP is valid — clean it up so it can't be reused
    db.delete(otp_entry)
    db.commit()
    return True
