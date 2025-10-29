import React, { useState, useEffect } from "react";
import "./App.css";
import "./styles/variables.css";

// Import volunteer management components
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Home from "./components/home/Home";
import UserProfile from "./components/profile/UserProfile";
import EventManagement from "./components/events/EventManagement";
import EventList from "./components/events/EventList";
import VolunteerMatching from "./components/matching/VolunteerMatching";
import VolunteerHistory from "./components/history/VolunteerHistory";
import Notifications from "./components/notifications/Notifications";
import TopBar from "./components/layout/TopBar";
import LandingPage from "./components/landing/LandingPage";
import VolunteerDashboard from "./components/volunteer/VolunteerDashboard";
import EventsList from "./components/volunteer/EventsList";

// Import API service
import API from "./services/api";

function App() {
  const [currentPage, setCurrentPage] = useState("landing");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Check if user is already logged in (localStorage or sessionStorage)
    const savedUser = localStorage.getItem("volunteerUser");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setUserData(user);
      setIsLoggedIn(true);
      setCurrentPage("dashboard");
    }
  }, []);

  // Login handler
  const handleLogin = async (email, password) => {
    try {
      const data = await API.login(email, password);

      if (data.success) {
        localStorage.setItem("volunteerUser", JSON.stringify(data.user));
        setIsLoggedIn(true);
        setUserData(data.user);
        setCurrentPage("dashboard");
      } else {
        alert(data.error || "Invalid email or password");
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert("An error occurred while logging in.");
    }
  };

  // Logout handler
  const handleLogout = () => {
    setUserData(null);
    setIsLoggedIn(false);
    localStorage.removeItem("volunteerUser");
    setCurrentPage("landing");
  };

  // Register handler
  const handleRegister = async (userData) => {
    try {
      const data = await API.register(userData);
      if (data.success) {
        alert("Registration successful! Please log in to complete your profile.");
        setCurrentPage("login");
      } else {
        alert("Failed to register: " + data.error);
      }
    } catch (error) {
      console.error("Error registering user:", error);
      alert("An error occurred while registering.");
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "landing":
        return (
          <LandingPage
            navigateToLogin={() => setCurrentPage("login")}
            navigateToRegister={() => setCurrentPage("register")}
          />
        );
      case "login":
        return (
          <Login
            onLogin={handleLogin}
            navigateToRegister={() => setCurrentPage("register")}
          />
        );
      case "register":
        return (
          <Register
            onRegister={handleRegister}
            navigateToLogin={() => setCurrentPage("login")}
          />
        );
      case "dashboard":
        return (
          <VolunteerDashboard
            userData={userData}
            onNavigateToProfile={() => setCurrentPage("profile")}
            onNavigateToEvents={() => setCurrentPage("events")}
          />
        );
      case "profile":
        return <UserProfile userData={userData} />;
      case "events":
        return <EventsList userData={userData} />;
      case "eventManagement":
        return <EventManagement userData={userData} />;
      case "matching":
        return <VolunteerMatching />;
      case "notifications":
        return <Notifications userData={userData} />;
      case "history":
        return <VolunteerHistory userData={userData} />;
      default:
        return (
          <LandingPage
            navigateToLogin={() => setCurrentPage("login")}
            navigateToRegister={() => setCurrentPage("register")}
          />
        );
    }
  };

  return (
    <div className="app-container">
      <TopBar
        isLoggedIn={isLoggedIn}
        userData={userData}
        handleLogout={handleLogout}
        navigateToProfile={() => setCurrentPage("profile")}
        navigateToEventManagement={() => setCurrentPage("eventManagement")}
        navigateToMatching={() => setCurrentPage("matching")}
        navigateToHistory={() => setCurrentPage("history")}
        navigateToNotifications={() => setCurrentPage("notifications")}
        navigateToLogin={() => setCurrentPage("login")}
        navigateToRegister={() => setCurrentPage("register")}
        navigateToLanding={() => setCurrentPage("landing")}
        navigateToHome={() => setCurrentPage("dashboard")}
      />

      <div className={isLoggedIn ? "content-container" : ""}>
        {renderCurrentPage()}
      </div>
    </div>
  );
}

export default App;
