import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  LuX,
  LuUpload,
  LuLink,
  LuLoader,
  LuClock,
  LuFlame,
  LuStar,
  LuTag,
} from "react-icons/lu";
import "../styles/createPost.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:10000";
const CLOUD_NAME = "ddhhjsobx";
const UPLOAD_PRESET = "Cookup_uploads";

export default function CreatePost({
  isOpen,
  onClose,
  myCookbooks = [],
  user,
}) {
  const [images, setImages] = useState([]);
  const [recipeName, setRecipeName] = useState("");
  const [scrapedTitle, setScrapedTitle] = useState(""); // Stores original metadata
  const [sourceUrl, setSourceUrl] = useState("");
  const [description, setDescription] = useState("");
  const [cookTime, setCookTime] = useState(30);
  const [difficulty, setDifficulty] = useState("Medium");
  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [cookbookCategory, setCookbookCategory] = useState("none");
  const [visibility, setVisibility] = useState("public");
  const [hasExtracted, setHasExtracted] = useState(false);

  const tagOptions = {
    Diet: ["Gluten-Free", "Vegan", "Vegetarian", "Keto", "Dairy-Free"],
    Meal: ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert"],
    Occasion: ["Weeknight", "Party", "Holiday", "Date Night"],
  };

  // --- AUTO-EXTRACT LOGIC ---
useEffect(() => {
  // Only start the timer if the URL is long enough AND we haven't succeeded yet
  if (!sourceUrl || sourceUrl.length < 10 || hasExtracted) return;

  const extractMetadata = async () => {
    setIsExtracting(true);
    try {
      const res = await axios.post(`${API_URL}/api/extract-recipe`, { url: sourceUrl });
      
      if (res.data && res.data.title) {
        const cleanTitle = res.data.title.trim();
        // Use a functional update to prevent overwriting manual user input
        setRecipeName(current => current === "" ? cleanTitle : current);
        setScrapedTitle(cleanTitle);
        setHasExtracted(true); 
      }
    } catch (error) {
      console.error("Scraper Error:", error);
    } finally {
      setIsExtracting(false);
    }
  };

  const debounceTimer = setTimeout(extractMetadata, 1000);
  return () => clearTimeout(debounceTimer);
}, [sourceUrl, hasExtracted]); // recipeName removed from here to stop the loop

  const handleTagToggle = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const invalidFile = files.find((file) => !allowedTypes.includes(file.type));

    if (invalidFile) {
      alert("Only images (JPG, PNG, WEBP, GIF) allowed!");
      e.target.value = null;
      return;
    }
    if (images.length + files.length > 3) return alert("Max 3 images!");

    setIsUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        return data.secure_url;
      });
      const newUrls = await Promise.all(uploadPromises);
      setImages((current) => [...current, ...newUrls]);
    } catch (error) { // Make sure this says 'error'
  console.error("Cloudinary Error:", error);
  alert("Image upload failed: " + error.message);
} finally {
  setIsUploading(false);
  e.target.value = null;
}
    };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?._id) return alert("Log in to post!");
    if (images.length === 0) return alert("Upload a photo!");

    const payload = {
      user: user._id,
      username: user.username,
      userAvatar: user.profilePic || `https://ui-avatars.com/api/?name=${user.username}`,
      recipeName: recipeName,      // User's choice
      recipeTitle: scrapedTitle,   // Original metadata title
      sourceUrl: sourceUrl,
      recipeLink: sourceUrl,
      description,
      dishImages: images,
      cookTime: Number(cookTime),
      difficulty,
      rating: Number(rating),
      tags: selectedTags,
      cookbookCategory,
      visibility,
    };

    try {
      const res = await fetch(`${API_URL}/api/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onClose();
        window.location.reload();
      }
    } catch (err) {
      console.error("Submission error:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Share Your Cook</h2>
          <button className="close-x" onClick={onClose}><LuX /></button>
        </div>

        <form className="modal-form scrollable-form" onSubmit={handleSubmit}>
          {/* LINK INPUT */}
          <div className="input-group">
            <label>
              <LuLink size={14} /> Recipe Link 
              {isExtracting && <LuLoader className="spinner inline-loader" />}
            </label>
            <input
              type="text"
              placeholder="Paste recipe URL..."
              value={sourceUrl}
              onChange={(e) => {
    setSourceUrl(e.target.value);
    // Reset the lock if the user clears the box
    if (e.target.value.length < 10) {
      setHasExtracted(false);
      // Optional: setRecipeName(""); // Only do this if you want the title to clear too
    }
  }}
            />
          </div>

          {/* NAME INPUT */}
          <div className="input-group">
            <label>Recipe Name</label>
            <input
              type="text"
              placeholder={isExtracting ? "Finding title..." : "e.g., Mom's Lasagna"}
              value={recipeName}
              onChange={(e) => setRecipeName(e.target.value)}
              required
            />
          </div>

          {/* TIME & DIFFICULTY */}
          <div className="form-row">
            <div className="input-group">
              <label><LuClock size={14} /> Mins</label>
              <input type="number" value={cookTime} onChange={(e) => setCookTime(e.target.value)} />
            </div>
            <div className="input-group">
              <label><LuFlame size={14} /> Difficulty</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>
          </div>

          {/* RATING */}
          <div className="input-group">
            <label>Your Rating</label>
            <div className="star-rating-input">
              {[1, 2, 3, 4, 5].map((num) => (
                <LuStar
                  key={num}
                  size={24}
                  onClick={() => setRating(num)}
                  fill={num <= rating ? "#f1c40f" : "none"}
                  stroke={num <= rating ? "#f1c40f" : "#ccc"}
                />
              ))}
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="input-group">
            <label>Notes</label>
            <textarea
              placeholder="How did it turn out?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* TAGS */}
          <div className="input-group">
            <label><LuTag size={14} /> Tags</label>
            <div className="tags-container">
              {Object.entries(tagOptions).map(([cat, opts]) => (
                <div key={cat} className="tag-group">
                  <span className="tag-category-label">{cat}</span>
                  <div className="tag-options">
                    {opts.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        className={`tag-choice ${selectedTags.includes(tag) ? "active" : ""}`}
                        onClick={() => handleTagToggle(tag)}
                      >{tag}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* COOKBOOK SELECT */}
          <div className="form-group">
            <label>Save to Cookbook</label>
            <select
              value={cookbookCategory}
              onChange={(e) => setCookbookCategory(e.target.value)}
              className="category-select"
            >
              <option value="none">🌍 General Feed</option>
              {myCookbooks.map((book) => (
                <option key={book._id} value={book.category}>{book.icon} {book.title}</option>
              ))}
            </select>
          </div>

          {/* IMAGE UPLOAD */}
          <div className="image-upload-zone">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              id="file-input"
              hidden
            />
            <label htmlFor="file-input" className={`upload-btn ${isUploading ? "disabled" : ""}`}>
              {isUploading ? <LuLoader className="spinner" /> : <LuUpload />}
              Add Photos ({images.length}/3)
            </label>
            <div className="preview-row">
              {images.map((url, i) => (
                <div key={i} className="thumb-wrapper">
                  <img src={url} className="thumb-preview" alt="preview" />
                  <button type="button" className="remove-img" onClick={() => setImages(images.filter((_, idx) => idx !== i))}>×</button>
                </div>
              ))}
            </div>
          </div>

          {/* VISIBILITY */}
          <div className="form-group" style={{ marginBottom: "20px" }}>
            <label style={{ fontWeight: "bold" }}>Privacy</label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }}
            >
              <option value="public">🌍 Public</option>
              <option value="followers">🔒 Followers Only</option>
            </select>
          </div>

          <button type="submit" className="share-btn" disabled={isUploading || images.length === 0}>
            {isUploading ? "Uploading..." : "Share Cook"}
          </button>
        </form>
      </div>
    </div>
  );
}