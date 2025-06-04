// App.tsx
import React, {useEffect} from "react";
import {BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom";
import Login from "./Login";
import Dashboard from "./Dashboard.tsx";
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";
import {applyStoredTheme, toggleTheme} from './theme'

const SECRET = "super-secret";

function isAuthenticated() {
  const encrypted = Cookies.get("auth");
  if (!encrypted) return false;
  try {
    const decrypted = CryptoJS.AES.decrypt(encrypted, SECRET).toString(CryptoJS.enc.Utf8);
    const data = JSON.parse(decrypted);
    return data.expires > Date.now();
  } catch {
    return false;
  }
}

const ProtectedRoute = ({children}: { children: React.ReactNode }) => {
  return isAuthenticated() ? children : <Navigate to="/"/>;
};

export default function App() {
  useEffect(() => {
    applyStoredTheme();
  }, []);

  return (
    <>
      <button onClick={toggleTheme}>Toggle Theme</button>
      <Router>
        <Routes>
          <Route path="/" element={<Login/>}/>
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>}/>
        </Routes>
      </Router>
    </>
  );
}
