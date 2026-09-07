from cryptography.fernet import Fernet
from app.core.config import FERNET_KEY

_fernet = Fernet(FERNET_KEY.encode())


def encrypt_password(plain_password: str) -> str:
    return _fernet.encrypt(plain_password.encode()).decode()


def decrypt_password(encrypted_password: str) -> str:
    return _fernet.decrypt(encrypted_password.encode()).decode()
