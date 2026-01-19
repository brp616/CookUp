import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import RecipePost from "../components/RecipePost"; 
import "../styles/Profile.css";

export default function Profile({ currentUser, setCurrentUser }) {
  const { userId } = useParams();
  const [profileUser, setProfileUser] = useState(null); 
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    bio: "",
    profilePic: ""
  });

  // Default Chef Image Fallback
  const defaultAvatar = "https://png.pngtree.com/png-clipart/20241030/original/pngtree-a-cheerful-cook-emoji-icon-png-image_16560077.png";

  const isOwnProfile = currentUser?._id === userId;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await fetch(`http://localhost:5000/api/auth/${userId}`);
        const userData = await userRes.json();
        setProfileUser(userData);
        
        setEditData({ 
          bio: userData.bio || "", 
          profilePic: userData.profilePic || "" 
        });

        const postsRes = await fetch("http://localhost:5000/api/posts");
        const allPosts = await postsRes.json();
        const userPosts = allPosts.filter(
          (p) => p.user === userId || p.user?._id === userId
        );
        setPosts(userPosts);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  // CLOUDINARY UPLOAD HANDLER
  const handleUpload = () => {
    window.cloudinary.openUploadWidget(
      {
        cloudName: "ddhhjsobx", // Replace with your Cloudinary Cloud Name
        uploadPreset: "Cookup_uploads",   // Replace with your Unsigned Upload Preset
        sources: ["local", "url", "camera"],
        multiple: false,
        theme: "minimal"
      },
      (error, result) => {
        if (!error && result && result.event === "success") {
          console.log("Upload success!", result.info.secure_url);
          setEditData({ ...editData, profilePic: result.info.secure_url });
        }
      }
    );
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/auth/update/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: currentUser._id, 
          ...editData 
        }),
      });

      if (!res.ok) throw new Error("Update failed");

      const updatedUser = await res.json();
      
      setProfileUser(updatedUser);
      setCurrentUser(updatedUser); 
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      setIsEditing(false);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="profile-loading">Loading Chef's Kitchen...</div>;
  if (!profileUser) return <div className="profile-error">User not found!</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar-large">
          <img
            src={profileUser.profilePic || defaultAvatar}
            alt={profileUser.username}
          />
        </div>

        <div className="profile-info">
          <h1>{profileUser.username}</h1>

          {isEditing ? (
            <form className="edit-profile-form" onSubmit={handleUpdate}>
              <button 
                type="button" 
                className="upload-btn" 
                onClick={handleUpload}
              >
                Change Profile Picture
              </button>
              
              {editData.profilePic && (
                <p className="pic-ready-msg">New image selected! ✅</p>
              )}

              <textarea
                placeholder="Tell us about your cooking style..."
                value={editData.bio}
                onChange={(e) => setEditData({...editData, bio: e.target.value})}
              />
              
              <div className="edit-buttons">
                <button type="submit" className="save-btn">Save Changes</button>
                <button type="button" onClick={() => setIsEditing(false)} className="cancel-btn">Cancel</button>
              </div>
            </form>
          ) : (
            <>
              <p className="profile-bio">{profileUser.bio || "No bio yet. 🍳"}</p>
              {isOwnProfile && (
                <button className="edit-btn" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </button>
              )}
            </>
          )}

          <div className="profile-stats">
            <span><strong>{posts.length}</strong> Cooks</span>
            <span><strong>12</strong> Followers</span>
            <span><strong>58</strong> Yums Received</span>
          </div>
        </div>
      </div>

      <hr className="profile-divider" />

      <div className="profile-feed">
        <h3>{profileUser.username}'s Kitchen History</h3>
        {posts.length === 0 ? (
          <p className="no-posts">This chef hasn't cooked anything yet!</p>
        ) : (
          <div className="profile-grid">
            {posts.map((post) => (
              <RecipePost key={post._id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}