import React, { useState, useEffect, useRef } from "react";

const RoomReservation = ({
  userData,
  navigateToHome,
  isLoggedIn,
  navigateToLogin,
  initialCategory, // Add this prop
  navigateToLanding, // Add this prop
}) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newRoom, setNewRoom] = useState({
    RoomNumber: "",
    RoomName: "",
    Capacity: "",
    Notes: "",
  });
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [displayedRooms, setDisplayedRooms] = useState([]);
  const initialRenderRef = useRef(true);
  const [editRoom, setEditRoom] = useState(null);

  const handleEditClick = (room) => {
    setEditRoom({
      RoomID: room.RoomID,
      RoomName: room.RoomName,
      Capacity: room.Capacity,
      Notes: room.Notes,
      IsAvailable: room.IsAvailable,
    });
  };

  const handleEditRoom = async () => {
    try {
      if (!editRoom.RoomID) {
        alert("Please select a room to edit.");
        return;
      }

      const response = await fetch("/api/updateRoom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editRoom),
      });

      const data = await response.json();
      if (data.success) {
        alert("Room updated successfully!");

        // Refresh the room list
        const refreshResponse = await fetch("/api/rooms");
        const refreshData = await refreshResponse.json();
        if (refreshData.success) {
          setRooms(refreshData.rooms);
          setEditRoom(null); // Clear the edit form
        }
      } else {
        alert("Failed to update room: " + data.error);
      }
    } catch (error) {
      console.error("Error updating room:", error);
      alert("An error occurred while updating the room.");
    }
  };

  // Use the initialCategory prop on mount
  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  // Fetch all rooms from the API
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/rooms");
        const data = await response.json();
        if (data.success) {
          setRooms(data.rooms);
        } else {
          setError(data.error || "Failed to fetch rooms");
        }
      } catch (err) {
        console.error("Error fetching rooms:", err);
        setError("An error occurred while fetching rooms");
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  // Periodically refresh rooms every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const fetchRooms = async () => {
        try {
          const response = await fetch("/api/rooms");
          const data = await response.json();
          if (data.success) {
            setRooms(data.rooms);
          }
        } catch (err) {
          console.error("Error fetching rooms:", err);
        }
      };
      fetchRooms();
    }, 60000); // Refresh every 60 seconds

    return () => clearInterval(interval); // Cleanup on component unmount
  }, []);

  // Filter rooms by capacity category
  useEffect(() => {
    if (rooms.length > 0) {
      let items = [...rooms];

      if (selectedCategory !== "all") {
        if (selectedCategory === "small") {
          items = items.filter((room) => room.Capacity <= 4);
        } else if (selectedCategory === "medium") {
          items = items.filter(
            (room) => room.Capacity > 4 && room.Capacity <= 10
          );
        } else if (selectedCategory === "large") {
          items = items.filter((room) => room.Capacity > 10);
        }
      }

      setDisplayedRooms(items);

      // Only apply animation on initial render or category change
      if (!initialRenderRef.current) {
        // Add a class to the container to trigger a CSS animation
        const container = document.querySelector("#rooms-grid");
        if (container) {
          container.classList.remove("fade-in-items");
          // Force a reflow to restart animation
          void container.offsetWidth;
          container.classList.add("fade-in-items");
        }
      } else {
        initialRenderRef.current = false;
      }
    }
  }, [selectedCategory, rooms]);

  // Add CSS styles for animations to document head
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
      
      .fade-in-items .room-card {
        opacity: 0;
        transform: translateY(30px);
        animation: fadeInUp 0.5s forwards;
      }
      
      .fade-in-items .room-card:nth-child(1) { animation-delay: 0.1s; }
      .fade-in-items .room-card:nth-child(2) { animation-delay: 0.15s; }
      .fade-in-items .room-card:nth-child(3) { animation-delay: 0.2s; }
      .fade-in-items .room-card:nth-child(4) { animation-delay: 0.25s; }
      .fade-in-items .room-card:nth-child(5) { animation-delay: 0.3s; }
      .fade-in-items .room-card:nth-child(6) { animation-delay: 0.35s; }
      .fade-in-items .room-card:nth-child(7) { animation-delay: 0.4s; }
      .fade-in-items .room-card:nth-child(8) { animation-delay: 0.45s; }
      .fade-in-items .room-card:nth-child(9) { animation-delay: 0.5s; }
      .fade-in-items .room-card:nth-child(10) { animation-delay: 0.55s; }
      .fade-in-items .room-card:nth-child(11) { animation-delay: 0.6s; }
      .fade-in-items .room-card:nth-child(12) { animation-delay: 0.65s; }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleAddRoom = async () => {
    try {
      if (!newRoom.RoomNumber || !newRoom.RoomName || !newRoom.Capacity) {
        alert("Please fill in all required fields");
        return;
      }

      const response = await fetch("/api/addRoom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRoom),
      });
      const data = await response.json();
      if (data.success) {
        alert("Room added successfully!");
        setNewRoom({ RoomNumber: "", RoomName: "", Capacity: "", Notes: "" });

        // Refresh the room list
        const refreshResponse = await fetch("/api/rooms");
        const refreshData = await refreshResponse.json();
        if (refreshData.success) {
          setRooms(refreshData.rooms);
        }
      } else {
        alert("Failed to add room: " + data.error);
      }
    } catch (error) {
      console.error("Error adding room:", error);
      alert("An error occurred while adding the room.");
    }
  };

  const handleReserveRoom = async (roomId) => {
    try {
      if (!isLoggedIn) {
        navigateToLogin();
        return;
      }

      const duration = userData?.Role === "Faculty" ? 180 : 90; // Faculty: 3 hours, Others: 1.5 hours
      console.log("Sending reservation request:", {
        RoomID: roomId,
        UserID: userData.UserID,
        Duration: duration,
      });

      const response = await fetch("/api/reserveRoom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          RoomID: roomId,
          UserID: userData.UserID,
          Duration: duration,
        }),
      });

      const data = await response.json();
      console.log("Response from backend:", data);

      if (data.success) {
        alert("Room reserved successfully!");

        // Refresh the room list
        const refreshResponse = await fetch("/api/rooms");
        const refreshData = await refreshResponse.json();
        console.log("Refreshed room data:", refreshData);

        if (refreshData.success) {
          setRooms(refreshData.rooms);
        } else {
          console.error("Failed to refresh room list:", refreshData.error);
        }
      } else {
        alert("Failed to reserve room: " + data.error);
      }
    } catch (error) {
      console.error("Error reserving room:", error);
      alert("An error occurred while reserving the room.");
    }
  };

  const handleCancelReservation = async (roomId) => {
    try {
      if (!isLoggedIn) {
        navigateToLogin();
        return;
      }

      console.log("Cancelling reservation for room:", roomId);

      const response = await fetch("/api/cancelReservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          RoomID: roomId,
          UserID: userData.UserID,
        }),
      });

      const data = await response.json();
      console.log("Response from backend:", data);

      if (data.success) {
        alert("Reservation cancelled successfully!");

        // Refresh the room list
        const refreshResponse = await fetch("/api/rooms");
        const refreshData = await refreshResponse.json();
        console.log("Refreshed room data:", refreshData);

        if (refreshData.success) {
          setRooms(refreshData.rooms);
        } else {
          console.error("Failed to refresh room list:", refreshData.error);
        }
      } else {
        alert("Failed to cancel reservation: " + data.error);
      }
    } catch (error) {
      console.error("Error cancelling reservation:", error);
      alert("An error occurred while cancelling the reservation.");
    }
  };

  // Apple-inspired styling
  const styles = {
    container: {
      padding: "0",
      maxWidth: "100%",
      margin: "0 auto",
      backgroundColor: "#ffffff",
      fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
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
    contentSection: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "0 24px 100px 24px",
    },
    adminSection: {
      backgroundColor: "#f5f5f7",
      borderRadius: "18px",
      padding: "30px",
      marginBottom: "40px",
      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
    },
    adminTitle: {
      fontSize: "24px",
      fontWeight: "600",
      margin: "0 0 20px 0",
      color: "#1d1d1f",
    },
    formRow: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "16px",
      marginBottom: "16px",
    },
    inputField: {
      width: "100%",
      padding: "12px 16px",
      borderRadius: "8px",
      border: "1px solid #d2d2d7",
      fontSize: "16px",
      color: "#1d1d1f",
      transition: "border-color 0.2s ease",
    },
    addButton: {
      backgroundColor: "#0071e3",
      color: "#ffffff",
      border: "none",
      borderRadius: "8px",
      padding: "12px 22px",
      fontSize: "17px",
      fontWeight: "500",
      cursor: "pointer",
      transition: "all 0.2s ease",
      marginTop: "10px",
    },
    updateButton: {
      backgroundColor: "#ff9800", // Orange color
      color: "#ffffff",
      border: "none",
      borderRadius: "8px",
      padding: "10px 20px",
      fontSize: "16px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      marginTop: "10px",
    },
    updateButtonHover: {
      backgroundColor: "#e68900",
      transform: "scale(1.05)",
    },
    saveButton: {
      backgroundColor: "#4caf50", // Green color
      color: "#ffffff",
      border: "none",
      borderRadius: "8px",
      padding: "10px 20px",
      fontSize: "16px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      marginTop: "10px",
    },
    textArea: {
      width: "100%",
      padding: "12px 16px",
      borderRadius: "8px",
      border: "1px solid #d2d2d7",
      fontSize: "16px",
      color: "#1d1d1f",
      transition: "border-color 0.2s ease",
      marginBottom: "16px",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
      gap: "35px",
      marginBottom: "40px",
    },
    card: {
      borderRadius: "18px",
      overflow: "hidden",
      backgroundColor: "#fff",
      boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
      transition: "transform 0.3s ease, box-shadow 0.3s ease",
    },
    cardContent: {
      padding: "25px",
    },
    cardTitle: {
      fontSize: "20px",
      fontWeight: "600",
      margin: "0 0 8px 0",
      color: "#1d1d1f",
    },
    cardInfo: {
      fontSize: "14px",
      color: "#86868b",
      margin: "0 0 5px 0",
    },
    cardStatus: {
      fontSize: "14px",
      fontWeight: "500",
      marginTop: "10px",
      padding: "6px 12px",
      borderRadius: "4px",
      display: "inline-block",
    },
    statusAvailable: {
      backgroundColor: "#e3f9e5",
      color: "#1d8531",
    },
    statusReserved: {
      backgroundColor: "#fef2f2",
      color: "#dc2626",
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
    disabledButton: {
      display: "inline-block",
      backgroundColor: "#000000",
      color: "#ffffff",
      border: "none",
      borderRadius: "8px",
      padding: "12px 22px",
      fontSize: "17px",
      fontWeight: "500",
      cursor: "pointer",
      marginTop: "15px",
      textAlign: "center",
      opacity: "0.9",
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
    loadingOverlay: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    },
    loadingSpinner: {
      border: "4px solid rgba(0, 0, 0, 0.1)",
      borderRadius: "50%",
      borderTop: "4px solid #0071e3",
      width: "40px",
      height: "40px",
      animation: "spin 1s linear infinite",
      marginBottom: "20px",
    },
    loadingText: {
      fontSize: "18px",
      color: "#86868b",
    },
    loginMessage: {
      fontSize: "18px",
      fontWeight: "400",
      color: "#86868b",
      marginTop: "10px",
      textAlign: "center",
    },
    loginLink: {
      color: "#0071e3",
      textDecoration: "none",
      fontWeight: "500",
      cursor: "pointer",
    },
  };

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>Study Room Reservations</h1>
        <p style={styles.heroSubtitle}>
          Reserve private rooms for individual or group study sessions
        </p>

        {/* Add login prompt for users who aren't logged in */}
        {!isLoggedIn && (
          <p
            style={{
              ...styles.heroSubtitle,
              fontSize: "18px",
              marginTop: "30px",
              opacity: "0",
              transform: "translateY(20px)",
              animation: "fadeInUp 1s forwards 0.6s",
            }}
          >
            Please{" "}
            <span onClick={navigateToLogin} style={styles.loginLink}>
              log in
            </span>{" "}
            to reserve rooms
          </p>
        )}
      </div>

      {/* Navigation */}
      <div style={styles.navContainer}>
        <div style={styles.nav}>
          <button
            style={
              selectedCategory === "all"
                ? { ...styles.navButton, ...styles.activeNavButton }
                : styles.navButton
            }
            onClick={() => setSelectedCategory("all")}
          >
            All Rooms
          </button>
          <button
            style={
              selectedCategory === "small"
                ? { ...styles.navButton, ...styles.activeNavButton }
                : styles.navButton
            }
            onClick={() => setSelectedCategory("small")}
          >
            Small (1-4 People)
          </button>
          <button
            style={
              selectedCategory === "medium"
                ? { ...styles.navButton, ...styles.activeNavButton }
                : styles.navButton
            }
            onClick={() => setSelectedCategory("medium")}
          >
            Medium (5-10 People)
          </button>
          <button
            style={
              selectedCategory === "large"
                ? { ...styles.navButton, ...styles.activeNavButton }
                : styles.navButton
            }
            onClick={() => setSelectedCategory("large")}
          >
            Large (10+ People)
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div style={styles.contentSection}>
        {/* Admin section to add rooms */}
        {isLoggedIn && userData?.Role === "Admin" && (
          <div style={styles.adminSection}>
            <h3 style={styles.adminTitle}>Add a New Room</h3>
            <div style={styles.formRow}>
              <input
                type="text"
                placeholder="Room Number"
                value={newRoom.RoomNumber}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, RoomNumber: e.target.value })
                }
                style={styles.inputField}
              />
              <input
                type="text"
                placeholder="Room Name"
                value={newRoom.RoomName}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, RoomName: e.target.value })
                }
                style={styles.inputField}
              />
              <input
                type="number"
                placeholder="Capacity"
                value={newRoom.Capacity}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, Capacity: e.target.value })
                }
                style={styles.inputField}
              />
            </div>
            <input
              type="text"
              placeholder="Notes (Features, Equipment, etc.)"
              value={newRoom.Notes}
              onChange={(e) =>
                setNewRoom({ ...newRoom, Notes: e.target.value })
              }
              style={styles.inputField}
            />
            <button onClick={handleAddRoom} style={styles.addButton}>
              Add Room
            </button>
          </div>
        )}

        {/* Room listing */}
        {loading ? (
          <div style={styles.loadingOverlay}>
            <div style={styles.loadingSpinner}></div>
            <p style={styles.loadingText}>Loading rooms...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "50px 0", color: "red" }}>
            {error}
          </div>
        ) : (
          <div id="rooms-grid" className="fade-in-items" style={styles.grid}>
            {displayedRooms.map((room) => (
              <div
                key={room.RoomID}
                className="room-card"
                style={styles.card}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-10px)";
                  e.currentTarget.style.boxShadow =
                    "0 12px 40px rgba(0, 0, 0, 0.12)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.boxShadow = "";
                }}
              >
                <div style={styles.cardContent}>
                  <h3 style={styles.cardTitle}>{room.RoomName}</h3>
                  <p style={styles.cardInfo}>Room Number: {room.RoomNumber}</p>
                  <p style={styles.cardInfo}>
                    Capacity: {room.Capacity} people
                  </p>
                  {room.Notes && (
                    <p style={styles.cardInfo}>Notes: {room.Notes}</p>
                  )}

                  <div
                    style={{
                      ...styles.cardStatus,
                      ...(room.IsAvailable
                        ? styles.statusAvailable
                        : styles.statusReserved),
                    }}
                  >
                    {room.IsAvailable
                      ? "Available"
                      : room.IsReserved
                      ? "Currently Reserved"
                      : "Room Temporarily Unavailable"}
                  </div>

                  {/* Show appropriate button based on login status and room availability */}
                  {isLoggedIn ? (
                    room.IsAvailable ? (
                      <button
                        style={styles.button}
                        onClick={() => handleReserveRoom(room.RoomID)}
                      >
                        Reserve Room
                      </button>
                    ) : (
                      <div
                        style={{
                          ...styles.cardStatus,
                          backgroundColor: "#f0f4ff",
                          color: "#4a6bdf",
                          fontWeight: "500",
                          padding: "10px 15px",
                          marginTop: "15px",
                          textAlign: "center",
                        }}
                      >
                        Room Already Reserved
                      </div>
                    )
                  ) : (
                    <button
                      style={styles.disabledButton}
                      onClick={navigateToLogin}
                    >
                      Login to Reserve
                    </button>
                  )}

                  {isLoggedIn && userData?.Role === "Admin" && (
                    <button
                      style={{
                        ...styles.updateButton,
                      }}
                      onClick={() => handleEditClick(room)}
                    >
                      Update Room
                    </button>
                  )}

                  {isLoggedIn &&
                    userData?.Role === "Admin" &&
                    editRoom?.RoomID === room.RoomID && (
                      <div style={styles.adminSection}>
                        <h3 style={styles.adminTitle}>Edit Room</h3>
                        <div style={styles.formRow}>
                          <input
                            type="text"
                            placeholder="Room Name"
                            value={editRoom.RoomName}
                            onChange={(e) =>
                              setEditRoom({
                                ...editRoom,
                                RoomName: e.target.value,
                              })
                            }
                            style={styles.inputField}
                          />
                          <input
                            type="number"
                            placeholder="Capacity"
                            value={editRoom.Capacity}
                            onChange={(e) =>
                              setEditRoom({
                                ...editRoom,
                                Capacity: e.target.value,
                              })
                            }
                            style={styles.inputField}
                          />
                        </div>
                        <textarea
                          placeholder="Notes (e.g., Projector, Board)"
                          value={editRoom.Notes}
                          onChange={(e) =>
                            setEditRoom({ ...editRoom, Notes: e.target.value })
                          }
                          style={styles.textArea}
                        />
                        <div>
                          <label>
                            <input
                              type="checkbox"
                              checked={editRoom.IsAvailable}
                              onChange={(e) =>
                                setEditRoom({
                                  ...editRoom,
                                  IsAvailable: e.target.checked,
                                })
                              }
                            />
                            Room Available
                          </label>
                        </div>
                        <button
                          onClick={handleEditRoom}
                          style={styles.saveButton}
                        >
                          Save Changes
                        </button>
                      </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Login message at the bottom for users who aren't logged in */}
        {!isLoggedIn && (
          <div style={{ textAlign: "center", margin: "40px 0" }}>
            <p style={styles.loginMessage}>
              Want to reserve a study room?{" "}
              <span onClick={navigateToLogin} style={styles.loginLink}>
                Log in to your account
              </span>
            </p>
          </div>
        )}

        <button
          style={styles.backButton}
          onClick={isLoggedIn ? navigateToHome : navigateToLanding}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default RoomReservation;
