import React, { useEffect } from 'react';
import '../../styles/landing/LandingPage.css';
import '../../styles/animations/ScrollAnimations.css';

const LandingPage = ({ 
  navigateToBooks, 
  navigateToMedia, 
  navigateToRooms, 
  navigateToEvents 
}) => {
  // Add scroll-to-top wrappers for navigation
  const handleNavigateToBooks = () => { window.scrollTo(0,0); navigateToBooks(); };
  const handleNavigateToMedia = () => { window.scrollTo(0,0); navigateToMedia(); };
  const handleNavigateToRooms = () => { window.scrollTo(0,0); navigateToRooms(); };
  const handleNavigateToEvents = () => { window.scrollTo(0,0); navigateToEvents(); };

  // Add animation styles on component mount
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slideUp {
        from { transform: translateY(30px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    
    // Set up intersection observer for scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Add 'is-visible' class when element is in view
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            // Once the animation is done, we can stop observing
            // observer.unobserve(entry.target);
          } else {
            // Optional: Remove the class when out of view for re-animation when scrolling back up
            entry.target.classList.remove('is-visible');
          }
        });
      },
      {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.15, // Trigger when 15% of the element is visible
      }
    );
    
    // Observe all elements with scroll-animate class
    document.querySelectorAll('.scroll-animate').forEach((el) => {
      observer.observe(el);
    });
    
    // Clean up
    return () => {
      document.head.removeChild(style);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="landing-container">
      {/* Hero Section */}
      <section className="hero-section parallax-bg">
        <div className="hero-content">
          <h1>Welcome to BookFinder</h1>
          <p className="hero-subtitle">Your University Library Portal</p>
          <div className="hero-cta">
            <button onClick={handleNavigateToBooks} className="cta-button primary">
              Explore Books
            </button>
            <button onClick={handleNavigateToMedia} className="cta-button secondary">
              Discover Media
            </button>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="features-section">
        <h2 className="section-title scroll-animate from-bottom">Library Services</h2>
        
        <div className="features-grid">
          <div className="feature-card scroll-animate from-left delay-100" onClick={handleNavigateToBooks}>
            <div className="feature-icon book-icon"></div>
            <h3>Extensive Book Collection</h3>
            <p>Browse through our books across all genres and subjects</p>
          </div>
          
          <div className="feature-card scroll-animate from-bottom delay-200" onClick={handleNavigateToMedia}>
            <div className="feature-icon media-icon"></div>
            <h3>Digital Media</h3>
            <p>Access our collection of music, movies, and more</p>
          </div>
          
          <div className="feature-card scroll-animate from-right delay-300" onClick={handleNavigateToRooms}>
            <div className="feature-icon room-icon"></div>
            <h3>Study Spaces</h3>
            <p>Reserve private rooms and collaborative spaces</p>
          </div>
          
          <div className="feature-card scroll-animate from-bottom delay-400" onClick={handleNavigateToEvents}>
            <div className="feature-icon event-icon"></div>
            <h3>Events & Workshops</h3>
            <p>Join our community events and learning sessions</p>
          </div>
        </div>
      </section>

      {/* Promotional Section */}
      <section className="promo-section sticky-section">
        <div className="promo-content">
          <h2 className="scroll-animate fade-in">Discover Something New</h2>
          <p className="scroll-animate fade-in delay-200">Our curated collections are updated regularly with the latest publications</p>
          <button 
            onClick={handleNavigateToBooks} 
            className="promo-button scroll-animate scale-in delay-400"
          >
            Start Browsing
          </button>
        </div>
        <div className="promo-image scroll-animate from-right"></div>
      </section>

      {/* Quick Info Section */}
      <section className="info-section">
        <div className="info-card scroll-animate from-left">
          <h3>Opening Hours</h3>
          <p>Monday - Friday: 8:00 AM - 10:00 PM</p>
          <p>Saturday - Sunday: 10:00 AM - 8:00 PM</p>
        </div>
        
        <div className="info-card scroll-animate from-bottom delay-200">
          <h3>Contact Us</h3>
          <p>Email: library@university.edu</p>
          <p>Phone: (555) 123-4567</p>
        </div>
        
        <div className="info-card scroll-animate from-right delay-300">
          <h3>Location</h3>
          <p>Main Campus, Building C</p>
          <p>123 University Avenue</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© 2025 BookFinder - University Library Portal</p>
      </footer>
    </div>
  );
};

export default LandingPage;
