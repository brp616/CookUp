import React, { useState, useRef } from "react";
import { 
  LuHeart, LuMessageCircle, LuShare2, LuClock, LuFlame, LuStar, 
  LuExternalLink, LuChevronLeft, LuChevronRight, LuTrash2, LuSend,
  LuPencil 
} from "react-icons/lu";
import { FaBowlFood } from "react-icons/fa6";
import "../styles/RecipePost.css";
import { Link } from "react-router-dom";
import CreatePost from "./CreatePost.jsx";

export default function RecipePost({ post, myCookbooks }) {
    // --- AUTH CHECK ---
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const currentUserId = currentUser?._id;
    const TEST_AVATAR = `https://ui-avatars.com/api/?name=${post.username}&background=random`;

    const [comments, setComments] = useState(post.comments || []);
    const [commentText, setCommentText] = useState("");
    const [showCommentModal, setShowCommentModal] = useState(false); 
    const [showMoveMenu, setShowMoveMenu] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(post.cookbookCategory || "none");
    const [yummed, setYummed] = useState(post.kudos?.includes(currentUserId) || false);
    const [count, setCount] = useState(post.kudosCount || 0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [kudosList, setKudosList] = useState(post.kudosData || (Array.isArray(post.kudos) && typeof post.kudos[0] === 'object' ? post.kudos : []));
    const [ShowEditModal, SetShowEditModal] = useState(false); 
    
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';
    const scrollRef = useRef(null);


    const toggleModal = () => {
        setShowCommentModal(!showCommentModal);
        document.body.style.overflow = !showCommentModal ? 'hidden' : 'unset';
    };

    const handleShare = async () => {
      const shareData = {
        title: `Check out this recipe: ${post.recipeName}`,
        text: `I found this amazing recipe for ${post.recipeName} on CookUp!`,
        url: `${window.location.origin}/post/${post._id}`, 
      };
      try {
        if (navigator.share) {
          await navigator.share(shareData);
        } else {
          await navigator.clipboard.writeText(shareData.url);
          alert("Link copied to clipboard! 📋");
        }
      } catch (err) { console.error("Error sharing:", err); }
    };


const handleDelete = async () => {
  const isOwner = currentUserId === post.user;

  // 1. Logic for Post Owners: Permanent Delete
  if (isOwner) {
    if (window.confirm("Are you sure you want to delete this cook? This will remove it for everyone.")) {
      try {
        const res = await fetch(`${API_URL}/api/posts/${post._id}?userId=${currentUserId}`, { 
            method: "DELETE" 
        });
        if (res.ok) window.location.reload();
      } catch (err) { 
        console.error("Delete failed:", err); 
      }
    }
  } 
  
  // 2. Logic for Savers: Unsave/Remove from Cookbook
  else {
    if (window.confirm("Remove this recipe from your cookbook?")) {
      try {
        // Find which of your cookbooks this post is currently in
        const myBookMatch = myCookbooks?.find(book => 
          post.cookbookIds?.some(id => id.toString() === book._id.toString())
        );

        if (!myBookMatch) {
          console.warn("Could not find a matching book to remove from.");
          return;
        }

        const res = await fetch(`${API_URL}/api/posts/${post._id}/category`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            cookbookId: myBookMatch._id, 
            action: "remove" 
          }),
        });

        if (res.ok) window.location.reload();
      } catch (err) {
        console.error("Unsave failed:", err);
      }
    }
  }
};

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        try {
            const res = await fetch(`${API_URL}/api/posts/${post._id}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    text: commentText, 
                    username: currentUser?.username || "Guest",
                    userAvatar: currentUser?.avatar || currentUser?.profilePic 
                }),
            });
            const updatedPost = await res.json();
            if (updatedPost && updatedPost.comments) {
                setComments(updatedPost.comments); 
                setCommentText(""); 
            }
        } catch (err) { console.error("Error:", err); }
    };

   const handleMoveCategory = async (targetBook) => {
  try {
    const isRemoving = targetBook === "none";
    
    // 1. Determine the correct ID to send to the backend
    let idToSend;
    let action;

    if (isRemoving) {
      // Find the ID of YOUR book that this post is currently in
      const currentBookMatch = myCookbooks?.find(book => 
        post.cookbookId?.some(id => id.toString() === book._id.toString())
      );
      idToSend = currentBookMatch?._id;
      action = "remove";
    } else {
      idToSend = targetBook._id;
      action = "add";
    }

    if (!idToSend) return; // Safety check

    const res = await fetch(`${API_URL}/api/posts/${post._id}/category`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        cookbookId: idToSend, 
        action: action 
      }),
    });

    if (res.ok) {
      window.location.reload(); 
    }
  } catch (err) {
    console.error("Move failed:", err);
  }
};

    const getDomainName = (url) => {
        if (!url) return "Recipe Source"; 
        try { return new URL(url).hostname.replace('www.', ''); } catch { return "Recipe Source"; }
    };

    const handleScroll = () => {
        if (scrollRef.current) {
            const width = scrollRef.current.offsetWidth;
            const newIndex = Math.round(scrollRef.current.scrollLeft / width);
            setCurrentIndex(newIndex);
        }
    };

    const scroll = (direction) => {
        if (scrollRef.current) {
            const width = scrollRef.current.offsetWidth;
            const scrollAmount = direction === "left" ? scrollRef.current.scrollLeft - width : scrollRef.current.scrollLeft + width;
            scrollRef.current.scrollTo({ left: scrollAmount, behavior: "smooth" });
        }
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <LuStar key={i} size={14} fill={i < rating ? "#f1c40f" : "none"} stroke={i < rating ? "#f1c40f" : "#ccc"} />
        ));
    };

    const handleYum = async () => {
        if (!currentUserId) return alert("Please log in!");
        try {
            const response = await fetch(`${API_URL}/api/posts/${post._id}/yum`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: currentUserId }),
            });
            if (response.ok) {
                const updatedPost = await response.json();
                setCount(updatedPost.kudosCount);
                setYummed(updatedPost.kudos?.includes(currentUserId));
                setKudosList(updatedPost.kudosData || []); 
            }
        } catch (err) { console.error("Error yumming:", err); }
    };

    if (!post) return null;
return (
        <div className="recipe-card">
            {currentUserId === post.user && (
                <div className="owner-actions">
                    <button className="edit-post-btn" onClick={() => SetShowEditModal(true)}>
                        <LuPencil size={18} />
                    </button>
                    <button className="delete-post-btn" onClick={handleDelete}>
                        <LuTrash2 size={18} />
                    </button>
                </div>
            )}

            <div className="card-header">
                <Link to={`/profile/${post.user}`}>
                  <img src={post.userAvatar || TEST_AVATAR} alt={post.username} className="avatar" />
                </Link>
                <div className="user-meta">
                    <Link to={`/profile/${post.user}`} className="username">{post.username}</Link>
                    <span className="timestamp">
                        {post.createdAt ? new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "Just now"}
                        {post.location && ` • ${post.location}`}
                    </span>
                </div>
            </div>

            <div className="card-content">
                <h2 className="recipe-title">{post.recipeName}</h2>
                <p className="recipe-description">{post.description}</p>
                
                {/* --- UPDATED BADGE LOGIC --- */}
                {(() => {
                    // Check if post has any cookbook associations
                    if (!post.cookbookId || !Array.isArray(post.cookbookId)) return null;

                    // Find if any of the post's cookbook IDs belong to the current user
                    const matchedBook = myCookbooks?.find(book => 
    post.cookbookId?.some(id => id?.toString() === book._id?.toString())
);

                    if (matchedBook) {
                        return (
                            <div className="category-indicator-badge">
                                <span>{matchedBook.icon || "📂"}</span> Filed in: <strong>{matchedBook.title}</strong>
                            </div>
                        );
                    }
                    return null;
                })()}
              
                {post.sourceUrl && (
                    <div className="source-metadata">
                        <a href={post.sourceUrl} target="_blank" rel="noopener noreferrer" className="recipe-source-link">
                          <LuExternalLink size={14} /> View Original Recipe
                        </a>
                        <span className="source-divider"> | </span>
                        <span className="source-site">{getDomainName(post.sourceUrl)}</span>
                        <span className="source-divider"> | </span>
                        <span className="source-recipe-name">{post.recipeTitle || post.recipeName}</span>
                    </div>
                )}
            </div>

            <div className="image-container">
                {post.dishImages?.length > 1 && (
                    <>
                        {currentIndex > 0 && <button className="nav-arrow left" onClick={() => scroll("left")}><LuChevronLeft size={36} /></button>}
                        {currentIndex < post.dishImages.length - 1 && <button className="nav-arrow right" onClick={() => scroll("right")}><LuChevronRight size={36} /></button>}
                        <div className="image-counter-pill">{currentIndex + 1} / {post.dishImages.length}</div>
                    </>
                )}
                <div className="image-scroller" ref={scrollRef} onScroll={handleScroll}>
                    {post.dishImages?.map((img, index) => (
                        <div className="image-slide" key={index}><img src={img} alt="Dish" className="dish-img" /></div>
                    ))}
                </div>
                <div className="tags-overlay">{post.tags?.map((tag, i) => <span key={i} className="tag-pill">{tag}</span>)}</div>
                <div className="stats-overlay">
                    <div className="stat"><LuClock /> <span>{post.cookTime}m</span></div>
                    <div className="stat"><LuFlame /> <span>{post.difficulty}</span></div>
                    <div className="stat rating">{renderStars(post.rating)}</div>
                </div>
            </div>

            <div className="card-footer">
                <div className="action-buttons">
                    <button className={`action-btn yum-container ${yummed ? "active" : ""}`} onClick={handleYum}>
                        <span className="yum-tooltip">{yummed ? "Yummed!" : "Yum!"}</span>
                        <FaBowlFood className="yum-icon" />
                        <span className="yum-count">{count}</span>
                    </button>
                    <button className="action-btn" onClick={toggleModal}>
                        <LuMessageCircle /> <span>{comments.length}</span>
                    </button>
                    <button className="post-btn share-btn" onClick={handleShare}>Share</button>
                </div>
            </div>

            <div className="comment-preview-area">
                {comments?.length > 0 && (
                    <div className="comment-line-with-avatar" onClick={toggleModal}>
                        <img src={comments[comments.length - 1].userAvatar || "https://via.placeholder.com/30"} alt="user" className="mini-comment-avatar" />
                        <span className="comment-user">{comments[comments.length - 1].username}</span>
                        <span className="comment-text">{comments[comments.length - 1].text}</span>
                    </div>
                )}
                {comments?.length > 1 && (
                    <button className="view-more-btn" onClick={toggleModal}>
                        View all {comments.length} comments
                    </button>
                )}
            </div>

            {showCommentModal && (
              <div className="modal-overlay frosted" onClick={toggleModal}>
                <div className="comment-modal-card" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <div className="header-titles">
                      <h3>Comments</h3>
                      <div className="yum-summary">
                        <FaBowlFood className="yum-icon-small" />
                        <strong>{count} {count === 1 ? "Yum" : "Yums"}</strong>
                      </div>
                    </div>
                    <button className="close-modal-x" onClick={toggleModal}>✕</button>
                  </div>

                  {count > 0 && (
                    <div className="yum-avatar-row">
                      <div className="avatar-stack">
                        {kudosList.slice(0, 3).map((yummer, i) => {
                          const isPopulated = typeof yummer === 'object' && yummer !== null;
                          const yummerId = isPopulated ? yummer._id : yummer;
                          const yummerName = isPopulated ? yummer.username : "Chef";
                          const yummerImg = isPopulated ? yummer.profilePic : null;
                          const finalAvatar = yummerImg || `https://ui-avatars.com/api/?name=${yummerName}&background=random`;

                          return (
                            <Link key={i} to={`/profile/${yummerId}`}>
                              <img src={finalAvatar} className="stacked-yum-avatar" alt={yummerName} title={yummerName} />
                            </Link>
                          );
                        })}
                      </div>
                      <p className="yum-text-line">
                        {count === 1 ? (
                          <span><strong>{kudosList[0]?.username || "A chef"}</strong> yummed this</span>
                        ) : (
                          <span>
                            <strong>{kudosList[0]?.username || "Chef"}</strong> and <strong>{count - 1} others</strong> yummed this
                          </span>
                        )}
                      </p>
                    </div>
                  )}

                  <div className="modal-comments-list">
                      {comments.map((c, i) => (
                          <div key={i} className="modal-comment-row">
                              <img src={c.userAvatar || "https://via.placeholder.com/40"} alt={c.username} className="comment-avatar" />
                              <div className="comment-content">
                                  <span className="comment-user">{c.username}</span>
                                  <p className="comment-text">{c.text}</p>
                              </div>
                          </div>
                      ))}
                  </div>

                  <form className="modal-comment-form" onSubmit={handleCommentSubmit}>
                      <input 
                          placeholder="Add a comment..." 
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          autoFocus
                      />
                      <button type="submit"><LuSend/></button>
                  </form>
                </div>
              </div>
            )}

            <div className="move-wrapper">
                <button className="move-trigger-btn" onClick={() => setShowMoveMenu(!showMoveMenu)}>🔖Add/Move to Cookbook</button>
                {showMoveMenu && (
                    <div className="move-dropdown-menu">
                        <header>Organize to...</header>
                        <button onClick={() => handleMoveCategory("none")}>🌍 General Feed</button>

{myCookbooks && myCookbooks.length > 0 ? (
    myCookbooks.map(book => (
        <button 
            key={book._id} 
            // Check if this specific book ID is in the post's cookbookId array
            className={post.cookbookId?.includes(book._id) ? "active-cat" : ""} 
            // PASS THE WHOLE BOOK OBJECT HERE
            onClick={() => handleMoveCategory(book)} 
        >
            {book.icon} {book.title}
        </button>
    ))
) : (
    <p className="no-cookbooks-hint">Create a cookbook first!</p>
)}
                    </div>
                )}
            </div>

            {ShowEditModal && (
                <CreatePost 
                    isOpen={ShowEditModal} 
                    onClose={() => SetShowEditModal(false)} 
                    user={currentUser}
                    myCookbooks={myCookbooks}
                    editingPost={post}
                />
            )}
        </div>
    );
}