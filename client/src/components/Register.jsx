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
  // let's register
  const HandleSubmit = async (e) => {
    e.preventDefault();
    setError("");

// basic validation before hitting the server
    if (formData.password.length < 6) {
      return setError("Password needs to be at least 6 characters.");
    }

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match!");
    }
//now let's try to register them
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, { //replaced localhost with api_url
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password
        }),});
const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }
      localStorage.setItem("user", JSON.stringify(data));
      if (setUser) setUser(data);
      navigate("/"); 
    } catch (err) {
      setError(err.message);
    }
  };

  // add-on module for google integration, use jwtDecode to decode info from google
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // pulling user details from JWT
      const decoded = jwtDecode(credentialResponse.credential);
      const res = await fetch(`${API_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: decoded.name,
          email: decoded.email,
          profilePic: decoded.picture,
          googleId: decoded.sub
        }),});

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Google registration failed");

      localStorage.setItem("user", JSON.stringify(data));
      if (setUser) setUser(data);
      navigate("/");
    } catch (err) {
      setError("Google Sign-up failed. Please try again.");
      console.error(err);
    }};

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Join CookUp! 🥗</h2>
        {error && <p className="error-msg" style={{color: 'red'}}>{error}</p>}
        <form OnSubmit={HandleSubmit}>
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
        </div><div className="google-login-wrapper">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google Sign-up Failed")}
            text="signup_with"
            useOneTap
          /> </div>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Log In</Link>
        </p>
      </div>
    </div>);}