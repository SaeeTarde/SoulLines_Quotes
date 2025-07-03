// src/pages/UserDashboard.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import QuoteCard from "../components/quoteCard";
import { Link } from "react-router-dom"; // ✅ Add this at the top
import Navbar from "../components/Navbar";
import "./UserDashboard.css";
import "./homePage.css";

const UserDashboard = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [postedQuotes, setPostedQuotes] = useState([]);
  const [savedQuotes, setSavedQuotes] = useState([]);
  const [activeTab, setActiveTab] = useState("posted");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get(
          "http://localhost:7000/api/v1/users/dashboard",
          { withCredentials: true }
        );
        const data = res.data.data;
        setUserInfo(data.user);
        setPostedQuotes(data.postedQuotes);
        if (data.savedQuotes) setSavedQuotes(data.savedQuotes); // This comes only if self
      } catch (err) {
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const handleDeleteQuote = async (quoteId) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this quote?"
    );
    if (!confirm) return;
    try {
      await axios.delete(
        `https://soullines-quotes.onrender.com/api/v1/users/delete/${quoteId}`,
        {
          withCredentials: true,
        }
      );
      setPostedQuotes((prev) => prev.filter((q) => q._id !== quoteId));
    } catch (err) {
      console.error(
        "Delete failed:",
        err.response?.data?.message || err.message
      );
      alert("Failed to delete quote");
    }
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <div className="background-wrapper">
          <div className="floating-squares">
            {Array.from({ length: 30 }).map((_, i) => (
              <span
                key={i}
                className="square"
                style={{
                  "--i": i,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDuration: `${15 + Math.random() * 10}s`,
                  opacity: 0.05 + Math.random() * 0.2,
                  width: `${20 + Math.random() * 30}px`,
                  height: `${20 + Math.random() * 30}px`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              ></span>
            ))}
          </div>
        </div>

        {/* --- Profile Info --- */}
        <div className="profile-header">
          <img src={userInfo.avatar} alt="Avatar" className="profile-avatar" />
          <div className="profile-details">
            <h2>@{userInfo.username}</h2>
            <p className="dashboard-tags">
              {userInfo.tags.map((tag) => (
                <span className="tag" key={tag._id || tag}>
                  {typeof tag === "string" ? tag : tag.name}
                </span>
              ))}
            </p>
          </div>
        </div>
        <div className="settings-dropdown">
          <button className="settings-button">⚙️</button>
          <div className="dropdown-content">
            <Link to="/edit-profile">Edit Profile</Link>
            <Link to="/change-password">Change Password</Link>
          </div>
        </div>

        {/* --- Tab Switcher --- */}
        <div className="tab-buttons">
          <button
            className={activeTab === "posted" ? "active" : ""}
            onClick={() => setActiveTab("posted")}
          >
            Quotes By You
          </button>
          <button
            className={activeTab === "saved" ? "active" : ""}
            onClick={() => setActiveTab("saved")}
          >
            Saved Quotes
          </button>
        </div>

        {/* --- Quote Grids --- */}
        <div className="quote-grid">
          {activeTab === "posted" ? (
            postedQuotes.length > 0 ? (
              postedQuotes.map((quote) => (
                <QuoteCard
                  key={quote._id}
                  quote={quote}
                  onDelete={handleDeleteQuote}
                  canDelete={true}
                />
              ))
            ) : (
              <p>You haven't posted any quotes yet.</p>
            )
          ) : savedQuotes.length > 0 ? (
            savedQuotes
              .filter((q) => q && q._id) // Filter out null/undefined quotes
              .map((quote) => <QuoteCard key={quote._id} quote={quote} />)
          ) : (
            <p>No saved quotes yet.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default UserDashboard;
