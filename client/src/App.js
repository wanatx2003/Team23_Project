import React, { useState, useEffect } from "react";
import "./App.css";

// Import components
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Home from "./components/home/Home";
import UserProfile from "./components/profile/UserProfile";
import EventManagement from "./components/events/EventManagement";
import VolunteerMatching from "./components/matching/VolunteerMatching";
import VolunteerHistory from "./components/history/VolunteerHistory";
import Notifications from "./components/notifications/Notifications";
import TopBar from "./components/layout/TopBar";
import LandingPage from "./components/landing/LandingPage";

// Import API service
import API from "./services/api";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [currentScreen, setCurrentScreen] = useState("landing");

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUserData(userData);
        setIsLoggedIn(true);
      } catch (e) {
        console.error("Error parsing stored user data:", e);
        sessionStorage.removeItem("user");
      }
    } else {
      setUserData(null);
      setIsLoggedIn(false);
    }
  }, []);

  // Login handler
  const handleLogin = async (email, password) => {
    try {
      const data = await API.login(email, password);

      if (data.success) {
        sessionStorage.setItem("user", JSON.stringify(data.user));
        setIsLoggedIn(true);
        setUserData(data.user);
        setCurrentScreen("home");
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
    sessionStorage.removeItem("user");
    setIsLoggedIn(false);
    setUserData(null);
    setCurrentScreen("landing");
  };

  // Navigation functions
  const navigateToHome = () => {
    window.scrollTo(0, 0);
    setCurrentScreen("home");
  };
  
  const navigateToLogin = () => {
    window.scrollTo(0, 0);
    setCurrentScreen("login");
  };
  
  const navigateToRegister = () => {
    window.scrollTo(0, 0);
    setCurrentScreen("register");
  };
  
  const navigateToLanding = () => {
    window.scrollTo(0, 0);
    setCurrentScreen("landing");
  };

  const navigateToProfile = () => {
    window.scrollTo(0, 0);
    setCurrentScreen("profile");
  };

  const navigateToEvents = () => {
    window.scrollTo(0, 0);
    setCurrentScreen("events");
  };

  const navigateToEventManagement = () => {
    window.scrollTo(0, 0);
    setCurrentScreen("eventManagement");
  };

  const navigateToMatching = () => {
    window.scrollTo(0, 0);
    setCurrentScreen("matching");
  };

  const navigateToHistory = () => {
    window.scrollTo(0, 0);
    setCurrentScreen("history");
  };

  const navigateToNotifications = () => {
    window.scrollTo(0, 0);
    setCurrentScreen("notifications");
  };

  // Register handler
  const handleRegister = async (userData) => {
    try {
      const data = await API.register(userData);
      if (data.success) {
        alert("Registration successful! Please log in to complete your profile.");
        setCurrentScreen("login");
      } else {
        alert("Failed to register: " + data.error);
      }
    } catch (error) {
      console.error("Error registering user:", error);
      alert("An error occurred while registering.");
    }
  };

  return (
    <div className="app-container">
      {/* Show TopBar on all screens except landing */}
      {currentScreen !== "landing" && (
        <TopBar
          isLoggedIn={isLoggedIn}
          userData={userData}
          handleLogout={handleLogout}
          navigateToHome={navigateToHome}
          navigateToProfile={navigateToProfile}
          navigateToLogin={navigateToLogin}
          navigateToRegister={navigateToRegister}
          navigateToLanding={navigateToLanding}
        />
      )}

      {/* Render the appropriate screen */}
      {currentScreen === "landing" && (
        <LandingPage
          navigateToLogin={navigateToLogin}
          navigateToRegister={navigateToRegister}
        />
      )}

      {currentScreen === "login" && (
        <Login onLogin={handleLogin} navigateToRegister={navigateToRegister} />
      )}

      {currentScreen === "register" && (
        <Register
          onRegister={handleRegister}
          navigateToLogin={navigateToLogin}
        />
      )}

      {currentScreen === "home" && (
        <Home
          userData={userData}
          navigateToProfile={navigateToProfile}
          navigateToEvents={navigateToEvents}
          navigateToEventManagement={navigateToEventManagement}
          navigateToMatching={navigateToMatching}
          navigateToHistory={navigateToHistory}
          navigateToNotifications={navigateToNotifications}
        />
      )}

      {currentScreen === "profile" && (
        <UserProfile
          userData={userData}
          navigateToHome={navigateToHome}
        />
      )}

      {currentScreen === "eventManagement" && userData?.Role === "admin" && (
        <EventManagement
          userData={userData}
          navigateToHome={navigateToHome}
        />
      )}

      {currentScreen === "matching" && userData?.Role === "admin" && (
        <VolunteerMatching
          userData={userData}
          navigateToHome={navigateToHome}
        />
      )}

      {currentScreen === "history" && (
        <VolunteerHistory
          userData={userData}
          navigateToHome={navigateToHome}
        />
      )}

      {currentScreen === "notifications" && (
        <Notifications
          userData={userData}
          navigateToHome={navigateToHome}
        />
      )}
    </div>
  );
}

export default App;
