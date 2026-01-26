//Whole lotta imports
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
import Contact from "./components/contact";

//Setting an environment variable so I can view locally and deploy. took long enough to figure it out
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:10000";

function App() {
  // get everything set up
  const [user, setUser] = useState(() => {
  const savedUser = localStorage.getItem("user"); return savedUser ? JSON.parse(savedUser) : null;
  });

  const [modalinuse, setmodalinuse] = useState(false);
  const [posts, setPosts] = useState([]);
  //setting default cookbooks so users have a place to put recipes when they start
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

  
  useEffect(() => {
    const syncUser = async () => {
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

  // fetch our data for posts and cookbook
  useEffect(() => {
  const fetchPosts = async () => {
    try {
      const postRes = await fetch(`${API_URL}/api/posts`);
      const postData = await postRes.json();
      setPosts(Array.isArray(postData) ? postData : postData.posts || []);
    } catch (err) {
      console.error("Fetch posts failed:", err);
    }
  };
  fetchPosts();
}, []);
//actually build out the site
  return (
    <div className="app-container">
      {user && (
        <div className="add-cook-container">
          <button className="add-cook-btn" onClick={() => setmodalinuse(true)}><LuPlus size={32} strokeWidth={3} /></button>
        </div>
      )}
      <CreatePost
        isOpen={modalinuse}
        onClose={() => setmodalinuse(false)}
        myCookbooks={myCookbooks}
        user={user}
        setPosts={setPosts}
      />
{/* routes galore */}
      <BrowserRouter>
        <Navbar user={user} onLogout={handleLogout} />

        <Routes>
          <Route
            path="/"
            element={
              <Feed type="timeline" myCookbooks={myCookbooks} user={user} />
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
          <Route path="/contact" element={<Contact />} />
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
