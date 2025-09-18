import React, { useState, useEffect } from "react";
import "./App.css";

// Import components
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import RegisterAsFaculty from "./components/auth/RegisterAsFaculty";
import Welcome from "./components/home/Welcome";
import Home from "./components/home/Home";
import BookList from "./components/books/BookList";
import BookLoan from "./components/books/BookLoan";
import BookHold from "./components/books/BookHold";
import AddBook from "./components/books/AddBook";
import LoanList from "./components/loans/LoanList";
import ReturnConfirmation from "./components/loans/ReturnConfirmation";
import HoldList from "./components/holds/HoldList";
import FineList from "./components/fines/FineList";
import TopBar from "./components/layout/TopBar";
import BooksNotLoggedIn from "./components/books/BooksNotLoggedIn";
import Media from "./components/media/Media";
import RoomReservation from "./components/rooms/RoomReservation";
import Events from "./components/events/Events";
import LandingPage from "./components/landing/LandingPage";
import Devices from "./components/devices/Devices";
import AddDevice from "./components/devices/AddDevice";
import AddMedia from "./components/media/AddMedia";
import AdminDashboard from "./components/admin/AdminDashboard";
import UpdateDeviceList from "./components/devices/UpdateDeviceList";
import UpdateDevice from "./components/devices/UpdateDevice";
import UpdateMediaList from "./components/media/UpdateMediaList";
import UpdateMedia from "./components/media/UpdateMedia";
import UpdateBookList from "./components/books/UpdateBookList";
import UpdateBook from "./components/books/UpdateBook";
import DeleteDeviceList from "./components/devices/DeleteDeviceList";
import DeleteDevice from "./components/devices/DeleteDevice";
import DeleteMediaList from "./components/media/DeleteMediaList";
import DeleteMedia from "./components/media/DeleteMedia";
import DeleteBookList from "./components/books/DeleteBookList";
import DeleteBook from "./components/books/DeleteBook";
import RoomManagement from "./components/rooms/RoomManagement"; // Import the RoomManagement component
import PayFine from "./components/fines/PayFine";


