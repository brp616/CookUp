import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Feed from "./components/Feed.jsx";
import "./App.css";
import { LuPlus } from "react-icons/lu";
import React, { useState } from 'react';
import CreatePost from './components/CreatePost.jsx'; // Adjust path if needed

function App() {

  // 1. Initialize the state
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="app-container">
      {/* 2. The Button triggers the state to 'true' */}
      <div className="add-cook-container">
        <button className="add-cook-btn" onClick={() => setIsModalOpen(true)}>
          <LuPlus size={28} />
          <span className="add-cook-tooltip">Add Cook</span>
        </button>
      </div>

      {/* 3. Pass the state and the closer function to the Modal */}
      <CreatePost 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    <div className="add-cook-container">
  <button className="add-cook-btn" onClick={() => setIsModalOpen(true)}>
    <LuPlus size={64} strokeWidth={3} />
    <span className="add-cook-tooltip">Add Cook</span>
  </button>
</div>,
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Feed />} />
        <Route path="/cookbooks" element={<h1>Cookbooks</h1>} />
        <Route path="/fresh" element={<h1>What's Fresh</h1>} />
        <Route path="/profile" element={<h1>Profile</h1>} />
        <Route path="/contact" element={<h1>Contact Us</h1>} />
      </Routes>
    </BrowserRouter>
  
  </div>
  );
}

export default App;
