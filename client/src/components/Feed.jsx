import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import RecipePost from "./RecipePost.jsx";
import "../styles/Feed.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:10000";

export default function Feed({ type, myCookbooks, user }) {
  // 1. Internal State (Since App.jsx no longer passes 'posts')
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search");

  // 2. Data Fetching Logic
  useEffect(() => {
    const fetchFeed = async () => {
      setLoading(true);
      try {
        let res;

        // --- PRIORITY LOGIC ---
        if (searchQuery) {
          // 1. SEARCH MODE (Highest Priority)
          // If URL has ?search=... ignore 'type' and search everything
          res = await axios.get(`${API_URL}/api/posts/search?q=${searchQuery}`);
        } else if (user && type === "timeline") {
          // 2. TIMELINE MODE (Logged In + Home Tab)
          res = await axios.get(`${API_URL}/api/posts/timeline/${user._id}`);
        } else {
          // 3. GLOBAL/GUEST MODE (Fresh Tab or Not Logged In)
          res = await axios.get(`${API_URL}/api/posts`);
        }
        // ----------------------

        // Handle response format (Array vs Object wrapper)
        const data = Array.isArray(res.data) ? res.data : res.data.posts || [];
        setPosts(data);
      } catch (err) {
        console.error("Feed fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, [type, user, searchQuery]);

  return (
    <div className="feed-container">
      {/* 3. GUEST OVERLAY (Your existing code) */}
      {!user && (
        <div className="guest-lock-overlay">
          <div className="guest-card">
            <div className="guest-card-icon">🍳</div>
            <h2>Welcome to CookUp!</h2>
            <p>What will you cook up today?</p>
            <p className="sub-text">Please login or register to continue.</p>

            <div className="guest-actions">
              <Link to="/login" className="btn-login">
                Login
              </Link>
              <Link to="/register" className="btn-register">
                Register
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 4. THE FEED CONTENT */}
      {/* We keep the 'blurred-feed' class if no user is present */}
      <div className={`feed ${!user ? "blurred-feed" : ""}`}>
        {/* Header for Logged In Users */}
        {user && (
          <div className="feed-header" style={{ padding: "0 1rem" }}>
            <h2>{type === "timeline" ? "Your Feed" : "Explore"}</h2>
            <p style={{ color: "#666", fontSize: "0.9rem" }}>
              {type === "timeline"
                ? "Recipes from chefs you follow"
                : "Trending recipes"}
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="no-data-msg">
            <p>Simmering... 🍲</p>
          </div>
        )}

        {/* Post List */}
        {!loading && posts.length > 0
          ? posts.map((post) => (
              <RecipePost
                key={post._id}
                post={post}
                myCookbooks={myCookbooks}
                user={user}
              />
            ))
          : /* Empty State (Only show if NOT loading) */
            !loading && (
              <div className="no-data-msg">
                {user && type === "timeline" ? (
                  <>
                    <p>It's quiet in here... 🦗</p>
                    <p style={{ fontSize: "0.9rem" }}>
                      Follow some chefs to populate your feed!
                    </p>
                  </>
                ) : (
                  <p>No recipes found.</p>
                )}
              </div>
            )}
      </div>
    </div>
  );
}
