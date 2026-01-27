import React, { useState, useEffect, memo } from "react";
import { Link } from "react-router-dom";
import RecipePost from "./RecipePost";
import "../styles/Cookbooks.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:10000";

const Cookbooks = ({ allPosts, user }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [activeCookbook, setActiveCookbook] = useState(null);
  const [customBooks, setCustomBooks] = useState([]);

  // state for new cookbook modal
  const [newBookData, setNewBookData] = useState({
    title: "",
    subtitle: "",
    color: "#f3d2a2",
    icon: "📚",
    visibility: "public"
  });

  // get cookbooks from DB, or seed them if empty
  useEffect(() => {
    if (!user?._id) return;

    const fetchOrSeedCookbooks = async () => {
      try {
        const response = await fetch(`${API_URL}/api/cookbooks?userId=${user._id}`);
        if (response.ok) {
          const dbData = await response.json();
          
          if (dbData && dbData.length > 0) {
            setCustomBooks(dbData);
          } else {
            // New user detection: Seed default books
            await seedDefaultBooks();
          }
        }
      } catch (err) {
        console.error("Failed to handle cookbooks:", err);
      }
    };

    const seedDefaultBooks = async () => {
      const defaults = [
        { 
          title: "To Cook", 
          subtitle: "Future Deliciousness", 
          color: "#a2d2f3", 
          icon: "⏳", 
          category: "to-cook", 
          userId: user._id,
          visibility: "public"
        },
        { 
          title: "Cooked", 
          subtitle: "Tried and True", 
          color: "#a2f3a2", 
          icon: "🍳", 
          category: "cooked", 
          userId: user._id,
          visibility: "public"
        }
      ];

      const createdBooks = [];
      for (const book of defaults) {
        const res = await fetch(`${API_URL}/api/cookbooks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(book)
        });
        if (res.ok) {
          const saved = await res.json();
          createdBooks.push(saved);
        }
      }
      setCustomBooks(createdBooks);
    };

    fetchOrSeedCookbooks();
  }, [user?._id]);

  const displayedCookbooks = customBooks;

  const handleDeleteCookbook = async (id) => {
    if (!user?._id) return;

    const confirmDelete = window.confirm(
      "Are you sure? This won't delete your recipes, just the cookbook folder."
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `${API_URL}/api/cookbooks/${id}?userId=${user._id}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        setCustomBooks(customBooks.filter(b => b._id !== id));
        setActiveCookbook(null);
      }
    } catch (err) {
      console.error("Failed to delete cookbook:", err);
    }
  };

  const finalizebook = async () => {
    if (!newBookData.title) {
      alert("Please give your book a title!");
      return;
    }

    if (!user?._id) {
      alert("You must be logged in to create a cookbook.");
      return;
    }

    const bookToSave = {
      ...newBookData,
      userId: user._id,
      subtitle: newBookData.subtitle || "Personal Collection",
      category: newBookData.title
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
    };

    try {
      const response = await fetch(`${API_URL}/api/cookbooks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookToSave)
      });
      if (response.ok) {
        const savedBook = await response.json();
        setCustomBooks([...customBooks, savedBook]);
        setIsCreating(false);

        setNewBookData({
          title: "",
          subtitle: "",
          color: "#f3d2a2",
          icon: "📚",
          visibility: "public"
        });
      }
    } catch (err) {
      console.error("Failed to save cookbook:", err);
    }
  };

  const getFilteredPosts = () => {
    if (!activeCookbook || !user?._id) return [];
    
    return allPosts.filter(post => {
      // 1. Ensure the recipe belongs to the current user
      const isOwner = post.userId === user._id;

      // 2. Check if the post matches this specific cookbook
      // We check the unique ID OR the category slug for legacy compatibility
      const matchesBook = 
        post.cookbookId === activeCookbook._id || 
        post.cookbookCategory === activeCookbook.category;

      return isOwner && matchesBook;
    });
  };

  if (activeCookbook) {
    const filteredPosts = getFilteredPosts();
    return (
      <div className="opened-book-container">
        {!user && (
          <div className="guest-lock-overlay">
            <div className="guest-card">
              <div className="guest-card-icon">📚</div>
              <h2>Welcome to CookUp!</h2>
              <p>What will you cook up today?</p>
              <div className="guest-actions">
                <Link to="/login" className="btn-login">Login</Link>
                <Link to="/register" className="btn-register">Register</Link>
              </div>
            </div>
          </div>
        )}

        <div className={`book-content-wrapper ${!user ? "blurred-feed" : ""}`}>
          <div className="book-controls">
            <button className="back-shelf-btn" onClick={() => setActiveCookbook(null)}>
              ← Back to Shelves
            </button>

            <button
              className="delete-book-btn"
              onClick={() => handleDeleteCookbook(activeCookbook._id)}>
              🗑️ Delete Cookbook
            </button>
          </div>

          <header
            className="opened-book-header"
            style={{ borderBottomColor: activeCookbook.color }}
          >
            <span className="header-icon">{activeCookbook.icon}</span>
            <h1>{activeCookbook.title}</h1>
            <p>{activeCookbook.subtitle}</p>
            <span className="count-tag">
              {filteredPosts.length} Recipes Found
            </span>
          </header>

          <div className="recipe-feed">
            {filteredPosts.length > 0 ? (
              filteredPosts.map(post => (
                <RecipePost
                  key={post._id}
                  post={post}
                  myCookbooks={displayedCookbooks}
                />
              ))
            ) : (
              <div className="empty-book-msg">
                <p>No recipes in this collection yet!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cookbooks-page-container">
      {!user && (
        <div className="guest-lock-overlay">
          <div className="guest-card">
            <div className="guest-card-icon">📚</div>
            <h2>Welcome to CookUp!</h2>
            <p>Please login or register to view your cookbooks.</p>
            <div className="guest-actions">
              <Link to="/login" className="btn-login">Login</Link>
              <Link to="/register" className="btn-register">Register</Link>
            </div>
          </div>
        </div>
      )}

      <div className={`cookbooks-page ${!user ? "blurred-feed" : ""}`}>
        <header className="shelf-header">
          <h1>Your Cookbooks</h1>
          <p>Cook up something yummy today!</p>
        </header>
        
        <div className="cookbooks-grid">
          {displayedCookbooks.map(book => (
            <div
              key={book._id}
              className="cookbook-card"
              style={{ backgroundColor: book.color }}
              onClick={() => setActiveCookbook(book)}
            >
              <div className="notebook-spiral">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="spiral-ring" />
                ))}
              </div>

              <div className="card-inner">
                <span className="card-emoji">{book.icon}</span>
                <h2>{book.title}</h2>
                <p>{book.subtitle}</p>
              </div>
            </div>
          ))}

          <div
            className="cookbook-card create-btn-card"
            onClick={() => setIsCreating(true)}
          >
            <div className="create-plus">+</div>
            <p>NEW BOOK</p>
          </div>
        </div>

        {isCreating && (
          <div className="modal-overlay">
            <div className="customizer-modal">
              <h2>Design Your Cookbook</h2>
              <div className="modal-body">
                <label>Title</label>
                <input
                  type="text"
                  placeholder="e.g., Summer Grilling"
                  value={newBookData.title}
                  onChange={e => setNewBookData({ ...newBookData, title: e.target.value })}
                />

                <label className="description-label">Description</label>
                <textarea
                  placeholder="e.g., Authentic family recipes..."
                  value={newBookData.subtitle}
                  maxLength="80"
                  onChange={e => setNewBookData({ ...newBookData, subtitle: e.target.value })}
                />
                <div className="selection-grid">
                  <div className="picker-section">
                    <label>Color</label>
                    <div className="color-options">
                      {["#f3d2a2", "#a2d2f3", "#f3a2a2", "#d2a2f3", "#a2f3a2"].map(c => (
                        <div
                          key={c}
                          className={`color-dot ${newBookData.color === c ? "active" : ""}`}
                          style={{ backgroundColor: c }}
                          onClick={() => setNewBookData({ ...newBookData, color: c })}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-btns">
                <button className="cancel-btn" onClick={() => setIsCreating(false)}>Cancel</button>
                <button className="save-btn" onClick={finalizebook}>Create Book</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(Cookbooks);