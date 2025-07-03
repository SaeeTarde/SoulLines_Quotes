// src/pages/homePage.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import QuoteCard from "../components/quoteCard.js";
import Navbar from "../components/Navbar.js";
import "./homePage.css";

const HomePage = () => {
  const [quotes, setQuotes] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const res = await axios.get(
          "https://soullines-quotes.onrender.com/api/v1/users/quotes",
          { withCredentials: true }
        );
        setQuotes(res.data.data.docs);
        setLoading(false);
      } catch (err) {
        setError("Failed to load quotes");
        setLoading(false);
      }
    };

    fetchQuotes();
  }, []);
  console.log("Fetched quotes in HomePage:", quotes);

  return (
    <>
      <Navbar />

      <div className="home-container">
        {/* <h1 className="home-title">Quotify Feed</h1> */}

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

        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}

        <div className="quote-grid">
          {quotes.map((quote) => (
            <QuoteCard key={quote._id} quote={quote} canDelete={false} />
          ))}
        </div>
      </div>
    </>
  );
};

export default HomePage;
