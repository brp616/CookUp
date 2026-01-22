import React, { useState} from "react";
import { LuX, LuUpload, LuLink, LuLoader, LuClock, LuFlame, LuStar, LuTag } from "react-icons/lu";
import "../styles/createPost.css";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';
const CLOUD_NAME = "ddhhjsobx"; 
const UPLOAD_PRESET = "Cookup_uploads";



export default function CreatePost({ isOpen, onClose, myCookbooks = [], user }) {
  const [images, setImages] = useState([]);
  const [recipeName, setRecipeName] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [description, setDescription] = useState("");
  const [cookTime, setCookTime] = useState(30);
  const [difficulty, setDifficulty] = useState("Medium");
  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [cookbookCategory, setCookbookCategory] = useState("none");

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

  // --- CLOUDINARY LOGIC ---
  const handleImageUpload = async (e) => {
  const files = Array.from(e.target.files);
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const invalidFile = files.find(file => !allowedTypes.includes(file.type));

  if (invalidFile) {
    alert("Only image files (JPG, PNG, WEBP, GIF) are allowed! Please remove the PDF or other files.");
    e.target.value = null; // Reset input
    return;
  }
  if (images.length + files.length > 3) return alert("Max 3 images!");
  
  setIsUploading(true);

  try {
    const uploadPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );

      if (!response.ok) throw new Error("Upload failed");
      const data = await response.json();
      return data.secure_url;
    });

    const newUrls = await Promise.all(uploadPromises);
    
    // --- KEY CHANGE START ---
    // Log exactly what we are about to put into state
    console.log("Adding these to state:", newUrls);
    
    setImages((currentImages) => {
      const updatedImages = [...currentImages, ...newUrls];
      console.log("New State will be:", updatedImages);
      return updatedImages;
    });
    // --- KEY CHANGE END ---

  } catch (error) {
    console.error("Cloudinary Error:", error);
    alert("Error uploading images.");
  } finally {
    setIsUploading(false);
    // Important: Clear the file input so you can upload the same file again if needed
    e.target.value = null; 
  }
};

  // --- MONGODB SUBMISSION LOGIC ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !user._id) {
      return alert("You must be logged in to post!");
    }

    if (images.length === 0) {
      return alert("Please upload at least one image before sharing.");
    }

    const newCook = {
    user: user._id, 
  username: user.username,      // Added: Schema expects a username string
  userAvatar: user.profilePic || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + user.username, // Added: Matches schema field
  recipeName,
  description,
  recipeLink: sourceUrl,         // Fixed: Maps frontend 'sourceUrl' to backend 'recipeLink'
  sourceUrl: sourceUrl,          // Keeping this since it's also in your schema
  dishImages: images,            // Matches Schema!
  cookTime: Number(cookTime),
  difficulty,
  rating: Number(rating),        // Ensure it's a number
  tags: selectedTags,
  cookbookCategory: cookbookCategory
    };

    // DEBUG: Check this log in your browser console!
    console.log("FINAL PAYLOAD BEING SENT:", newCook);

    try {
      const response = await fetch(`${API_URL}/api/posts`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCook),
      });

      if (response.ok) {
        alert("Cook Shared Successfully!");
        onClose(); 
        window.location.reload(); 
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (err) {
      console.error("Server Error:", err);
      alert("Could not connect to the server.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Post a Cook</h2>
          <button className="close-x" onClick={onClose}><LuX /></button>
        </div>

        <form className="modal-form scrollable-form" onSubmit={handleSubmit}>
          
          <div className="input-group">
            <label><LuLink size={14} /> Recipe Link</label>
            <input 
               type="text" 
               placeholder="Link to original recipe..." 
               value={sourceUrl} 
               onChange={(e) => setSourceUrl(e.target.value)} 
            />
          </div>

          <div className="input-group">
            <label>Cook Name</label>
            <input 
              type="text" 
              placeholder="e.g., Spicy Miso Ramen" 
              value={recipeName} 
              onChange={(e) => setRecipeName(e.target.value)} 
              required 
            />
          </div>

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
                  style={{ cursor: 'pointer' }}
                />
              ))}
            </div>
          </div>

          <div className="input-group">
            <label>Description</label>
            <textarea 
              placeholder="How was the process?" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
            />
          </div>

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

          <div className="form-group">
            <label>Add to Cookbook</label>
            <select 
              value={cookbookCategory} 
              onChange={(e) => setCookbookCategory(e.target.value)}
              className="category-select"
            >
              <option value="none">🌍 General Feed</option>
              {myCookbooks.map(book => (
                <option key={book._id} value={book.category}>
                  {book.icon} {book.title}
                </option>
              ))}
            </select>
          </div>

          <div className="image-upload-zone">
            <input type="file" multiple onChange={handleImageUpload} id="file-input" hidden />
            <input 
  type="file" 
  multiple 
  accept="image/png, image/jpeg, image/webp, image/gif" 
  onChange={handleImageUpload} 
  id="file-input" 
  hidden 
/>
            <label htmlFor="file-input" className={`upload-btn ${isUploading ? 'disabled' : ''}`}>
              {isUploading ? <LuLoader className="spinner" /> : <LuUpload />} 
              Upload Photos ({images.length}/3)
            </label>
            <div className="preview-row">
              {images.map((url, i) => (
                <div key={i} className="thumb-wrapper">
                  <img src={url} className="thumb-preview" alt="preview" />
                  <button 
                    type="button" 
                    className="remove-img" 
                    onClick={() => setImages(images.filter((_, index) => index !== i))}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="share-btn" disabled={isUploading || images.length === 0}>
            {isUploading ? "Uploading..." : "Share Cook"}
          </button>
        </form>
      </div>
    </div>
  );
}