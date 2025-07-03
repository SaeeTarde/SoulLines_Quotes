// src/pages/SearchResultsPage.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import QuoteCard from "../components/quoteCard.js";
import Navbar from "../components/Navbar.js";
import "./homePage.css"; // Reuse same grid styling

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const SearchResultsPage = () => {
  const query = useQuery();
  const searchQuery = query.get("query");
  const tagQuery = query.get("tags"); // optional

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        const res = await axios.get(
          "https://soullines-quotes.onrender.com/api/v1/users/search",
          {
            params: {
              query: searchQuery,
              tags: tagQuery,
            },
            withCredentials: true,
          }
        );
        setResults(res.data.data);
      } catch (err) {
        setError("Failed to load search results");
      } finally {
        setLoading(false);
      }
    };

    if (searchQuery) {
      fetchSearchResults();
    }
  }, [searchQuery, tagQuery]);

  return (
    <>
      <Navbar />

      <div className="home-container">
        <h2 className="home-title">Results for "{searchQuery}"</h2>

        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}

        <div className="quote-grid">
          {results.length > 0 ? (
            results.map((quote) => <QuoteCard key={quote._id} quote={quote} />)
          ) : (
            <p>No matching quotes found.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default SearchResultsPage;
