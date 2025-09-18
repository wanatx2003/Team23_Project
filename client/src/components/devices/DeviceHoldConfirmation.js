import React from "react";
import "../../styles/devices/devices.css";

const DeviceHoldConfirmation = ({ device, handleConfirmHold, navigateToDevices }) => {
  return (
    <div className="content-container">
      <h2>Hold Confirmation</h2>
      <p>Are you sure you want to place a hold on this device?</p>
      <div className="device-details">
        <p><strong>Type:</strong> {device.Type}</p>
        <p><strong>Model:</strong> {device.Model}</p>
        <p><strong>Brand:</strong> {device.Brand}</p>
      </div>
      <p>We will notify you when this item becomes available.</p>
      <div className="button-group">
        <button onClick={navigateToDevices} className="btn-secondary">Cancel</button>
        <button onClick={handleConfirmHold} className="btn-primary">Confirm</button>
      </div>
    </div>
  );
};

export default DeviceHoldConfirmation;
