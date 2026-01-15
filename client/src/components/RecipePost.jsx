import React, { useState } from "react";
import { LuHeart, LuMessageCircle, LuShare2, LuClock, LuFlame, LuStar, LuExternalLink } from "react-icons/lu";
import { FaBowlFood } from "react-icons/fa6";
import "../styles/RecipePost.css";



export default function RecipePost({ post }) {
    //get recipe name
const getDomainName = (url) => {
  // If url is null, undefined, or an empty string, don't even try to parse it
  if (!url) return "Recipe Source"; 

  try {
    const domain = new URL(url).hostname;
    return domain.replace('www.', ''); 
  } catch {
    return "Recipe Source";
  }
};

    // Helper to render stars based on rating (e.g., 4)
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <LuStar 
        key={i} 
        size={14} 
        fill={i < rating ? "#f1c40f" : "none"} 
        stroke={i < rating ? "#f1c40f" : "#ccc"} 
      />
    ));
  };
    const [yummed, setYummed] = useState(false);
  const [count, setCount] = useState(post.kudosCount);

  const handleYum = () => {
    // Toggle state
    setYummed(!yummed);
    setCount(yummed ? count - 1 : count + 1);

    // TODO: fetch('/api/posts/yum', { method: 'POST', body: JSON.stringify({ postId: post.id }) })
    console.log("Yummed post:", post.recipeName);
  };

  if (!post) return null;


  return (
    <div className="recipe-card">
      {/* 1. Header: User Info */}
      <div className="card-header">
        <img src={post.userAvatar} alt={post.username} className="avatar" />
        <div className="user-meta">
          <span className="username">{post.username}</span>
          <span className="timestamp">{post.timeAgo} • {post.location}</span>
        </div>
      </div>

      {/* 2. Content: The "Cook" */}
      <div className="card-content">
        <h2 className="recipe-title">{post.recipeName}</h2>
        <p className="recipe-description">{post.description}</p>
      

{/* NEW: Source Link Section */}
        {post.sourceUrl && (
     <div className="source-metadata">
    <a href={post.sourceUrl} target="_blank" rel="noopener noreferrer" className="recipe-source-link">
      <LuExternalLink size={14} /> View Original Recipe
    </a>
    <span className="source-divider"> | </span>
    <span className="source-site">{<span className="source-site">{getDomainName(post.sourceUrl)}</span> || "Unknown Source"}</span>
    <span className="source-divider"> | </span>
    <span className="source-recipe-name">{post.originalRecipeName || post.recipeName}</span>
  </div>
        )}
      </div>
<div className="image-container">
  {/* Layer 1: The Swipeable Images */}
  <div className="image-scroller">
    {post.dishImages.map((img, index) => (
      <div className="image-slide" key={index}>
        <img src={img} alt="Dish" className="dish-img" />
      </div>
    ))}
  </div>

  {/* Layer 2: The Overlays (Siblings to the scroller, not inside it) */}
  <div className="tags-overlay">
    {post.tags.map((tag, i) => (
      <span key={i} className="tag-pill">{tag}</span>
    ))}
  </div>

  <div className="stats-overlay">
    <div className="stat"><LuClock /> <span>{post.cookTime}m</span></div>
    <div className="stat"><LuFlame /> <span>{post.difficulty}</span></div>
    <div className="stat rating">{renderStars(post.rating)}</div>
  </div>
  
  {/* Optional: Image dots/counter */}
  <div className="image-dots">
    {post.dishImages.length > 1 && post.dishImages.map((_, i) => (
      <div key={i} className="dot"></div>
    ))}
  </div>
</div>

      {/* 4. Strava-style "Kudos" & Comments */}
      <div className="card-footer">
        <div className="action-buttons">
          {/* THE YUM BUTTON */}
          <button 
            className={`action-btn yum-container ${yummed ? "active" : ""}`}
            onClick={handleYum}
          >
            <span className="yum-tooltip">{yummed ? "Yummed!" : "Yum!"}</span>
            
            <FaBowlFood className="yum-icon" />
            <span className = "yum-count">{count}</span>
          </button>
          <button className="action-btn">
            <LuMessageCircle /> <span>{post.commentCount}</span>
          </button>
          <button className="action-btn">
            <LuShare2 />
          </button>
          
          
        </div>
      </div>
    </div>
  );
}