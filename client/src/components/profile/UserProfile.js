import React, { useState, useEffect } from 'react';
import '../../styles/profile/UserProfile.css';

const UserProfile = ({ userData, navigateToHome }) => {
  const [profile, setProfile] = useState({
    FullName: '',
    Address1: '',
    Address2: '',
    City: '',
    StateCode: '',
    Zipcode: '',
    Skills: [],
    Preferences: [],
    Availability: []
  });
  const [states, setStates] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchProfile();
    fetchStates();
    fetchAvailableSkills();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/profile/${userData.UserID}`);
      const data = await response.json();
      if (data.success) {
        setProfile({
          FullName: data.profile.FullName || '',
          Address1: data.profile.Address1 || '',
          Address2: data.profile.Address2 || '',
          City: data.profile.City || '',
          StateCode: data.profile.StateCode || '',
          Zipcode: data.profile.Zipcode || '',
          Skills: data.profile.skills || [],
          Preferences: data.profile.preferences || [],
          Availability: data.profile.availability || []
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStates = async () => {
    try {
      const response = await fetch('/api/states');
      const data = await response.json();
      if (data.success) {
        setStates(data.states);
      }
    } catch (error) {
      console.error('Error fetching states:', error);
    }
  };

  const fetchAvailableSkills = async () => {
    try {
      const response = await fetch('/api/skills');
      const data = await response.json();
      if (data.success) {
        setAvailableSkills(data.skills);
      }
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!profile.FullName.trim() || profile.FullName.length > 100) {
      newErrors.FullName = 'Full name is required (max 100 characters)';
    }
    if (!profile.Address1.trim() || profile.Address1.length > 100) {
      newErrors.Address1 = 'Address 1 is required (max 100 characters)';
    }
    if (profile.Address2.length > 100) {
      newErrors.Address2 = 'Address 2 must be 100 characters or less';
    }
    if (!profile.City.trim() || profile.City.length > 100) {
      newErrors.City = 'City is required (max 100 characters)';
    }
    if (!profile.StateCode) {
      newErrors.StateCode = 'State selection is required';
    }
    if (!profile.Zipcode.trim() || profile.Zipcode.length < 5 || profile.Zipcode.length > 9) {
      newErrors.Zipcode = 'Zip code is required (5-9 characters)';
    }
    if (profile.Skills.length === 0) {
      newErrors.Skills = 'At least one skill must be selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSaving(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          UserID: userData.UserID,
          ...profile
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('An error occurred while updating your profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleSkillChange = (skill) => {
    const newSkills = profile.Skills.includes(skill)
      ? profile.Skills.filter(s => s !== skill)
      : [...profile.Skills, skill];
    
    setProfile({ ...profile, Skills: newSkills });
    if (errors.Skills && newSkills.length > 0) {
      setErrors({ ...errors, Skills: '' });
    }
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        <p>Complete your volunteer profile to get matched with suitable opportunities</p>
      </div>

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-section">
          <h3>Personal Information</h3>
          
          <div className="form-group">
            <label htmlFor="FullName">Full Name *</label>
            <input
              type="text"
              id="FullName"
              value={profile.FullName}
              onChange={(e) => setProfile({ ...profile, FullName: e.target.value })}
              maxLength={100}
              placeholder="Enter your full name"
            />
            {errors.FullName && <span className="error">{errors.FullName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="Address1">Address 1 *</label>
            <input
              type="text"
              id="Address1"
              value={profile.Address1}
              onChange={(e) => setProfile({ ...profile, Address1: e.target.value })}
              maxLength={100}
              placeholder="Street address"
            />
            {errors.Address1 && <span className="error">{errors.Address1}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="Address2">Address 2</label>
            <input
              type="text"
              id="Address2"
              value={profile.Address2}
              onChange={(e) => setProfile({ ...profile, Address2: e.target.value })}
              maxLength={100}
              placeholder="Apartment, suite, etc. (optional)"
            />
            {errors.Address2 && <span className="error">{errors.Address2}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="City">City *</label>
              <input
                type="text"
                id="City"
                value={profile.City}
                onChange={(e) => setProfile({ ...profile, City: e.target.value })}
                maxLength={100}
                placeholder="City"
              />
              {errors.City && <span className="error">{errors.City}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="StateCode">State *</label>
              <select
                id="StateCode"
                value={profile.StateCode}
                onChange={(e) => setProfile({ ...profile, StateCode: e.target.value })}
              >
                <option value="">Select State</option>
                {states.map(state => (
                  <option key={state.StateCode} value={state.StateCode}>
                    {state.StateName}
                  </option>
                ))}
              </select>
              {errors.StateCode && <span className="error">{errors.StateCode}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="Zipcode">Zip Code *</label>
              <input
                type="text"
                id="Zipcode"
                value={profile.Zipcode}
                onChange={(e) => setProfile({ ...profile, Zipcode: e.target.value })}
                maxLength={9}
                placeholder="12345"
              />
              {errors.Zipcode && <span className="error">{errors.Zipcode}</span>}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Skills & Preferences</h3>
          
          <div className="form-group">
            <label>Skills * (Select all that apply)</label>
            <div className="skills-grid">
              {availableSkills.map(skill => (
                <label key={skill} className="skill-checkbox">
                  <input
                    type="checkbox"
                    checked={profile.Skills.includes(skill)}
                    onChange={() => handleSkillChange(skill)}
                  />
                  <span className="checkmark"></span>
                  {skill}
                </label>
              ))}
            </div>
            {errors.Skills && <span className="error">{errors.Skills}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="preferences">Preferences (Optional)</label>
            <textarea
              id="preferences"
              value={profile.Preferences.join('\n')}
              onChange={(e) => setProfile({ 
                ...profile, 
                Preferences: e.target.value.split('\n').filter(p => p.trim()) 
              })}
              placeholder="Enter any specific preferences or requirements (one per line)"
              rows={4}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={navigateToHome} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserProfile;
