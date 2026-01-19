from passlib.context import CryptContext
from fastapi import Request
from fastapi.responses import RedirectResponse

pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(p: str) -> str:
    return pwd.hash(p)

def verify_password(p: str, hashed: str) -> bool:
    return pwd.verify(p, hashed)

def get_current_user(request: Request):
    return request.session.get("user")

def require_login(request: Request):
    if not get_current_user(request):
        return RedirectResponse("/login", status_code=302)
    return None
