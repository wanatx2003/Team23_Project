import React, { useState } from 'react';
import '../../styles/holds/Holds.css';

const HoldList = ({ holds, handleCancelHold, navigateToHome }) => {
  const [selectedItemType, setSelectedItemType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Sort holds by RequestAT (newest to oldest)
  const sortedHolds = holds.sort(
    (a, b) => new Date(b.RequestAT) - new Date(a.RequestAT)
  );

  // Get unique item types and statuses for dropdowns
  const itemTypes = ['All', ...new Set(holds.map((hold) => hold.ItemType))];
  const statuses = ['All', ...new Set(holds.map((hold) => hold.HoldStatus))];

  // Apply filters
  const filteredHolds = sortedHolds.filter((hold) => {
    const matchesType =
      selectedItemType === 'All' || hold.ItemType === selectedItemType;
    const matchesStatus =
      selectedStatus === 'All' || hold.HoldStatus === selectedStatus;
    return matchesType && matchesStatus;
  });

  return (
    <div className="content-container">
      <h2>Your Holds</h2>
      <button onClick={navigateToHome} className="btn-back-title">
        Back to Home
      </button>

      {/* Filters */}
      <div className="filter-container">
        <label htmlFor="typeFilter">Item Type: </label>
        <select
          id="typeFilter"
          value={selectedItemType}
          onChange={(e) => setSelectedItemType(e.target.value)}
        >
          {itemTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <label htmlFor="statusFilter" style={{ marginLeft: '1rem' }}>
          Hold Status:
        </label>
        <select
          id="statusFilter"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {/* Table or message */}
      {filteredHolds.length === 0 ? (
        <p>No matching holds found.</p>
      ) : (
        <table className="holds-table">
          <thead>
            <tr>
              <th>Item Type</th>
              <th>Title/Model</th>
              <th>Author/Brand</th>
              <th>Requested At</th>
              <th>Hold Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredHolds.map((hold, index) => (
              <tr key={index}>
                <td>{hold.ItemType}</td>
                <td>{hold.Title}</td>
                <td>{hold.AuthorOrBrand}</td>
                <td>{new Date(hold.RequestAT).toLocaleString()}</td>
                <td>{hold.HoldStatus}</td>
                <td>
                  <button
                    onClick={() => handleCancelHold(hold)}
                    className={
                      hold.HoldStatus === 'Pending'
                        ? 'btn-cancel'
                        : 'btn-disabled'
                    }
                    disabled={hold.HoldStatus !== 'Pending'}
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default HoldList;
