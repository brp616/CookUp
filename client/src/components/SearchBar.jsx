import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Navigate to Home Page with a query parameter
      navigate(`/?search=${encodeURIComponent(searchTerm)}`);
      setSearchTerm(""); // Optional: clear after search
    }
  };

  return (
    <form onSubmit={handleSearch} className="search-container">
      <input
        type="text"
        placeholder="Search..."
        className="search-input"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button
        type="submit"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          display: "flex",
        }}
      >
        <FiSearch className="search-icon" color="#888" />
      </button>
    </form>
  );
}
