// src/pages/PublicUserProfile.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import QuoteCard from "../components/quoteCard";
import Navbar from "../components/Navbar";
import "./UserDashboard.css";

const PublicUserProfile = () => {
  const { userId } = useParams();
  const [userInfo, setUserInfo] = useState(null);
  const [userQuotes, setUserQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          `http://localhost:7000/api/v1/users/${userId}/profile`
        );
        const data = res.data.data;
        setUserInfo(data.user);
        setUserQuotes(data.quotes);
      } catch (err) {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        {/* --- Profile Info --- */}
        <div className="profile-header">
          <img src={userInfo.avatar} alt="Avatar" className="profile-avatar" />
          <div className="profile-details">
            <h2>@{userInfo.username}</h2>
            <p className="dashboard-tags">
              {userInfo.tags?.map((tag) => (
                <span className="tag" key={tag._id || tag}>
                  {typeof tag === "string" ? tag : tag.name}
                </span>
              ))}
            </p>
          </div>
        </div>

        {/* --- User's Quotes --- */}
        <div className="quote-grid">
          {userQuotes.length > 0 ? (
            userQuotes.map((quote) => (
              <QuoteCard key={quote._id} quote={quote} />
            ))
          ) : (
            <p>This user hasn’t posted any quotes yet.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default PublicUserProfile;
