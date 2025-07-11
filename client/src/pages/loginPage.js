// src/pages/LoginPage.js

import React, { useState } from "react";
import axios from "axios";
import "./loginPage.css";
import "./landingPage.css";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await axios.post(
        "https://soullines-quotes.onrender.com/api/v1/users/login",
        {
          identifier: form.identifier,
          password: form.password,
        },
        { withCredentials: true }
      );

      localStorage.setItem("userId", res.data.data.user._id); // Save userId
      setError("");
      alert("Login successful!");
      navigate("/home"); // ✅ Move navigation here AFTER login is done
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setIsSubmitting(false); // 🔓 re-enable button
    }
  };

  return (
    <div className="login-container">
      <div className="background-blur"></div>
      <div className="login-box">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            name="identifier"
            placeholder="Username or email"
            value={form.identifier}
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
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Logging...may take some seconds" : "Login"}
          </button>
          {error && <p>{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
