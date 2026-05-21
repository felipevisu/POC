import bcrypt


def hash_password(plaintext: str) -> str:
    return bcrypt.hashpw(plaintext.encode(), bcrypt.gensalt()).decode()


def verify_password(plaintext: str, stored_hash: str) -> bool:
    return bcrypt.checkpw(plaintext.encode(), stored_hash.encode())
