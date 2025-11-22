import React, { useState, useEffect } from 'react';
import '../../styles/volunteers/MyAssignments.css';

const MyAssignments = ({ userData, navigateToHome }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [attendanceData, setAttendanceData] = useState({
    hoursWorked: '',
    feedback: ''
  });

  useEffect(() => {
    fetchMyAssignments();
  }, [userData]);

  const fetchMyAssignments = async () => {
    try {
      const response = await fetch(`/api/volunteer/my-assignments/${userData.UserID}`);
      const data = await response.json();
      
      if (data.success) {
        setAssignments(data.assignments || []);
      } else {
        setError('Failed to load assignments');
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMatchAction = async (matchId, action) => {
    const confirmMessage = action === 'confirmed' 
      ? 'Are you sure you want to confirm this volunteer assignment?'
      : 'Are you sure you want to decline this assignment?';
    
    if (!window.confirm(confirmMessage)) return;

    try {
      const response = await fetch(`/api/volunteer/match/${matchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ MatchStatus: action })
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage(`Assignment ${action} successfully!`);
        fetchMyAssignments();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(data.error || `Failed to ${action} assignment`);
      }
    } catch (error) {
      console.error('Error updating match:', error);
      setError('Network error. Please try again.');
    }
  };

  const openAttendanceModal = (assignment) => {
    setSelectedEvent(assignment);
    setShowAttendanceModal(true);
    
    // Calculate default hours based on event time if available
    if (assignment.StartTime && assignment.EndTime) {
      // Calculate hours between start and end time
      const start = new Date(`2000-01-01T${assignment.StartTime}`);
      const end = new Date(`2000-01-01T${assignment.EndTime}`);
      const hours = (end - start) / (1000 * 60 * 60);
      setAttendanceData({ hoursWorked: hours.toString(), feedback: '' });
    } else {
      // Default to 3 hours if no specific time frame
      setAttendanceData({ hoursWorked: '3', feedback: '' });
    }
  };

  const submitAttendance = async () => {
    if (!attendanceData.hoursWorked || parseFloat(attendanceData.hoursWorked) <= 0) {
      alert('Please enter valid hours worked (must be greater than 0)');
      return;
    }

    try {
      // Format the date properly for SQL DATE field (YYYY-MM-DD)
      const participationDate = new Date(selectedEvent.EventDate).toISOString().split('T')[0];
      
      const response = await fetch('/api/volunteer/submit-attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          MatchID: selectedEvent.MatchID,
          VolunteerID: userData.UserID,
          EventID: selectedEvent.EventID,
          HoursVolunteered: parseFloat(attendanceData.hoursWorked),
          ParticipationDate: participationDate,
          Feedback: attendanceData.feedback
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage('Attendance submitted successfully! Thank you for volunteering!');
        setShowAttendanceModal(false);
        setSelectedEvent(null);
        setAttendanceData({ hoursWorked: '', feedback: '' });
        fetchMyAssignments();
        setTimeout(() => setMessage(''), 5000);
      } else {
        setError(data.error || 'Failed to submit attendance');
      }
    } catch (error) {
      console.error('Error submitting attendance:', error);
      setError('Network error. Please try again.');
    }
  };

  const getFilteredAssignments = () => {
    const now = new Date();
    
    switch (filter) {
      case 'pending':
        return assignments.filter(a => a.MatchStatus === 'pending');
      case 'confirmed':
        return assignments.filter(a => a.MatchStatus === 'confirmed' && new Date(a.EventDate) >= now);
      case 'past':
        return assignments.filter(a => new Date(a.EventDate) < now && a.MatchStatus !== 'completed');
      case 'completed':
        return assignments.filter(a => a.MatchStatus === 'completed');
      default:
        return assignments;
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'pending': 'status-pending',
      'confirmed': 'status-confirmed',
      'declined': 'status-declined',
      'completed': 'status-completed'
    };
    return statusMap[status] || 'status-default';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return null;
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatTimeRange = (startTime, endTime) => {
    if (!startTime && !endTime) return 'Time TBD';
    if (startTime && endTime) {
      return `${formatTime(startTime)} - ${formatTime(endTime)}`;
    }
    if (startTime) return `Starts at ${formatTime(startTime)}`;
    return `Ends at ${formatTime(endTime)}`;
  };

  const isPastEvent = (eventDate) => {
    return new Date(eventDate) < new Date();
  };

  const canSubmitAttendance = (assignment) => {
    return assignment.MatchStatus === 'confirmed' && isPastEvent(assignment.EventDate);
  };

  if (loading) {
    return <div className="assignments-loading">Loading your assignments...</div>;
  }

  const filteredAssignments = getFilteredAssignments();

  return (
    <div className="my-assignments-container">
      <div className="assignments-header">
        <h1>My Volunteer Assignments</h1>
        <p>Manage your volunteer commitments and track your participation</p>
      </div>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      {/* Filter Tabs */}
      <div className="assignments-filters">
        <button 
          className={filter === 'all' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('all')}
        >
          All ({assignments.length})
        </button>
        <button 
          className={filter === 'pending' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('pending')}
        >
          Pending ({assignments.filter(a => a.MatchStatus === 'pending').length})
        </button>
        <button 
          className={filter === 'confirmed' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('confirmed')}
        >
          Confirmed ({assignments.filter(a => a.MatchStatus === 'confirmed' && new Date(a.EventDate) >= new Date()).length})
        </button>
        <button 
          className={filter === 'past' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('past')}
        >
          Awaiting Attendance ({assignments.filter(a => new Date(a.EventDate) < new Date() && a.MatchStatus !== 'completed').length})
        </button>
        <button 
          className={filter === 'completed' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('completed')}
        >
          Completed ({assignments.filter(a => a.MatchStatus === 'completed').length})
        </button>
      </div>

      {/* Assignments List */}
      <div className="assignments-list">
        {filteredAssignments.length > 0 ? (
          filteredAssignments.map(assignment => (
            <div key={assignment.MatchID} className="assignment-card">
              <div className="assignment-card-header">
                <div>
                  <h3>{assignment.EventName}</h3>
                  <span className={`status-badge ${getStatusBadgeClass(assignment.MatchStatus)}`}>
                    {assignment.MatchStatus.toUpperCase()}
                  </span>
                </div>
                <span className={`urgency-indicator urgency-${assignment.Urgency}`}>
                  {assignment.Urgency}
                </span>
              </div>

              <div className="assignment-details">
                <div className="detail-row">
                  <span className="detail-icon">📅</span>
                  <div>
                    <strong>Date:</strong>
                    <p>{formatDate(assignment.EventDate)}</p>
                  </div>
                </div>

                <div className="detail-row">
                  <span className="detail-icon">🕒</span>
                  <div>
                    <strong>Time:</strong>
                    <p>{formatTimeRange(assignment.StartTime, assignment.EndTime)}</p>
                  </div>
                </div>

                <div className="detail-row">
                  <span className="detail-icon">📍</span>
                  <div>
                    <strong>Location:</strong>
                    <p>{assignment.Location}</p>
                  </div>
                </div>

                {assignment.Description && (
                  <div className="detail-row description">
                    <span className="detail-icon">📝</span>
                    <div>
                      <strong>Description:</strong>
                      <p>{assignment.Description}</p>
                    </div>
                  </div>
                )}

                {assignment.RequiredSkills && assignment.RequiredSkills.length > 0 && (
                  <div className="detail-row">
                    <span className="detail-icon">🎯</span>
                    <div>
                      <strong>Required Skills:</strong>
                      <div className="skills-tags">
                        {assignment.RequiredSkills.map(skill => (
                          <span key={skill} className="skill-tag">{skill}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {assignment.RequestedAt && (
                  <div className="detail-row">
                    <span className="detail-icon">⏰</span>
                    <div>
                      <strong>Assigned On:</strong>
                      <p>{new Date(assignment.RequestedAt).toLocaleString()}</p>
                    </div>
                  </div>
                )}

                {assignment.HoursVolunteered && (
                  <div className="detail-row highlight">
                    <span className="detail-icon">✅</span>
                    <div>
                      <strong>Hours Contributed:</strong>
                      <p className="hours-badge">{assignment.HoursVolunteered} hours</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="assignment-actions">
                {assignment.MatchStatus === 'pending' && (
                  <>
                    <button 
                      className="btn-confirm"
                      onClick={() => handleMatchAction(assignment.MatchID, 'confirmed')}
                    >
                      ✓ Confirm Assignment
                    </button>
                    <button 
                      className="btn-decline"
                      onClick={() => handleMatchAction(assignment.MatchID, 'declined')}
                    >
                      ✗ Decline Assignment
                    </button>
                  </>
                )}

                {canSubmitAttendance(assignment) && (
                  <button 
                    className="btn-attendance"
                    onClick={() => openAttendanceModal(assignment)}
                  >
                    📝 Submit Attendance
                  </button>
                )}

                {assignment.MatchStatus === 'completed' && (
                  <div className="completed-indicator">
                    <span className="checkmark">✓</span> Attendance Recorded
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="no-assignments">
            <div className="no-assignments-icon">📋</div>
            <h3>No assignments found</h3>
            <p>
              {filter === 'all' 
                ? "You don't have any volunteer assignments yet. Browse available events to get started!"
                : `No ${filter} assignments at the moment.`
              }
            </p>
          </div>
        )}
      </div>

      {/* Attendance Modal */}
      {showAttendanceModal && selectedEvent && (
        <div className="modal-overlay" onClick={() => setShowAttendanceModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Submit Attendance</h2>
              <button className="modal-close" onClick={() => setShowAttendanceModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="event-summary">
                <h3>{selectedEvent.EventName}</h3>
                <p><strong>Date:</strong> {formatDate(selectedEvent.EventDate)}</p>
                <p><strong>Location:</strong> {selectedEvent.Location}</p>
              </div>

              <div className="form-group">
                <label htmlFor="hoursWorked">
                  Hours Volunteered <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="hoursWorked"
                  min="0.5"
                  step="0.5"
                  max="24"
                  value={attendanceData.hoursWorked}
                  onChange={(e) => setAttendanceData({ ...attendanceData, hoursWorked: e.target.value })}
                  placeholder="e.g., 3.5"
                  required
                />
                <small>Enter the total hours you volunteered (in increments of 0.5)</small>
              </div>

              <div className="form-group">
                <label htmlFor="feedback">
                  Feedback (Optional)
                </label>
                <textarea
                  id="feedback"
                  rows="4"
                  value={attendanceData.feedback}
                  onChange={(e) => setAttendanceData({ ...attendanceData, feedback: e.target.value })}
                  placeholder="Share your experience, any challenges, or suggestions..."
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowAttendanceModal(false)}>
                Cancel
              </button>
              <button className="btn-submit" onClick={submitAttendance}>
                Submit Attendance
              </button>
            </div>
          </div>
        </div>
      )}

      <button onClick={navigateToHome} className="btn-back">
        ← Back to Dashboard
      </button>
    </div>
  );
};

export default MyAssignments;
