import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/NavBar";
import Feed from "./components/Feed.jsx";
import PostDetail from "./components/PostDetail.jsx";
import Cookbooks from "./components/CookBookPage.jsx";
import CreatePost from "./components/CreatePost.jsx";
import { LuPlus } from "react-icons/lu";
import "./App.css";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";
import WhatsFresh from "./components/WhatsFresh";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:10000";

function App() {
  // 1. State Initialization
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [myCookbooks, setMyCookbooks] = useState([
    {
      _id: "default-1",
      title: "Cooked It",
      subtitle: "Tried & True",
      color: "#f3d2a2",
      icon: "✅",
      category: "cooked",
    },
    {
      _id: "default-2",
      title: "To Cook",
      subtitle: "Future Feasts",
      color: "#a2d2f3",
      icon: "⏳",
      category: "to-cook",
    },
  ]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login";
  };

  // 2. USER SYNC: Cleaned ID to prevent ":1" or 404 errors
  useEffect(() => {
    const syncUser = async () => {
      // Logic fix: Ensure ID is present and strip any stray characters
      if (user && user._id) {
        try {
          const cleanId = String(user._id).split(":")[0].trim(); // Removes ":1" if it exists
          const res = await fetch(`${API_URL}/api/auth/${cleanId}`);

          if (res.ok) {
            const freshUserData = await res.json();
            localStorage.setItem("user", JSON.stringify(freshUserData));
            setUser(freshUserData);
          }
        } catch (err) {
          console.error("User sync failed:", err);
        }
      }
    };
    syncUser();
  }, []);

  // 3. Unified Data Fetch: Posts and Cookbooks
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postRes, bookRes] = await Promise.all([
          fetch(`${API_URL}/api/posts`),
          fetch(`${API_URL}/api/cookbooks`),
        ]);

        const postData = await postRes.json();
        const bookData = await bookRes.json();

        setPosts(Array.isArray(postData) ? postData : postData.posts || []);
        setMyCookbooks(Array.isArray(bookData) ? bookData : []);
      } catch (err) {
        console.error("Fetch failed:", err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="app-container">
      {user && (
        <div className="add-cook-container">
          <button className="add-cook-btn" onClick={() => setIsModalOpen(true)}>
            <LuPlus size={32} strokeWidth={3} />
          </button>
        </div>
      )}

      <CreatePost
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        myCookbooks={myCookbooks}
        user={user}
        setPosts={setPosts}
      />

      <BrowserRouter>
        <Navbar user={user} onLogout={handleLogout} />

        <Routes>
          <Route
            path="/"
            element={
              <Feed posts={posts} myCookbooks={myCookbooks} user={user} />
            }
          />
          <Route
            path="/cookbooks"
            element={
              <Cookbooks
                allPosts={posts}
                myCookbooks={myCookbooks}
                setMyCookbooks={setMyCookbooks}
                user={user}
              />
            }
          />
          <Route
            path="/fresh"
            element={<WhatsFresh user={user} myCookbooks={myCookbooks} />}
          />
          <Route
            path="/profile"
            element={<Profile currentUser={user} setUser={setUser} />}
          />
          <Route
            path="/profile/:userId"
            element={<Profile currentUser={user} setUser={setUser} />}
          />
          <Route path="/contact" element={<h1>Contact Us</h1>} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register setUser={setUser} />} />
          <Route
            path="/post/:id"
            element={<PostDetail user={user} myCookbooks={myCookbooks} />}
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
