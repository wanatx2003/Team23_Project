import React, { useState, useEffect } from 'react';
import '../../styles/profile/UserProfile.css';

const UserProfile = ({ userData, navigateToHome, updateUserData }) => {
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

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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

    // Validate availability
    profile.Availability.forEach((availability, index) => {
      if (!availability.DayOfWeek) {
        newErrors[`availability_day_${index}`] = 'Day of week is required';
      }
      if (!availability.StartTime) {
        newErrors[`availability_start_${index}`] = 'Start time is required';
      }
      if (!availability.EndTime) {
        newErrors[`availability_end_${index}`] = 'End time is required';
      }
      if (availability.StartTime && availability.EndTime && availability.StartTime >= availability.EndTime) {
        newErrors[`availability_time_${index}`] = 'End time must be after start time';
      }
    });

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
        
        // Update userData in App.js with new profile info
        if (updateUserData) {
          updateUserData({
            FullName: profile.FullName,
            City: profile.City,
            StateCode: profile.StateCode
          });
        }
        
        // Navigate back to dashboard
        setTimeout(() => {
          navigateToHome();
        }, 500);
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

  const addAvailability = () => {
    setProfile({
      ...profile,
      Availability: [
        ...profile.Availability,
        { DayOfWeek: '', StartTime: '', EndTime: '' }
      ]
    });
  };

  const removeAvailability = (index) => {
    const newAvailability = profile.Availability.filter((_, i) => i !== index);
    setProfile({ ...profile, Availability: newAvailability });
    
    // Clear related errors
    const newErrors = { ...errors };
    delete newErrors[`availability_day_${index}`];
    delete newErrors[`availability_start_${index}`];
    delete newErrors[`availability_end_${index}`];
    delete newErrors[`availability_time_${index}`];
    setErrors(newErrors);
  };

  const updateAvailability = (index, field, value) => {
    const newAvailability = [...profile.Availability];
    newAvailability[index] = { ...newAvailability[index], [field]: value };
    setProfile({ ...profile, Availability: newAvailability });

    // Clear specific field errors
    const newErrors = { ...errors };
    if (field === 'DayOfWeek') delete newErrors[`availability_day_${index}`];
    if (field === 'StartTime') delete newErrors[`availability_start_${index}`];
    if (field === 'EndTime') delete newErrors[`availability_end_${index}`];
    delete newErrors[`availability_time_${index}`];
    setErrors(newErrors);
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

        <div className="form-section">
          <h3>Availability</h3>
          <p>Set your available days and times for volunteering</p>
          
          <div className="availability-list">
            {profile.Availability.map((availability, index) => (
              <div key={index} className="availability-item">
                <div className="availability-row">
                  <div className="form-group">
                    <label htmlFor={`day-${index}`}>Day</label>
                    <select
                      id={`day-${index}`}
                      value={availability.DayOfWeek}
                      onChange={(e) => updateAvailability(index, 'DayOfWeek', e.target.value)}
                    >
                      <option value="">Select Day</option>
                      {daysOfWeek.map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                    {errors[`availability_day_${index}`] && (
                      <span className="error">{errors[`availability_day_${index}`]}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor={`start-${index}`}>Start Time</label>
                    <input
                      type="time"
                      id={`start-${index}`}
                      value={availability.StartTime}
                      onChange={(e) => updateAvailability(index, 'StartTime', e.target.value)}
                    />
                    {errors[`availability_start_${index}`] && (
                      <span className="error">{errors[`availability_start_${index}`]}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor={`end-${index}`}>End Time</label>
                    <input
                      type="time"
                      id={`end-${index}`}
                      value={availability.EndTime}
                      onChange={(e) => updateAvailability(index, 'EndTime', e.target.value)}
                    />
                    {errors[`availability_end_${index}`] && (
                      <span className="error">{errors[`availability_end_${index}`]}</span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeAvailability(index)}
                    className="btn-remove"
                    title="Remove availability"
                  >
                    ×
                  </button>
                </div>
                {errors[`availability_time_${index}`] && (
                  <span className="error">{errors[`availability_time_${index}`]}</span>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addAvailability}
            className="btn-secondary"
          >
            + Add Availability
          </button>
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
