import RecipePost from "./RecipePost.jsx";
import React, { useState, useEffect } from "react";


export default function Feed() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // This runs as soon as the page loads
    const fetchPosts = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/posts");
        const data = await response.json();
        setPosts(data); // Replaces hardcoded data with real DB data
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, []); // The empty array [] means it only runs once on mount

  return (
    <div className="feed">
      {posts.map(post => (
        <RecipePost key={post._id} post={post} />
      ))}
    </div>
  );
}