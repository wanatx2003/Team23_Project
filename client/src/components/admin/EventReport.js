import React, { useEffect, useState } from 'react';
import '../../styles/admin/EventReport.css';
import DataReportChart from '../DataReportChart';

const EventReport = ({ navigateBack }) => {
  const [reportData, setReportData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'chart'
  const [chartType, setChartType] = useState('bar'); // 'bar' or 'pie'
  const [chartMetric, setChartMetric] = useState('attendance'); // which data to visualize

  // Input fields (user input before "Generate Report")
  const [startDateInput, setStartDateInput] = useState('');
  const [endDateInput, setEndDateInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('all');
  const [roomIdInput, setRoomIdInput] = useState('all');
  const [eventNameInput, setEventNameInput] = useState('');
  const [sortByInput, setSortByInput] = useState('none');
  const [sortOrderInput, setSortOrderInput] = useState('asc');

  // Applied filters (used for actual filtering)
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [roomIdFilter, setRoomIdFilter] = useState('all');
  const [eventNameFilter, setEventNameFilter] = useState('');
  const [sortBy, setSortBy] = useState('none');
  const [sortOrder, setSortOrder] = useState('asc');

  const [roomsList, setRoomsList] = useState([]);
  const [expandedEventId, setExpandedEventId] = useState(null);
  const [attendeeData, setAttendeeData] = useState({});
  const [loadingAttendees, setLoadingAttendees] = useState(false);

  // Fetch rooms for filter dropdown
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch('/api/rooms');
        const data = await response.json();
        if (data.success) {
          setRoomsList(data.rooms || []);
        } else {
          console.error('Failed to fetch rooms:', data.error);
        }
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    };

    fetchRooms();
  }, []);

  // Data aggregation for charts
  const prepareChartData = () => {
    if (!filteredData || filteredData.length === 0) return [];

    switch (chartMetric) {
      case 'attendance':
        return filteredData.map(event => ({
          label: event.EventName,
          value: event.RegisteredAttendees
        }));
      case 'checkInRate':
        return filteredData.map(event => ({
          label: event.EventName,
          value: event.CheckInRate
        }));
      case 'categories':
        const categoryData = {};
        filteredData.forEach(event => {
          const category = event.EventCategory || 'Uncategorized';
          if (!categoryData[category]) {
            categoryData[category] = 0;
          }
          categoryData[category] += event.RegisteredAttendees;
        });
        return Object.keys(categoryData).map(category => ({
          label: category,
          value: categoryData[category]
        }));
      case 'roomUtilization':
        const roomData = {};
        filteredData.forEach(event => {
          const room = event.RoomName || event.RoomNumber || 'Unknown';
          if (!roomData[room]) {
            roomData[room] = 0;
          }
          roomData[room] += 1;
        });
        return Object.keys(roomData).map(room => ({
          label: room,
          value: roomData[room]
        }));
      default:
        return [];
    }
  };

  // Calculate summary statistics
  const calculateStats = () => {
    if (!filteredData || filteredData.length === 0) {
      return { totalEvents: 0, totalAttendees: 0, avgAttendance: 0, avgCheckIn: 0 };
    }
    
    const totalEvents = filteredData.length;
    const totalAttendees = filteredData.reduce((sum, event) => sum + (event.RegisteredAttendees || 0), 0);
    const avgAttendance = totalEvents > 0 ? (totalAttendees / totalEvents).toFixed(1) : 0;
    
    const totalCheckIns = filteredData.reduce((sum, event) => sum + (event.CheckedInAttendees || 0), 0);
    const avgCheckIn = totalAttendees > 0 ? ((totalCheckIns / totalAttendees) * 100).toFixed(1) : 0;

    return { totalEvents, totalAttendees, avgAttendance, avgCheckIn };
  };

  // Apply filters and fetch report data
  const applyFilters = async () => {
    setStartDateFilter(startDateInput);
    setEndDateFilter(endDateInput);
    setCategoryFilter(categoryInput);
    setRoomIdFilter(roomIdInput);
    setEventNameFilter(eventNameInput);
    setSortBy(sortByInput);
    setSortOrder(sortOrderInput);
    setIsLoading(true);
    
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      if (startDateInput) queryParams.append('startDate', startDateInput);
      if (endDateInput) queryParams.append('endDate', endDateInput);
      if (categoryInput !== 'all') queryParams.append('category', categoryInput);
      if (roomIdInput !== 'all') queryParams.append('roomId', roomIdInput);
      if (eventNameInput) queryParams.append('eventName', eventNameInput);
      if (sortByInput !== 'none') {
        queryParams.append('sortBy', sortByInput);
        queryParams.append('sortOrder', sortOrderInput);
      }
      
      const queryString = queryParams.toString();
      console.log(`Sending request to /api/eventReport?${queryString}`);
      
      const response = await fetch(`/api/eventReport?${queryString}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("API response:", data);
      
      if (data.success) {
        console.log(`Retrieved ${data.data.length} event records`);
        const serverData = data.data;
        
        // Apply client-side filtering for event name if needed
        let filteredResult = [...serverData];
        
        // Add client-side event name filtering if the field has a value
        if (eventNameInput) {
          const searchTerm = eventNameInput.toLowerCase();
          filteredResult = filteredResult.filter(event => 
            (event.EventName && event.EventName.toLowerCase().includes(searchTerm)) || 
            (event.EventDescription && event.EventDescription.toLowerCase().includes(searchTerm))
          );
          console.log(`Client-side filtered to ${filteredResult.length} events matching "${eventNameInput}"`);
        }
        
        setReportData(serverData);
        setFilteredData(filteredResult);
      } else {
        console.error('Failed to fetch event report:', data.error);
      }
    } catch (error) {
      console.error('Error fetching event report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    applyFilters();
  }, []);

  // Apply client-side sorting if needed
  useEffect(() => {
    if (filteredData.length > 0 && sortBy !== 'none') {
      const sorted = [...filteredData].sort((a, b) => {
        let aValue, bValue;
        
        switch(sortBy) {
          case 'RegisteredAttendees':
            aValue = a.RegisteredAttendees || 0;
            bValue = b.RegisteredAttendees || 0;
            break;
          case 'CheckedInAttendees':
            aValue = a.CheckedInAttendees || 0;
            bValue = b.CheckedInAttendees || 0;
            break;
          case 'CheckInRate':
            aValue = a.CheckInRate || 0;
            bValue = b.CheckInRate || 0;
            break;
          case 'EventName':
            aValue = a.EventName || '';
            bValue = b.EventName || '';
            return sortOrder === 'asc' 
              ? aValue.localeCompare(bValue) 
              : bValue.localeCompare(aValue);
          case 'StartDate':
            aValue = new Date(a.StartAt || 0).getTime();
            bValue = new Date(b.StartAt || 0).getTime();
            break;
          default:
            return 0;
        }
        
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      });
      
      setFilteredData(sorted);
    }
  }, [sortBy, sortOrder, reportData]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Format time for display
  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  // Format check-in time
  const formatCheckInTime = (dateString) => {
    if (!dateString) return 'Not checked in';
    
    const date = new Date(dateString);
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return date.toLocaleDateString(undefined, options);
  };

  // Get attendees for a specific event
  const fetchEventAttendees = async (eventId) => {
    if (attendeeData[eventId]) {
      // If we already have the data, just toggle the expanded state
      setExpandedEventId(expandedEventId === eventId ? null : eventId);
      return;
    }
    
    try {
      setLoadingAttendees(true);
      const response = await fetch(`/api/events/${eventId}/attendees`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setAttendeeData(prev => ({
          ...prev,
          [eventId]: data.attendees || []
        }));
        setExpandedEventId(eventId);
      } else {
        console.error('Failed to fetch attendees:', data.error);
      }
    } catch (error) {
      console.error('Error fetching attendees:', error);
    } finally {
      setLoadingAttendees(false);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setStartDateInput('');
    setEndDateInput('');
    setCategoryInput('all');
    setRoomIdInput('all');
    setEventNameInput('');
    setSortByInput('none');
    setSortOrderInput('asc');
    
    // Also apply the cleared filters
    setStartDateFilter('');
    setEndDateFilter('');
    setCategoryFilter('all');
    setRoomIdFilter('all');
    setEventNameFilter('');
    setSortBy('none');
    setSortOrder('asc');
    
    // Refresh the data
    applyFilters();
  };

  const chartData = prepareChartData();
  const stats = calculateStats();

  return (
    <div className="event-report">
      <h2>Event Report</h2>

      {/* View toggle */}
      <div className="view-toggle">
        <button 
          className={viewMode === 'table' ? 'active' : ''} 
          onClick={() => setViewMode('table')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 10h18M3 14h18M3 18h18M3 6h18"></path>
          </svg>
          Table View
        </button>
        <button 
          className={viewMode === 'chart' ? 'active' : ''} 
          onClick={() => setViewMode('chart')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 20V10"></path>
            <path d="M18 20V4"></path>
            <path d="M6 20v-4"></path>
          </svg>
          Chart View
        </button>
      </div>
      
      {/* Back to Reports Button */}
      <div className="back-to-reports">
        <button onClick={navigateBack} className="apply-button">
          Back to Reports
        </button>
      </div>

      {/* Summary Statistics */}
      <div className="summary-stats">
        <div className="stat-box">
          <div className="stat-value">{stats.totalEvents}</div>
          <div className="stat-label">Total Events</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{stats.totalAttendees}</div>
          <div className="stat-label">Total Registrations</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{stats.avgAttendance}</div>
          <div className="stat-label">Avg. Attendees per Event</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{stats.avgCheckIn}%</div>
          <div className="stat-label">Avg. Check-in Rate</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-panel">
        <div className="filters-header">
          <h3>Filter Options</h3>
          <button onClick={clearFilters} className="clear-button">
            Clear All
          </button>
        </div>
        
        <div className="filters-grid">
          <div className="filter-group">
            <label>Event Name</label>
            <input
              type="text"
              value={eventNameInput}
              onChange={e => setEventNameInput(e.target.value)}
              placeholder="Search by name"
            />
          </div>

          <div className="filter-group">
            <label>Category</label>
            <select value={categoryInput} onChange={e => setCategoryInput(e.target.value)}>
              <option value="all">All Categories</option>
              <option value="Workshops">Workshops</option>
              <option value="Seminar">Seminar</option>
              <option value="Conference">Conference</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Room</label>
            <select value={roomIdInput} onChange={e => setRoomIdInput(e.target.value)}>
              <option value="all">All Rooms</option>
              {roomsList.map(room => (
                <option key={room.RoomID} value={room.RoomID}>
                  {room.RoomName || room.RoomNumber}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Sort By</label>
            <select value={sortByInput} onChange={e => setSortByInput(e.target.value)}>
              <option value="none">None</option>
              <option value="RegisteredAttendees">Total Registrations</option>
              <option value="CheckedInAttendees">Check-ins</option>
              <option value="CheckInRate">Check-in Rate</option>
              <option value="EventName">Event Name</option>
              <option value="StartDate">Start Date</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Order</label>
            <select
              value={sortOrderInput}
              onChange={e => setSortOrderInput(e.target.value)}
              disabled={sortByInput === 'none'}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>

          <div className="filter-group date-range-group">
            <label>Date Range</label>
            <div className="date-inputs">
              <input
                type="date"
                value={startDateInput}
                onChange={e => setStartDateInput(e.target.value)}
                placeholder="From"
              />
              <span>to</span>
              <input
                type="date"
                value={endDateInput}
                onChange={e => setEndDateInput(e.target.value)}
                placeholder="To"
              />
            </div>
          </div>
        </div>

        <div className="filters-actions">
          <button onClick={applyFilters} className="apply-button">
            Generate Report
          </button>
        </div>
      </div>

      {/* Chart View */}
      {viewMode === 'chart' && (
        <div className="chart-container">
          <div className="chart-controls">
            <h3>
              {chartMetric === 'attendance' ? 'Event Attendance' : 
               chartMetric === 'checkInRate' ? 'Check-in Rates' :
               chartMetric === 'categories' ? 'Attendance by Category' :
               'Events by Room'}
            </h3>
            <div className="chart-type-selector">
              <label>
                <input
                  type="radio"
                  name="chartType"
                  checked={chartType === 'bar'}
                  onChange={() => setChartType('bar')}
                />
                Bar Chart
              </label>
              <label>
                <input
                  type="radio"
                  name="chartType"
                  checked={chartType === 'pie'}
                  onChange={() => setChartType('pie')}
                />
                Pie Chart
              </label>
            </div>
            <div className="chart-type-selector">
              <label>
                <input
                  type="radio"
                  name="chartMetric"
                  checked={chartMetric === 'attendance'}
                  onChange={() => setChartMetric('attendance')}
                />
                Attendance
              </label>
              <label>
                <input
                  type="radio"
                  name="chartMetric"
                  checked={chartMetric === 'checkInRate'}
                  onChange={() => setChartMetric('checkInRate')}
                />
                Check-in Rate
              </label>
              <label>
                <input
                  type="radio"
                  name="chartMetric"
                  checked={chartMetric === 'categories'}
                  onChange={() => setChartMetric('categories')}
                />
                Categories
              </label>
              <label>
                <input
                  type="radio"
                  name="chartMetric"
                  checked={chartMetric === 'roomUtilization'}
                  onChange={() => setChartMetric('roomUtilization')}
                />
                Rooms
              </label>
            </div>
          </div>
          
          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading chart data...</p>
            </div>
          ) : chartData.length === 0 ? (
            <div className="no-data-message">
              <p>No data available for chart visualization.</p>
            </div>
          ) : (
            <div className="chart-wrapper">
              <DataReportChart reportData={chartData} chartType={chartType} />
            </div>
          )}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="table-wrapper">
          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading event data...</p>
            </div>
          ) : (
            <>
              <p className="results-count">{filteredData.length} events found</p>
              <div className="table-container">
                <table className="events-table">
                  <thead>
                    <tr>
                      <th></th>
                      <th>EventID</th>
                      <th>Event Name</th>
                      <th>Category</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Location</th>
                      <th>Organizer</th>
                      <th className="numeric-column">Registered</th>
                      <th className="numeric-column">Checked In</th>
                      <th className="numeric-column">Capacity</th>
                      <th className="numeric-column">Attendance %</th>
                      <th className="numeric-column">Check-in %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length === 0 ? (
                      <tr>
                        <td colSpan="13" className="no-results">No events match your search criteria.</td>
                      </tr>
                    ) : (
                      filteredData.map((event, index) => (
                        <React.Fragment key={event.EventID}>
                          <tr className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                            <td>
                              <button 
                                className="toggle-button"
                                onClick={() => fetchEventAttendees(event.EventID)}
                                aria-label={expandedEventId === event.EventID ? 'Collapse' : 'Expand'}
                              >
                                {expandedEventId === event.EventID ? '−' : '+'}
                              </button>
                            </td>
                            <td>{event.EventID}</td>
                            <td className="primary-cell">{event.EventName}</td>
                            <td>
                              <span className="category-badge">
                                {event.EventCategory || 'General'}
                              </span>
                            </td>
                            <td>{formatDate(event.StartAt)}</td>
                            <td>{formatTime(event.StartAt)} - {formatTime(event.EndAt)}</td>
                            <td>{event.RoomName || event.RoomNumber || 'N/A'}</td>
                            <td>{`${event.OrganizerFirstName || ''} ${event.OrganizerLastName || ''}`.trim() || 'N/A'}</td>
                            <td className="numeric-column">{event.RegisteredAttendees}</td>
                            <td className="numeric-column">{event.CheckedInAttendees}</td>
                            <td className="numeric-column">{event.MaxAttendees}</td>
                            <td className="numeric-column">{event.AttendanceRate}%</td>
                            <td className="numeric-column">
                              <div className="check-in-rate">
                                <span className={
                                  `check-in-rate-value ${
                                    event.CheckInRate >= 70 ? 'high-rate' : 
                                    event.CheckInRate >= 40 ? 'medium-rate' : 
                                    'low-rate'
                                  }`
                                }>
                                  {event.CheckInRate}%
                                </span>
                              </div>
                            </td>
                          </tr>
                          {expandedEventId === event.EventID && (
                            <tr>
                              <td colSpan="13" className="attendee-details">
                                <h4>Attendee Details</h4>
                                
                                {loadingAttendees ? (
                                  <div className="loading-container" style={{padding: "20px 0"}}>
                                    <div className="loading-spinner"></div>
                                    <p>Loading attendees...</p>
                                  </div>
                                ) : attendeeData[event.EventID]?.length > 0 ? (
                                  <table className="attendees-table">
                                    <thead>
                                      <tr>
                                        <th>User ID</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Status</th>
                                        <th>Check-in Time</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {attendeeData[event.EventID].map((attendee, idx) => (
                                        <tr key={attendee.EventAttendeeID}>
                                          <td>{attendee.UserID}</td>
                                          <td>{attendee.FirstName} {attendee.LastName}</td>
                                          <td>{attendee.Email}</td>
                                          <td>
                                            <span className={attendee.CheckedIn === 1 ? 'checked-in-tag' : 'registered-tag'}>
                                              {attendee.CheckedIn === 1 ? 'Checked In' : 'Registered'}
                                            </span>
                                          </td>
                                          <td>{formatCheckInTime(attendee.CheckedInAt)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                ) : (
                                  <p className="no-data-message">No attendees found for this event.</p>
                                )}
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default EventReport;