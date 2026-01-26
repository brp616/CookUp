//Component housing the navbar at the top of the page with nav links, search bar, and login buttons

import { NavLink, useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import "../styles/NavBar.css";
import logo from "../assets/Logo_NavBar.png";

 export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate(); 
  const handleLogoutClick = () => {
    onLogout(); 
    navigate("/login");
  };

  return (
    <nav className="navbar">
                {/*logo, name*/}
      <NavLink to="/" className="logo">
        CookUp!
        <img src={logo} alt="CookUp logo" className="logo-img" />
      </NavLink>
        {/*navigate to pages*/}
      <ul className="navbar-links">
        <li>
          <NavLink to="/">Feed</NavLink>
        </li>
          <li>
          <NavLink to="/cookbooks">Cookbooks</NavLink>
        </li>
        <li>
          <NavLink to="/fresh">What's Fresh</NavLink>
        </li>
        <li>
          <NavLink to={user ? `/profile/${user._id}` : "/login"}>
            Profile
          </NavLink>
        </li>
        <li>
          <NavLink to="/contact">Contact Us</NavLink>
        </li>
      </ul>

      <div className="navbar-right">
        <SearchBar />

        {/* --- Login section --- */}
        <div
          className="auth-buttons"
          style={{
              marginLeft: "15px", display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          {user ? (
            <>
              <span className="user-greeting">
                Hello, <strong>{user.username}</strong>
              </span>
              {/* --- actually handle login/logout --- */}
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
