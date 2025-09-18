import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import '../../styles/devices/devices.css';

const DeleteDeviceList = ({ navigateToHome, navigateToDeleteDevice }) => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState('All');

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const data = await API.getDevices();
        if (data.success) {
          setDevices(data.devices);
        } else {
          setError(data.error || 'Failed to fetch devices');
        }
      } catch (err) {
        console.error('Error fetching devices:', err);
        setError('An error occurred while fetching devices');
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  // Static device types for filter
  const deviceTypes = ['All', 'Laptop', 'iPad', 'Headphone']; // Example types, adjust as needed

  // Filtered devices based on selectedType
  const filteredDevices =
    selectedType === 'All'
      ? devices
      : devices.filter((device) => device.Type === selectedType);

  return (
    <div className="content-container">
      <h2>Delete Devices</h2>
      
      <div className="header-actions">
        <button onClick={navigateToHome} className="btn-secondary">
          Back to Home
        </button>
      </div>

      {loading ? (
        <p>Loading devices...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <>
          {/* Enhanced Filter Controls */}
          <div className="filter-controls">
            <div className="filter-group">
              <label htmlFor="typeFilter">Type:</label>
              <select
                id="typeFilter"
                className="filter-select"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                {deviceTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Redesigned Table */}
          <div className="table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Brand</th>
                  <th>Model</th>
                  <th>Serial Number</th>
                  <th>Total Copies</th>
                  <th>Available</th>
                  <th>Location</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDevices.length > 0 ? (
                  filteredDevices.map((device) => (
                    <tr key={device.DeviceID}>
                      <td>{device.Type}</td>
                      <td>{device.Brand}</td>
                      <td>{device.Model}</td>
                      <td>{device.SerialNumber}</td>
                      <td>{device.TotalCopies}</td>
                      <td>{device.AvailableCopies}</td>
                      <td>{device.ShelfLocation}</td>
                      <td>
                        <button
                          className="action-button"
                          onClick={() => navigateToDeleteDevice(device)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8">No devices found for this type.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default DeleteDeviceList;
