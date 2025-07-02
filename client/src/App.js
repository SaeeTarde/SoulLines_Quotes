// src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/landingPage.js";
import LoginPage from "./pages/loginPage.js";
import RegisterPage from "./pages/registerPage.js";
import HomePage from "./pages/homePage.js";
import SearchResultsPage from "./pages/SearchResultsPage";
import UserDashboard from "./pages/UserDashboard.js";
import AddPost from "./pages/AddPost.js";
import PublicUserProfile from "./pages/PublicDashboard.js";
import EditProfile from "./pages/EditProfile.js";
import ChangePassword from "./pages/ChangePassword.js";

//import RegisterPage from "./pages/registerPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/add-post" element={<AddPost />} />
        <Route path="/:userId/profile" element={<PublicUserProfile />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/change-password" element={<ChangePassword />} />
      </Routes>
    </Router>
  );
}

export default App;
