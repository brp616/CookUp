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
  console.log("Seeding cookbooks for userId:", userId);

  const defaults = [
    { title: "To Cook", userId: userId, category: "to-cook", icon: "⏳", color: "#a2d2f3" },
    { title: "Cooked", userId: userId, category: "cooked", icon: "🍳", color: "#a2f3a2" }
  ];

  try {
    for (const book of defaults) {
      console.log(`Attempting to create cookbook: ${book.title}...`);
      
      const res = await fetch(`${API_URL}/api/cookbooks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(book)
      });

      const responseData = await res.json();

      if (!res.ok) {
        console.error(`FAILED to create ${book.title}:`, responseData);
      } else {
        console.log(`SUCCESS: Created ${book.title}`, responseData);
      }
    }
  } catch (err) {
    console.error("seedDefaultCookbooks Network/Catch Error:", err);
  }
};
const HandleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  console.log("--- 1. Registration Started ---");

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
    console.log("--- 2. Server Response Received ---", data);

    if (!res.ok) {
      console.error("Registration Server Error:", data);
      throw new Error(data.message || "Registration failed");
    }

    // Checking for ID in different common structures
    const newUser = data.user || data; 
    const extractedId = newUser._id || newUser.id;
    
    console.log("Extracted User Object:", newUser);
    console.log("Extracted ID to be used for seeding:", extractedId);

    if (!extractedId) {
      console.warn("CRITICAL: No ID found in the response. Check backend return statement.");
      throw new Error("Account created, but userId is missing from response.");
    }

    // Call seed with the ID
    console.log("--- 3. Triggering Seed Process ---");
    await seedDefaultCookbooks(extractedId);

    localStorage.setItem("user", JSON.stringify(newUser));
    if (setUser) setUser(newUser);
    
    console.log("--- 4. Navigation Success ---");
    navigate("/"); 
    
  } catch (err) {
    console.error("HandleSubmit Catch Block:", err.message);
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