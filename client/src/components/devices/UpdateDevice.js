import React, { useState, useEffect } from 'react';
import '../../styles/devices/devices.css';

const UpdateDevice = ({ deviceData, onUpdateDevice, navigateToHome }) => {
  const [device, setDevice] = useState({
    DeviceID: '',
    Type: '',
    Brand: '',
    Model: '',
    SerialNumber: '',
    TotalCopies: '',
    AvailableCopies: '',
    ShelfLocation: ''
  });

  useEffect(() => {
    if (deviceData) {
      setDevice(deviceData); // Pre-fill form with existing data
    }
  }, [deviceData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDevice(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateDevice(device); // Send updated device data to parent
  };

  return (
    <div className="content-container">
      <h2>Update Device</h2>
      <form onSubmit={handleSubmit} className="add-device-form">
        <div className="form-row">
          <div className="form-group">
            <label>Type:</label>
            <select
              name="Type"
              value={device.Type}
              onChange={handleChange}
            >
              <option value="">Select Type</option>
              <option value="Laptop">Laptop</option>
              <option value="iPad">iPad</option>
              <option value="Headphone">Headphone</option>
            </select>
          </div>
          <div className="form-group">
            <label>Brand:</label>
            <input
              type="text"
              name="Brand"
              value={device.Brand}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Model:</label>
            <input
              type="text"
              name="Model"
              value={device.Model}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Serial Number:</label>
            <input
              type="text"
              name="SerialNumber"
              value={device.SerialNumber}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Total Copies:</label>
            <input
              type="number"
              name="TotalCopies"
              value={device.TotalCopies}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Available Copies:</label>
            <input
              type="number"
              name="AvailableCopies"
              value={device.AvailableCopies}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Shelf Location:</label>
          <input
            type="text"
            name="ShelfLocation"
            value={device.ShelfLocation}
            onChange={handleChange}
          />
        </div>

        <div className="button-group">
          <button type="button" onClick={navigateToHome} className="btn-secondary">Back</button>
          <button type="submit" className="btn-primary">Update</button>
        </div>
      </form>
    </div>
  );
};

export default UpdateDevice;
