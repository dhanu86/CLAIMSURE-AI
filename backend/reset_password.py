import sys
from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash

def reset_password(email: str, new_password: str):
    clean_email = email.lower().strip()
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == clean_email).first()
        if not user:
            print(f"Error: No account found with email '{clean_email}'")
            print("Existing registered emails:")
            for u in db.query(User).all():
                print(f" - {u.email} ({u.role})")
            return False

        user.password_hash = get_password_hash(new_password)
        db.commit()
        print(f"Success! Password for '{clean_email}' ({user.role}) has been reset to: '{new_password}'")
        return True
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python reset_password.py <email> <new_password>")
        print("Example: python reset_password.py dhanushreea24am@gmail.com Password123!")
        db = SessionLocal()
        print("\nExisting registered accounts in database:")
        for u in db.query(User).all():
            print(f" - {u.email} [Role: {u.role}]")
        db.close()
    else:
        reset_password(sys.argv[1], sys.argv[2])
