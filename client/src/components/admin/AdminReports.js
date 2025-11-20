import React, { useState, useEffect } from 'react';
import '../../styles/admin/AdminReports.css';

const AdminReports = ({ navigateToHome }) => {
  const [activeReport, setActiveReport] = useState(null);
  const [reportData, setReportData] = useState([]);
  const [summary, setSummary] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: 'All',
    urgency: 'All',
    skill: 'All'
  });

  const statusList = ['All', 'registered', 'confirmed', 'attended', 'no_show', 'cancelled'];
  const urgencyList = ['All', 'low', 'medium', 'high', 'critical'];
  const skillsList = ['All', 'Communication', 'Teamwork', 'Physical Work', 'Organization', 'Teaching', 'Technology'];

  const fetchReport = async (reportType) => {
    setIsLoading(true);
    try {
      let endpoint = '';
      let params = new URLSearchParams();
      
      switch (reportType) {
        case 'participation':
          endpoint = '/api/reports/volunteer-participation';
          if (filters.startDate) params.append('startDate', filters.startDate);
          if (filters.endDate) params.append('endDate', filters.endDate);
          if (filters.status !== 'All') params.append('status', filters.status);
          if (filters.skill !== 'All') params.append('skill', filters.skill);
          break;
        case 'event':
          endpoint = '/api/reports/event-summary';
          if (filters.startDate) params.append('startDate', filters.startDate);
          if (filters.endDate) params.append('endDate', filters.endDate);
          if (filters.urgency !== 'All') params.append('urgency', filters.urgency);
          break;
        case 'volunteer':
          endpoint = '/api/reports/volunteer-summary';
          break;
        default:
          return;
      }
      
      const response = await fetch(`${endpoint}?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setReportData(data.data || []);
        setSummary(data.summary || {});
      } else {
        console.error('Failed to fetch report:', data.error);
        alert('Failed to generate report');
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      alert('Error generating report');
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!reportData.length) {
      alert('No data to export');
      return;
    }

    // Get column headers
    const headers = Object.keys(reportData[0]);
    
    // Create CSV content
    let csvContent = headers.join(',') + '\n';
    
    reportData.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        // Handle values that might contain commas
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value !== null && value !== undefined ? value : '';
      });
      csvContent += values.join(',') + '\n';
    });

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${activeReport}_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    if (!reportData.length) {
      alert('No data to export');
      return;
    }

    // Create a printable HTML version
    const printWindow = window.open('', '', 'height=600,width=800');
    
    let tableHTML = '<table border="1" style="width:100%; border-collapse: collapse;">';
    
    // Headers
    const headers = Object.keys(reportData[0]);
    tableHTML += '<thead><tr>';
    headers.forEach(header => {
      tableHTML += `<th style="padding: 8px; background: #4F46E5; color: white;">${header}</th>`;
    });
    tableHTML += '</tr></thead>';
    
    // Data
    tableHTML += '<tbody>';
    reportData.forEach(row => {
      tableHTML += '<tr>';
      headers.forEach(header => {
        const value = row[header];
        tableHTML += `<td style="padding: 8px;">${value !== null && value !== undefined ? value : ''}</td>`;
      });
      tableHTML += '</tr>';
    });
    tableHTML += '</tbody></table>';

    printWindow.document.write(`
      <html>
        <head>
          <title>${activeReport} Report - ${new Date().toLocaleDateString()}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #4F46E5; }
            table { margin-top: 20px; font-size: 12px; }
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>${activeReport.toUpperCase()} Report</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <div style="margin: 20px 0;">
            <strong>Summary:</strong> ${JSON.stringify(summary)}
          </div>
          ${tableHTML}
          <br>
          <button onclick="window.print()" style="background: #4F46E5; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">Print / Save as PDF</button>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  const renderFilters = () => {
    switch (activeReport) {
      case 'participation':
        return (
          <div className="filters-grid">
            <div className="filter-group">
              <label>Start Date</label>
              <input 
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({...filters, startDate: e.target.value})}
              />
            </div>
            <div className="filter-group">
              <label>End Date</label>
              <input 
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({...filters, endDate: e.target.value})}
              />
            </div>
            <div className="filter-group">
              <label>Status</label>
              <select 
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
              >
                {statusList.map(status => (
                  <option key={status} value={status}>{status.replace('_', ' ').toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Skill</label>
              <select 
                value={filters.skill}
                onChange={(e) => setFilters({...filters, skill: e.target.value})}
              >
                {skillsList.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
            </div>
          </div>
        );
      case 'event':
        return (
          <div className="filters-grid">
            <div className="filter-group">
              <label>Start Date</label>
              <input 
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({...filters, startDate: e.target.value})}
              />
            </div>
            <div className="filter-group">
              <label>End Date</label>
              <input 
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({...filters, endDate: e.target.value})}
              />
            </div>
            <div className="filter-group">
              <label>Urgency</label>
              <select 
                value={filters.urgency}
                onChange={(e) => setFilters({...filters, urgency: e.target.value})}
              >
                {urgencyList.map(urgency => (
                  <option key={urgency} value={urgency}>{urgency.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderTable = () => {
    if (!reportData.length) {
      return <div className="no-data">No data available for this report</div>;
    }

    const headers = Object.keys(reportData[0]);
    
    return (
      <div className="table-wrapper">
        <table className="report-table">
          <thead>
            <tr>
              {headers.map(header => (
                <th key={header}>{header.replace(/([A-Z])/g, ' $1').trim()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reportData.map((row, index) => (
              <tr key={index}>
                {headers.map(header => (
                  <td key={header}>
                    {header.includes('Date') && row[header]
                      ? new Date(row[header]).toLocaleDateString()
                      : row[header] !== null && row[header] !== undefined
                      ? row[header]
                      : 'N/A'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (!activeReport) {
    return (
      <div className="admin-reports-container">
        <div className="reports-header">
          <h1>Admin Reports Dashboard</h1>
          <p>Generate comprehensive reports on volunteer activities and event management</p>
        </div>

        <div className="report-cards-grid">
          <div className="report-card" onClick={() => setActiveReport('participation')}>
            <div className="report-icon">📊</div>
            <h3>Volunteer Participation Report</h3>
            <p>Track volunteer participation history, hours, and status across all events</p>
            <ul>
              <li>Filter by date range and status</li>
              <li>View hours volunteered</li>
              <li>Export to PDF/CSV</li>
            </ul>
          </div>

          <div className="report-card" onClick={() => setActiveReport('event')}>
            <div className="report-icon">📅</div>
            <h3>Event Summary Report</h3>
            <p>Comprehensive overview of all events, volunteers assigned, and participation metrics</p>
            <ul>
              <li>Event attendance statistics</li>
              <li>Volunteer assignment tracking</li>
              <li>Filter by urgency and dates</li>
            </ul>
          </div>

          <div className="report-card" onClick={() => setActiveReport('volunteer')}>
            <div className="report-icon">👥</div>
            <h3>Volunteer Summary Report</h3>
            <p>Complete profile summaries of all volunteers including skills and participation stats</p>
            <ul>
              <li>Total volunteers and active status</li>
              <li>Skills breakdown</li>
              <li>Individual contribution metrics</li>
            </ul>
          </div>
        </div>

        <button onClick={navigateToHome} className="btn-back">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="admin-reports-container">
      <div className="report-header">
        <div>
          <h2>{activeReport.toUpperCase()} Report</h2>
          {summary && Object.keys(summary).length > 0 && (
            <div className="summary-stats">
              {Object.entries(summary).map(([key, value]) => (
                <div key={key} className="stat-item">
                  <span className="stat-label">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                  <span className="stat-value">{typeof value === 'number' ? value.toFixed(2) : value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <button onClick={() => setActiveReport(null)} className="btn-secondary">
          Back to Reports
        </button>
      </div>

      {renderFilters()}

      <div className="report-actions">
        <button onClick={() => fetchReport(activeReport)} className="btn-primary" disabled={isLoading}>
          {isLoading ? 'Generating...' : 'Generate Report'}
        </button>
        {reportData.length > 0 && (
          <>
            <button onClick={exportToCSV} className="btn-success">
              Export to CSV
            </button>
            <button onClick={exportToPDF} className="btn-success">
              Export to PDF
            </button>
          </>
        )}
      </div>

      {isLoading ? (
        <div className="loading">Generating report...</div>
      ) : (
        renderTable()
      )}
    </div>
  );
};

export default AdminReports;
