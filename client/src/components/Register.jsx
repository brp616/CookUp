import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import "../styles/Auth.css";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';

export default function Register({ setUser }) {
  const [formData, setFormData] = useState({ 
    username: "", 
    email: "", 
    password: "", 
    confirmPassword: "" 
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Helper to create initial cookbook collections for new users
  const seedDefaultCookbooks = async (userId) => {
    const defaults = [
      { 
        title: "To Cook", 
        subtitle: "Future Deliciousness", 
        color: "#a2d2f3", 
        icon: "⏳", 
        category: "to-cook", 
        userId: userId,
        visibility: "public"
      },
      { 
        title: "Cooked", 
        subtitle: "Tried and True", 
        color: "#a2f3a2", 
        icon: "🍳", 
        category: "cooked", 
        userId: userId,
        visibility: "public"
      }
    ];

    try {
      await Promise.all(defaults.map(book => 
        fetch(`${API_URL}/api/cookbooks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(book)
        })
      ));
    } catch (err) {
      console.error("Failed to seed initial cookbooks:", err);
    }
  };

  const HandleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password.length < 6) {
      return setError("Password needs to be at least 6 characters.");
    }

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match!");
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

      // Create default books before navigating
      await seedDefaultCookbooks(data._id);

      localStorage.setItem("user", JSON.stringify(data));
      if (setUser) setUser(data);
      navigate("/"); 
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const res = await fetch(`${API_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: decoded.name,
          email: decoded.email,
          profilePic: decoded.picture,
          googleId: decoded.sub
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Google registration failed");

      // Seed books for Google users as well
      await seedDefaultCookbooks(data._id);

      localStorage.setItem("user", JSON.stringify(data));
      if (setUser) setUser(data);
      navigate("/");
    } catch (err) {
      setError("Google Sign-up failed. Please try again.");
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Join CookUp! 🥗</h2>
        {error && <p className="error-msg" style={{color: 'red'}}>{error}</p>}
        <form onSubmit={HandleSubmit}>
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

        <div className="auth-divider">
          <span>OR</span>
        </div>
        <div className="google-login-wrapper">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google Sign-up Failed")}
            text="signup_with"
            useOneTap
          /> 
        </div>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Log In</Link>
        </p>
      </div>
    </div>
  );
}