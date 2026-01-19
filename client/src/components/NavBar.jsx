import { NavLink, useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import "../styles/NavBar.css";
import logo from "../assets/Logo_NavBar.png";

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  // This wrapper ensures the global state is cleared before navigating
  const handleLogoutClick = () => {
    onLogout(); // Clears App.js state & localStorage
    navigate("/login");
  };

  return (
    <nav className="navbar">
      {/* Left: Logo */}
      <NavLink to="/" className="logo">
        CookUp!
        <img src={logo} alt="CookUp logo" className="logo-img" />
      </NavLink>

      {/* Center: Navigation */}
      <ul className="navbar-links">
        <li><NavLink to="/">Feed</NavLink></li>
        <li><NavLink to="/cookbooks">Cookbooks</NavLink></li>
        <li><NavLink to="/fresh">What's Fresh</NavLink></li>
        <li>
          <NavLink to={user ? `/profile/${user._id}` : "/login"}>
            Profile
          </NavLink>
        </li>
        <li><NavLink to="/contact">Contact Us</NavLink></li>
      </ul>

      <div className="navbar-right">
        {/* Right: Search */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Search recipes..."
            className="search-input"
          />
          <FiSearch className="search-icon" />
        </div>

        {/* --- AUTH SECTION --- */}
        <div className="auth-buttons" style={{ marginLeft: "15px", display: "flex", alignItems: "center", gap: "10px" }}>
          {user ? (
            <>
              <span className="user-greeting">
                Hello, <strong>{user.username}</strong>
              </span>

              <button onClick={handleLogoutClick} className="nav-btn logout">
                Logout
              </button>
            </>
          ) : (
            <NavLink to="/login" className="nav-btn">
              Login
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
}