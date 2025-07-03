import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar"; // Include if you want to show the navbar
import "./ChangePassword.css"; // Optional: for styling
import "./EditProfile.css";

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (newPassword !== confirmPassword) {
      setMessage("New password and confirm password do not match.");
      return;
    }

    try {
      const res = await axios.post(
        "https://soullines-quotes.onrender.com/api/v1/users/change-password",
        { oldPassword, newPassword },
        { withCredentials: true }
      );
      setMessage(res.data.message || "Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => navigate("/dashboard"), 2500); // Redirect after success
    } catch (err) {
      const error = err.response?.data?.message || "Failed to change password.";
      setMessage(error);
    }
  };

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
        <div className="change-password-container">
          <h2>Change Password</h2>
          <form onSubmit={handleSubmit} className="change-password-form">
            <div className="form-group">
              <label>Old Password:</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>New Password:</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Confirm New Password:</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit">Update Password</button>
            {message && <p className="form-message">{message}</p>}
          </form>
        </div>
      </div>
    </>
  );
};

export default ChangePassword;
