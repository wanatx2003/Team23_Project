import React, { useState, useEffect } from 'react';
import '../../styles/layout/TopBar.css';

const TopBar = ({ 
  isLoggedIn, 
  userData, 
  handleLogout, 
  navigateToProfile,
  navigateToEventManagement,
  navigateToMatching,
  navigateToHistory,
  navigateToNotifications,
  navigateToAssignments,
  navigateToLogin,
  navigateToRegister,
  navigateToLanding,
  navigateToHome,
  navigateToEvents,
  navigateToReports,
  navigateToUserManagement
}) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [closeTimeout, setCloseTimeout] = useState(null);

  // Fetch unread notification count
  useEffect(() => {
    if (isLoggedIn && userData) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, userData]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeout) {
        clearTimeout(closeTimeout);
      }
    };
  }, [closeTimeout]);

  const handleDropdownEnter = () => {
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      setCloseTimeout(null);
    }
    setOpenDropdown('user');
  };

  const handleDropdownLeave = () => {
    const timeout = setTimeout(() => {
      setOpenDropdown(null);
    }, 300); // 300ms delay before closing
    setCloseTimeout(timeout);
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch(`/api/notifications/unread/${userData.UserID}`);
      const data = await response.json();
      if (data.success) {
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const glowEffect = {
    color: '#ffffff',
    textShadow: '0 0 5px rgba(255, 255, 255, 0.8), 0 0 10px rgba(102, 126, 234, 0.4)',
    transition: 'color 0.3s ease, text-shadow 0.3s ease'
  };

  const isAdmin = userData?.Role === 'admin';

  return (
    <div className="top-bar">
      <div className="top-bar-content">
        <div 
          className="logo" 
          onClick={navigateToLanding}
          onMouseEnter={() => setIsLogoHovered(true)}
          onMouseLeave={() => setIsLogoHovered(false)}
          style={{ 
            cursor: 'pointer',
            color: isLogoHovered ? '#ffffff' : 'inherit',
            textShadow: isLogoHovered ? '0 0 5px rgba(255, 255, 255, 0.8), 0 0 10px rgba(102, 126, 234, 0.4)' : 'none',
            transition: 'color 0.3s ease, text-shadow 0.3s ease',
            fontWeight: 700,
          }}
        >
          VolunteerConnect
        </div>
        
        <div className="nav-buttons">
          {/* Only show navigation buttons if user is logged in */}
          {isLoggedIn && userData && (
            <>
              {!isAdmin && (
                <>
                  <button 
                    onClick={navigateToEvents} 
                    className="nav-button"
                    onMouseEnter={() => setHoveredButton('events')}
                    onMouseLeave={() => setHoveredButton(null)}
                    style={hoveredButton === 'events' ? glowEffect : {}}
                  >
                    Browse Events
                  </button>

                  <button 
                    onClick={navigateToAssignments} 
                    className="nav-button"
                    onMouseEnter={() => setHoveredButton('assignments')}
                    onMouseLeave={() => setHoveredButton(null)}
                    style={hoveredButton === 'assignments' ? glowEffect : {}}
                  >
                    My Assignments
                  </button>
                </>
              )}
              
              <button 
                onClick={navigateToHistory} 
                className="nav-button"
                onMouseEnter={() => setHoveredButton('history')}
                onMouseLeave={() => setHoveredButton(null)}
                style={hoveredButton === 'history' ? glowEffect : {}}
              >
                My History
              </button>

              {isAdmin && (
                <>
                  <button 
                    onClick={navigateToEventManagement} 
                    className="nav-button admin-button"
                    onMouseEnter={() => setHoveredButton('manage')}
                    onMouseLeave={() => setHoveredButton(null)}
                    style={hoveredButton === 'manage' ? glowEffect : {}}
                  >
                    Manage Events
                  </button>

                  <button 
                    onClick={navigateToMatching} 
                    className="nav-button admin-button"
                    onMouseEnter={() => setHoveredButton('matching')}
                    onMouseLeave={() => setHoveredButton(null)}
                    style={hoveredButton === 'matching' ? glowEffect : {}}
                  >
                    Match Volunteers
                  </button>

                  <button 
                    onClick={navigateToReports} 
                    className="nav-button admin-button"
                    onMouseEnter={() => setHoveredButton('reports')}
                    onMouseLeave={() => setHoveredButton(null)}
                    style={hoveredButton === 'reports' ? glowEffect : {}}
                  >
                    Reports
                  </button>

                  <button 
                    onClick={navigateToUserManagement} 
                    className="nav-button admin-button"
                    onMouseEnter={() => setHoveredButton('users')}
                    onMouseLeave={() => setHoveredButton(null)}
                    style={hoveredButton === 'users' ? glowEffect : {}}
                  >
                    Manage Users
                  </button>
                </>
              )}
            </>
          )}
          
          {isLoggedIn && userData ? (
            <div className="user-info">
              <button 
                onClick={navigateToNotifications} 
                className="notification-button"
                title="Notifications"
              >
                🔔
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </button>

              <span>Hello, {userData.FirstName}</span>

              <div 
                className="dropdown-container"
                onMouseEnter={handleDropdownEnter}
                onMouseLeave={handleDropdownLeave}
              >
                <button className="user-menu-button">⚙️</button>
                {openDropdown === 'user' && (
                  <div className="dropdown-menu user-dropdown">
                    <div className="dropdown-item" onClick={navigateToHome}>
                      Dashboard
                    </div>
                    <div className="dropdown-item" onClick={navigateToProfile}>
                      My Profile
                    </div>
                    <div className="dropdown-item" onClick={navigateToNotifications}>
                      Notifications {unreadCount > 0 && `(${unreadCount})`}
                    </div>
                    <div className="dropdown-divider"></div>
                    <div className="dropdown-item logout-item" onClick={handleLogout}>
                      Logout
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <button className="login-button" onClick={navigateToLogin}>
                LOGIN
              </button>
              <button className="register-button" onClick={navigateToRegister}>
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;