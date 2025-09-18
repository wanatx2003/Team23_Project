import React, { useEffect, useState, useRef } from "react";
import API from "../../services/api";
import DeviceBorrowConfirmation from "./DeviceBorrowConfirmation";
import DeviceHoldConfirmation from "./DeviceHoldConfirmation";
import "../../styles/devices/devices.css";

const Devices = ({ 
  navigateToHome, 
  isLoggedIn, 
  navigateToLogin, 
  userData, 
  initialCategory, 
  navigateToLanding, 
  navigateToAddDevice, 
  navigateToUpdateDeviceList,
  navigateToDeleteDeviceList,
}) => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [displayedDevices, setDisplayedDevices] = useState([]);
  const initialRenderRef = useRef(true);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [currentAction, setCurrentAction] = useState(null); // "borrow" or "hold"
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch devices from the backend
  const fetchDevices = async () => {
    try {
      setLoading(true);
      const data = await API.getDevices();
      if (data.success) {
        setDevices(data.devices);

        // Extract unique categories from devices
        const uniqueCategories = [...new Set(data.devices.map((device) => device.Type))];
        setCategories(["all", ...uniqueCategories]);
      } else {
        setError(data.error || "Failed to fetch devices");
      }
    } catch (err) {
      console.error("Error fetching devices:", err);
      setError("An error occurred while fetching devices");
    } finally {
      setLoading(false);
    }
  };

  // Fetch devices on component mount
  useEffect(() => {
    fetchDevices();
  }, []);

  // Use the initialCategory prop on mount
  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  // Filter devices by category and search query
  useEffect(() => {
    if (devices && devices.length > 0) {
      let filtered = [...devices];
      
      // Filter by category first
      if (selectedCategory !== "all") {
        filtered = filtered.filter((device) => device.Type === selectedCategory);
      }
      
      // Then filter by search query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(device => 
          (device.Brand && device.Brand.toLowerCase().includes(query)) ||
          (device.Model && device.Model.toLowerCase().includes(query)) ||
          (device.Type && device.Type.toLowerCase().includes(query))
        );
      }
      
      setDisplayedDevices(filtered);

      // Trigger animation on category change
      if (!initialRenderRef.current) {
        const container = document.querySelector("#devices-grid");
        if (container) {
          container.classList.remove("fade-in-items");
          void container.offsetWidth; // Force reflow
          container.classList.add("fade-in-items");
        }
      } else {
        initialRenderRef.current = false;
      }
    }
  }, [selectedCategory, devices, searchQuery]);

  const navigateToBorrowConfirmation = (device) => {
    setSelectedDevice(device);
    setCurrentAction("borrow");
  };

  const navigateToHoldConfirmation = (device) => {
    setSelectedDevice(device);
    setCurrentAction("hold");
  };

  const handleConfirmBorrow = async () => {
    try {
      const response = await fetch("/api/borrowDevice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          UserID: userData.UserID,
          DeviceID: selectedDevice.DeviceID,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`Borrow successfully`);
        fetchDevices(); // Refresh devices to update available copies
        setCurrentAction(null); // Return to the device list
      } else {
        alert(`Failed to borrow: ${data.error}`);
        setCurrentAction(null); // Return to the device list
      }
    } catch (error) {
      console.error("Error borrowing device:", error);
      alert("An error occurred while borrowing the device.");
    }
  };

  const handleConfirmHold = async () => {
    try {
      const response = await fetch("/api/holdDevice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          UserID: userData.UserID,
          DeviceID: selectedDevice.DeviceID,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`Place hold successfully`);
        fetchDevices(); // Refresh devices to update available copies
        setCurrentAction(null); // Return to the device list
      } else {
        alert(`Failed to place a hold: ${data.error}`);
        setCurrentAction(null); // Return to the device list
      }
    } catch (error) {
      console.error("Error placing hold on device:", error);
      alert("An error occurred while placing the hold.");
    }
  };

  const handleDeleteDevice = async (deviceID) => {
    try {
      const response = await API.deleteDevice(deviceID);
      if (response.success) {
        alert("Device deleted successfully!");
        const updatedDevices = await API.getDevices();
        setDevices(updatedDevices.devices);
      } else {
        alert("Failed to delete device: " + response.error);
      }
    } catch (error) {
      console.error("Error deleting device:", error);
      alert("An error occurred while deleting the device.");
    }
  };

  const styles = {
    container: {
      padding: "0",
      maxWidth: "100%",
      margin: "0 auto",
      backgroundColor: "#ffffff",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      color: "#1d1d1f",
      overflowX: "hidden",
    },
    hero: {
      height: "70vh",
      backgroundImage: "linear-gradient(to bottom, #000000, #212121)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      color: "#ffffff",
      position: "relative",
      marginBottom: "60px",
      textAlign: "center",
    },
    heroTitle: {
      fontSize: "56px",
      fontWeight: "600",
      margin: "0",
      letterSpacing: "-0.02em",
      opacity: "0",
      transform: "translateY(20px)",
      animation: "fadeInUp 1s forwards",
    },
    heroSubtitle: {
      fontSize: "24px",
      fontWeight: "400",
      maxWidth: "600px",
      margin: "20px 0 0 0",
      opacity: "0",
      transform: "translateY(20px)",
      animation: "fadeInUp 1s forwards 0.3s",
    },
    navContainer: {
      position: "sticky",
      top: "70px",
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      backdropFilter: "blur(20px)",
      zIndex: "100",
      padding: "20px 0",
      marginBottom: "40px",
      borderBottom: "1px solid #f5f5f7",
    },
    nav: {
      display: "flex",
      justifyContent: "center",
      maxWidth: "800px",
      margin: "0 auto",
      padding: "0 20px",
    },
    navButton: {
      backgroundColor: "transparent",
      border: "none",
      fontSize: "17px",
      fontWeight: "400",
      padding: "8px 18px",
      margin: "0 5px",
      cursor: "pointer",
      borderRadius: "20px",
      transition: "all 0.2s ease",
      color: "#1d1d1f",
    },
    activeNavButton: {
      backgroundColor: "#1d1d1f",
      color: "#ffffff",
      fontWeight: "500",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", // Changed from 350px to 280px to match book cards
      gap: "35px",
      marginBottom: "40px",
      maxWidth: "1200px",  // Added max-width constraint for larger screens
      margin: "0 auto",    // Center the grid
    },
    card: {
      borderRadius: "18px",
      overflow: "hidden",
      backgroundColor: "#fff",
      boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
      cursor: "pointer",
      transition: "transform 0.3s ease, box-shadow 0.3s ease",
    },
    cardImage: {
      width: "100%",
      height: "300px",
      objectFit: "cover",
      borderTopLeftRadius: "18px",
      borderTopRightRadius: "18px",
      transition: "transform 0.5s ease",
    },
    cardContent: {
      padding: "20px",
    },
    cardTitle: {
      fontSize: "18px",
      fontWeight: "600",
      margin: "0 0 8px 0",
      color: "#1d1d1f",
    },
    cardInfo: {
      fontSize: "14px",
      color: "#86868b",
      margin: "0 0 5px 0",
    },
    button: {
      display: "inline-block",
      backgroundColor: "#0071e3",
      color: "#ffffff",
      border: "none",
      borderRadius: "8px",
      padding: "12px 22px",
      fontSize: "17px",
      fontWeight: "500",
      cursor: "pointer",
      transition: "all 0.2s ease",
      marginTop: "15px",
      textAlign: "center",
    },
    backButton: {
      display: "block",
      width: "max-content",
      margin: "60px auto 0 auto",
      backgroundColor: "transparent",
      border: "1px solid #86868b",
      color: "#1d1d1f",
      padding: "12px 24px",
      borderRadius: "8px",
      fontSize: "17px",
      fontWeight: "500",
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
  };

  // Apple-styled search bar styles
  const searchBarStyles = {
    searchContainer: {
      display: "flex",
      justifyContent: "center",
      width: "100%",
      maxWidth: "600px",
      margin: "20px auto",
      position: "relative",
    },
    searchInput: {
      width: "100%",
      padding: "12px 20px",
      paddingLeft: "40px",
      fontSize: "17px",
      border: "none",
      borderRadius: "8px",
      backgroundColor: "#f5f5f7",
      color: "#1d1d1f",
      transition: "all 0.2s ease",
      outline: "none",
    },
    searchIcon: {
      position: "absolute",
      left: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      width: "18px",
      height: "18px",
      color: "#86868b",
      pointerEvents: "none",
    },
  };

  return (
    <div style={styles.container}>
      {currentAction === "borrow" && selectedDevice ? (
        <DeviceBorrowConfirmation
          device={selectedDevice}
          userData={userData}
          handleConfirmBorrow={handleConfirmBorrow}
          navigateToDevices={() => setCurrentAction(null)}
        />
      ) : currentAction === "hold" && selectedDevice ? (
        <DeviceHoldConfirmation
          device={selectedDevice}
          userData={userData}
          handleConfirmHold={handleConfirmHold}
          navigateToDevices={() => setCurrentAction(null)}
        />
      ) : (
        <>
          {/* Hero Section */}
          <div style={styles.hero}>
            <h1 style={styles.heroTitle}>Explore Devices</h1>
            <p style={styles.heroSubtitle}>Find the perfect device for your needs.</p>
          </div>

          {/* Show "Add Device" and "Update Device" buttons for admins */}
          {isLoggedIn && userData?.Role === "Admin" && (
            <div style={{ display: "flex", justifyContent: "center", gap: "15px", margin: "20px 0" }}>
              <button onClick={navigateToAddDevice} className="admin-button">Add Device</button>
              <button onClick={() => navigateToUpdateDeviceList()} className="admin-button">Update Device</button>
              <button onClick={() => navigateToDeleteDeviceList()} className="admin-button">Delete Device</button>
            </div>
          )}

          {/* Category Navigation */}
          <div style={styles.navContainer}>
            <div style={styles.nav}>
              {categories.map((category) => (
                <button
                  key={category}
                  style={selectedCategory === category ? { ...styles.navButton, ...styles.activeNavButton } : styles.navButton}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category === "all" ? "All Devices" : category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
            
            {/* Search Bar */}
            <div style={searchBarStyles.searchContainer}>
              <span style={searchBarStyles.searchIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search by brand, model, or type"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={searchBarStyles.searchInput}
              />
            </div>
          </div>

          {/* Device List */}
          {loading ? (
            <p>Loading devices...</p>
          ) : error ? (
            <p style={{ color: "red" }}>{error}</p>
          ) : (
            <div id="devices-grid" className="fade-in-items" style={styles.grid}>
              {displayedDevices.map((device) => (
                <div key={device.DeviceID} className="device-card" style={styles.card}>
                  <img
                    src={`/images/${device.Type}.jpg`}
                    alt={device.Model}
                    style={styles.cardImage}
                  />
                  <div style={styles.cardContent}>
                    <h3 style={styles.cardTitle}>{device.Model}</h3>
                    <p style={styles.cardInfo}>Type: {device.Type}</p>
                    <p style={styles.cardInfo}>Brand: {device.Brand}</p>
                    <p style={styles.cardInfo}>Available Copies: {device.AvailableCopies}</p>
                    {isLoggedIn ? (
                      device.AvailableCopies > 0 ? (
                        <button style={styles.button} onClick={() => navigateToBorrowConfirmation(device)}>Borrow</button>
                      ) : (
                        <button style={{ ...styles.button, backgroundColor: "#f7d774", color: "#000" }} onClick={() => navigateToHoldConfirmation(device)}>Hold</button>
                      )
                    ) : (
                      <button style={styles.button} onClick={navigateToLogin}>Login to Borrow</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <button onClick={isLoggedIn ? navigateToHome : navigateToLanding} style={styles.backButton}>
            Back to Home
          </button>
        </>
      )}
    </div>
  );
};

export default Devices;
