from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.db.models import User
from app.auth.schemas import RequestOTP, VerifyOTP, TokenResponse
from app.auth.otp import create_and_send_otp, verify_otp
from app.auth.jwt_handler import create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/request-otp")
def request_otp(payload: RequestOTP, db: Session = Depends(get_db)):
    create_and_send_otp(db, payload.email)
    return {"message": "OTP sent"}


@router.post("/verify-otp", response_model=TokenResponse)
def verify_otp_route(payload: VerifyOTP, db: Session = Depends(get_db)):
    is_valid = verify_otp(db, payload.email, payload.code)
    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        user = User(email=payload.email)
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token(user.id, user.email)
    return TokenResponse(access_token=token)
