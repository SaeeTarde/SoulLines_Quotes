// src/pages/LandingPage.js
import { Link } from "react-router-dom";
import "./landingPage.css";

function LandingPage() {
  return (
    <div className="landing-container">
      <div className="background-blur"></div> {/* Blur layer */}
      <div className="landing-content">
        <h1 className="landing-title">SoulLines</h1>
        <p className="landing-tagline">From blank space to brave thoughts.</p>
        <p className="landing-tagline2">
          Your Heart Writes. The World Listens.
        </p>
        <div className="landing-buttons">
          <Link to="/login" className="landing-button">
            Login
          </Link>
          <Link to="/register" className="landing-button">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
