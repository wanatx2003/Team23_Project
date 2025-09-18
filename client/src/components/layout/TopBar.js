import React, { useState, useEffect } from 'react';
import '../../styles/layout/TopBar.css';

const TopBar = ({ 
  isLoggedIn, 
  userData, 
  handleLogout, 
  navigateToBooks, 
  navigateToMedia,
  navigateToDevices, // Ensure this function is passed
  navigateToLogin,
  navigateToRegister,
  navigateToRooms,
  navigateToEvents,
  navigateToLanding,
  navigateToHome, // Make sure this prop is passed
  bookGenres = ['all'] // Add default value for bookGenres
}) => {
  // Add state to track which dropdown is open
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isLogoHovered, setIsLogoHovered] = useState(false); // Add hover state for logo
  const [hoveredButton, setHoveredButton] = useState(null); // Add state to track hover for each navigation button

  // The glow effect style that will be applied to hovered elements
  const glowEffect = {
    color: '#ffffff',
    textShadow: '0 0 5px rgba(255, 255, 255, 0.8), 0 0 10px rgba(255, 255, 255, 0.1), 0 0 15px rgba(77, 213, 255, 0.15), 0 0 25px rgba(77, 213, 255, 0.4)',
    transition: 'color 0.3s ease, text-shadow 0.3s ease'
  };

  // Define menu items for each dropdown
  const [dropdownMenus, setDropdownMenus] = useState({
    books: [
      { label: 'All Books', action: () => navigateToBooks() }
    ],
    media: [
      { label: 'Movies', action: () => navigateToMedia('movies') },
      { label: 'Music', action: () => navigateToMedia('music') },
      { label: 'Video Games', action: () => navigateToMedia('videogames') },
      { label: 'All Media', action: () => navigateToMedia() }
    ],
    rooms: [
      { label: 'Small Rooms (1-4)', action: () => navigateToRooms('small') },
      { label: 'Medium Rooms (5-10)', action: () => navigateToRooms('medium') },
      { label: 'Large Rooms (10+)', action: () => navigateToRooms('large') },
      { label: 'All Rooms', action: () => navigateToRooms() }
    ],
    devices: [
      { label: 'Headphone', action: () => navigateToDevices('Headphone') },
      { label: 'iPad', action: () => navigateToDevices('iPad') },
      { label: 'Laptop', action: () => navigateToDevices('Laptop') },
      { label: 'All Devices', action: () => navigateToDevices('all') }
    ],
    events: [
      { label: 'Workshops', action: () => navigateToEvents('Workshops') },
      { label: 'Seminar', action: () => navigateToEvents('Seminar') },
      { label: 'Conference', action: () => navigateToEvents('Conference') },
      { label: 'All Events', action: () => navigateToEvents() }
    ]
  });

  // Update book genres menu whenever bookGenres prop changes
  useEffect(() => {
    if (bookGenres && bookGenres.length > 0) {
      const genreItems = bookGenres.map(genre => {
        if (genre.toLowerCase() === 'all') {
          return { label: 'All Books', action: () => navigateToBooks() };
        } else {
          return { 
            label: genre.charAt(0).toUpperCase() + genre.slice(1), // Capitalize first letter
            action: () => navigateToBooks(genre) 
          };
        }
      });
      
      // Update the dropdown menus state with the new book genres
      setDropdownMenus(prev => ({
        ...prev,
        books: genreItems
      }));
    }
  }, [bookGenres, navigateToBooks]);

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
            textShadow: isLogoHovered ? '0 0 5px rgba(255, 255, 255, 0.8), 0 0 10px rgba(255, 255, 255, 0.1), 0 0 15px rgba(77, 213, 255, 0.15), 0 0 25px rgba(77, 213, 255, 0.4)' : 'none',
            transition: 'color 0.3s ease, text-shadow 0.3s ease',
            fontWeight: 700, // Keep font weight consistent to prevent layout shift
          }}
        >
          BookFinder
        </div>
        
        <div className="nav-buttons">
          <div 
            className="dropdown-container"
            onMouseEnter={() => setOpenDropdown('books')}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <button 
              onClick={() => navigateToBooks('all')} 
              className="nav-button"
              onMouseEnter={() => setHoveredButton('books')}
              onMouseLeave={() => setHoveredButton(null)}
              style={hoveredButton === 'books' ? glowEffect : {}}
            >
              Book
            </button>
            {openDropdown === 'books' && (
              <div className="dropdown-menu">
                {dropdownMenus.books.map((item, index) => (
                  <div key={index} className="dropdown-item" onClick={item.action}>
                    {item.label}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div 
            className="dropdown-container"
            onMouseEnter={() => setOpenDropdown('media')}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <button 
              onClick={() => navigateToMedia('all')} 
              className="nav-button"
              onMouseEnter={() => setHoveredButton('media')}
              onMouseLeave={() => setHoveredButton(null)}
              style={hoveredButton === 'media' ? glowEffect : {}}
            >
              Media
            </button>
            {openDropdown === 'media' && (
              <div className="dropdown-menu">
                {dropdownMenus.media.map((item, index) => (
                  <div key={index} className="dropdown-item" onClick={item.action}>
                    {item.label}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div 
            className="dropdown-container"
            onMouseEnter={() => setOpenDropdown('devices')}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <button 
              onClick={() => navigateToDevices('all')} 
              className="nav-button"
              onMouseEnter={() => setHoveredButton('devices')}
              onMouseLeave={() => setHoveredButton(null)}
              style={hoveredButton === 'devices' ? glowEffect : {}}
            >
              Device
            </button>
            {openDropdown === 'devices' && (
              <div className="dropdown-menu">
                {dropdownMenus.devices.map((item, index) => (
                  <div key={index} className="dropdown-item" onClick={item.action}>
                    {item.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div 
            className="dropdown-container"
            onMouseEnter={() => setOpenDropdown('rooms')}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <button 
              onClick={() => navigateToRooms('all')} 
              className="nav-button"
              onMouseEnter={() => setHoveredButton('rooms')}
              onMouseLeave={() => setHoveredButton(null)}
              style={hoveredButton === 'rooms' ? glowEffect : {}}
            >
              Room
            </button>
            {openDropdown === 'rooms' && (
              <div className="dropdown-menu">
                {dropdownMenus.rooms.map((item, index) => (
                  <div key={index} className="dropdown-item" onClick={item.action}>
                    {item.label}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          
          <div 
            className="dropdown-container"
            onMouseEnter={() => setOpenDropdown('events')}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <button 
              onClick={() => navigateToEvents('all')} 
              className="nav-button"
              onMouseEnter={() => setHoveredButton('events')}
              onMouseLeave={() => setHoveredButton(null)}
              style={hoveredButton === 'events' ? glowEffect : {}}
            >
              Event
            </button>
            {openDropdown === 'events' && (
              <div className="dropdown-menu">
                {dropdownMenus.events.map((item, index) => (
                  <div key={index} className="dropdown-item" onClick={item.action}>
                    {item.label}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {isLoggedIn && userData ? (
            <div className="user-info">
              <span>Hello, {userData.FirstName}</span>
              <button 
                onClick={navigateToHome} 
                className="logout-button"
                title="Go to Home"
              >
                Home
              </button>
              <button className="logout-button" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <button className="login-button" onClick={navigateToLogin}>
                Login
              </button>
              <button className="login-button" onClick={navigateToRegister}>
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