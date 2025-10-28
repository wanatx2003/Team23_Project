import React, { useState, useEffect } from 'react';
import '../../styles/admin/VolunteerReport.css';

const VolunteerReport = ({ navigateBack }) => {
  const [reportData, setReportData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter inputs
  const [startDateInput, setStartDateInput] = useState('');
  const [endDateInput, setEndDateInput] = useState('');
  const [statusInput, setStatusInput] = useState('All');
  const [skillInput, setSkillInput] = useState('All');

  // Applied filters
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [skillFilter, setSkillFilter] = useState('All');

  const [viewMode, setViewMode] = useState('table');
  
  const statusList = ['All', 'registered', 'confirmed', 'attended', 'no_show', 'cancelled'];
  const skillsList = ['All', 'Communication', 'Teamwork', 'Physical Work', 'Organization', 'Teaching', 'Technology'];

  // Fetch volunteer participation report data
  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDateFilter) params.append('startDate', startDateFilter);
      if (endDateFilter) params.append('endDate', endDateFilter);
      if (statusFilter !== 'All') params.append('status', statusFilter);
      if (skillFilter !== 'All') params.append('skill', skillFilter);

      const response = await fetch(`/api/volunteer-report?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setReportData(data.data || []);
      } else {
        console.error('Failed to fetch volunteer report:', data.error);
      }
    } catch (error) {
      console.error('Error fetching volunteer report:', error);
      setReportData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters
  const applyFilters = () => {
    setStartDateFilter(startDateInput);
    setEndDateFilter(endDateInput);
    setStatusFilter(statusInput);
    setSkillFilter(skillInput);
  };

  // Clear filters
  const clearFilters = () => {
    setStartDateInput('');
    setEndDateInput('');
    setStatusInput('All');
    setSkillInput('All');
    setStartDateFilter('');
    setEndDateFilter('');
    setStatusFilter('All');
    setSkillFilter('All');
  };

  useEffect(() => {
    fetchReportData();
  }, [startDateFilter, endDateFilter, statusFilter, skillFilter]);

  useEffect(() => {
    setFilteredData(reportData);
  }, [reportData]);

  const prepareChartData = () => {
    if (!filteredData.length) return [];
    
    const statusCounts = statusList.slice(1).map(status => ({
      label: status.replace('_', ' ').toUpperCase(),
      value: filteredData.filter(item => item.ParticipationStatus === status).length
    }));
    
    return statusCounts.filter(item => item.value > 0);
  };

  return (
    <div className="reports-container">
      <h3>Volunteer Participation Report</h3>

      <div className="view-toggle">
        <button 
          className={viewMode === 'table' ? 'active' : ''} 
          onClick={() => setViewMode('table')}
        >
          📊 Table View
        </button>
        <button 
          className={viewMode === 'chart' ? 'active' : ''} 
          onClick={() => setViewMode('chart')}
        >
          📈 Chart View
        </button>
      </div>

      <div className="back-to-reports">
        <button onClick={navigateBack} className="apply-button">
          Back to Admin Dashboard
        </button>
      </div>

      {/* Filters Panel */}
      <div className="filters-panel">
        <div className="filters-header">
          <h3>Filter Options</h3>
          <button onClick={clearFilters} className="clear-button">Clear All</button>
        </div>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Participation Status</label>
            <select 
              value={statusInput}
              onChange={e => setStatusInput(e.target.value)}
            >
              {statusList.map(status => (
                <option key={status} value={status}>
                  {status === 'All' ? 'All' : status.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Required Skill</label>
            <select 
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
            >
              {skillsList.map(skill => (
                <option key={skill} value={skill}>{skill}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Start Date</label>
            <input 
              type="date"
              value={startDateInput}
              onChange={e => setStartDateInput(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label>End Date</label>
            <input 
              type="date"
              value={endDateInput}
              onChange={e => setEndDateInput(e.target.value)}
            />
          </div>
        </div>
        <div className="filters-actions">
          <button onClick={applyFilters} className="apply-button">Generate Report</button>
        </div>
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="table-wrapper">
          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading volunteer report...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="no-data-message">
              <p>No volunteer participation data available.</p>
            </div>
          ) : (
            <table className="items-table">
              <thead>
                <tr>
                  <th>Volunteer Name</th>
                  <th>Event Name</th>
                  <th>Event Date</th>
                  <th>Participation Status</th>
                  <th>Hours Volunteered</th>
                  <th>Skills Used</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                    <td>{row.VolunteerName}</td>
                    <td>{row.EventName}</td>
                    <td>{new Date(row.EventDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${row.ParticipationStatus}`}>
                        {row.ParticipationStatus?.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td>{row.HoursVolunteered || 'N/A'}</td>
                    <td>{row.RequiredSkills || 'N/A'}</td>
                    <td>{row.Location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Chart View */}
      {viewMode === 'chart' && (
        <div className="chart-container">
          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading chart data...</p>
            </div>
          ) : (
            <div className="chart-wrapper">
              <h3>Volunteer Participation Summary</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <h4>{filteredData.length}</h4>
                  <p>Total Participations</p>
                </div>
                <div className="stat-card">
                  <h4>{filteredData.filter(item => item.ParticipationStatus === 'attended').length}</h4>
                  <p>Attended Events</p>
                </div>
                <div className="stat-card">
                  <h4>{filteredData.reduce((sum, item) => sum + (parseFloat(item.HoursVolunteered) || 0), 0).toFixed(1)}</h4>
                  <p>Total Hours</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VolunteerReport;
