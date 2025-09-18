import React, { useState, useEffect } from "react";

const MyRoomReservations = ({ userData, isLoggedIn }) => {
  const [userReservations, setUserReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isLoggedIn && userData?.UserID) {
      fetchUserReservations();
    }
  }, [isLoggedIn, userData?.UserID]);

  const fetchUserReservations = async () => {
    try {
      setLoading(true);
      console.log("Fetching room reservations for UserID:", userData.UserID);

      const response = await fetch(`/api/userReservations/${userData.UserID}`);
      const data = await response.json();

      console.log("API response:", data); // Log the response to debug column names

      if (data.success) {
        setUserReservations(data.reservations || []);
      } else {
        setError(data.error || "Failed to fetch reservations");
      }
    } catch (err) {
      console.error("Error fetching user reservations:", err);
      setError(
        `Error: ${
          err.message || "An error occurred while fetching reservations"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (roomId) => {
    try {
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

      if (data.success) {
        alert("Reservation cancelled successfully!");
        // Refresh the reservations list
        fetchUserReservations();
      } else {
        alert("Failed to cancel reservation: " + data.error);
      }
    } catch (error) {
      console.error("Error cancelling reservation:", error);
      alert("An error occurred while cancelling the reservation.");
    }
  };

  // Styles
  const styles = {
    container: {
      backgroundColor: "#ffffff",
      borderRadius: "12px",
      padding: "25px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      margin: "20px auto",
      maxWidth: "900px",
    },
    title: {
      fontSize: "24px",
      fontWeight: "600",
      marginBottom: "20px",
      color: "#1d1d1f",
      textAlign: "center",
    },
    subtitle: {
      fontSize: "16px",
      color: "#86868b",
      marginBottom: "25px",
      textAlign: "center",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
    },
    tableHeader: {
      backgroundColor: "#f5f5f7",
      color: "#1d1d1f",
      padding: "12px 16px",
      textAlign: "left",
      fontSize: "15px",
      fontWeight: "600",
    },
    tableRow: {
      borderBottom: "1px solid #e6e6e6",
    },
    tableCell: {
      padding: "16px",
      color: "#1d1d1f",
      fontSize: "15px",
    },
    cancelButton: {
      backgroundColor: "#ff3b30",
      color: "white",
      border: "none",
      borderRadius: "6px",
      padding: "8px 16px",
      fontSize: "14px",
      fontWeight: "500",
      cursor: "pointer",
      transition: "background-color 0.2s ease",
    },
    noReservations: {
      textAlign: "center",
      padding: "30px 0",
      color: "#86868b",
      fontSize: "16px",
    },
    loadingSpinner: {
      border: "4px solid rgba(0, 0, 0, 0.1)",
      borderRadius: "50%",
      borderTop: "4px solid #0071e3",
      width: "30px",
      height: "30px",
      animation: "spin 1s linear infinite",
      margin: "30px auto",
    },
  };

  // If not logged in, don't render anything
  if (!isLoggedIn) {
    return null;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>My Room Reservations</h2>
      <p style={styles.subtitle}>Manage your current room reservations here</p>

      {loading ? (
        <div style={styles.loadingSpinner}></div>
      ) : error ? (
        <div style={{ color: "red", textAlign: "center" }}>{error}</div>
      ) : userReservations.length === 0 ? (
        <p style={styles.noReservations}>
          You don't have any active room reservations.
        </p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.tableHeader}>Room Name</th>
              <th style={styles.tableHeader}>Room Number</th>
              <th style={styles.tableHeader}>Reserved Until</th>
              <th style={styles.tableHeader}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {userReservations.map((reservation) => (
              <tr
                key={reservation.RoomReservationID || reservation.RoomID}
                style={styles.tableRow}
              >
                <td style={styles.tableCell}>{reservation.RoomName}</td>
                <td style={styles.tableCell}>{reservation.RoomNumber}</td>
                <td style={styles.tableCell}>
                  {new Date(reservation.EndAT).toLocaleString()}
                </td>
                <td style={styles.tableCell}>
                  <button
                    style={styles.cancelButton}
                    onClick={() => handleCancelReservation(reservation.RoomID)}
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MyRoomReservations;
