import React, { useState } from "react";
import { LuX, LuUpload, LuLink, LuLoader, LuClock, LuFlame, LuStar, LuTag } from "react-icons/lu";
import "../styles/createPost.css";

export default function CreatePost({ isOpen, onClose }) {
  // Form States
  const [images, setImages] = useState([]);
  const [recipeName, setRecipeName] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [description, setDescription] = useState("");
  const [cookTime, setCookTime] = useState(30);
  const [difficulty, setDifficulty] = useState("Medium");
  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const tagOptions = {
    Diet: ["Gluten-Free", "Vegan", "Vegetarian", "Keto", "Dairy-Free"],
    Meal: ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert"],
    Occasion: ["Weeknight", "Party", "Holiday", "Date Night"]
  };

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 3) return alert("Max 3 images!");
    setIsUploading(true);
    // ... (Cloudinary logic from previous step goes here)
    setIsUploading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Post a Cook</h2>
          <button className="close-x" onClick={onClose}><LuX /></button>
        </div>

        <form className="modal-form scrollable-form">
          {/* URL & Name */}
          <div className="input-group">
            <label><LuLink size={14} /> Recipe Link</label>
            <input type="text" placeholder="Link to original recipe..." value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} />
          </div>

          <div className="input-group">
            <label>Cook Name</label>
            <input type="text" placeholder="e.g., Spicy Miso Ramen" value={recipeName} onChange={(e) => setRecipeName(e.target.value)} required />
          </div>

          {/* Stats Row: Time & Difficulty */}
          <div className="form-row">
            <div className="input-group">
              <label><LuClock size={14} /> Time (mins)</label>
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

          {/* Star Rating */}
          <div className="input-group">
            <label>Taste Rating</label>
            <div className="star-rating-input">
              {[1, 2, 3, 4, 5].map((num) => (
                <LuStar
                  key={num}
                  size={24}
                  onClick={() => setRating(num)}
                  fill={num <= rating ? "#f1c40f" : "none"}
                  stroke={num <= rating ? "#f1c40f" : "#ccc"}
                  className="star-icon"
                />
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="input-group">
            <label>Description</label>
            <textarea placeholder="How was the process?" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          {/* Nested Tags Section */}
          <div className="input-group">
            <label><LuTag size={14} /> Tags</label>
            <div className="tags-container">
              {Object.entries(tagOptions).map(([category, options]) => (
                <div key={category} className="tag-group">
                  <span className="tag-category-label">{category}</span>
                  <div className="tag-options">
                    {options.map(tag => (
                      <button 
                        key={tag} 
                        type="button"
                        className={`tag-choice ${selectedTags.includes(tag) ? "active" : ""}`}
                        onClick={() => handleTagToggle(tag)}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="image-upload-zone">
            <input type="file" multiple onChange={handleImageUpload} id="file-input" hidden />
            <label htmlFor="file-input" className="upload-btn">
              {isUploading ? <LuLoader className="spinner" /> : <LuUpload />} 
              Upload Photos ({images.length}/3)
            </label>
            <div className="preview-row">
              {images.map((url, i) => <img key={i} src={url} className="thumb-preview" alt="preview" />)}
            </div>
          </div>

          <button type="submit" className="share-btn">Share Cook</button>
        </form>
      </div>
    </div>
  );
}