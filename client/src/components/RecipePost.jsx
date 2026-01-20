import React, { useState, useRef } from "react";
import { LuHeart, LuMessageCircle, LuShare2, LuClock, LuFlame, LuStar, LuExternalLink, LuChevronLeft, LuChevronRight, LuTrash2, LuSend } from "react-icons/lu";
import { FaBowlFood } from "react-icons/fa6";
import "../styles/RecipePost.css";
import { Link } from "react-router-dom";


export default function RecipePost({ post,myCookbooks }) {
    
    const [comments, setComments] = useState(post.comments || []);
const [commentText, setCommentText] = useState("");
const [showAll, setShowAll] = useState(false);
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';

    
// --- DELETE LOGIC ---
const handleDelete = async () => {
  if (window.confirm("Are you sure you want to delete this cook?")) {
    try {
      const res = await fetch(`${API_URL}/api/posts/${post._id}`, {
        method: "DELETE",
      });
      if (res.ok) window.location.reload(); // Refresh feed to remove post
    } catch (err) {
      console.error("Delete failed:", err);
    }
  }
};

// --- COMMENT LOGIC ---
const handleCommentSubmit = async (e) => {
  e.preventDefault();
  if (!commentText.trim()) return;

  try {
    const res = await fetch(`${API_URL}/api/posts/${post._id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: commentText, username: "ChefUser" }),
    });

    const updatedPost = await res.json();
    
    // FIX: Make sure you are setting the state to the NEW comments array
    if (updatedPost && updatedPost.comments) {
      setComments(updatedPost.comments); 
      setCommentText(""); // Clear the input
    }
  } catch (err) {
    console.error("Error:", err);
  }
};

const [showMoveMenu, setShowMoveMenu] = useState(false);
const [currentCategory, setCurrentCategory] = useState(post.cookbookCategory || "none");

const handleMoveCategory = async (newCategory) => {
  try {
    const res = await fetch(`${API_URL}/api/posts/${post._id}/category`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: newCategory })
    });

    if (res.ok) {
      const updated = await res.json();
      setCurrentCategory(updated.cookbookCategory);
      setShowMoveMenu(false); // Close the menu after picking
    }
  } catch (err) {
    console.error("Failed to move post:", err);
  }
};

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
// [NEW] State and Ref for Carousel tracking
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef(null);

  // [NEW] Logic to update index during manual swipe
  const handleScroll = () => {
    if (scrollRef.current) {
      const width = scrollRef.current.offsetWidth;
      const newIndex = Math.round(scrollRef.current.scrollLeft / width);
      setCurrentIndex(newIndex);
    }
  };

  // [NEW] Logic for Arrow Buttons
  const scroll = (direction) => {
    if (scrollRef.current) {
      const width = scrollRef.current.offsetWidth;
      const scrollAmount = direction === "left" 
        ? scrollRef.current.scrollLeft - width 
        : scrollRef.current.scrollLeft + width;
      
      scrollRef.current.scrollTo({
        left: scrollAmount,
        behavior: "smooth",
      });
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

 const handleYum = async () => {
  try {
    // 1. Tell the server to increment the count in DB
    const response = await fetch(`${API_URL}/api/posts/${post._id}/yum`, {
      method: "PATCH",
    });

    if (response.ok) {
      const updatedPost = await response.json();
      
      // 2. Update local UI state with the new count from the server
      setCount(updatedPost.kudosCount);
      setYummed(true);
    }
  } catch (err) {
    console.error("Error yumming:", err);
  }
};

  if (!post) return null;


  return (
    <div className="recipe-card">
        {/* Delete Button (Absolute positioned in top-right) */}
    <button className="delete-post-btn" onClick={handleDelete}>
      <LuTrash2 size={18} />
    </button>
      {/* 1. Header: User Info */}
      <div className="card-header">
             {post.user ? (
          <Link to={`/profile/${post.user}`}>
            <img src={post.userAvatar} alt={post.username} className="avatar" />
          </Link>
        ) : (
          <img src={post.userAvatar} alt={post.username} className="avatar" />
        )}
        <div className="user-meta">
          {post.user ? (
            <Link
              to={`/profile/${post.user}`}
              className="username"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              {post.username}
            </Link>
          ) : (
            <span className="username">{post.username}</span>
          )}

          <span className="timestamp">
            {post.timeAgo} • {post.location}
          </span>
        </div>
      </div>

      {/* 2. Content: The "Cook" */}
      <div className="card-content">
        <h2 className="recipe-title">{post.recipeName}</h2>
        <p className="recipe-description">{post.description}</p>
      {currentCategory !== "none" && (
      <div className="category-indicator-badge">
        📂 Filed in: <strong>{currentCategory}</strong>
      </div>
    )}

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
        {/* [NEW] Navigation Arrows (Only show if multiple images) */}
        {post.dishImages?.length > 1 && (
          <>
            {currentIndex > 0 && (
              <button className="nav-arrow left" onClick={() => scroll("left")}>
                <LuChevronLeft size={36}style={{ display: 'block' }} />
              </button>
            )}
            {currentIndex < post.dishImages.length - 1 && (
              <button className="nav-arrow right" onClick={() => scroll("right")}>
                <LuChevronRight size={36}style={{ display: 'block' }} />
              </button>
            )}
            
            {/* [NEW] Image Counter Pill */}
            <div className="image-counter-pill">
              {currentIndex + 1} / {post.dishImages.length}
            </div>
          </>
        )}

        {/* [NEW] Image Scroller with Ref and Scroll Listener */}
        <div 
          className="image-scroller" 
          ref={scrollRef} 
          onScroll={handleScroll}
        >
          {post.dishImages?.map((img, index) => (
            <div className="image-slide" key={index}>
              <img src={img} alt="Dish" className="dish-img" />
            </div>
          ))}
        </div>

        {/* [NEW] Dot Indicators */}
        {post.dishImages?.length > 1 && (
          <div className="image-dots">
            {post.dishImages.map((_, i) => (
              <div 
                key={i} 
                className={`dot ${i === currentIndex ? "active" : ""}`}
                onClick={() => {
                  const width = scrollRef.current.offsetWidth;
                  scrollRef.current.scrollTo({ left: width * i, behavior: "smooth" });
                }}
              ></div>
            ))}
          </div>
        )}

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
      {/* COMMENT THREAD */}
    <div className="comment-section">
     <div className="comments-display">
  {/* 1. Safe Check for the 'View All' button */}
  {comments?.length > 1 && !showAll && (
    <button className="view-more-btn" onClick={() => setShowAll(true)}>
      View all {comments.length} comments
    </button>
  )}

  {/* 2. Safe Mapping of comments */}
  {/* We add ?. after 'comments' and after 'slice' to prevent the crash */}
  {(showAll ? comments : comments?.slice(-1))?.map((c, i) => (
    <div key={i} className="comment-line">
      <span className="comment-user">{c.username || "Guest"}</span>
      <span className="comment-text">{c.text}</span>
    </div>
  ))}
  
  {/* 3. Show a placeholder if there are no comments yet (Optional but nice) */}
  {comments?.length === 0 && (
    <p className="no-comments-text">No comments yet. Be the first!</p>
  )}
</div>
      <form className="comment-form" onSubmit={handleCommentSubmit}>
        <input 
          placeholder="Add a comment..." 
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />
        <button type="submit"><LuSend size={16} /></button>
      </form>
    </div>
    {/* 3. NEW MOVE BUTTON & MENU */}
      <div className="move-wrapper">
        <button 
          className="move-trigger-btn" 
          onClick={() => setShowMoveMenu(!showMoveMenu)}
          title="Move to Cookbook"
        >
          🔖
        </button>

        {showMoveMenu && (
          <div className="move-dropdown-menu">
            <header>Organize to...</header>
           <button onClick={() => handleMoveCategory("none")}>🌍 General Feed</button>
    
    {myCookbooks.map(book => (
      <button 
        key={book.id}
        className={currentCategory === book.category ? "active-cat" : ""} 
        onClick={() => handleMoveCategory(book.category)}
      >
        {book.icon} {book.title}
      </button>
    ))}
          </div>
        )}
      </div>
  </div>
  );
}