// Import API service
import API from "./services/api";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [currentScreen, setCurrentScreen] = useState("landing"); // Change initial screen to landing
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null); // Initialize selectedMedia
  const [loans, setLoans] = React.useState([]); // Initialize loans as an empty array
  const [holds, setHolds] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [fines, setFines] = useState([]);
  const [reportData, setReportData] = useState(null); // State to store data report results
  const [bookGenres, setBookGenres] = useState([
    "fiction",
    "fantasy",
    "romance",
    "thriller",
    "novel",
    "mystery/Thriller",
    "all Books",
  ]); // Add default genres
  const [selectedFine, setSelectedFine] = useState(null);

  // Add state variables for initial categories
  const [initialBookCategory, setInitialBookCategory] = useState(null);
  const [initialMediaCategory, setInitialMediaCategory] = useState(null);
  const [initialDevicesCategory, setInitialDevicesCategory] = useState(null);
  const [initialRoomCategory, setInitialRoomCategory] = useState(null);
  const [initialEventCategory, setInitialEventCategory] = useState(null);

  const [selectedDevice, setSelectedDevice] = useState(null);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user"); // Changed from localStorage to sessionStorage
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUserData(userData);
        setIsLoggedIn(true);
      } catch (e) {
        console.error("Error parsing stored user data:", e);
        sessionStorage.removeItem("user"); // Remove invalid data
      }
    } else {
      // No stored user data found, ensure user is logged out
      setUserData(null);
      setIsLoggedIn(false);
    }
  }, []);

  const handleUpdateDevice = async (updatedDevice) => {
    try {
      const response = await API.updateDevice(updatedDevice);
      if (response.success) {
        alert("Device updated successfully!");
        setSelectedDevice(null); // Clear selected device
        setCurrentScreen("devices"); // Navigate back to devices list
      } else {
        alert("Failed to update device: " + response.error);
      }
    } catch (error) {
      console.error("Error updating device:", error);
      alert("An error occurred while updating the device.");
    }
  };

  const handleUpdateMedia = async (updatedMedia) => {
    try {
      const response = await API.updateMedia(updatedMedia);
      if (response.success) {
        alert("Media updated successfully!");
        setSelectedMedia(null); // Clear selected media
        setCurrentScreen("media"); // Navigate back to media list
      } else {
        alert("Failed to update media: " + response.error);
      }
    } catch (error) {
      console.error("Error updating media:", error);
      alert("An error occurred while updating the media.");
    }
  };

  const handleUpdateBook = async (updatedBook) => {
    try {
      const response = await API.updateBook(updatedBook);
      if (response.success) {
        alert("Book updated successfully!");
        setSelectedBook(null); // Clear selected book
        setCurrentScreen("books"); // Navigate back to books list
      } else {
        alert("Failed to update book: " + response.error);
      }
    } catch (error) {
      console.error("Error updating book:", error);
      alert("An error occurred while updating the book.");
    }
  };

  const handleDeleteDevice = async (deviceID) => {
    try {
      const response = await API.deleteDevice(deviceID);
      if (response.success) {
        alert("Device deleted successfully!");
        // Refresh the device list
        const updatedDevices = await API.getDevices();
        setCurrentScreen("devices"); // Navigate back to devices list
      } else {
        alert("Failed to delete device: " + response.error);
      }
    } catch (error) {
      console.error("Error deleting device:", error);
      alert("An error occurred while deleting the device.");
    }
  };

  const handleDeleteMedia = async (mediaID) => {
    try {
      const response = await API.deleteMedia(mediaID);
      if (response.success) {
        alert("Media deleted successfully!");
        // Refresh the media list
        const updatedMedia = await API.getMedia();
        setCurrentScreen("media"); // Navigate back to media list
      } else {
        alert("Failed to delete media: " + response.error);
      }
    } catch (error) {
      console.error("Error deleting media:", error);
      alert("An error occurred while deleting the media.");
    }
  };

  const handleDeleteBook = async (bookID) => {
    try {
      const response = await API.deleteBook(bookID);
      if (response.success) {
        alert("Book deleted successfully!");
        const updatedBooks = await API.getBooks(userData.UserID);
        setBooks(updatedBooks);
        setCurrentScreen("books");
      } else {
        alert("Failed to delete book: " + response.error);
      }
    } catch (error) {
      console.error("Error deleting book:", error);
      alert("An error occurred while deleting the book.");
    }
  };

  // Login handler
  const handleLogin = async (email, password) => {
    try {
      const data = await API.login(email, password);

      if (data.success) {
        sessionStorage.setItem("user", JSON.stringify(data.user)); // Changed from localStorage to sessionStorage
        setIsLoggedIn(true);
        setUserData(data.user);
        // Redirect directly to homepage (Library services)
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
    sessionStorage.removeItem("user"); // Changed from localStorage to sessionStorage
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
  const navigateToRegisterAsFaculty = () => {
    window.scrollTo(0, 0);
    setCurrentScreen("registerAsFaculty");
  };
  const navigateToAddBook = () => {
    window.scrollTo(0, 0);
    setCurrentScreen("addBook");
  };
  const navigateToBooksNotLoggedIn = () => {
    window.scrollTo(0, 0);
    setCurrentScreen("booksNotLoggedIn");
  };

  // Update the navigation functions to accept category parameters

  // Books navigation with optional category parameter
  const navigateToBooks = async (category) => {
    window.scrollTo(0, 0);
    try {
      // If user is logged in, fetch books with user-specific info
      if (isLoggedIn && userData) {
        const data = await API.getBooks(userData.UserID);
        setBooks(data);

        // Extract unique genres, but put 'all' at the end
        const uniqueGenres = [
          ...new Set(data.map((book) => book.genre).filter(Boolean)),
        ];
        const genres = [...uniqueGenres, "all"]; // Put 'all' at the end
        setBookGenres(genres);
      } else {
        // If not logged in, fetch books without user-specific info
        const data = await API.getBooks();
        setBooks(data);

        // Extract unique genres, but put 'all' at the end
        const uniqueGenres = [
          ...new Set(data.map((book) => book.genre).filter(Boolean)),
        ];
        const genres = [...uniqueGenres, "all"]; // Put 'all' at the end
        setBookGenres(genres);
      }

      // Set the initial category if provided, ensure it's a string
      if (category) {
        setInitialBookCategory(String(category));
      } else {
        setInitialBookCategory("all");
      }

      setCurrentScreen("books");
    } catch (error) {
      console.error("Error fetching books:", error);
      alert("An error occurred while fetching books.");
    }
  };

  // Media navigation with optional category parameter
  const navigateToMedia = (category) => {
    window.scrollTo(0, 0);
    setInitialMediaCategory(category || "all");
    setCurrentScreen("media");
  };

  const navigateToAddMedia = () => {
    window.scrollTo(0, 0);
    setCurrentScreen("addMedia");
  };

  const navigateToPayFine = (fine) => {
    setSelectedFine(fine);
    setCurrentScreen("payfine");
  };

  // Room reservation navigation with optional category parameter
  const navigateToRooms = (category) => {
    window.scrollTo(0, 0);
    setInitialRoomCategory(category || "all");
    setCurrentScreen("rooms");
  };

  // Events navigation with optional category parameter
  const navigateToEvents = (category) => {
    window.scrollTo(0, 0);
    setInitialEventCategory(category || "all");
    setCurrentScreen("events");
  };

  const navigateToDevices = (category = "all") => {
    window.scrollTo(0, 0);
    setInitialDevicesCategory(category);
    setCurrentScreen("devices");
  };

  const navigateToLanding = () => {
    window.scrollTo(0, 0);
    setCurrentScreen("landing");
  };

  const navigateToAddDevice = () => {
    window.scrollTo(0, 0);
    setCurrentScreen("addDevice");
  };

  const navigateToDataReport = async () => {
    window.scrollTo(0, 0);
    try {
      const response = await fetch("/api/dataReport"); // Fetch data from the backend
      const data = await response.json();

      if (data.success) {
        setReportData(data.data); // Store the query results in state
        setCurrentScreen("dataReport"); // Navigate to the data report screen
      } else {
        alert("Failed to load data report: " + data.error);
      }
    } catch (error) {
      console.error("Error loading data report:", error);
      alert("An error occurred while loading the data report.");
    }
  };

  // Add new navigation function
  const navigateToAdminDashboard = () => {
    window.scrollTo(0, 0);
    setCurrentScreen("adminDashboard");
  };

  const navigateToUpdateDeviceList = () => {
    window.scrollTo(0, 0);
    setCurrentScreen("updateDeviceList");
  };

  const navigateToUpdateDevice = (device) => {
    window.scrollTo(0, 0);
    setSelectedDevice(device);
    setCurrentScreen("updateDevice");
  };

  const navigateToUpdateMediaList = () => {
    window.scrollTo(0, 0);
    setCurrentScreen("updateMediaList");
  };

  const navigateToUpdateMedia = (media) => {
    window.scrollTo(0, 0);
    setSelectedMedia(media);
    setCurrentScreen("updateMedia");
  };

  const navigateToUpdateBookList = () => {
    window.scrollTo(0, 0);
    setCurrentScreen("updateBookList");
  };

  const navigateToUpdateBook = (book) => {
    window.scrollTo(0, 0);
    setSelectedBook(book);
    setCurrentScreen("updateBook");
  };

  const navigateToDeleteDeviceList = () => {
    window.scrollTo(0, 0);
    setCurrentScreen("deleteDeviceList");
  };

  const navigateToDeleteDevice = (device) => {
    window.scrollTo(0, 0);
    setSelectedDevice(device);
    setCurrentScreen("deleteDevice");
  };

  const navigateToDeleteMediaList = () => {
    window.scrollTo(0, 0);
    setCurrentScreen("deleteMediaList");
  };

  const navigateToDeleteMedia = (media) => {
    window.scrollTo(0, 0);
    setSelectedMedia(media);
    setCurrentScreen("deleteMedia");
  };

  const navigateToDeleteBookList = () => {
    window.scrollTo(0, 0);
    setCurrentScreen("deleteBookList");
  };

  // Ensure the navigateToDeleteBook function navigates to the DeleteBook component
  const navigateToDeleteBook = (book) => {
    setSelectedBook(book);
    setCurrentScreen("deleteBook");
  };

  // Books navigation and handlers
  const navigateToLoan = (book) => {
    setSelectedBook(book);
    setCurrentScreen("loan");
  };

  const navigateToHold = (book) => {
    setSelectedBook(book);
    setCurrentScreen("hold");
  };

  const handleReturn = async (loans) => {
    try {
      console.log("Returning loan with LoanID:", loans.LoanID); // Debugging line

      // Call the API to confirm the return
      const data = await API.confirmReturn(loans.LoanID); // Pass the correct LoanID

      if (data.success) {
        alert(`The item "${loans.Title}" has been successfully returned.`);

        const updatedLoan = { ...loans, ReturnedAt: new Date().toISOString() };
        setLoans((prevLoans) =>
          prevLoans.map((l) => (l.LoanID === loans.LoanID ? updatedLoan : l))
        );

        // Fetch the updated loan list from the API after the return
        const updatedLoans = await API.getLoans(userData.UserID);
        setLoans(updatedLoans); // Update state with the fresh data from the server

        // Navigate to the loans page to display the updated loan list
        navigateToLoans(); // Assuming this function takes the user to the loan page
      } else {
        // If the return fails, revert the change in local state
        setLoans((prevLoans) =>
          prevLoans.map((l) => (l.LoanID === loans.LoanID ? loans : l))
        );
        alert("Failed to return the item: " + data.error);
      }
    } catch (error) {
      console.error("Error returning the item:", error);
      alert("An error occurred while returning the item.");
    }
  };

  // Loans navigation and handlers
  const navigateToLoans = async () => {
    window.scrollTo(0, 0);
    try {
      const data = await API.getLoans(userData.UserID);
      if (data.success && Array.isArray(data.loans)) {
        setLoans(data.loans); // Set loans to the array from the response
      } else {
        setLoans([]); // Fallback to an empty array if the response is invalid
        alert("Failed to fetch loans: " + (data.error || "Invalid response"));
      }
      setCurrentScreen("loans");
    } catch (error) {
      console.error("Error fetching loans:", error);
      setLoans([]); // Fallback to an empty array on error
      alert("An error occurred while fetching loans.");
    }
  };

  const navigateToReturnConfirmation = (loan) => {
    window.scrollTo(0, 0);
    console.log("Navigating to return confirmation with loan:", loan); // Debugging line
    setSelectedLoan(loan);
    setCurrentScreen("returnConfirmation");
  };

  // Holds navigation
  const navigateToHolds = async () => {
    window.scrollTo(0, 0);
    try {
      const data = await API.getHolds(userData.UserID);
      if (data.success) {
        setHolds(data.holds);
        setCurrentScreen("holds");
      } else {
        alert("Failed to fetch holds: " + data.error);
      }
    } catch (error) {
      console.error("Error fetching holds:", error);
      alert("An error occurred while fetching holds.");
    }
  };

  const handleCancelHold = async (hold) => {
    try {
      const response = await API.cancelHold(hold.HoldID); // Assuming this API is working fine
      if (response.success) {
        alert(`The hold for "${hold.Title}" has been successfully canceled.`);
        // Update the hold status immediately in the frontend state
        const updatedHolds = holds.map((h) =>
          h.HoldID === hold.HoldID ? { ...h, HoldStatus: "Canceled" } : h
        );
        setHolds(updatedHolds); // Update the holds state with the new status
      } else {
        alert("Failed to cancel hold: " + response.error);
      }
    } catch (error) {
      console.error("Error canceling hold:", error);
      alert("An error occurred while canceling the hold.");
    }
  };

  // Fines navigation
  const navigateToFines = async () => {
    window.scrollTo(0, 0);
    try {
      const data = await API.getFines(userData.UserID);
      if (data.success) {
        setFines(data.fines);
        setCurrentScreen("fines");
      } else {
        alert("Failed to fetch fines: " + data.error);
      }
    } catch (error) {
      console.error("Error fetching fines:", error);
      alert("An error occurred while fetching fines.");
    }
  };

  // Action handlers
  const handleRegister = async (userData) => {
    try {
      const data = await API.register(userData);
      if (data.success) {
        alert("Registration successful!");
        setCurrentScreen("login");
      } else {
        alert("Failed to register: " + data.error);
      }
    } catch (error) {
      console.error("Error registering user:", error);
      alert("An error occurred while registering.");
    }
  };

  const handleAddBook = async (bookData) => {
    try {
      const data = await API.addBook(bookData);
      if (data.success) {
        alert("Book added successfully!");
        // Refresh the book list
        const updatedBooks = await API.getBooks(userData.UserID);
        setBooks(updatedBooks);
        setCurrentScreen("books"); // Navigate back to the book list
      } else {
        alert("Failed to add book: " + data.error);
      }
    } catch (error) {
      console.error("Error adding book:", error);
      alert("An error occurred while adding the book.");
    }
  };

  const handleAddDevice = async (deviceData) => {
    try {
      const data = await API.addDevice(deviceData);
      if (data.success) {
        alert("Device added successfully!");
        // Refresh the device list
        const updatedBooks = await API.getDevices();
        setCurrentScreen("devices");
      } else {
        alert("Failed to add device: " + data.error);
      }
    } catch (error) {
      console.error("Error adding device:", error);
      alert("An error occurred while adding the device.");
    }
  };

  const handleAddMedia = async (mediaData) => {
    try {
      const data = await API.addMedia(mediaData);
      if (data.success) {
        alert("Media added successfully!");
        // Refresh the media list
        const updatedBooks = await API.getMedia();
        setCurrentScreen("media");
      } else {
        alert("Failed to add media: " + data.error);
      }
    } catch (error) {
      console.error("Error adding media:", error);
      alert("An error occurred while adding the media.");
    }
  };

  const handleBorrowBook = async () => {
    try {
      const data = await API.borrowBook(
        selectedBook.bookID,
        userData.UserID,
        userData.Role
      );
      if (data.success) {
        alert("Borrow successfully");
        const updatedBooks = await API.getBooks(userData.UserID);
        setBooks(updatedBooks);
        setCurrentScreen("books");
      } else {
        alert("Failed to borrow: " + data.error);
        setCurrentScreen("books");
      }
    } catch (error) {
      console.error("Error confirming book borrow:", error);
      alert("An error occurred while confirming book borrow.");
    }
  };

  const handleHoldBook = async () => {
    try {
      const data = await API.holdBook(userData.UserID, selectedBook.bookID);
      if (data.success) {
        alert("Place hold successfully");
        setCurrentScreen("books");
      } else {
        alert("Failed to place hold: " + data.error);
        setCurrentScreen("books");
      }
    } catch (error) {
      console.error("Error placing hold:", error);
      alert("An error occurred while placing the hold.");
    }
  };

  const navigateToRoomManagement = () => {
    setCurrentScreen("roomManagement");
  };

  // const navigateToItemReport = async (startDate, endDate) => {
  //   window.scrollTo(0, 0);
  //   try {
  //     const params = new URLSearchParams();
  //     if (startDate) params.append('startDate', startDate);
  //     if (endDate) params.append('endDate', endDate);

  //     const response = await fetch(`/api/itemReport?${params.toString()}`);
  //     const data = await response.json();

  //     if (data.success) {
  //       setReportData(data.data);
  //       setCurrentScreen("dataReport");
  //     } else {
  //       alert("Failed to load item report: " + data.error);
  //     }
  //   } catch (error) {
  //     console.error("Error loading item report:", error);
  //     alert("An error occurred while loading the item report.");
  //   }
  // };

  return (
    <div className="app-container">
      {/* Show TopBar on all screens */}
      <TopBar
        isLoggedIn={isLoggedIn}
        userData={userData}
        handleLogout={handleLogout}
        navigateToBooks={navigateToBooks} // Always pass navigateToBooks
        navigateToMedia={navigateToMedia}
        navigateToDevices={navigateToDevices} // Add this line to pass the function
        navigateToLogin={navigateToLogin} // Add this line to pass the navigateToLogin function
        navigateToRegister={navigateToRegister} // Make sure this prop is included
        navigateToRooms={navigateToRooms} // Pass this function to TopBar
        navigateToEvents={navigateToEvents} // <-- added prop
        navigateToLanding={navigateToLanding} // Add this prop
        navigateToHome={navigateToHome} // Ensure this prop is passed
        bookGenres={bookGenres} // Pass the book genres to TopBar
      />

      {/* Render the appropriate screen based on currentScreen state */}
      {currentScreen === "landing" && (
        <LandingPage
          navigateToBooks={navigateToBooks}
          navigateToMedia={navigateToMedia}
          navigateToDevices={navigateToDevices}
          navigateToRooms={navigateToRooms}
          navigateToEvents={navigateToEvents}
        />
      )}

      {currentScreen === "login" && (
        <Login onLogin={handleLogin} navigateToRegister={navigateToRegister} />
      )}

      {currentScreen === "register" && (
        <Register
          onRegister={handleRegister}
          navigateToLogin={navigateToLogin}
          navigateToRegisterAsFaculty={navigateToRegisterAsFaculty} // Pass the navigation function
        />
      )}

      {currentScreen === "registerAsFaculty" && (
        <RegisterAsFaculty navigateToRegister={navigateToRegister} />
      )}

      {currentScreen === "home" && (
        <Home
          userData={userData}
          navigateToBooks={navigateToBooks}
          navigateToMedia={navigateToMedia}
          navigateToDevices={navigateToDevices}
          navigateToLoans={navigateToLoans} // Pass the function
          navigateToHolds={navigateToHolds}
          navigateToFines={navigateToFines}
          navigateToAddBook={navigateToAddBook} // Pass the function
          navigateToAddDevice={navigateToAddDevice} // Pass the function
          navigateToAddMedia={navigateToAddMedia} // Pass the function
          navigateToDataReport={navigateToDataReport} // Pass the function
          navigateToRooms={navigateToRooms} // Pass the function
          navigateToEvents={navigateToEvents} // Pass the function
          navigateToAdminDashboard={navigateToAdminDashboard} // Pass the function
          navigateToRoomManagement={navigateToRoomManagement} // Add this line
        />
      )}

      {currentScreen === "books" && (
        <BookList
          books={books}
          navigateToLoan={navigateToLoan}
          navigateToHold={navigateToHold}
          handleReturn={handleReturn}
          navigateToHome={navigateToHome}
          userData={userData}
          isLoggedIn={isLoggedIn}
          navigateToAddBook={navigateToAddBook}
          navigateToUpdateBookList={navigateToUpdateBookList}
          navigateToDeleteBook={navigateToDeleteBook}
          navigateToDeleteBookList={navigateToDeleteBookList}
          navigateToLogin={navigateToLogin}
          initialCategory={initialBookCategory}
          navigateToLanding={navigateToLanding}
        />
      )}

      {currentScreen === "loan" && selectedBook && (
        <BookLoan
          selectedBook={selectedBook}
          userData={userData}
          handleBorrowBook={handleBorrowBook}
          navigateToBooks={() => setCurrentScreen("books")}
        />
      )}

      {currentScreen === "hold" && selectedBook && (
        <BookHold
          selectedBook={selectedBook}
          userData={userData}
          handleHoldBook={handleHoldBook}
          navigateToBooks={() => setCurrentScreen("books")}
        />
      )}

      {currentScreen === "addBook" && (
        <AddBook onAddBook={handleAddBook} navigateToHome={navigateToHome} />
      )}

      {currentScreen === "addDevice" && (
        <AddDevice
          onAddDevice={handleAddDevice}
          navigateToHome={navigateToHome}
        />
      )}

      {currentScreen === "addMedia" && (
        <AddMedia onAddMedia={handleAddMedia} navigateToHome={navigateToHome} />
      )}

      {currentScreen === "loans" && (
        <LoanList
          loans={loans}
          navigateToReturnConfirmation={navigateToReturnConfirmation}
          navigateToHome={navigateToHome}
          handleReturn={handleReturn} // Pass the handleReturn function
        />
      )}

      {/* {currentScreen === "returnConfirmation" && selectedLoan && (
        <ReturnConfirmation
          selectedLoan={selectedLoan}
          handleConfirmReturn={handleConfirmReturn}
          navigateToLoans={() => setCurrentScreen("loans")}
        />
      )} */}

      {currentScreen === "holds" && (
        <HoldList
          holds={holds}
          navigateToHome={navigateToHome}
          handleCancelHold={handleCancelHold}
        />
      )}

      {currentScreen === "fines" && (
        <FineList 
          fines={fines} 
          navigateToHome={navigateToHome} 
          navigateToPayFine={navigateToPayFine} 
        />
      )}

      {currentScreen === "payfine" && selectedFine && (
        <PayFine
          fine={selectedFine}
          navigateToFines={() => setCurrentScreen("fines")}
          onConfirmPayment={(paymentInfo) => {
            // Update fines state so that the fine with matching FineID is marked as "Paid"
            setFines(prevFines =>
              prevFines.map(fine =>
                fine.FineID === paymentInfo.fine.FineID
                  ? { ...fine, Status: "Paid" }
                  : fine
              )
            );
            // Return to fines list page
            setCurrentScreen("fines");
          }}
        />
      )}

      {currentScreen === "dataReport" && (
        <div className="content-container">
          <h2>Data Report</h2>
          <p>Here is the data from the database:</p>

          {/* Display the data in a table */}
          {reportData && (
            <table className="data-report-table">
              <thead>
                <tr>
                  {Object.keys(reportData[0]).map((key, index) => (
                    <th key={index}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reportData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {Object.values(row).map((value, colIndex) => (
                      <td key={colIndex}>{value}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <button onClick={navigateToHome} className="btn-back">
            Back to Menu
          </button>
        </div>
      )}

      {currentScreen === "media" && (
        <Media
          navigateToHome={navigateToHome}
          isLoggedIn={isLoggedIn}
          navigateToLogin={navigateToLogin}
          userData={userData}
          initialCategory={initialMediaCategory}
          navigateToLanding={navigateToLanding}
          navigateToAddMedia={navigateToAddMedia}
          navigateToUpdateMediaList={navigateToUpdateMediaList}
          // navigateToDeleteMedia={navigateToDeleteMedia}
          navigateToDeleteMediaList={navigateToDeleteMediaList}
        />
      )}

      {currentScreen === "devices" && (
        <Devices
          navigateToHome={navigateToHome}
          isLoggedIn={isLoggedIn}
          navigateToLogin={navigateToLogin}
          userData={userData}
          initialCategory={initialDevicesCategory}
          navigateToLanding={navigateToLanding}
          navigateToAddDevice={navigateToAddDevice}
          navigateToUpdateDeviceList={navigateToUpdateDeviceList}
          navigateToDeleteDeviceList={navigateToDeleteDeviceList}
        />
      )}

      {currentScreen === "rooms" && (
        <RoomReservation
          userData={userData}
          navigateToHome={navigateToHome}
          isLoggedIn={isLoggedIn}
          navigateToLogin={navigateToLogin}
          initialCategory={initialRoomCategory} // Pass the initial category
          navigateToLanding={navigateToLanding} // Add this prop
        />
      )}

      {currentScreen === "events" && (
        <Events
          navigateToHome={navigateToHome}
          userData={userData}
          initialCategory={initialEventCategory} // Pass the initial category
          navigateToLanding={navigateToLanding} // Add this prop
        />
      )}

      {currentScreen === "adminDashboard" && userData?.Role === "Admin" && (
        <AdminDashboard 
          userData={userData} 
          navigateToHome={navigateToHome} 
        />
      )}

      {currentScreen === "updateDeviceList" && (
        <UpdateDeviceList
          navigateToHome={navigateToHome}
          navigateToUpdateDevice={navigateToUpdateDevice}
        />
      )}

      {currentScreen === "updateDevice" && selectedDevice && (
        <UpdateDevice
          deviceData={selectedDevice}
          onUpdateDevice={handleUpdateDevice}
          navigateToHome={navigateToHome}
        />
      )}

      {currentScreen === "updateMediaList" && (
        <UpdateMediaList
          navigateToHome={navigateToHome}
          navigateToUpdateMedia={navigateToUpdateMedia}
        />
      )}

      {currentScreen === "updateMedia" && selectedMedia && (
        <UpdateMedia
          mediaData={selectedMedia}
          onUpdateMedia={handleUpdateMedia}
          navigateToHome={navigateToHome}
        />
      )}

      {currentScreen === "updateBookList" && (
        <UpdateBookList
          navigateToHome={navigateToHome}
          navigateToUpdateBook={navigateToUpdateBook}
        />
      )}

      {currentScreen === "updateBook" && selectedBook && (
        <UpdateBook
          bookData={selectedBook}
          onUpdateBook={handleUpdateBook}
          navigateToHome={navigateToHome}
        />
      )}

      {currentScreen === "deleteDeviceList" && (
        <DeleteDeviceList
          navigateToHome={navigateToHome}
          navigateToDeleteDevice={navigateToDeleteDevice}
        />
      )}

      {currentScreen === "deleteDevice" && selectedDevice && (
        <DeleteDevice
          deviceData={selectedDevice}
          onDeleteDevice={handleDeleteDevice}
          navigateToHome={navigateToHome}
        />
      )}

      {currentScreen === "deleteMediaList" && (
        <DeleteMediaList
          navigateToHome={navigateToHome}
          navigateToDeleteMedia={navigateToDeleteMedia}
        />
      )}

      {currentScreen === "deleteMedia" && selectedMedia && (
        <DeleteMedia
          mediaData={selectedMedia}
          onDeleteMedia={handleDeleteMedia}
          navigateToHome={navigateToHome}
        />
      )}

      {currentScreen === "deleteBookList" && (
        <DeleteBookList
          navigateToHome={navigateToHome}
          navigateToDeleteBook={navigateToDeleteBook}
        />
      )}

      {currentScreen === "deleteBook" && selectedBook && (
        <DeleteBook
          bookData={selectedBook}
          onDeleteBook={handleDeleteBook}
          navigateToHome={navigateToHome}
        />
      )}

      {currentScreen === "roomManagement" && (
        <RoomManagement
          userData={userData}
          navigateToHome={navigateToHome}
          isLoggedIn={isLoggedIn}
          navigateToLogin={navigateToLogin}
        />
      )}
    </div>
  );
}

export default App;
