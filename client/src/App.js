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
import MyAssignments from "./components/volunteers/MyAssignments";
import AdminReports from "./components/admin/AdminReports";
import UserManagement from "./components/admin/UserManagement";

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
      
      // Redirect based on role: admin to eventManagement, volunteer to dashboard
      if (user.Role === 'admin') {
        setCurrentPage("eventManagement");
      } else {
        setCurrentPage("dashboard");
      }
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
        
        // Redirect based on role: admin to eventManagement, volunteer to dashboard
        if (data.user.Role === 'admin') {
          setCurrentPage("eventManagement");
        } else {
          setCurrentPage("dashboard");
        }
      } else {
        alert(data.error || "Invalid email or password");
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert("An error occurred while logging in.");
    }
  };

  // Update user data handler
  const updateUserData = (updatedData) => {
    const newUserData = { ...userData, ...updatedData };
    setUserData(newUserData);
    localStorage.setItem("volunteerUser", JSON.stringify(newUserData));
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
        localStorage.setItem("volunteerUser", JSON.stringify(data.user));
        setIsLoggedIn(true);
        setUserData(data.user);
        
        // Redirect based on role: admin to eventManagement, volunteer to profile
        if (data.user.Role === 'admin') {
          alert("Registration successful! Welcome, Admin.");
          setCurrentPage("eventManagement");
        } else {
          alert("Registration successful! Please complete your profile.");
          setCurrentPage("profile");
        }
      } else {
        alert("Failed to register: " + data.error);
      }
    } catch (error) {
      console.error("Error registering user:", error);
      alert("An error occurred while registering.");
    }
  };

  const renderCurrentPage = () => {
    // Helper function to determine home page based on role
    const getHomePage = () => {
      return userData?.Role === 'admin' ? 'eventManagement' : 'dashboard';
    };
    
    const navigateHome = () => setCurrentPage(getHomePage());

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
            onNavigateToHistory={() => setCurrentPage("history")}
            onNavigateToNotifications={() => setCurrentPage("notifications")}
            onNavigateToAssignments={() => setCurrentPage("assignments")}
          />
        );
      case "profile":
        return <UserProfile userData={userData} navigateToHome={navigateHome} updateUserData={updateUserData} />;
      case "assignments":
        return <MyAssignments userData={userData} navigateToHome={navigateHome} />;
      case "events":
        return <EventsList userData={userData} navigateToHome={navigateHome} />;
      case "eventManagement":
        return <EventManagement userData={userData} navigateToHome={navigateHome} />;
      case "matching":
        return <VolunteerMatching userData={userData} navigateToHome={navigateHome} />;
      case "notifications":
        return <Notifications userData={userData} navigateToHome={navigateHome} />;
      case "history":
        return <VolunteerHistory userData={userData} navigateToHome={navigateHome} />;
      case "reports":
        return <AdminReports navigateToHome={navigateHome} />;
      case "userManagement":
        return <UserManagement navigateToHome={navigateHome} />;
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
        navigateToAssignments={() => setCurrentPage("assignments")}
        navigateToLogin={() => setCurrentPage("login")}
        navigateToRegister={() => setCurrentPage("register")}
        navigateToLanding={() => setCurrentPage("landing")}
        navigateToHome={() => setCurrentPage("dashboard")}
        navigateToEvents={() => setCurrentPage("events")}
        navigateToReports={() => setCurrentPage("reports")}
        navigateToUserManagement={() => setCurrentPage("userManagement")}
      />

      <div className={isLoggedIn ? "content-container" : ""}>
        {renderCurrentPage()}
      </div>
    </div>
  );
}

export default App;
