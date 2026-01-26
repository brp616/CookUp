import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import RecipePost from "../components/RecipePost"; 
import "../styles/PostDetail.css";
// Added LuChevronLeft for the back button to match other icons
import { LuChevronLeft } from "react-icons/lu";
//finally we figured out how to deploy
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';

export default function PostDetail({ user, myCookbooks = [] }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`${API_URL}/api/posts/${id}`);
        const data = await res.json();
        setPost(data);
      } catch (err) {
        console.error("Error fetching post detail:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  if (loading) return <div className="loader">Heating up the oven... 🍳</div>;
  if (!post) return <div className="error-container">Post not found</div>;
//now to return the detail page
  return (
    <div className="post-detail-page">
      {/* Styled Back Button matching the website's clean, pill-shaped design */}
      <button className="back-to-feed-btn" onClick={() => navigate(-1)}>
        <LuChevronLeft size={20} />
        <span>Back to the feed</span>
      </button>

      <div className="detail-content-wrapper">
        <RecipePost 
          post={post} 
          user={user} 
          myCookbooks={myCookbooks} 
          isDetailView={true} 
        />
      </div>
    </div>
  );
}