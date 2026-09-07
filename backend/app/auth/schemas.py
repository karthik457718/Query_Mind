from pydantic import BaseModel, EmailStr


class RequestOTP(BaseModel):
    email: str


class VerifyOTP(BaseModel):
    email: str
    code: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"