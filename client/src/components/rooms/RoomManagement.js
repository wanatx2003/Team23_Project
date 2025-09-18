import React, { useState, useEffect } from "react";

const RoomManagement = ({
  userData,
  navigateToHome,
  isLoggedIn,
  navigateToLogin,
}) => {
  const [userReservations, setUserReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isLoggedIn && userData?.UserID) {
      fetchUserReservations();
    } else if (!isLoggedIn) {
      navigateToLogin();
    }
  }, [isLoggedIn, userData?.UserID]);

  const fetchUserReservations = async () => {
    try {
      // Check if userData and UserID exist before proceeding
      if (!userData || !userData.UserID) {
        console.error("User data or UserID is missing");
        setError("Unable to fetch reservations: User information is missing");
        setLoading(false);
        return;
      }
      
      setLoading(true);
      console.log("Fetching reservations for UserID:", userData.UserID); // Additional debug log
      
      const response = await fetch(`/api/userReservations/${userData.UserID}`);
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Fetched reservations:", data);

      if (data.success) {
        setUserReservations(data.reservations || []);
      } else {
        setError(data.error || "Failed to fetch reservations");
      }
    } catch (err) {
      console.error("Error fetching user reservations:", err);
      setError(`An error occurred while fetching your reservations: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (roomId) => {
    // Fix: Use window.confirm instead of confirm
    if (!window.confirm("Are you sure you want to cancel this reservation?")) {
      return;
    }

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
      console.log("Cancel response:", data); // Debug log

      if (data.success) {
        alert("Reservation cancelled successfully!");
        fetchUserReservations(); // Refresh the list
      } else {
        alert(
          "Failed to cancel reservation: " + (data.error || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Error cancelling reservation:", error);
      alert("An error occurred while cancelling your reservation.");
    }
  };

  // Styles for the component
  const styles = {
    container: {
      maxWidth: "1000px",
      margin: "50px auto",
      padding: "30px",
      backgroundColor: "#ffffff",
      borderRadius: "15px",
      boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
    },
    header: {
      textAlign: "center",
      marginBottom: "40px",
    },
    title: {
      fontSize: "36px",
      fontWeight: "700",
      margin: "0 0 10px 0",
      color: "#1d1d1f",
    },
    subtitle: {
      fontSize: "18px",
      color: "#86868b",
      margin: "0",
    },
    tableContainer: {
      overflowX: "auto",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      textAlign: "left",
    },
    tableHead: {
      borderBottom: "2px solid #f5f5f7",
    },
    tableHeader: {
      padding: "12px 20px",
      color: "#1d1d1f",
      fontWeight: "600",
      fontSize: "15px",
    },
    tableRow: {
      borderBottom: "1px solid #f5f5f7",
      transition: "background-color 0.2s",
    },
    tableCell: {
      padding: "16px 20px",
      color: "#1d1d1f",
    },
    cancelButton: {
      backgroundColor: "#ff3b30",
      color: "#ffffff",
      border: "none",
      borderRadius: "8px",
      padding: "8px 16px",
      fontSize: "14px",
      fontWeight: "500",
      cursor: "pointer",
      transition: "background-color 0.2s",
    },
    backButton: {
      display: "block",
      marginTop: "30px",
      backgroundColor: "transparent",
      border: "1px solid #86868b",
      color: "#1d1d1f",
      padding: "10px 20px",
      borderRadius: "8px",
      fontSize: "16px",
      cursor: "pointer",
      transition: "all 0.2s",
    },
    noReservations: {
      textAlign: "center",
      padding: "40px 0",
      color: "#86868b",
      fontSize: "18px",
    },
    loading: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "200px",
    },
    spinner: {
      border: "4px solid rgba(0, 0, 0, 0.1)",
      width: "36px",
      height: "36px",
      borderRadius: "50%",
      borderLeft: "4px solid #0071e3",
      animation: "spin 1s linear infinite",
    },
    error: {
      color: "#ff3b30",
      textAlign: "center",
      padding: "20px",
      fontSize: "16px",
    },
  };

  // Add spinner animation
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Room Reservation Management</h1>
        <p style={styles.subtitle}>
          View and manage your current room reservations
        </p>
      </div>

      {loading ? (
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
        </div>
      ) : error ? (
        <div style={styles.error}>{error}</div>
      ) : userReservations.length === 0 ? (
        <div style={styles.noReservations}>
          You don't have any active room reservations.
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead style={styles.tableHead}>
              <tr>
                <th style={styles.tableHeader}>Room Name</th>
                <th style={styles.tableHeader}>Room Number</th>
                <th style={styles.tableHeader}>Reserved Since</th>
                <th style={styles.tableHeader}>Reserved Until</th>
                <th style={styles.tableHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {userReservations.map((reservation) => (
                <tr
                  key={reservation.ReservationID || reservation.RoomID}
                  style={styles.tableRow}
                >
                  <td style={styles.tableCell}>{reservation.RoomName}</td>
                  <td style={styles.tableCell}>{reservation.RoomNumber}</td>
                  <td style={styles.tableCell}>
                    {new Date(reservation.StartAt).toLocaleString()}
                  </td>
                  <td style={styles.tableCell}>
                    {new Date(reservation.EndAt).toLocaleString()}
                  </td>
                  <td style={styles.tableCell}>
                    <button
                      style={styles.cancelButton}
                      onClick={() =>
                        handleCancelReservation(reservation.RoomID)
                      }
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button style={styles.backButton} onClick={navigateToHome}>
        Back to Home
      </button>
    </div>
  );
};

export default RoomManagement;
