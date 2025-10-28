import React, { useState, useEffect } from 'react';
import '../../styles/history/VolunteerHistory.css';

const VolunteerHistory = ({ userData, navigateToHome }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const endpoint = userData.Role === 'admin' 
        ? '/api/volunteer-history/all' 
        : `/api/volunteer-history/${userData.UserID}`;
      
      const response = await fetch(endpoint);
      const data = await response.json();
      if (data.success) {
        setHistory(data.history);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredHistory = () => {
    if (filter === 'all') return history;
    return history.filter(record => record.ParticipationStatus === filter);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'attended': return 'green';
      case 'registered': return 'blue';
      case 'no_show': return 'red';
      case 'cancelled': return 'gray';
      default: return 'black';
    }
  };

  if (loading) return <div className="loading">Loading volunteer history...</div>;

  return (
    <div className="volunteer-history-container">
      <div className="history-header">
        <h1>Volunteer History</h1>
        <p>
          {userData.Role === 'admin' 
            ? 'Complete volunteer participation history for all users'
            : 'Your volunteer participation history'
          }
        </p>
      </div>

      <div className="filter-controls">
        <label>Filter by status:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Records</option>
          <option value="registered">Registered</option>
          <option value="attended">Attended</option>
          <option value="no_show">No Show</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {getFilteredHistory().length === 0 ? (
        <div className="no-history">
          <p>No volunteer history found.</p>
        </div>
      ) : (
        <div className="history-table-container">
          <table className="history-table">
            <thead>
              <tr>
                {userData.Role === 'admin' && <th>Volunteer</th>}
                <th>Event Name</th>
                <th>Event Date</th>
                <th>Location</th>
                <th>Required Skills</th>
                <th>Urgency</th>
                <th>Participation Status</th>
                <th>Hours Volunteered</th>
                <th>Participation Date</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredHistory().map(record => (
                <tr key={record.HistoryID}>
                  {userData.Role === 'admin' && (
                    <td>{record.FullName || `${record.FirstName} ${record.LastName}`}</td>
                  )}
                  <td>{record.EventName}</td>
                  <td>{new Date(record.EventDate).toLocaleDateString()}</td>
                  <td>{record.Location}</td>
                  <td>{record.RequiredSkills?.join(', ') || 'None'}</td>
                  <td>
                    <span className={`urgency-badge ${record.Urgency}`}>
                      {record.Urgency}
                    </span>
                  </td>
                  <td>
                    <span 
                      className="status-badge"
                      style={{ color: getStatusColor(record.ParticipationStatus) }}
                    >
                      {record.ParticipationStatus}
                    </span>
                  </td>
                  <td>{record.HoursVolunteered || 'N/A'}</td>
                  <td>{new Date(record.ParticipationDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="history-summary">
        <h3>Summary</h3>
        <div className="summary-stats">
          <div className="stat">
            <span className="stat-number">{history.length}</span>
            <span className="stat-label">Total Events</span>
          </div>
          <div className="stat">
            <span className="stat-number">
              {history.filter(r => r.ParticipationStatus === 'attended').length}
            </span>
            <span className="stat-label">Attended</span>
          </div>
          <div className="stat">
            <span className="stat-number">
              {history.reduce((total, record) => 
                total + (parseFloat(record.HoursVolunteered) || 0), 0
              ).toFixed(1)}
            </span>
            <span className="stat-label">Total Hours</span>
          </div>
        </div>
      </div>

      <button onClick={navigateToHome} className="btn-back">
        Back to Home
      </button>
    </div>
  );
};

export default VolunteerHistory;
