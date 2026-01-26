import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";

export default function SearchBar() {
  const [searchterm, setsearchterm] = useState("");
  const navigate = useNavigate();

  const dosearch = (e) => {
    e.preventDefault();
    if (searchterm.trim()) {
      navigate(`/?search=${encodeURIComponent(searchterm)}`);
      setsearchterm("");
    }
  };
  return (
    <form onSubmit={dosearch} className="search-container">
      <input
        type="text"
        placeholder="Search..."
        className="search-input"
        value={searchterm}
        onChange={(e) => setsearchterm(e.target.value)}
      />
      <button
        type="submit"
        style={{background: "none",border: "none", cursor: "pointer",padding: 0,display: "flex",
        }}
      >
        <FiSearch className="search-icon" color="#888" />
    </button>
    </form>
  );
}
