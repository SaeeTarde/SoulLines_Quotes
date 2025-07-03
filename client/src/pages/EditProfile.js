import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./EditProfile.css";

const TAG_OPTIONS = [
  { label: "Love" },
  { label: "Poetry" },
  { label: "Motivation" },
  { label: "Life" },
  { label: "War" },
  { label: "Humanity" },
  { label: "Friendship " },
  { label: "Growth" },
  { label: "Wisdom" },
  { label: "Resilience" },
  { label: "Silence" },
  { label: "Freedom" },
  { label: "Hope" },
  { label: "Dreams" },
];

const EditProfile = () => {
  const [username, setUsername] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          "https://soullines-quotes.onrender.com/api/v1/users/dashboard",
          { withCredentials: true }
        );
        const user = res.data.data.user;
        setUsername(user.username || "");

        // Convert tag objects (or IDs) to lowercase name strings for comparison
        const tagNames = user.tags.map((tag) =>
          typeof tag === "string" ? tag.toLowerCase() : tag.name?.toLowerCase()
        );
        setSelectedTags(tagNames || []);
        setAvatarPreview(user.avatar);
      } catch (err) {
        console.error("Failed to load user:", err.response?.data?.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleTagToggle = (tagName) => {
    setSelectedTags((prev) =>
      prev.includes(tagName.toLowerCase())
        ? prev.filter((name) => name !== tagName.toLowerCase())
        : [...prev, tagName.toLowerCase()]
    );
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    setAvatarFile(file);
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const formData = new FormData();
    formData.append("username", username);
    selectedTags.forEach((tagName) => formData.append("tags", tagName));
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    try {
      await axios.patch(
        "https://soullines-quotes.onrender.com/api/v1/users/update-profile",
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setMessage("Profile updated successfully!");
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      console.error("Update failed:", err.response?.data?.message);
      setMessage("Failed to update profile.");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <Navbar />
      <div className="body">
        <div className="background-wrapper">
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

        <div className="edit-profile-container">
          <h2>Edit Profile</h2>
          <form onSubmit={handleSubmit} className="edit-form">
            <div className="form-group">
              <label>Username:</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Select Tags:</label>
              <div className="tags-container">
                {TAG_OPTIONS.map((tag) => (
                  <div
                    key={tag.label}
                    className={`tag-pill ${
                      selectedTags.includes(tag.label.toLowerCase())
                        ? "selected"
                        : ""
                    }`}
                    onClick={() => handleTagToggle(tag.label)}
                  >
                    {tag.label}
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Avatar:</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
              />
              {avatarPreview && (
                <img
                  src={avatarPreview}
                  alt="Avatar Preview"
                  className="avatar-preview"
                />
              )}
            </div>

            <button type="submit">Update Profile</button>
            {message && <p className="form-message">{message}</p>}
          </form>
        </div>
      </div>
    </>
  );
};

export default EditProfile;
