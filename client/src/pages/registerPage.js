// src/pages/RegisterPage.js

import React, { useState } from "react";
import axios from "axios";
import "./registerPage.css";
import { useNavigate } from "react-router-dom";

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

const RegisterPage = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [avatar, setAvatar] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTagToggle = (tagName) => {
    setSelectedTags((prev) =>
      prev.includes(tagName)
        ? prev.filter((name) => name !== tagName)
        : [...prev, tagName]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // ✅ Clear old JWT cookie (if any)
    try {
      const formData = new FormData();
      formData.append("username", form.username);
      formData.append("email", form.email);
      formData.append("password", form.password);
      selectedTags.forEach((tagName) => formData.append("tags", tagName));
      if (avatar) formData.append("avatar", avatar);

      const res = await axios.post(
        "https://soullines-quotes.onrender.com/api/v1/users/register",
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      console.log(res.data);
      setError("");
      localStorage.setItem("userId", res.data.data.user._id);
      alert("Registration successful!");
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="register-container">
      <div className="background-blur" />
      <div className="register-box">
        <h2>Create Account</h2>
        <form onSubmit={handleSubmit}>
          <input
            name="username"
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <div className="avatar-upload">
            <label htmlFor="avatar" className="avatar-preview">
              {avatar ? (
                <img src={URL.createObjectURL(avatar)} alt="avatar" />
              ) : (
                <span>+</span>
              )}
            </label>

            <input
              id="avatar" // This now matches the htmlFor above
              type="file"
              accept="image/*"
              onChange={(e) => setAvatar(e.target.files[0])}
              style={{ display: "none" }}
            />
            <p className="avatar-text">Upload Avatar (Optional)</p>
          </div>

          <div className="tags-section">
            <p>Select Interests:</p>
            <div className="tags-container">
              {TAG_OPTIONS.map((tag) => (
                <div
                  key={tag.label} // ✅ use tag.label
                  className={`tag-pill ${
                    selectedTags.includes(tag.label) ? "selected" : "" // ✅ use tag.label
                  }`}
                  onClick={() => handleTagToggle(tag.label)} // ✅ pass label
                >
                  {tag.label}
                </div>
              ))}
            </div>
          </div>

          <button type="submit">Register</button>
          {error && <p className="error">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
