// src/components/quoteCard.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import { Link } from "react-router-dom";
import "./QuoteCard.css";
import { FaHeart, FaRegHeart, FaBookmark, FaRegBookmark } from "react-icons/fa";

const QuoteCard = ({ quote, onDelete, canDelete = false }) => {
  const [liked, setLiked] = useState(quote.isLiked || false);
  const [likesCount, setLikesCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [saved, setSaved] = useState(quote.isSaved || false); // You can pass isSaved from backend later
  const [saveLoading, setSaveLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false); // 👈 new

  useEffect(() => {
    setLiked(quote.isLiked || false);
    setSaved(quote.isSaved || false);
  }, [quote.isLiked, quote.isSaved]);

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const res = await axios.get(
          `http://localhost:7000/api/v1/users/likes/${quote._id}`,
          { withCredentials: true }
        );
        setLikesCount(res.data.data.likes);
      } catch (err) {
        console.error(
          "Failed to fetch like count:",
          err.response?.data?.message
        );
      }
    };

    fetchLikes();
  }, [quote._id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // If the menu is open and click is outside of menu/icon, close it
      if (
        menuOpen &&
        !event.target.closest(`#quote-${quote._id} .menu-wrapper`)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen, quote._id]);

  const handleLikeToggle = async () => {
    setLikeLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:7000/api/v1/users/like",
        { quoteId: quote._id },
        { withCredentials: true }
      );
      setLiked(res.data.data.liked);
      setLikesCount((prev) => (res.data.data.liked ? prev + 1 : prev - 1));
    } catch (err) {
      console.error("Failed to like/unlike:", err.response?.data?.message);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleSaveToggle = async () => {
    setSaveLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:7000/api/v1/users/save",
        { quoteId: quote._id },
        { withCredentials: true }
      );
      setSaved(res.data.data.saved);
    } catch (err) {
      console.error("Save toggle failed:", err.response?.data?.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDownload = async () => {
    const element = document.getElementById(`quote-${quote._id}`);
    if (!element) return;

    setIsDownloading(true); // ⛔ hide UI

    // Let the DOM update
    await new Promise((resolve) => setTimeout(resolve, 100)); // slight delay

    try {
      const canvas = await html2canvas(element, {
        useCORS: true,
        backgroundColor: null,
      });

      const dataURL = canvas.toDataURL("image/png");

      const link = document.createElement("a");
      link.download = `quote-${quote._id}.png`;
      link.href = dataURL;
      link.click();
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setIsDownloading(false); // ✅ restore UI
    }
  };

  console.log("Received quote in frontend:", quote);

  return (
    <div
      id={`quote-${quote._id}`}
      className={`quote-card ${
        quote.backgroundImage?.secure_url ? "with-image" : "no-image"
      }  ${isDownloading ? "download-mode" : ""}`}
      style={{
        backgroundImage: quote.backgroundImage?.secure_url
          ? `url(${quote.backgroundImage.secure_url})`
          : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {!isDownloading && (
        <div className="menu-wrapper">
          <span
            className="menu-icon"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            ⋮
          </span>

          {menuOpen && (
            <div className="dropdown-menu">
              {canDelete && (
                <button onClick={() => onDelete(quote._id)}>Delete</button>
              )}
              <button onClick={handleDownload}>Download</button>
            </div>
          )}
        </div>
      )}
      <div className="quote-top">
        <p className="quote-text">"{quote.quoteText}"</p>
        <p className="quote-author">— {quote.authorName || "Anonymous"}</p>
      </div>

      {/* {!isDownloading && (
        <div className="tags">
          {quote.tags.map((tag) => (
            <span className="tag" key={tag._id}>
              {tag.name}
            </span>
          ))}
        </div>
      )} */}
      {!isDownloading && (
        <p className="quote-user">
          —{" "}
          <Link
            to={`/${quote?.postedBy._id}/profile`}
            className="username-link"
            onClick={(e) => e.stopPropagation()} // 👈 prevent bubbling to the card
          >
            @{quote?.postedBy.username || "Anonymous"}
          </Link>
        </p>
      )}

      {!isDownloading && (
        <div className="actions">
          <div className="like-button" onClick={handleLikeToggle}>
            {likeLoading ? (
              <span className="like-spinner">...</span>
            ) : liked ? (
              <FaHeart className="heart liked" />
            ) : (
              <FaRegHeart className="heart not-liked" />
            )}
            <div className="like-count">{likesCount}</div>
          </div>

          <div className="save-button" onClick={handleSaveToggle}>
            {saveLoading ? (
              <span className="like-spinner">...</span>
            ) : saved ? (
              <FaBookmark className="bookmark saved" />
            ) : (
              <FaRegBookmark className="bookmark" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuoteCard;
