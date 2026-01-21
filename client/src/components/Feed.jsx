import RecipePost from "./RecipePost.jsx";
import React from "react";
import { Link } from "react-router-dom";
// Import your feed styles
import "../styles/Feed.css"; 

export default function Feed({ posts, myCookbooks, user }) {
  console.log("Feed received posts:", posts);

  if (!Array.isArray(posts)) {
    return <p>Error: Data is not in list format.</p>;
  }

  return (
    <div className="feed-container">
      {/* 1. GUEST OVERLAY: Only shows if user is null/undefined */}
      {!user && (
        <div className="guest-lock-overlay">
          <div className="guest-card">
            <div className="guest-card-icon">🍳</div>
            <h2>Welcome to CookUp!</h2>
            <p>What will you cook up today?</p>
            <p className="sub-text">Please login or register to continue.</p>
            
            <div className="guest-actions">
              <Link to="/login" className="btn-login">Login</Link>
              <Link to="/register" className="btn-register">Register</Link>
            </div>
          </div>
        </div>
      )}

      {/* 2. THE ACTUAL FEED: We add a 'blurred' class if no user is logged in */}
      <div className={`feed ${!user ? "blurred-feed" : ""}`}>
        {posts.length > 0 ? (
          posts.map((post) => (
            <RecipePost 
              key={post._id} 
              post={post} 
              myCookbooks={myCookbooks} 
              user={user}
            />
          ))
        ) : (
          <div className="no-data-msg">
             <p>Your feed is loading...</p>
             
          </div>
        )}
      </div>
    </div>
  );
}