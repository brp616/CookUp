import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { formatDistanceToNow } from 'date-fns';
import "../styles/PostDetail.css";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';

export default function PostDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`${API_URL}/api/posts/${id}`);
        if (!res.ok) throw new Error("Post not found");
        const data = await res.json();
        setPost(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;

    try {
      const res = await fetch(`${API_URL}/api/posts/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.username,
          text: commentText,
          createdAt: new Date()
        }),
      });

      if (res.ok) {
        const updatedPost = await res.json();
        setPost(updatedPost);
        setCommentText("");
      }
    } catch (err) {
      console.error("Comment failed:", err);
    }
  };

  const deleteComment = async (commentId) => {
    try {
      const res = await fetch(`${API_URL}/api/posts/${id}/comments/${commentId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const updatedPost = await res.json();
        setPost(updatedPost);
      }
    } catch (err) {
      console.error("Failed to delete comment", err);
    }
  };

  if (loading) return <div className="loader">Heating up the oven... 🍳</div>;
  if (!post) return <div className="error-container"><h2>Recipe not found!</h2><button onClick={() => navigate('/')}>Go Home</button></div>;

  return (
    <div className="post-detail-page">
      {/* Back Button - Reusing your nav-arrow style */}
      <button className="nav-arrow left detail-back" onClick={() => navigate(-1)}>
        <i className="fa-solid fa-arrow-left"></i>
      </button>

      <div className="recipe-card detail-view">
        {/* Header */}
        <div className="card-header">
          <img src={post.user?.profilePic || "https://via.placeholder.com/150"} className="avatar" alt="Chef" />
          <div>
            <span className="username">@{post.user?.username || 'chef'}</span>
            <span className="timestamp">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
          </div>
        </div>

        {/* Image Section */}
        <div className="image-container">
          <img src={post.image} alt={post.recipeName} className="dish-img" />
          <div className="tags-overlay">
            <span className="tag-pill">{post.cookbookCategory}</span>
          </div>
          <div className="stats-overlay">
             <div className="stat">🔥 {post.kudosCount || 0} Yums</div>
          </div>
        </div>

        {/* Content */}
        <div className="card-content">
          <h1 className="recipe-title">{post.recipeName}</h1>
          <p className="post-description">{post.description}</p>
        </div>

        {/* Comment Section */}
        <div className="comment-section">
          <header className="comment-header">
            COMMENTS ({post.comments?.length || 0})
          </header>
          
          <div className="comment-thread">
            {post.comments?.map((c) => (
              <div key={c._id} className="comment-line-item">
                <div className="comment-meta">
                  <span className="comment-user">{c.username}</span>
                  <span className="comment-time">
                    {c.createdAt ? formatDistanceToNow(new Date(c.createdAt), { addSuffix: true }) : 'just now'}
                  </span>
                </div>
                <div className="comment-body">
                  <p className="comment-text">{c.text}</p>
                  {user?.username === c.username && (
                    <button onClick={() => deleteComment(c._id)} className="comment-delete-btn">
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {user ? (
            <form className="comment-form" onSubmit={handleCommentSubmit}>
              <input 
                type="text" 
                placeholder="Add a comment..." 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                required
              />
              <button type="submit">Post</button>
            </form>
          ) : (
            <p className="login-prompt">
              <Link to="/login">Log in</Link> to join the conversation.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}