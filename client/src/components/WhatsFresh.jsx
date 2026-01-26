import React, { useState, useEffect } from "react";
import Feed from "./Feed"; // Reuse your existing Feed UI
import "../styles/WhatsFresh.css";

// Update this if your Python service runs on a different port/URL
const REC_SERVICE_URL = import.meta.env.VITE_REC_URL || "http://localhost:8000";

const WhatsFresh = ({ user, myCookbooks }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      // 1. Handle "Cold Start" or Guest User
      // If no user is logged in, you might want to fetch generic "popular" posts
      // or just return to prevent errors.
      if (!user || !user._id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Ensure ID is clean (matching your App.jsx logic)
        const cleanId = String(user._id).split(":")[0].trim();

        // 2. Call the Python Service
        const res = await fetch(`${REC_SERVICE_URL}/recommend/${cleanId}`);

        if (!res.ok) {
          throw new Error("Failed to fetch recommendations");
        }

        const data = await res.json();

        // 3. Update State
        // Assuming the Python service returns a JSON object with a list of posts
        // Adjust 'data.recommendations' based on your actual Python response structure
        setRecommendations(
          Array.isArray(data) ? data : data.recommendations || [],
        );
      } catch (err) {
        console.error("Recommendation Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [user]);

  if (loading) return <div className="loading">Checking what's fresh...</div>;
  if (error) return <div className="error">Could not load fresh recipes.</div>;

  return (
    <div className="whats-fresh-page">
      <h2>&nbsp;&nbsp;&nbsp;Top Picks for You</h2>
      {/* 4. Reuse the Feed component to display the recommended posts */}
      {recommendations.length > 0 ? (
        <Feed posts={recommendations} myCookbooks={myCookbooks} user={user} />
      ) : (
        <p>No recommendations yet. Try liking some posts!</p>
      )}
    </div>
  );
};

export default WhatsFresh;
