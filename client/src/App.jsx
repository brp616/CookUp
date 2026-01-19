import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/NavBar";
import Feed from "./components/Feed.jsx";
import Cookbooks from "./components/CookBookPage.jsx";
import CreatePost from './components/CreatePost.jsx';
import { LuPlus } from "react-icons/lu";
import "./App.css";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
    _id: 'default-1', 
    title: "Cooked It", 
    subtitle: "Tried & True", 
    color: "#f3d2a2", 
    icon: "✅", 
    category: "cooked" 
  },
  { 
    _id: 'default-2', 
    title: "To Cook", 
    subtitle: "Future Feasts", 
    color: "#a2d2f3", 
    icon: "⏳", 
    category: "to-cook" 
  }
]);
const handleLogout = () => {
  localStorage.removeItem("user");
  setUser(null);
  window.location.href = "/login"; // Redirect to login
};
  // 2. Single Unified Fetch Call
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both simultaneously
        const [postRes, bookRes] = await Promise.all([
          fetch(`${API_URL}/api/posts`),
          fetch(`${API_URL}/api/cookbooks`)
        ]);

        const postData = await postRes.json();
        const bookData = await bookRes.json();
        



        // Ensure we are setting arrays
        setPosts(Array.isArray(postData) ? postData : (postData.posts || []));
        setMyCookbooks(Array.isArray(bookData) ? bookData : []);
        
        console.log("Data loaded successfully");
      } catch (err) {
        console.error("Fetch failed:", err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="app-container">
      {/* Floating Add Button */}
      {user && (
  <>
    <div className="add-cook-container">
      <button className="add-cook-btn" onClick={() => setIsModalOpen(true)}>
        <LuPlus size={32} strokeWidth={3} />
      </button>
    </div>
    <CreatePost 
      isOpen={isModalOpen} 
      onClose={() => setIsModalOpen(false)} 
      myCookbooks={myCookbooks}
      user={user}
    />
  </>
)}

      {/* Global Upload Modal */}
      <CreatePost 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        myCookbooks={myCookbooks}
        user={user}
      />

      <BrowserRouter>
        <Navbar user={user} onLogout={handleLogout} />
        <Routes>
          {/* FIXED: 'posts={posts}' must be lowercase to match Feed.jsx */}
          <Route path="/" element={
            <Feed posts={posts} myCookbooks={myCookbooks}/>
          } />
          
          <Route path="/cookbooks" element={
            <Cookbooks 
              allPosts={posts} 
              myCookbooks={myCookbooks} 
              setMyCookbooks={setMyCookbooks}
            />
          } />

          <Route path="/fresh" element={<h1>What's Fresh</h1>} />
          <Route path="/profile" element={<Profile currentUser={user} />} />
          <Route path="/profile/:userId" element={<Profile currentUser={user}/>} />
          <Route path="/contact" element={<h1>Contact Us</h1>} />
          <Route path="/login" element={<Login setUser={setUser} />} />
<Route path="/register" element={<Register setUser={setUser} />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;