from db import engine, SessionLocal
from models import User
from auth import hash_password

db = SessionLocal()

# Buat user demo
demo_user = User(
    username="demo",
    password_hash=hash_password("demo123"),
    role="admin",
    display_name="Demo User"
)

# Cek apakah user sudah ada
existing = db.query(User).filter(User.username == "demo").first()
if not existing:
    db.add(demo_user)
    db.commit()
    print("✅ User demo berhasil dibuat!")
    print("Username: demo")
    print("Password: demo123")
else:
    print("⚠️ User demo sudah ada")

db.close()