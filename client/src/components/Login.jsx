// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Auth.css";

export default function Login({ setUser }) {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
  throw new Error(data.message || "Login failed");
}

// 1. Save to LocalStorage (for persistence when they refresh)
localStorage.setItem("user", JSON.stringify(data));

// 2. Update Global State (so Navbar and Feed update immediately)
if (setUser) {
  setUser(data); 
}

// 3. Navigate to Home
navigate("/");

      console.log("LOGIN RESPONSE:", data);

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      // SUCCESS: Save user info to browser storage!
      localStorage.setItem("user", JSON.stringify(data));

      console.log("SAVED USER:", localStorage.getItem("user"));

      // Go to Home Page AND refresh (All in one step)
      window.location.href = "/";
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Welcome Back! 🍳</h2>
        {error && <p className="error-msg">{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            required
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
          <button type="submit" className="auth-btn">
            Log In
          </button>
        </form>

        <p className="auth-footer">
          New here? <Link to="/register">Create Account</Link>
        </p>
      </div>
    </div>
  );
}
