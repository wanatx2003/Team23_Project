import React, { useEffect } from 'react';
import '../../styles/landing/LandingPage.css';
import '../../styles/animations/ScrollAnimations.css';

const LandingPage = ({ 
  navigateToLogin, 
  navigateToRegister 
}) => {
  // Add scroll-to-top wrappers for navigation
  const handleNavigateToLogin = () => { window.scrollTo(0,0); navigateToLogin(); };
  const handleNavigateToRegister = () => { window.scrollTo(0,0); navigateToRegister(); };

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

      @keyframes slideInLeft {
        from { transform: translateX(-50px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }

      @keyframes slideInRight {
        from { transform: translateX(50px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }

      .scroll-animate {
        opacity: 0;
        transition: all 0.6s ease-out;
      }

      .scroll-animate.is-visible {
        opacity: 1;
      }

      .from-left.is-visible {
        animation: slideInLeft 0.6s ease-out forwards;
      }

      .from-right.is-visible {
        animation: slideInRight 0.6s ease-out forwards;
      }

      .from-bottom.is-visible {
        animation: slideUp 0.6s ease-out forwards;
      }

      .delay-200 {
        animation-delay: 0.2s;
      }

      .delay-300 {
        animation-delay: 0.3s;
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
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">VolunteerConnect</h1>
          <p className="hero-subtitle">
            Connecting passionate volunteers with meaningful opportunities in their community
          </p>
          <p className="hero-description">
            Join our platform to discover volunteer opportunities that match your skills, 
            schedule, and interests. Make a difference while building valuable connections.
          </p>
          
          <div className="hero-buttons">
            <button onClick={handleNavigateToRegister} className="cta-button primary">
              Get Started
            </button>
            <button onClick={handleNavigateToLogin} className="cta-button secondary">
              Sign In
            </button>
          </div>
        </div>
        
        <div className="hero-image">
          <img 
            src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&h=400&fit=crop" 
            alt="Volunteers working together" 
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2>Why Choose VolunteerConnect?</h2>
          
          <div className="features-grid">
            <div className="feature-card scroll-animate from-left">
              <div className="feature-icon">🎯</div>
              <h3>Smart Matching</h3>
              <p>Our system matches you with opportunities based on your skills, location, and availability.</p>
            </div>
            
            <div className="feature-card scroll-animate from-bottom delay-200">
              <div className="feature-icon">⏰</div>
              <h3>Flexible Scheduling</h3>
              <p>Find volunteer opportunities that fit your schedule with our easy-to-use calendar system.</p>
            </div>
            
            <div className="feature-card scroll-animate from-right delay-300">
              <div className="feature-icon">📈</div>
              <h3>Track Your Impact</h3>
              <p>Monitor your volunteer hours and see the difference you're making in your community.</p>
            </div>
            
            <div className="feature-card scroll-animate from-bottom">
              <div className="feature-icon">🤝</div>
              <h3>Community Network</h3>
              <p>Connect with like-minded individuals and organizations working toward common goals.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <h2>How It Works</h2>
          
          <div className="steps-grid">
            <div className="step scroll-animate from-left">
              <div className="step-number">1</div>
              <h3>Create Your Profile</h3>
              <p>Sign up and complete your volunteer profile with your skills, interests, and availability.</p>
            </div>
            
            <div className="step scroll-animate from-bottom delay-200">
              <div className="step-number">2</div>
              <h3>Discover Opportunities</h3>
              <p>Browse volunteer events and opportunities that match your profile and preferences.</p>
            </div>
            
            <div className="step scroll-animate from-right delay-300">
              <div className="step-number">3</div>
              <h3>Get Matched</h3>
              <p>Receive notifications when you're matched to suitable volunteer opportunities.</p>
            </div>
            
            <div className="step scroll-animate from-bottom">
              <div className="step-number">4</div>
              <h3>Make an Impact</h3>
              <p>Volunteer at events and track your contribution to the community.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Info Section */}
      <section className="info-section">
        <div className="info-card scroll-animate from-left">
          <h3>Platform Hours</h3>
          <p>Monday - Friday: 6:00 AM - 11:00 PM</p>
          <p>Saturday - Sunday: 8:00 AM - 10:00 PM</p>
          <p>24/7 online access available</p>
        </div>
        
        <div className="info-card scroll-animate from-bottom delay-200">
          <h3>Contact Us</h3>
          <p>Email: support@volunteerconnect.org</p>
          <p>Phone: (555) VOLUNTEER</p>
          <p>Emergency Line: (555) 911-HELP</p>
        </div>
        
        <div className="info-card scroll-animate from-right delay-300">
          <h3>Community Center</h3>
          <p>Downtown Community Hub</p>
          <p>456 Volunteer Avenue</p>
          <p>Community District, CD 12345</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>VolunteerConnect</h4>
            <p>Making volunteering accessible and meaningful for everyone.</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><button onClick={handleNavigateToRegister}>Sign Up</button></li>
              <li><button onClick={handleNavigateToLogin}>Login</button></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 VolunteerConnect - Community Volunteer Management Platform</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
