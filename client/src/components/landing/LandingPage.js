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
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Smart Matching</h3>
              <p>Our system matches you with opportunities based on your skills, location, and availability.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">⏰</div>
              <h3>Flexible Scheduling</h3>
              <p>Find volunteer opportunities that fit your schedule with our easy-to-use calendar system.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h3>Track Your Impact</h3>
              <p>Monitor your volunteer hours and see the difference you're making in your community.</p>
            </div>
            
            <div className="feature-card">
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
            <div className="step">
              <div className="step-number">1</div>
              <h3>Create Your Profile</h3>
              <p>Sign up and complete your volunteer profile with your skills, interests, and availability.</p>
            </div>
            
            <div className="step">
              <div className="step-number">2</div>
              <h3>Discover Opportunities</h3>
              <p>Browse volunteer events and opportunities that match your profile and preferences.</p>
            </div>
            
            <div className="step">
              <div className="step-number">3</div>
              <h3>Get Matched</h3>
              <p>Receive notifications when you're matched to suitable volunteer opportunities.</p>
            </div>
            
            <div className="step">
              <div className="step-number">4</div>
              <h3>Make an Impact</h3>
              <p>Volunteer at events and track your contribution to the community.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat">
              <div className="stat-number">1,200+</div>
              <div className="stat-label">Active Volunteers</div>
            </div>
            <div className="stat">
              <div className="stat-number">350+</div>
              <div className="stat-label">Events Completed</div>
            </div>
            <div className="stat">
              <div className="stat-number">15,000+</div>
              <div className="stat-label">Hours Volunteered</div>
            </div>
            <div className="stat">
              <div className="stat-number">95%</div>
              <div className="stat-label">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Start Volunteering?</h2>
          <p>Join thousands of volunteers making a difference in their communities.</p>
          
          <div className="cta-buttons">
            <button onClick={handleNavigateToRegister} className="cta-button primary large">
              Join as Volunteer
            </button>
            <button onClick={handleNavigateToRegister} className="cta-button secondary large">
              Register as Organization
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>VolunteerConnect</h4>
              <p>Connecting volunteers with meaningful opportunities since 2024.</p>
            </div>
            
            <div className="footer-section">
              <h4>For Volunteers</h4>
              <ul>
                <li><a href="#" onClick={handleNavigateToRegister}>Sign Up</a></li>
                <li><a href="#" onClick={handleNavigateToLogin}>Login</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>For Organizations</h4>
              <ul>
                <li><a href="#" onClick={handleNavigateToRegister}>Create Account</a></li>
                <li><a href="#" onClick={handleNavigateToLogin}>Admin Portal</a></li>
              </ul>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2024 VolunteerConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
