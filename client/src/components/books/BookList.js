import React, { useState, useEffect, useRef } from "react";

const BookList = ({
  books,
  navigateToLoan,
  navigateToHold,
  navigateToHome,
  userData,
  isLoggedIn, // Added isLoggedIn prop
  navigateToAddBook,
  navigateToUpdateBookList,
  navigateToDeleteBookList,
  navigateToLogin, // Added navigateToLogin prop
  initialCategory, // Add this prop
  navigateToLanding, // Add this prop to fix the error
  navigateToDeleteBook // Ensure navigateToDeleteBook is correctly passed to the DeleteBookList component
}) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [displayedBooks, setDisplayedBooks] = useState([]);
  const initialRenderRef = useRef(true);
  const [imageLoadingStatus, setImageLoadingStatus] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  
  // Use the initialCategory prop on mount
  useEffect(() => {
    if (initialCategory) {
      // Ensure initialCategory is treated as a string
      setSelectedCategory(String(initialCategory));
    }
  }, [initialCategory]);

  // Filter books by category and search query
  useEffect(() => {
    if (books.length > 0) {
      let filteredBooks = [...books];
      
      // Filter by category first
      if (selectedCategory !== "all") {
        filteredBooks = filteredBooks.filter(book => 
          book.genre && typeof book.genre === 'string' && 
          typeof selectedCategory === 'string' && 
          book.genre.toLowerCase() === selectedCategory.toLowerCase()
        );
      }
      
      // Then filter by search query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        filteredBooks = filteredBooks.filter(book => 
          (book.title && book.title.toLowerCase().includes(query)) ||
          (book.author && book.author.toLowerCase().includes(query)) ||
          (book.genre && book.genre.toLowerCase().includes(query))
        );
      }
      
      setDisplayedBooks(filteredBooks);
      
      // Only apply animation on initial render or category/search change
      if (!initialRenderRef.current) {
        // Add a class to the container to trigger a CSS animation
        const container = document.querySelector('#books-grid');
        if (container) {
          container.classList.remove('fade-in-items');
          // Force a reflow to restart animation
          void container.offsetWidth;
          container.classList.add('fade-in-items');
        }
      } else {
        initialRenderRef.current = false;
      }
    } else {
      setDisplayedBooks([]);
    }
  }, [selectedCategory, books, searchQuery]);

  // Add CSS styles for animations to document head
  useEffect(() => {
    const style = document.createElement('style');
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
      
      .fade-in-items .book-card {
        opacity: 0;
        transform: translateY(30px);
        animation: fadeInUp 0.5s forwards;
      }
      
      .fade-in-items .book-card:nth-child(1) { animation-delay: 0.1s; }
      .fade-in-items .book-card:nth-child(2) { animation-delay: 0.15s; }
      .fade-in-items .book-card:nth-child(3) { animation-delay: 0.2s; }
      .fade-in-items .book-card:nth-child(4) { animation-delay: 0.25s; }
      .fade-in-items .book-card:nth-child(5) { animation-delay: 0.3s; }
      .fade-in-items .book-card:nth-child(6) { animation-delay: 0.35s; }
      .fade-in-items .book-card:nth-child(7) { animation-delay: 0.4s; }
      .fade-in-items .book-card:nth-child(8) { animation-delay: 0.45s; }
      .fade-in-items .book-card:nth-child(9) { animation-delay: 0.5s; }
      .fade-in-items .book-card:nth-child(10) { animation-delay: 0.55s; }
      .fade-in-items .book-card:nth-child(11) { animation-delay: 0.6s; }
      .fade-in-items .book-card:nth-child(12) { animation-delay: 0.65s; }
      
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

  // Handle image loading status
  const handleImageLoad = (id) => {
    setImageLoadingStatus(prev => ({
      ...prev,
      [id]: 'loaded'
    }));
  };

  const handleImageError = (id, e) => {
    setImageLoadingStatus(prev => ({
      ...prev,
      [id]: 'error'
    }));
    e.target.onerror = null;
    e.target.src = "/images/default-book.jpg";
  };

  // Extract unique genres for the category filter
  const genres = books.length > 0
    ? ['all', ...new Set(books.map(book => book.genre).filter(Boolean))]
    : ['all'];

  // Apple-inspired styling
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
      flexWrap: "wrap",
    },
    navButton: {
      backgroundColor: "transparent",
      border: "none",
      fontSize: "17px",
      fontWeight: "400",
      padding: "8px 18px",
      margin: "5px",
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
      cursor: "pointer",
      transition: "transform 0.3s ease, box-shadow 0.3s ease",
    },
    cardHover: {
      transform: "translateY(-10px)",
      boxShadow: "0 12px 40px rgba(0, 0, 0, 0.12)",
    },
    imageContainer: {
      position: "relative",
      height: "300px",
      overflow: "hidden",
      borderTopLeftRadius: "18px",
      borderTopRightRadius: "18px",
      backgroundColor: "#f5f5f7",
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
      borderRadius: "20px",
      padding: "12px 22px",
      fontSize: "17px",
      fontWeight: "500",
      cursor: "pointer",
      transition: "all 0.2s ease",
      marginTop: "15px",
      textAlign: "center",
    },
    holdButton: {
      display: "inline-block",
      backgroundColor: "#f7d774",
      color: "#000000",
      border: "none",
      borderRadius: "20px",
      padding: "12px 22px",
      fontSize: "17px",
      fontWeight: "500",
      cursor: "pointer",
      transition: "all 0.2s ease",
      marginTop: "15px",
      textAlign: "center",
    },
    addButton: {
      display: "block",
      width: "max-content",
      margin: "0 auto 40px",
      backgroundColor: "#0071e3",
      color: "#ffffff",
      border: "none",
      borderRadius: "20px",
      padding: "15px 30px",
      fontSize: "17px",
      fontWeight: "500",
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
    backButton: {
      display: "block",
      width: "max-content",
      margin: "60px auto 0 auto",
      backgroundColor: "transparent",
      border: "1px solid #86868b",
      color: "#1d1d1f",
      padding: "12px 24px",
      borderRadius: "20px",
      fontSize: "17px",
      fontWeight: "500",
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
    loadingOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.1)",
    },
    loadingSpinner: {
      border: "4px solid rgba(255, 255, 255, 0.3)",
      borderRadius: "50%",
      borderTop: "4px solid #0071e3",
      width: "40px",
      height: "40px",
      animation: "spin 1s linear infinite",
    }
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

  const handleLoanClick = (book) => {
    // Only process if user is logged in
    if (!isLoggedIn) {
      navigateToLogin();
      return;
    }
    
    navigateToLoan(book);;
  };

  const handleHoldClick = (book) => {
    // Only process if user is logged in
    if (!isLoggedIn) {
      navigateToLogin();
      return;
    }
    
    navigateToHold(book);
  };

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>Explore Our Book Collection</h1>
        <p style={styles.heroSubtitle}>
          Discover books from various genres in our library
        </p>
        
        {/* Add login prompt for users who aren't logged in */}
        {!isLoggedIn && (
          <p style={{
            ...styles.heroSubtitle, 
            fontSize: "18px",
            marginTop: "30px",
            opacity: "0",
            transform: "translateY(20px)",
            animation: "fadeInUp 1s forwards 0.6s"
          }}>
            Please{" "}
            <span 
              onClick={navigateToLogin} 
              style={{
                color: "#0071e3",
                textDecoration: "none",
                fontWeight: "500",
                cursor: "pointer"
              }}
            >
              log in
            </span>{" "}
            to borrow items from our collection
          </p>
        )}
      </div>

      {/* Admin Buttons for Book Management (for Admins) */}
      {userData?.Role === "Admin" && (
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <button onClick={navigateToAddBook} className="admin-button">Add Book</button>
          <button onClick={() => navigateToUpdateBookList()} className="admin-button">Update Book</button>
          <button onClick={() => navigateToDeleteBookList()} className="admin-button">Delete Book</button>
        </div>
      )}

      {/* Navigation */}
      <div style={styles.navContainer}>
        <div style={styles.nav}>
          {genres.map(genre => (
            <button
              key={genre}
              style={selectedCategory === genre 
                ? {...styles.navButton, ...styles.activeNavButton} 
                : styles.navButton}
              onClick={() => setSelectedCategory(genre)}
            >
              {genre === 'all' ? 'All Books' : genre}
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
            placeholder="Search by title, author, or genre"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={searchBarStyles.searchInput}
          />
        </div>
      </div>

      {/* Content Section */}
      <div style={styles.contentSection}>
        <div id="books-grid" className="fade-in-items" style={styles.grid}>
          {displayedBooks.map((book) => {
            const isOutOfStock = book.copies === 0;
            const userHasHold = book.userHasHold; // Indicates if the current user has a hold on the book
            const otherUserHasHold = book.otherUserHasHold; // Indicates if another user has a hold on the book

            return (
              <div
                key={book.bookID}
                className="book-card"
                style={styles.card}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-10px)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.12)';
                  const img = e.currentTarget.querySelector('img');
                  if (img) img.style.transform = 'scale(1.05)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = '';
                  const img = e.currentTarget.querySelector('img');
                  if (img) img.style.transform = 'scale(1)';
                }}
              >
                <div style={styles.imageContainer}>
                  {/* Show loading spinner until image loads */}
                  {imageLoadingStatus[book.bookID] !== 'loaded' && imageLoadingStatus[book.bookID] !== 'error' && (
                    <div style={styles.loadingOverlay}>
                      <div style={styles.loadingSpinner}></div>
                    </div>
                  )}
                  
                  <img
                    src={`/images/books/${book.bookID}.jpg`}
                    alt={book.title}
                    style={styles.cardImage}
                    onLoad={() => handleImageLoad(book.bookID)}
                    onError={(e) => handleImageError(book.bookID, e)}
                  />
                </div>
                <div style={styles.cardContent}>
                  <h3 style={styles.cardTitle}>{book.title}</h3>
                  <p style={styles.cardInfo}>Author: {book.author}</p>
                  <p style={styles.cardInfo}>Genre: {book.genre}</p>
                  <p style={styles.cardInfo}>Available Copies: {book.copies}</p>

                  {/* Conditional button rendering based on availability and holds */}
                  {isLoggedIn ? (
                    isOutOfStock ? (
                      // If no copies are available, show the Hold button
                      <button style={styles.holdButton} onClick={() => handleHoldClick(book)}>
                        Hold
                      </button>
                    ) : (
                      // Copies are available:
                      book.holdUserID ? (
                        // A hold exists—allow borrowing only if the current user placed it
                        book.holdUserID === userData.UserID ? (
                          <button style={styles.button} onClick={() => handleLoanClick(book)}>
                            Borrow
                          </button>
                        ) : (
                          <button style={{ ...styles.button, opacity: 0.5, cursor: 'not-allowed' }} disabled>
                            Borrow
                          </button>
                        )
                      ) : (
                        // No hold exists—allow anyone to borrow
                        <button style={styles.button} onClick={() => handleLoanClick(book)}>
                          Borrow
                        </button>
                      )
                    )
                  ) : (
                    // If the user is not logged in, show the Login to Borrow button
                    <button 
                      style={{
                        display: "inline-block",
                        backgroundColor: "#000000",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "20px",
                        padding: "12px 22px",
                        fontSize: "17px",
                        fontWeight: "500",
                        cursor: "pointer",
                        marginTop: "15px",
                        textAlign: "center",
                        opacity: "0.9",
                      }}
                      onClick={navigateToLogin}
                    >
                      Login to Borrow
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Login message at the bottom for users who aren't logged in */}
        {!isLoggedIn && (
          <div style={{ textAlign: "center", margin: "40px 0" }}>
            <p style={{
              fontSize: "18px",
              fontWeight: "400",
              color: "#86868b",
              marginTop: "10px",
              textAlign: "center",
            }}>
              Want to borrow these items?{" "}
              <span 
                onClick={navigateToLogin} 
                style={{
                  color: "#0071e3",
                  textDecoration: "none",
                  fontWeight: "500",
                  cursor: "pointer",
                }}
              >
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

export default BookList;
