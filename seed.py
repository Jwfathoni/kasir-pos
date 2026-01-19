from sqlalchemy.orm import Session
from db import engine, Base, SessionLocal
from models import User
from auth import hash_password

def seed():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    if not db.query(User).filter(User.username == "admin").first():
        db.add(User(username="admin", password_hash=hash_password("admin123"), display_name="Admin Toko", role="admin"))
        db.commit()
        print("Admin created: admin / admin123")
    else:
        print("Admin already exists")

    db.close()

if __name__ == "__main__":
    seed()
