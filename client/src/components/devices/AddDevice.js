import React, { useState } from 'react';
import '../../styles/devices/devices.css';

const AddDevice = ({ onAddDevice, navigateToHome }) => {
  const [newDevice, setNewDevice] = useState({
    Type: '',
    Brand: '',
    Model: '',
    SerialNumber: '',
    TotalCopies: '',
    AvailableCopies: '',
    ShelfLocation: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewDevice(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddDevice(newDevice);
  };

  return (
    <div className="content-container">
      <h2>Add New Device</h2>
      <form onSubmit={handleSubmit} className="add-device-form">
        <div className="form-row">
          <div className="form-group">
            <label>Type:</label>
            <select
              name="Type"
              value={newDevice.Type}
              onChange={handleChange}
              required
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
              value={newDevice.Brand}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Model:</label>
            <input
              type="text"
              name="Model"
              value={newDevice.Model}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Serial Number:</label>
            <input
              type="text"
              name="SerialNumber"
              value={newDevice.SerialNumber}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Total Copies:</label>
            <input
              type="number"
              name="TotalCopies"
              value={newDevice.TotalCopies}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Available Copies:</label>
            <input
              type="number"
              name="AvailableCopies"
              value={newDevice.AvailableCopies}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Shelf Location:</label>
          <input
            type="text"
            name="ShelfLocation"
            value={newDevice.ShelfLocation}
            onChange={handleChange}
            required
          />
        </div>

        <div className="button-group">
          <button type="button" onClick={navigateToHome} className="btn-secondary">Back to Home</button>
          <button type="submit" className="btn-primary">Confirm</button>
        </div>
      </form>
    </div>
  );
};

export default AddDevice;
