import React, { useEffect, useState } from 'react';
import '../../styles/admin/UserReport.css';
import DataReportChart from '../DataReportChart';

const UserReport = ({ navigateBack }) => {
  const [reportData, setReportData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'chart'
  const [chartType, setChartType] = useState('bar'); // 'bar' or 'pie'

  // Live inputs
  const [roleInput, setRoleInput] = useState('');
  const [itemTypeInput, setItemTypeInput] = useState('');
  const [statusInput, setStatusInput] = useState('');
  const [firstNameInput, setFirstNameInput] = useState('');
  const [lastNameInput, setLastNameInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [authorInput, setAuthorInput] = useState('');
  const [dateFieldInput, setDateFieldInput] = useState('BorrowedAt');
  const [dateFromInput, setDateFromInput] = useState('');
  const [dateToInput, setDateToInput] = useState('');

  // Applied filters
  const [roleFilter, setRoleFilter] = useState('');
  const [itemTypeFilter, setItemTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [firstNameFilter, setFirstNameFilter] = useState('');
  const [lastNameFilter, setLastNameFilter] = useState('');
  const [titleFilter, setTitleFilter] = useState('');
  const [authorFilter, setAuthorFilter] = useState('');
  const [dateFieldFilter, setDateFieldFilter] = useState('');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');

  useEffect(() => {
    const fetchUserReport = async () => {
      try {
        const response = await fetch('/api/userReport');
        const data = await response.json();
        if (data.success) {
          setReportData(data.data);
          setFilteredData(data.data);
        } else {
          console.error('Failed to fetch user report:', data.error);
        }
      } catch (error) {
        console.error('Error fetching user report:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserReport();
  }, []);

  useEffect(() => {
    let filtered = reportData;

    if (roleFilter) {
      filtered = filtered.filter(item => item.Role === roleFilter);
    }
    if (itemTypeFilter) {
      filtered = filtered.filter(item => item.ItemType === itemTypeFilter);
    }
    if (statusFilter) {
      filtered = filtered.filter(item => item.Status === statusFilter);
    }
    if (firstNameFilter) {
      filtered = filtered.filter(item =>
        item.FirstName?.toLowerCase().includes(firstNameFilter.toLowerCase())
      );
    }
    if (lastNameFilter) {
      filtered = filtered.filter(item =>
        item.LastName?.toLowerCase().includes(lastNameFilter.toLowerCase())
      );
    }
    if (titleFilter) {
      filtered = filtered.filter(item =>
        item.Title?.toLowerCase().includes(titleFilter.toLowerCase())
      );
    }
    if (authorFilter) {
      filtered = filtered.filter(item =>
        item.Author?.toLowerCase().includes(authorFilter.toLowerCase())
      );
    }

    if (dateFieldFilter) {
      filtered = filtered.filter(item => {
        const dateValue = item[dateFieldFilter];
        if (!dateValue) return false;

        const date = new Date(dateValue);
        const from = dateFromFilter ? new Date(dateFromFilter + "T00:00:00") : null; // Start of day
        const to = dateToFilter ? new Date(dateToFilter + "T23:59:59.999") : null;   // End of day

        // Ensure the date is within the from and to range (inclusive of both)
        if (from && date < from) return false;
        if (to && date > to) return false;

        return true;
      });
    }

    setFilteredData(filtered);
  }, [
    roleFilter,
    itemTypeFilter,
    statusFilter,
    firstNameFilter,
    lastNameFilter,
    titleFilter,
    authorFilter,
    dateFieldFilter,
    dateFromFilter,
    dateToFilter,
    reportData
  ]);

  const uniqueRoles = [...new Set(reportData.map(item => item.Role))];
  const uniqueItemTypes = [...new Set(reportData.map(item => item.ItemType))];
  const uniqueStatuses = [...new Set(reportData.map(item => item.Status))];

  // Calculate summary statistics
  const calculateStats = () => {
    if (!filteredData || filteredData.length === 0) {
      return { 
        totalLoans: 0, 
        activeLoans: 0, 
        uniqueUsers: 0, 
        overdueItems: 0 
      };
    }
    
    const totalLoans = filteredData.length;
    const activeLoans = filteredData.filter(item => !item.ReturnedAt).length;
    
    // Count unique user IDs in the filtered data
    const userSet = new Set();
    filteredData.forEach(item => userSet.add(item.UserID));
    const uniqueUsers = userSet.size;
    
    // Count items that are overdue (current date > due date and not returned)
    const currentDate = new Date();
    const overdueItems = filteredData.filter(item => {
      if (item.ReturnedAt) return false; // Already returned
      if (!item.DueAT) return false; // No due date
      
      return new Date(item.DueAT) < currentDate;
    }).length;
    
    return { totalLoans, activeLoans, uniqueUsers, overdueItems };
  };

  // Prepare chart data
  const prepareChartData = () => {
    if (!filteredData || filteredData.length === 0) return [];
    
    if (chartType === 'bar') {
      // Group loans by item type
      const itemTypeData = {};
      filteredData.forEach(item => {
        const type = item.ItemType || 'Unknown';
        if (!itemTypeData[type]) {
          itemTypeData[type] = 0;
        }
        itemTypeData[type]++;
      });
      
      return Object.keys(itemTypeData).map(type => ({
        label: type,
        value: itemTypeData[type]
      }));
    } else {
      // Prepare data for pie chart - group by status
      const statusData = {};
      filteredData.forEach(item => {
        const status = item.Status || 'Unknown';
        if (!statusData[status]) {
          statusData[status] = 0;
        }
        statusData[status]++;
      });
      
      return Object.keys(statusData).map(status => ({
        label: status,
        value: statusData[status]
      }));
    }
  };

  const applyFilters = () => {
    setRoleFilter(roleInput);
    setItemTypeFilter(itemTypeInput);
    setStatusFilter(statusInput);
    setFirstNameFilter(firstNameInput);
    setLastNameFilter(lastNameInput);
    setTitleFilter(titleInput);
    setAuthorFilter(authorInput);
    setDateFieldFilter(dateFieldInput);
    setDateFromFilter(dateFromInput);
    setDateToFilter(dateToInput);
  };
  
  // Clear all filters
  const clearFilters = () => {
    setRoleInput('');
    setItemTypeInput('');
    setStatusInput('');
    setFirstNameInput('');
    setLastNameInput('');
    setTitleInput('');
    setAuthorInput('');
    setDateFieldInput('BorrowedAt');
    setDateFromInput('');
    setDateToInput('');
    
    // Apply cleared filters
    setRoleFilter('');
    setItemTypeFilter('');
    setStatusFilter('');
    setFirstNameFilter('');
    setLastNameFilter('');
    setTitleFilter('');
    setAuthorFilter('');
    setDateFieldFilter('');
    setDateFromFilter('');
    setDateToFilter('');
  };
  
  const stats = calculateStats();
  const chartData = prepareChartData();

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };
  
  // Format status with icon
  const renderStatus = (status, returnedAt) => {
    if (status === 'Borrowed' && !returnedAt) {
      // Item is currently borrowed
      return (
        <span className="status-badge borrowed">
          <span className="status-icon">●</span>
          Borrowed
        </span>
      );
    } else if (status === 'Returned' || returnedAt) {
      // Item has been returned
      return (
        <span className="status-badge returned">
          <span className="status-icon">✓</span>
          Returned
        </span>
      );
    } else {
      // Other status
      return (
        <span className="status-badge other">
          {status}
        </span>
      );
    }
  };

  return (
    <div className="user-report">
      <h2>User Loan Report</h2>

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
          <div className="stat-value">{stats.totalLoans}</div>
          <div className="stat-label">Total Loans</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{stats.activeLoans}</div>
          <div className="stat-label">Active Loans</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{stats.uniqueUsers}</div>
          <div className="stat-label">Unique Users</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{stats.overdueItems}</div>
          <div className="stat-label">Overdue Items</div>
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
            <label>Role</label>
            <select value={roleInput} onChange={e => setRoleInput(e.target.value)}>
              <option value="">All Roles</option>
              {uniqueRoles.filter(Boolean).map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Item Type</label>
            <select value={itemTypeInput} onChange={e => setItemTypeInput(e.target.value)}>
              <option value="">All Types</option>
              {uniqueItemTypes.filter(Boolean).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select value={statusInput} onChange={e => setStatusInput(e.target.value)}>
              <option value="">All Statuses</option>
              {uniqueStatuses.filter(Boolean).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>First Name</label>
            <input
              type="text"
              value={firstNameInput}
              onChange={e => setFirstNameInput(e.target.value)}
              placeholder="Search by first name"
            />
          </div>

          <div className="filter-group">
            <label>Title/Model</label>
            <input
              type="text"
              value={titleInput}
              onChange={e => setTitleInput(e.target.value)}
              placeholder="Search by title"
            />
          </div>

          <div className="filter-group">
            <label>Date Field</label>
            <select value={dateFieldInput} onChange={e => {
              setDateFieldInput(e.target.value);
              if (e.target.value === '') {
                setDateFromInput('');
                setDateToInput('');
              }
            }}>
              <option value="">None</option>
              <option value="BorrowedAt">Borrowed Date</option>
              <option value="ReturnedAt">Returned Date</option>
              <option value="DueAT">Due Date</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Last Name</label>
            <input
              type="text"
              value={lastNameInput}
              onChange={e => setLastNameInput(e.target.value)}
              placeholder="Search by last name"
            />
          </div>

          <div className="filter-group">
            <label>Author/Brand</label>
            <input
              type="text"
              value={authorInput}
              onChange={e => setAuthorInput(e.target.value)}
              placeholder="Search by author"
            />
          </div>

          <div className="filter-group">
            <label>Date Range</label>
            <div className="date-inputs">
              <input
                type="date"
                value={dateFromInput}
                onChange={e => setDateFromInput(e.target.value)}
                placeholder="From"
                disabled={!dateFieldInput}
              />
              <span>to</span>
              <input
                type="date"
                value={dateToInput}
                onChange={e => setDateToInput(e.target.value)}
                placeholder="To"
                disabled={!dateFieldInput}
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
            <>
              <div className="chart-controls">
                <h3>
                  {chartType === 'bar' ? 'Loans by Item Type' : 'Loans by Status'}
                </h3>
                <div className="chart-type-selector">
                  <label>
                    <input
                      type="radio"
                      name="chartType"
                      checked={chartType === 'bar'}
                      onChange={() => setChartType('bar')}
                    />
                    Item Type
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="chartType"
                      checked={chartType === 'pie'}
                      onChange={() => setChartType('pie')}
                    />
                    Loan Status
                  </label>
                </div>
              </div>
              <div className="chart-wrapper">
                <DataReportChart reportData={chartData} chartType={chartType === 'bar' ? 'bar' : 'pie'} />
              </div>
            </>
          )}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="table-wrapper">
          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading user loan data...</p>
            </div>
          ) : (
            <>
              <p className="results-count">{filteredData.length} loans found</p>
              <div className="table-container">
                <table className="loans-table">
                  <thead>
                    <tr>
                      <th>User ID</th>
                      <th>User</th>
                      <th>Role</th>
                      <th>Item Type</th>
                      <th>Title/Model</th>
                      <th>Author/Brand</th>
                      <th>Borrowed Date</th>
                      <th>Due Date</th>
                      <th>Returned Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length === 0 ? (
                      <tr>
                        <td colSpan="10" className="no-results">No loans match your search criteria.</td>
                      </tr>
                    ) : (
                      filteredData.map((item, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                          <td>{item.UserID}</td>
                          <td className="user-cell">
                            <div className="user-name">{item.FirstName} {item.LastName}</div>
                          </td>
                          <td>
                            <span className={`role-badge role-${item.Role?.toLowerCase()}`}>
                              {item.Role}
                            </span>
                          </td>
                          <td>
                            <div className="item-type-badge">
                              {item.ItemType}
                            </div>
                          </td>
                          <td className="primary-cell">{item.Title}</td>
                          <td>{item.Author}</td>
                          <td>{formatDate(item.BorrowedAt)}</td>
                          <td>
                            {item.DueAT && !item.ReturnedAt && new Date(item.DueAT) < new Date() ? (
                              <span className="overdue-date">{formatDate(item.DueAT)}</span>
                            ) : (
                              formatDate(item.DueAT)
                            )}
                          </td>
                          <td>{item.ReturnedAt ? formatDate(item.ReturnedAt) : '—'}</td>
                          <td>{renderStatus(item.Status, item.ReturnedAt)}</td>
                        </tr>
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

export default UserReport;
