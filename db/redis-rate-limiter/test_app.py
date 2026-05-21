import sqlite3
import time
from unittest.mock import patch

import pytest

from src.app import app


@pytest.fixture
def db_conn():
    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row
    conn.execute("""
        CREATE TABLE users (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            email         TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL
        )
    """)
    conn.commit()
    yield conn
    conn.close()


@pytest.fixture
def client(db_conn):
    app.config["TESTING"] = True
    with patch("src.app.get_db", return_value=db_conn):
        with app.test_client() as c:
            yield c


class TestRegister:
    def test_missing_email(self, client):
        res = client.post("/register", json={"password": "secret"})
        assert res.status_code == 400
        assert "email and password are required" in res.get_json()["error"]

    def test_missing_password(self, client):
        res = client.post("/register", json={"email": "user@example.com"})
        assert res.status_code == 400
        assert "email and password are required" in res.get_json()["error"]

    def test_missing_both(self, client):
        res = client.post("/register", json={})
        assert res.status_code == 400
        assert "email and password are required" in res.get_json()["error"]

    def test_empty_strings(self, client):
        res = client.post("/register", json={"email": "", "password": ""})
        assert res.status_code == 400

    def test_no_body(self, client):
        res = client.post("/register")
        assert res.status_code == 400

    def test_success(self, client):
        res = client.post("/register", json={"email": "user@example.com", "password": "secret"})
        assert res.status_code == 201
        assert res.get_json()["email"] == "user@example.com"


class TestRegisterDB:
    def test_db_connection_failure(self, client):
        with patch("src.app.get_db", side_effect=sqlite3.OperationalError("unable to open database")):
            res = client.post("/register", json={"email": "user@example.com", "password": "secret"})
        assert res.status_code == 503
        assert "database unavailable" in res.get_json()["error"]

    def test_duplicate_email(self, client):
        payload = {"email": "dup@example.com", "password": "secret"}
        client.post("/register", json=payload)
        res = client.post("/register", json=payload)
        assert res.status_code == 409
        assert "already registered" in res.get_json()["error"]

    def test_success_stores_user(self, client, db_conn):
        res = client.post("/register", json={"email": "stored@example.com", "password": "secret"})
        assert res.status_code == 201
        row = db_conn.execute("SELECT email FROM users WHERE email = ?", ("stored@example.com",)).fetchone()
        assert row is not None


class TestLogin:
    def test_success(self, client):
        client.post("/register", json={"email": "ada@example.com", "password": "hunter2"})
        with patch("src.app.create_session", return_value="fake-token"):
            res = client.post("/login", json={"email": "ada@example.com", "password": "hunter2"})
        assert res.status_code == 200
        data = res.get_json()
        assert data["token"] == "fake-token"
        assert "expires_in" in data

    def test_wrong_password(self, client):
        client.post("/register", json={"email": "ada@example.com", "password": "hunter2"})
        res = client.post("/login", json={"email": "ada@example.com", "password": "wrong"})
        assert res.status_code == 401
        assert "invalid credentials" in res.get_json()["error"]

    def test_unknown_email(self, client):
        res = client.post("/login", json={"email": "ghost@example.com", "password": "hunter2"})
        assert res.status_code == 401
        assert "invalid credentials" in res.get_json()["error"]

    def test_missing_credentials(self, client):
        res = client.post("/login", json={})
        assert res.status_code == 401


class TestMe:
    def _fake_session(self):
        return {"user_id": "42", "email": "ada@example.com", "created_at": str(int(time.time()))}

    def test_authenticated(self, client):
        with patch("src.app.require_session", return_value=("fake-token", self._fake_session())):
            res = client.get("/me", headers={"Authorization": "Bearer fake-token"})
        assert res.status_code == 200
        data = res.get_json()
        assert data["user_id"] == 42
        assert data["email"] == "ada@example.com"
        assert data["session_age_seconds"] >= 0

    def test_no_token(self, client):
        with patch("src.app.require_session", return_value=(None, None)):
            res = client.get("/me")
        assert res.status_code == 401
        assert "not authenticated" in res.get_json()["error"]

    def test_invalid_token(self, client):
        with patch("src.app.require_session", return_value=("bad-token", None)):
            res = client.get("/me", headers={"Authorization": "Bearer bad-token"})
        assert res.status_code == 401
