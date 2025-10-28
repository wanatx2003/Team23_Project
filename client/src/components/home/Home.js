import React, { useEffect } from "react";
import "../../styles/home/Home.css";

const Home = ({
  userData,
  navigateToProfile,
  navigateToEventManagement,
  navigateToMatching,
  navigateToHistory,
  navigateToNotifications
}) => {
  const isAdmin = userData?.Role === "admin";

  // Add animation styles on component mount
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      /* Make sure hero title remains visible */
      .hero-title {
        animation: fadeInUp 0.5s forwards;
        opacity: 1 !important;
        visibility: visible !important;
      }
      
      .fade-in-items .menu-item {
        opacity: 0;
        transform: translateY(30px);
        animation: fadeInUp 0.5s forwards;
      }
      
      .fade-in-items .menu-item:nth-child(1) { animation-delay: 0.1s; }
      .fade-in-items .menu-item:nth-child(2) { animation-delay: 0.15s; }
      .fade-in-items .menu-item:nth-child(3) { animation-delay: 0.2s; }
      .fade-in-items .menu-item:nth-child(4) { animation-delay: 0.25s; }
      .fade-in-items .menu-item:nth-child(5) { animation-delay: 0.3s; }
      .fade-in-items .menu-item:nth-child(6) { animation-delay: 0.35s; }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="home-modern-container">
      {/* Hero Section */}
      <div className="hero-section">
        <h1 className="hero-title">
          Welcome to Volunteer Connect
        </h1>
        <p>
          Welcome back, {userData.FirstName}! Ready to make a difference today?
        </p>
        <p className="hero-subtitle">
          Connect with meaningful volunteer opportunities and track your impact in the community
        </p>
      </div>

      {/* Content Section */}
      <div className="content-section">
        <h2 className="section-title">Volunteer Dashboard</h2>

        <div id="menu-grid" className="menu-container fade-in-items">
          <div className="menu-item" onClick={navigateToProfile}>
            <div className="menu-item-image-container">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop" 
                alt="Profile" 
                className="menu-image" 
              />
            </div>
            <div className="menu-item-content">
              <h3>My Profile</h3>
              <p>Manage your personal information, skills, and availability</p>
            </div>
          </div>

          <div className="menu-item" onClick={navigateToHistory}>
            <div className="menu-item-image-container">
              <img 
                src="https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop" 
                alt="History" 
                className="menu-image" 
              />
            </div>
            <div className="menu-item-content">
              <h3>Volunteer History</h3>
              <p>View your past volunteer activities and achievements</p>
            </div>
          </div>

          <div className="menu-item" onClick={navigateToNotifications}>
            <div className="menu-item-image-container">
              <img 
                src="https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop" 
                alt="Notifications" 
                className="menu-image" 
              />
            </div>
            <div className="menu-item-content">
              <h3>Notifications</h3>
              <p>Stay updated with event assignments and reminders</p>
            </div>
          </div>

          {isAdmin && (
            <>
              <div className="menu-item" onClick={navigateToEventManagement}>
                <div className="menu-item-image-container">
                  <img 
                    src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop" 
                    alt="Event Management" 
                    className="menu-image" 
                  />
                </div>
                <div className="menu-item-content">
                  <h3>Event Management</h3>
                  <p>Create and manage volunteer events and opportunities</p>
                </div>
              </div>

              <div className="menu-item" onClick={navigateToMatching}>
                <div className="menu-item-image-container">
                  <img 
                    src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=300&fit=crop" 
                    alt="Volunteer Matching" 
                    className="menu-image" 
                  />
                </div>
                <div className="menu-item-content">
                  <h3>Volunteer Matching</h3>
                  <p>Match volunteers with suitable events based on skills</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
