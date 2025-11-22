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
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-badge">✨ Trusted by 10,000+ Volunteers</div>
          <h1 className="hero-title">
            Make a <span className="gradient-text">Difference</span> in Your Community
          </h1>
          <p className="hero-subtitle">
            Connect with meaningful volunteer opportunities that match your passion, 
            skills, and schedule. Join VolunteerConnect today.
          </p>
          
          <div className="hero-buttons">
            <button onClick={handleNavigateToRegister} className="cta-button primary">
              <span>Get Started Free</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button onClick={handleNavigateToLogin} className="cta-button secondary">
              <span>Sign In</span>
            </button>
          </div>
          
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">10K+</div>
              <div className="stat-label">Active Volunteers</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">500+</div>
              <div className="stat-label">Organizations</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">50K+</div>
              <div className="stat-label">Hours Contributed</div>
            </div>
          </div>
        </div>
        
        <div className="hero-image">
          <div className="image-card">
            <img 
              src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&h=600&fit=crop" 
              alt="Volunteers working together" 
            />
            <div className="floating-card card-1">
              <div className="card-icon">🎯</div>
              <div className="card-text">Smart Matching</div>
            </div>
            <div className="floating-card card-2">
              <div className="card-icon">⏰</div>
              <div className="card-text">Flexible Schedule</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Features</span>
            <h2>Everything You Need to <span className="gradient-text">Volunteer Effectively</span></h2>
            <p className="section-description">Powerful tools designed to make volunteering seamless and rewarding</p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card scroll-animate from-left">
              <div className="feature-icon-wrapper">
                <div className="feature-icon gradient-1">🎯</div>
              </div>
              <h3>Smart Matching</h3>
              <p>AI-powered matching connects you with opportunities perfectly suited to your skills, location, and availability.</p>
              <div className="feature-link">Learn more →</div>
            </div>
            
            <div className="feature-card scroll-animate from-bottom delay-200">
              <div className="feature-icon-wrapper">
                <div className="feature-icon gradient-2">⏰</div>
              </div>
              <h3>Flexible Scheduling</h3>
              <p>Integrated calendar system helps you find opportunities that seamlessly fit your busy lifestyle.</p>
              <div className="feature-link">Learn more →</div>
            </div>
            
            <div className="feature-card scroll-animate from-right delay-300">
              <div className="feature-icon-wrapper">
                <div className="feature-icon gradient-3">📈</div>
              </div>
              <h3>Track Your Impact</h3>
              <p>Beautiful analytics dashboard shows your volunteer hours, achievements, and community impact metrics.</p>
              <div className="feature-link">Learn more →</div>
            </div>
            
            <div className="feature-card scroll-animate from-bottom">
              <div className="feature-icon-wrapper">
                <div className="feature-icon gradient-4">🤝</div>
              </div>
              <h3>Community Network</h3>
              <p>Build meaningful connections with organizations and volunteers working toward shared community goals.</p>
              <div className="feature-link">Learn more →</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Simple Process</span>
            <h2>Start Making a Difference in <span className="gradient-text">4 Easy Steps</span></h2>
          </div>
          
          <div className="steps-timeline">
            <div className="timeline-line"></div>
            
            <div className="step scroll-animate from-left">
              <div className="step-number-wrapper">
                <div className="step-number">1</div>
                <div className="step-connector"></div>
              </div>
              <div className="step-content">
                <h3>Create Your Profile</h3>
                <p>Sign up in minutes and tell us about your skills, interests, and availability. Our intelligent system will understand your preferences.</p>
                <ul className="step-features">
                  <li>✓ Quick 2-minute signup</li>
                  <li>✓ Add your skills & interests</li>
                  <li>✓ Set your availability</li>
                </ul>
              </div>
            </div>
            
            <div className="step scroll-animate from-right delay-200">
              <div className="step-number-wrapper">
                <div className="step-number">2</div>
                <div className="step-connector"></div>
              </div>
              <div className="step-content">
                <h3>Discover Opportunities</h3>
                <p>Browse through curated volunteer opportunities that match your unique profile and make a real difference.</p>
                <ul className="step-features">
                  <li>✓ Personalized recommendations</li>
                  <li>✓ Filter by location & date</li>
                  <li>✓ View organization details</li>
                </ul>
              </div>
            </div>
            
            <div className="step scroll-animate from-left delay-300">
              <div className="step-number-wrapper">
                <div className="step-number">3</div>
                <div className="step-connector"></div>
              </div>
              <div className="step-content">
                <h3>Get Matched & Confirm</h3>
                <p>Receive instant notifications when you're matched to perfect opportunities. Review details and confirm your participation.</p>
                <ul className="step-features">
                  <li>✓ Real-time notifications</li>
                  <li>✓ Easy confirmation process</li>
                  <li>✓ Calendar integration</li>
                </ul>
              </div>
            </div>
            
            <div className="step scroll-animate from-right">
              <div className="step-number-wrapper">
                <div className="step-number">4</div>
              </div>
              <div className="step-content">
                <h3>Make an Impact</h3>
                <p>Volunteer at events, log your hours, and watch your community impact grow. Share your experiences and inspire others.</p>
                <ul className="step-features">
                  <li>✓ Track volunteer hours</li>
                  <li>✓ Earn achievement badges</li>
                  <li>✓ View impact analytics</li>
                </ul>
              </div>
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
          <p>Email: volunteer@university.edu</p>
          <p>Phone: (555) VOLUNTEER</p>
          <p>Emergency Line: (555) 911-HELP</p>
        </div>
        
        <div className="info-card scroll-animate from-right delay-300">
          <h3>Location</h3>
          <p>Main Campus, Building C</p>
          <p>123 University Avenue</p>
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
          <p>© 2025 VolunteerConnect - Community Volunteer Management Platform</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
