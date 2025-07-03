// src/components/Navbar.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Navbar.css";

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId"); // or however you store it

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await axios.get(
          `https://soullines-quotes.onrender.com/api/v1/users/dashboard`,
          { withCredentials: true }
        );
        setAvatarUrl(res.data.data.user.avatar);
        console.log("Fetched user:", res.data.data.user);
        console.log("Avatar URL:", res.data.data.user.avatar);
      } catch (err) {
        console.error("Failed to load user data:", err);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        "https://soullines-quotes.onrender.com/api/v1/users/logout",
        {},
        { withCredentials: true }
      );
      localStorage.removeItem("userId"); // Clear localStorage
      navigate("/"); // Redirect to initial page
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        {/* <h2 className="navbar-logo" onClick={() => navigate("/homePage")}>
          Quotify
        </h2> */}
      </div>

      <form className="navbar-search" onSubmit={handleSearchSubmit}>
        <input
          type="text"
          placeholder="Search quotes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit">🔍</button>
      </form>
      <ul className="navbar-links-below">
        <li onClick={() => navigate("/home")}>Home</li>
        {/* <li onClick={() => navigate("/saved")}>Saved</li> */}
        <li onClick={() => navigate("/add-post")} className="post tooltip">
          +<span className="tooltip-text">Add Post</span>
        </li>
        <li
          onClick={() => navigate("/dashboard")}
          className="profile-pic-link tooltip"
        >
          <img
            src={avatarUrl || "https://i.pravatar.cc/150"} // Fallback if null
            alt="Profile"
            className="profile-pic"
          />
          <span className="tooltip-text">Profile</span>
        </li>
        <li onClick={handleLogout}>Logout</li>
      </ul>
    </nav>
  );
};

export default Navbar;
