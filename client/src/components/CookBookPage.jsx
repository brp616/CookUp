import React, { useState, useEffect, memo } from 'react';
import { Link } from 'react-router-dom'; 
import RecipePost from './RecipePost'; 
import '../styles/Cookbooks.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';

const Cookbooks = ({ allPosts, myCookbooks, setMyCookbooks, user }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [activeCookbook, setActiveCookbook] = useState(null);
  const [newBookData, setNewBookData] = useState({
    title: "",
    subtitle: "",
    color: "#f3d2a2",
    icon: "📚",
    visibility: "public" // Initialize here
  });

  // --- FETCH LOGIC (Load user-specific books on mount) ---
  useEffect(() => {
  if (!user?._id) return;

  const fetchUserCookbooks = async () => {
    try {
      const response = await fetch(`${API_URL}/api/cookbooks?userId=${user._id}`);
      
      if (response.ok) {
        const dbData = await response.json();
        
        // FIX: Only update if we actually got books back from the DB
        if (dbData && dbData.length > 0) {
          setMyCookbooks(prevBooks => {
            // This prevents adding the same book twice if the effect runs again
            const existingIds = new Set(prevBooks.map(b => b._id));
            const uniqueNewBooks = dbData.filter(b => !existingIds.has(b._id));
            return [...prevBooks, ...uniqueNewBooks];
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch cookbooks:", err);
    }
  };

  fetchUserCookbooks();
}, [user?._id]);

  // --- DELETE LOGIC ---
  const handleDeleteCookbook = async (id) => {
    if (!user?._id) return;
    
    if (window.confirm("Are you sure? This won't delete your recipes, just the cookbook folder.")) {
      try {
        // Passing userId as a query param to match your simple backend logic
        const response = await fetch(`${API_URL}/api/cookbooks/${id}?userId=${user._id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setMyCookbooks(myCookbooks.filter(b => b._id !== id));
          setActiveCookbook(null); 
        }
      } catch (err) {
        console.error("Failed to delete cookbook:", err);
      }
    }
  };

  // --- SAVE LOGIC ---
  const finalizeBook = async () => {
    console.log("User Prop Value:", user);
    if (!newBookData.title) return alert("Please give your book a title!");
    if (!user?._id) return alert("You must be logged in to create a cookbook.");

    const bookToSave = {
      ...newBookData,
      userId: user._id, // Crucial: sending the ID to the backend
      subtitle: newBookData.subtitle || "Personal Collection",
      category: newBookData.title.toLowerCase().trim().replace(/\s+/g, '-')
    };

    try {
      const response = await fetch(`${API_URL}/api/cookbooks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookToSave)
      });

      if (response.ok) {
        const savedBook = await response.json();
        setMyCookbooks([...myCookbooks, savedBook]);
        setIsCreating(false);
        setNewBookData({ title: "", subtitle: "", color: "#f3d2a2", icon: "📚" });
      }
    } catch (err) {
      console.error("Failed to save cookbook:", err);
    }
  };

  const getFilteredPosts = () => {
    if (!activeCookbook) return [];
    return (allPosts || []).filter(post => 
      post.cookbookCategory === activeCookbook.category || 
      post.tags?.includes(activeCookbook.category)
    );
  };

  // --- VIEW 1: THE OPENED BOOK ---
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
                <p className="sub-text">Please login or register to view your cookbooks.</p>
                <div className="guest-actions">
                  <Link to="/login" className="btn-login">Login</Link>
                  <Link to="/register" className="btn-register">Register</Link>
                </div>
              </div>
            </div>
          )}

        <div className={`book-content-wrapper ${!user ? 'blurred-feed' : ''}`}>
            <div className="book-controls">
              <button className="back-shelf-btn" onClick={() => setActiveCookbook(null)}>
                ← Back to Shelves
              </button>
              <button className="delete-book-btn" onClick={() => handleDeleteCookbook(activeCookbook._id)}>
                🗑️ Delete Cookbook
              </button>
            </div>

            <header className="opened-book-header" style={{ borderBottomColor: activeCookbook.color }}>
              <span className="header-icon">{activeCookbook.icon}</span>
              <h1>{activeCookbook.title}</h1>
              <p>{activeCookbook.subtitle}</p>
              <span className="count-tag">{filteredPosts.length} Recipes Found</span>
            </header>

            <div className="recipe-feed">
              {filteredPosts.length > 0 ? (
                filteredPosts.map(post => <RecipePost key={post._id} post={post} myCookbooks={myCookbooks} />)
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

  // --- VIEW 2: THE BOOKSHELF ---
  return (
    <div className="cookbooks-page-container">
      {!user && (
        <div className="guest-lock-overlay">
          <div className="guest-card">
            <div className="guest-card-icon">📚</div>
            <h2>Welcome to CookUp!</h2>
            <p>What will you cook up today?</p>
            <p className="sub-text">Please login or register to view your cookbooks.</p>
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
          {(myCookbooks || []).map((book) => (
            <div 
              key={book._id} 
              className="cookbook-card" 
              style={{ backgroundColor: book.color }}
              onClick={() => setActiveCookbook(book)}
            >
              <div className="notebook-spiral">
                {[...Array(6)].map((_, i) => <div key={i} className="spiral-ring" />)}
              </div>
              <div className="card-inner">
                <span className="card-emoji">{book.icon}</span>
                <h2>{book.title}</h2>
                <p>{book.subtitle}</p>
              </div>
            </div>
          ))}

          <div className="cookbook-card create-btn-card" onClick={() => setIsCreating(true)}>
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
                  onChange={(e) => setNewBookData({...newBookData, title: e.target.value})}
                />
                <label>Description / Subtitle</label>
                <div className="textarea-wrapper">
                  <textarea 
                    placeholder="e.g., Authentic family recipes..."
                    value={newBookData.subtitle}
                    maxLength="80"
                    onChange={(e) => setNewBookData({...newBookData, subtitle: e.target.value})}
                    rows="3"
                    className="modal-textarea"
                  />
                  <span className={`char-counter ${newBookData.subtitle.length >= 80 ? 'limit-reached' : ''}`}>
                    {newBookData.subtitle.length}/80
                  </span>
                </div>

                <div className="selection-grid">
                  <div className="picker-section">
                    <label>Cover Color</label>
                    <div className="color-options">
                      {['#f3d2a2', '#a2d2f3', '#f3a2a2', '#d2a2f3', '#a2f3a2'].map(c => (
                        <div 
                          key={c} 
                          className={`color-dot ${newBookData.color === c ? 'active' : ''}`}
                          style={{ backgroundColor: c }}
                          onClick={() => setNewBookData({...newBookData, color: c})}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="picker-section">
                    <label>Icon</label>
                    <div className="emoji-options">
                      {['📚', '🍳', '🍰', '🥗', '🌶️', '🍕'].map(e => (
                        <span 
                          key={e} 
                          className={`emoji-choice ${newBookData.icon === e ? 'active-emoji' : ''}`}
                          onClick={() => setNewBookData({...newBookData, icon: e})}
                        >
                          {e}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-btns">
                <button className="cancel-btn" onClick={() => setIsCreating(false)}>Cancel</button>
                <button className="save-btn" onClick={finalizeBook}>Create Book</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(Cookbooks);