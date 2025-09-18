import React, { useState, useEffect } from 'react';
import DataReportChart from '../DataReportChart';
import '../../styles/admin/FinesReport.css';
import API from '../../services/api';

const FinesReport = ({ navigateBack }) => {
  const [reportData, setReportData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter inputs:
  const [startDateInput, setStartDateInput] = useState('');
  const [endDateInput, setEndDateInput] = useState('');
  const [paymentStatusInput, setPaymentStatusInput] = useState('All');
  const [roleInput, setRoleInput] = useState('All');
  const [itemTypeInput, setItemTypeInput] = useState('All');

  // Applied filters
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [itemTypeFilter, setItemTypeFilter] = useState('All');

  // New state for view mode: "table" or "chart"
  const [viewMode, setViewMode] = useState('table');
  
  // Hardcoded filter lists instead of dynamic generation
  const rolesList = ['All', 'Student', 'Faculty', 'Admin'];
  const itemTypesList = ['All', 'Book', 'Media', 'Device'];

  // Helper function to format headers
  const formatHeader = (header) => {
    const mappings = {
      FineID: 'Fine ID',
      FirstName: 'First Name',
      LastName: 'Last Name',
      Role: 'User Role',
      ItemType: 'Item Type',
      BorrowedAt: 'Date Borrowed',
      DueAT: 'Date Due',
      PaymentStatus: 'Payment Status'
      // add any additional mappings as needed
    };
    return mappings[header] || header.replace(/([a-z])([A-Z])/g, '$1 $2');
  };

  // Function to get ordered keys so that columns appear in desired order
  const getOrderedKeys = () => {
    if (!filteredData || !filteredData.length) return [];
    // Force FineID, FirstName, LastName, Role, ItemType to appear first; the rest follow
    const baseOrder = ['FineID', 'FirstName', 'LastName', 'Role', 'ItemType', 'Title', 'Author', 'BorrowedAt', 'DueAT', 'Amount', 'Status'];
    const allKeys = Object.keys(filteredData[0]);
    const remaining = allKeys.filter(key => !baseOrder.includes(key));
    return [...baseOrder.filter(key => allKeys.includes(key)), ...remaining];
  };

  // Fetch report data from API using filters
  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      console.log("Sending fine report filters to API:", {
        startDate: startDateFilter,
        endDate: endDateFilter,
        paymentStatus: paymentStatusFilter,
        role: roleFilter,
        itemType: itemTypeFilter
      });
      
      const data = await API.getFineReport(
        startDateFilter, 
        endDateFilter, 
        paymentStatusFilter,
        roleFilter,
        itemTypeFilter
      );
      
      if (data.success) {
        console.log("Received fine report data:", data.data ? data.data.length : 0, "records");
        setReportData(data.data || []);
      } else {
        console.error('Failed to fetch fines report:', data.error);
      }
    } catch (error) {
      console.error('Error fetching fines report:', error);
      setReportData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters based on input values
  const applyFilters = () => {
    console.log("Applying date filters:", {
      startDate: startDateInput,
      endDate: endDateInput
    });
    
    setStartDateFilter(startDateInput);
    setEndDateFilter(endDateInput);
    setPaymentStatusFilter(paymentStatusInput);
    setRoleFilter(roleInput);
    setItemTypeFilter(itemTypeInput);
  };

  // Clear filters
  const clearFilters = () => {
    setStartDateInput('');
    setEndDateInput('');
    setPaymentStatusInput('All');
    setRoleInput('All');
    setItemTypeInput('All');
    setStartDateFilter('');
    setEndDateFilter('');
    setPaymentStatusFilter('All');
    setRoleFilter('All');
    setItemTypeFilter('All');
  };

  // Re-fetch data when filters are applied
  useEffect(() => {
    fetchReportData();
  }, [startDateFilter, endDateFilter, paymentStatusFilter, roleFilter, itemTypeFilter]);

  // Update filteredData based on reportData and all filters
  useEffect(() => {
    let data = reportData || [];
    
    // Apply payment status filter
    if (paymentStatusFilter !== 'All') {
      data = data.filter(item => item.Status === paymentStatusFilter);
    }
    
    // Apply role filter
    if (roleFilter !== 'All') {
      data = data.filter(item => item.Role === roleFilter);
    }
    
    // Apply item type filter
    if (itemTypeFilter !== 'All') {
      data = data.filter(item => item.ItemType === itemTypeFilter);
    }
    
    setFilteredData(data);
  }, [reportData, paymentStatusFilter, roleFilter, itemTypeFilter]);

  // Prepare chart data (e.g., total amount for Paid and Unpaid fines)
  const prepareChartData = () => {
    if (!filteredData.length) return [];
    const paidTotal = filteredData
      .filter(item => item.Status === 'Paid')
      .reduce((sum, item) => sum + parseFloat(item.Amount || 0), 0);
    const unpaidTotal = filteredData
      .filter(item => item.Status === 'Unpaid')
      .reduce((sum, item) => sum + parseFloat(item.Amount || 0), 0);
    return [
      { label: 'Paid Fines', value: paidTotal },
      { label: 'Unpaid Fines', value: unpaidTotal }
    ];
  };

  const chartData = prepareChartData();

  return (
    <div className="reports-container">
      <h3>Fines Report</h3>

      {/* View Toggle Controls */}
      <div className="view-toggle">
        <button 
          className={viewMode === 'table' ? 'active' : ''} 
          onClick={() => setViewMode('table')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" 
               viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 10h18M3 14h18M3 18h18M3 6h18"></path>
          </svg>
          Table View
        </button>
        <button 
          className={viewMode === 'chart' ? 'active' : ''} 
          onClick={() => setViewMode('chart')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" 
               viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

      {/* Filters Panel */}
      <div className="filters-panel">
        <div className="filters-header">
          <h3>Filter Options</h3>
          <button onClick={clearFilters} className="clear-button">Clear All</button>
        </div>
        <div className="filters-grid">
          <div className="filter-group">
            <label>User Role</label>
            <select 
              value={roleInput}
              onChange={e => setRoleInput(e.target.value)}
            >
              {rolesList.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Item Type</label>
            <select 
              value={itemTypeInput}
              onChange={e => setItemTypeInput(e.target.value)}
            >
              {itemTypesList.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Payment Status</label>
            <select 
              value={paymentStatusInput}
              onChange={e => setPaymentStatusInput(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
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

      {/* Conditional Rendering for Chart / Table Views */}
      {viewMode === 'chart' ? (
        <div className="chart-container">
          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading chart data...</p>
            </div>
          ) : chartData.length === 0 ? (
            <div className="no-data-message">
              <p>No fines data available for chart visualization.</p>
            </div>
          ) : (
            <>
              <h3>Fine Metrics Chart</h3>
              <div className="chart-wrapper">
                <DataReportChart reportData={chartData} chartType="pie" />
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="table-wrapper">
          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading fines report...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="no-data-message">
              <p>No fines data available yet.</p>
            </div>
          ) : (
            <table className="items-table">
              <thead>
                <tr>
                  {getOrderedKeys().map((key, index) => (
                    <th key={index}>{formatHeader(key)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, rowIndex) => (
                  <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'even-row' : 'odd-row'}>
                    {getOrderedKeys().map((key, colIndex) => (
                      <td key={colIndex}>{row[key]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default FinesReport;