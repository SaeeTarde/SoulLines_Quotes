import React, { useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./AddPost.css";

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

const AddPost = () => {
  const [quoteText, setQuoteText] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [source, setSource] = useState("");
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedFont, setSelectedFont] = useState("inherit");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleTagToggle = (tagLabel) => {
    setSelectedTags((prev) =>
      prev.includes(tagLabel)
        ? prev.filter((t) => t !== tagLabel)
        : [...prev, tagLabel]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!quoteText.trim()) {
      return setError("Quote text is required");
    }

    try {
      const formData = new FormData();
      formData.append("quoteText", quoteText);
      formData.append("authorName", authorName);
      formData.append("source", source);
      formData.append("fontFamily", selectedFont);
      selectedTags.forEach((tag) => formData.append("tags", tag));
      if (backgroundImage) {
        formData.append("backgroundImage", backgroundImage);
      }

      await axios.post(
        "http://localhost:7000/api/v1/users/add-post",
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setSuccess("Quote posted successfully!");
      setError("");
      setQuoteText("");
      setAuthorName("");
      setSource("");
      setSelectedTags([]);
      setBackgroundImage(null);
      setSelectedFont("inherit");
    } catch (err) {
      setSuccess("");
      setError(err.response?.data?.message || "Failed to post quote");
    }
  };

  return (
    <>
      <div className="body">
        <Navbar />
        <div className="addpost-container">
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
          <div className="block">
            <h2 className="addpost-title">Add New Quote</h2>
            <form className="addpost-form" onSubmit={handleSubmit}>
              {/* Font Selector */}
              <label htmlFor="fontSelector">Select Font:</label>
              <select
                id="fontSelector"
                value={selectedFont}
                onChange={(e) => setSelectedFont(e.target.value)}
                className="font-selector"
              >
                <option value="inherit">Default</option>
                <option value="serif">Serif</option>
                <option value="sans-serif">Sans Serif</option>
                <option value="monospace">Monospace</option>
                <option value="cursive">Cursive</option>
                <option value="fantasy">Fantasy</option>
                <option value="'Pacifico', cursive">Pacifico</option>
                <option value="'Poppins', sans-serif">Poppins</option>
                <option value="'Roboto', sans-serif">Roboto</option>
                <option value="'Lobster', cursive">Lobster</option>
                <option value="'Merriweather', serif">Merriweather</option>
                <option value="'Indie Flower', cursive">Indie Flower</option>
                <option value="'Dancing Script', cursive">
                  Dancing Script
                </option>
                <option value="'Quicksand', sans-serif">Quicksand</option>
                <option value="'Playfair Display', serif">
                  Playfair Display
                </option>
                <option value="'Source Code Pro', monospace">
                  Source Code Pro
                </option>
                <option value="'Raleway', sans-serif">Raleway</option>
                <option value="'Shadows Into Light', cursive">
                  Shadows Into Light
                </option>
                <option value="'Amatic SC', cursive">Amatic SC</option>
                <option value="'Bebas Neue', cursive">Bebas Neue</option>
              </select>

              <textarea
                value={quoteText}
                onChange={(e) => setQuoteText(e.target.value)}
                placeholder="Write your quote here..."
                rows={4}
                required
                style={{ fontFamily: selectedFont }}
              />
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Author Name (optional)"
              />
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="Source (e.g. Book, Movie) (optional)"
              />

              <div className="upload-section">
                <label htmlFor="bgImage" className="bg-image-preview">
                  {backgroundImage ? (
                    <img
                      src={URL.createObjectURL(backgroundImage)}
                      alt="Preview"
                      className="bg-preview-img"
                    />
                  ) : (
                    <span className="plus-sign">+</span>
                  )}
                </label>

                <input
                  id="bgImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setBackgroundImage(e.target.files[0])}
                  style={{ display: "none" }}
                />
                <p className="upload-hint">
                  Upload Background Image (Optional)
                </p>
              </div>

              <div className="tags-section">
                <p>Select Tags:</p>
                <div className="tags-container">
                  {TAG_OPTIONS.map((tag) => (
                    <div
                      key={tag.label}
                      className={`tag-pill ${
                        selectedTags.includes(tag.label) ? "selected" : ""
                      }`}
                      onClick={() => handleTagToggle(tag.label)}
                    >
                      {tag.label}
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit">Post Quote</button>
              {error && <p className="error-msg">{error}</p>}
              {success && <p className="success-msg">{success}</p>}
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddPost;
