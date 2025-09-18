import React from "react";
import "../../styles/devices/devices.css";

const DeviceBorrowConfirmation = ({ device, userData, handleConfirmBorrow, navigateToDevices }) => {
  const borrowDays = userData.Role === "Student" ? 7 : 14;

  return (
    <div className="content-container">
      <h2>Borrow Confirmation</h2>
      <p>Are you sure you want to borrow this device?</p>
      <div className="device-details">
        <p><strong>Type:</strong> {device.Type}</p>
        <p><strong>Model:</strong> {device.Model}</p>
        <p><strong>Brand:</strong> {device.Brand}</p>
        <p><strong>Borrow Duration:</strong> {borrowDays} days</p>
      </div>
      <div className="button-group">
        <button onClick={navigateToDevices} className="btn-secondary">Cancel</button>
        <button onClick={handleConfirmBorrow} className="btn-primary">Confirm</button>
      </div>
    </div>
  );
};

export default DeviceBorrowConfirmation;
