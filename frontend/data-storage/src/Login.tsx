import React from "react";
import {useNavigate} from "react-router-dom";
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";

const SECRET = "super-secret";

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      email: (e.target as any).email.value,
      password: (e.target as any).password.value,
      expires: Date.now() + 60 * 60 * 1000, // 1 hour
    };
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), SECRET).toString();
    Cookies.set("auth", encrypted, {expires: 1 / 24}); // 1 hour
    navigate("/dashboard");
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Login</h2>
      <input name="email" type="email" placeholder="Email" required/>
      <input name="password" type="password" placeholder="Password" required/>
      <button type="submit">Login</button>
    </form>
  );
}