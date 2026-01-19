import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Auth.css";

export default function Register({ setUser }) {
  // 1. Expanded state to include email and confirmPassword
  const [formData, setFormData] = useState({ 
    username: "", 
    email: "", 
    password: "", 
    confirmPassword: "" 
  });
  
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // 2. Client-side Validation: Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match!");
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Send username, email, and password to backend
        body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // 3. SUCCESS: Save to LocalStorage and update App State
      localStorage.setItem("user", JSON.stringify(data));
      
      if (setUser) {
        setUser(data);
      }

      console.log("Registration successful, user logged in");
      navigate("/"); 
    } catch (err) {
      setError(err.message);
    }
  };

  // Helper to update state fields dynamically
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Join CookUp! 🥗</h2>
        {error && <p className="error-msg" style={{color: 'red'}}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            name="username"
            type="text"
            placeholder="Username"
            required
            value={formData.username}
            onChange={handleChange}
          />
          
          <input
            name="email"
            type="email"
            placeholder="Email Address"
            required
            value={formData.email}
            onChange={handleChange}
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            value={formData.password}
            onChange={handleChange}
          />

          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
          />

          <button type="submit" className="auth-btn">
            Create Account
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Log In</Link>
        </p>
      </div>
    </div>
  );
}