import React from 'react';
import '../../styles/devices/devices.css';

const DeleteDevice = ({ deviceData, onDeleteDevice, navigateToHome}) => {
  const handleDelete = () => {
    onDeleteDevice(deviceData.DeviceID);
  };

  return (
    <div className="content-container">
      <div className="delete-confirmation-card">
        <div className="delete-header">
          <div className="warning-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36">
              <path fill="none" d="M0 0h24v24H0z"/>
              <path fill="currentColor" d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-1-5h2v2h-2v-2zm0-8h2v6h-2V7z"/>
            </svg>
          </div>
          <h2>Delete Device</h2>
        </div>
        
        <p className="delete-warning-text">
          Are you sure you want to delete this device? This action cannot be undone.
        </p>

        <div className="device-info-box">
          <div className="device-info-header">
            <h3>{deviceData.Brand} {deviceData.Model}</h3>
            <span className="device-type-badge">{deviceData.Type}</span>
          </div>
          
          <div className="device-info-grid">
            <div className="info-item">
              <span className="info-label">Serial Number:</span>
              <span className="info-value">{deviceData.SerialNumber}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Total Copies:</span>
              <span className="info-value">{deviceData.TotalCopies}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Available Copies:</span>
              <span className="info-value">{deviceData.AvailableCopies}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Shelf Location:</span>
              <span className="info-value">{deviceData.ShelfLocation}</span>
            </div>
          </div>
        </div>

        <div className="button-group delete-actions">
          <button onClick={navigateToHome} className="btn-secondary">Cancel</button>
          <button onClick={handleDelete} className="btn-danger">
            <span className="delete-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                <path fill="none" d="M0 0h24v24H0z"/>
                <path fill="currentColor" d="M17 6h5v2h-2v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8H2V6h5V3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3zm1 2H6v12h12V8zm-9 3h2v6H9v-6zm4 0h2v6h-2v-6zM9 4v2h6V4H9z"/>
              </svg>
            </span>
            Delete Device
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteDevice;
