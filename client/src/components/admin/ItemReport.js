import React, { useEffect, useState } from 'react';
import '../../styles/admin/ItemReport.css';
import DataReportChart from '../DataReportChart';

const ItemReport = ({ navigateBack }) => {
  const [reportData, setReportData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'chart'

  // Input fields (user input before "Generate Report")
  const [itemTypeInput, setItemTypeInput] = useState('All');
  const [titleInput, setTitleInput] = useState('');
  const [authorInput, setAuthorInput] = useState('');
  const [sortByInput, setSortByInput] = useState('none');
  const [sortOrderInput, setSortOrderInput] = useState('asc');
  const [startDateInput, setStartDateInput] = useState('');
  const [endDateInput, setEndDateInput] = useState('');

  // Filters applied when "Generate Report" is clicked
  const [itemTypeFilter, setItemTypeFilter] = useState('All');
  const [titleSearch, setTitleSearch] = useState('');
  const [authorSearch, setAuthorSearch] = useState('');
  const [sortBy, setSortBy] = useState('none');
  const [sortOrder, setSortOrder] = useState('asc');

  // Apply filters
  const applyFilters = async () => {
    setItemTypeFilter(itemTypeInput);
    setTitleSearch(titleInput);
    setAuthorSearch(authorInput);
    setSortBy(sortByInput);
    setSortOrder(sortOrderInput);
    setIsLoading(true);

    try {
      const params = new URLSearchParams();
      if (startDateInput) params.append('startDate', startDateInput);
      if (endDateInput) params.append('endDate', endDateInput);

      console.log("Query parameters being sent:", params.toString());

      const response = await fetch(`/api/itemReport?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setReportData(data.data);
      } else {
        console.error('Failed to fetch item report:', data.error);
      }
    } catch (error) {
      console.error('Error fetching item report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    applyFilters(); // Initial fetch (all data)
  }, []);

  useEffect(() => {
    let filtered = [...reportData];

    // Apply filters
    if (itemTypeFilter !== 'All') {
      filtered = filtered.filter(item => item.ItemType === itemTypeFilter);
    }

    if (titleSearch) {
      filtered = filtered.filter(item =>
        item.DisplayTitle.toLowerCase().includes(titleSearch.toLowerCase())
      );
    }

    if (authorSearch) {
      filtered = filtered.filter(item =>
        item.DisplayAuthor.toLowerCase().includes(authorSearch.toLowerCase())
      );
    }

    // Apply sorting
    if (sortBy !== 'none') {
      filtered.sort((a, b) => {
        const aValue = sortBy === 'TotalBorrows' ? a.TotalBorrows : a.TotalHolds;
        const bValue = sortBy === 'TotalBorrows' ? b.TotalBorrows : b.TotalHolds;
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      });
    }

    setFilteredData(filtered);
  }, [itemTypeFilter, titleSearch, authorSearch, sortBy, sortOrder, reportData]);
  
  // Calculate summary statistics
  const calculateStats = () => {
    if (!filteredData || filteredData.length === 0) {
      return { 
        totalItems: 0, 
        totalBorrows: 0, 
        activeBorrows: 0, 
        totalHolds: 0 
      };
    }
    
    const totalItems = filteredData.length;
    const totalBorrows = filteredData.reduce((sum, item) => sum + (item.TotalBorrows || 0), 0);
    const activeBorrows = filteredData.reduce((sum, item) => sum + (item.ActiveBorrows || 0), 0);
    const totalHolds = filteredData.reduce((sum, item) => sum + (item.TotalHolds || 0), 0);
    
    return { totalItems, totalBorrows, activeBorrows, totalHolds };
  };
  
  // Prepare data for charts
  const prepareChartData = () => {
    if (!filteredData || filteredData.length === 0) return [];
    
    // Get top 10 items by borrows
    const topItems = [...filteredData]
      .sort((a, b) => b.TotalBorrows - a.TotalBorrows)
      .slice(0, 10);
      
    return topItems.map(item => ({
      label: item.DisplayTitle.length > 25 
        ? item.DisplayTitle.substring(0, 22) + '...' 
        : item.DisplayTitle,
      value: item.TotalBorrows
    }));
  };
  
  const stats = calculateStats();
  const chartData = prepareChartData();

  return (
    <div className="item-report">
      <h2>Item Report</h2>
      
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
          <div className="stat-value">{stats.totalItems}</div>
          <div className="stat-label">Total Items</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{stats.totalBorrows}</div>
          <div className="stat-label">Total Borrows</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{stats.activeBorrows}</div>
          <div className="stat-label">Active Borrows</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{stats.totalHolds}</div>
          <div className="stat-label">Total Holds</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-panel">
        <div className="filters-header">
          <h3>Filter Options</h3>
          <button 
            onClick={() => {
              setItemTypeInput('All');
              setTitleInput('');
              setAuthorInput('');
              setSortByInput('none');
              setSortOrderInput('asc');
              setStartDateInput('');
              setEndDateInput('');
            }} 
            className="clear-button"
          >
            Clear All
          </button>
        </div>
        
        <div className="filters-grid">
          <div className="filter-group">
            <label>Item Type</label>
            <select value={itemTypeInput} onChange={e => setItemTypeInput(e.target.value)}>
              <option value="All">All Items</option>
              <option value="Book">Books</option>
              <option value="Media">Media</option>
              <option value="Device">Devices</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Title/Model</label>
            <input
              type="text"
              value={titleInput}
              onChange={e => setTitleInput(e.target.value)}
              placeholder="Search by title or model"
            />
          </div>

          <div className="filter-group">
            <label>Author/Brand</label>
            <input
              type="text"
              value={authorInput}
              onChange={e => setAuthorInput(e.target.value)}
              placeholder="Search by author or brand"
            />
          </div>

          <div className="filter-group">
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

          <div className="filter-group">
            <label>Sort by</label>
            <select value={sortByInput} onChange={e => setSortByInput(e.target.value)}>
              <option value="none">None</option>
              <option value="TotalBorrows">Total Borrows</option>
              <option value="TotalHolds">Total Holds</option>
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
              <h3>Top 10 Items by Borrows</h3>
              <div className="chart-wrapper">
                <DataReportChart reportData={chartData} chartType="bar" />
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
              <p>Loading item data...</p>
            </div>
          ) : (
            <>
              <p className="results-count">{filteredData.length} items found</p>
              <div className="table-container">
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Item Type</th>
                      <th>Item ID</th>
                      <th>Title/Model</th>
                      <th>Author/Brand</th>
                      <th className="numeric-column">Total Borrows</th>
                      <th className="numeric-column">Active Borrows</th>
                      <th className="numeric-column">Total Holds</th>
                      <th className="numeric-column">Pending Holds</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length === 0 ? (
                      <tr><td colSpan="8" className="no-results">No items match your search criteria.</td></tr>
                    ) : (
                      filteredData.map((item, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                          <td>
                            <div className="item-type-badge">
                              {item.ItemType}
                            </div>
                          </td>
                          <td>{item.ItemID}</td>
                          <td className="primary-cell">{item.DisplayTitle}</td>
                          <td>{item.DisplayAuthor}</td>
                          <td className="numeric-column">{item.TotalBorrows}</td>
                          <td className="numeric-column">
                            <span className={item.ActiveBorrows > 0 ? "highlight-value" : ""}>
                              {item.ActiveBorrows}
                            </span>
                          </td>
                          <td className="numeric-column">{item.TotalHolds}</td>
                          <td className="numeric-column">
                            <span className={item.PendingHolds > 0 ? "highlight-value" : ""}>
                              {item.PendingHolds}
                            </span>
                          </td>
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

export default ItemReport;
