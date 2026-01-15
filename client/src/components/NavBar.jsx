import { NavLink } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import "../styles/navbar.css";
import logo from "../assets/Logo_NavBar.png";

export default function Navbar() {
  return (
    <nav className="navbar">
      {/* Left: Logo */}
      <NavLink to="/" className="logo">
        CookUp!
        <img src={logo} alt="CookUp logo" className="logo-img"/>
      </NavLink>

      {/* Center: Navigation */}
      <ul className="navbar-links">
        <li><NavLink to="/">Feed</NavLink></li>
        <li><NavLink to="/cookbooks">Cookbooks</NavLink></li>
        <li><NavLink to="/fresh">What's Fresh</NavLink></li>
        <li><NavLink to="/profile">Profile</NavLink></li>
        <li><NavLink to="/contact">Contact Us</NavLink></li>
      </ul>
        <div className="navbar-right">
      {/* Right: Search */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search recipes or users..."
          className="search-input"
        />
        <FiSearch className="search-icon" />
      </div>
      </div>
    </nav>
    
  );
}