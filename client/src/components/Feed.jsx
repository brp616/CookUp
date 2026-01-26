import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import RecipePost from "./RecipePost.jsx";
import "../styles/Feed.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:10000";


export default function Feed({ type, myCookbooks, user }) {
  const [posts, setPosts] = useState([]);
  const [loading, toggleLoad] = useState(true);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search");

  useEffect(() => {
    const GrabFeed = async () => {
      toggleLoad(true);
      try {let res;
        if (searchQuery) {
          // feed we return from searches
          res = await axios.get(`${API_URL}/api/posts/search?q=${searchQuery}`);
        } else if (user && type === "timeline") {
          // regular feed
          res = await axios.get(`${API_URL}/api/posts/timeline/${user._id}`);
        } else {
          // whats fresh/discover
          const url = user?._id 
    ? `${API_URL}/api/feed/fresh?userId=${user._id}` 
    : `${API_URL}/api/feed/fresh`;
  res = await axios.get(url);
        }

        const data = Array.isArray(res.data) ? res.data : res.data.posts || [];
        setPosts(data);
      } catch (err) {
        console.error("Feed fetch error:", err);
      } finally {
        toggleLoad(false);
      }
    };
    GrabFeed();
  }, [type, user, searchQuery]);

  return (
    <div className="feed-container">
      {!user && (
        <div className="guest-lock-overlay">
          <div className="guest-card">
            <div className="guest-card-icon">🍳</div>
                <h2>Welcome to CookUp!</h2><p>What will you cook up today?</p>
            <p className="sub-text">Please login or register to continue.</p>
            <div className="guest-actions">
                <Link to="/login" className="btn-login">Login</Link>
              <Link to="/register" className="btn-register">Register</Link>
            </div></div></div>
      )}

      <div className={`feed ${!user ? "blurred-feed" : ""}`}>
        {/* Search Results Header */}
        {searchQuery && (
          <div className="search-header">
            <h3>Results for "{searchQuery}"</h3>
            <p>{posts.length} matches found</p>
            <Link to="/" className="clear-search-link">Clear Search</Link>
          </div>
        )}

        {/* Regular Header (Only show if not searching) */}
        {user && !searchQuery && (
          <div className="feed-header">
            <h2>{type === "timeline" ? "Your Feed" : ""}</h2>
            <p>
              {type === "timeline" ? (
                <>
                  Recipes from chefs you follow.
                  <br />
                  Want to find more chefs? Click on "What's Fresh" or search their username!
                </>
              ) : (
                "Trending recipes based on your activity"
              )}
            </p>
          </div>)}
        {loading && (
          <div className="no-data-msg">
            <p>Simmering... 🍲</p>
          </div>)}


        {!loading && posts.length > 0 ? (
          posts.map((post) => {
            // new addition: Determine badge logic to see if it is a match on user or recipe
            const query = searchQuery?.toLowerCase() || "";
            const isRecipeMatch = searchQuery && post.recipeName?.toLowerCase().includes(query);
            const isChefMatch = searchQuery && post.username?.toLowerCase().includes(query);
            return (
              <div key={post._id} className="post-wrapper">
                {searchQuery && (
                  <div className="search-badge-container">
                    {isRecipeMatch && <span className="search-badge recipe-match">🍴 Recipe Match</span>}
                    {isChefMatch && <span className="search-badge chef-match">👨‍🍳 Chef Match</span>}
                  </div>
                )}
                <RecipePost
                  post={post}
                  myCookbooks={myCookbooks}
                  user={user}
                />
              </div>
            );
          })
        ) : (
          !loading && (
            <div className="no-data-msg">
              {user && type === "timeline" && !searchQuery ? (
                <>
                  <p>It's quiet in the kitchen...</p>
                  <p style={{ fontSize: "0.9rem" }}>Follow some chefs to populate your feed!</p>
                </>
              ) : (
              ""
              )}
            </div>
          )
        )}
      </div>
    </div>
  );}