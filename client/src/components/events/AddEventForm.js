import React, { useState } from 'react';

const AddEventForm = ({ onSubmit, rooms, onCancel, bookedRooms = [] }) => {
  const [eventData, setEventData] = useState({
    EventName: '',
    RoomID: '',
    StartAt: '',
    EndAt: '',
    MaxAttendees: '',
    Category: '',
    Description: '',
    CreatedByAdmin: true
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(eventData);
  };
  
  // Format datetime for input fields - modified to handle timezones better
  const formatDateTimeForInput = (date) => {
    const d = new Date(date || new Date());
    
    // Format for datetime-local input (YYYY-MM-DDThh:mm) with timezone adjustment
    const tzoffset = d.getTimezoneOffset() * 60000; // offset in milliseconds
    const localISOTime = (new Date(d.getTime() - tzoffset)).toISOString().slice(0, 16);
    
    console.log("Formatted date for input:", localISOTime);
    return localISOTime;
  };
  
  // Update eventCategories to match the database enum values
  const eventCategories = [
    'Workshops',
    'Seminar',
    'Conference'
  ];
  
  // Filter out rooms that are already booked
  const availableRooms = rooms.filter(room => {
    const isAvailable = !bookedRooms.includes(room.RoomID);
    console.log(`Room ${room.RoomID} (${room.RoomName || room.RoomNumber}): available=${isAvailable}`);
    return isAvailable;
  });
  
  console.log("Total rooms:", rooms.length, "Available rooms:", availableRooms.length);
  
  return (
    <div className="add-event-form-container">
      <h3>Add New Event</h3>
      <form onSubmit={handleSubmit} className="add-event-form">
        <div className="form-group">
          <label htmlFor="EventName">Event Name:</label>
          <input
            type="text"
            id="EventName"
            name="EventName"
            value={eventData.EventName}
            onChange={handleChange}
            required
            placeholder="Enter event name"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="Category">Event Category:</label>
          <select
            id="Category"
            name="Category"
            value={eventData.Category}
            onChange={handleChange}
            required
          >
            <option value="">Select a Category</option>
            {eventCategories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="RoomID">Room:</label>
          <select
            id="RoomID"
            name="RoomID"
            value={eventData.RoomID}
            onChange={handleChange}
            required
          >
            <option value="">Select a Room</option>
            {availableRooms.map(room => (
              <option key={room.RoomID} value={room.RoomID}>
                {room.RoomName || room.RoomNumber} (Capacity: {room.Capacity})
              </option>
            ))}
          </select>
          {availableRooms.length === 0 && (
            <p style={{ color: '#dc2626', fontSize: '0.9rem', marginTop: '5px' }}>
              No rooms available for this time slot
            </p>
          )}
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="StartAt">Start Date/Time:</label>
            <input
              type="datetime-local"
              id="StartAt"
              name="StartAt"
              value={eventData.StartAt}
              onChange={handleChange}
              required
              min={formatDateTimeForInput()}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="EndAt">End Date/Time:</label>
            <input
              type="datetime-local"
              id="EndAt"
              name="EndAt"
              value={eventData.EndAt}
              onChange={handleChange}
              required
              min={eventData.StartAt || formatDateTimeForInput()}
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="MaxAttendees">Maximum Attendees:</label>
          <input
            type="number"
            id="MaxAttendees"
            name="MaxAttendees"
            value={eventData.MaxAttendees}
            onChange={handleChange}
            min="1"
            required
            placeholder="Enter maximum number of attendees"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="Description">Event Description:</label>
          <textarea
            id="Description"
            name="Description"
            value={eventData.Description}
            onChange={handleChange}
            rows="4"
            placeholder="Provide details about the event"
            required
          ></textarea>
        </div>
        
        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-cancel">
            Cancel
          </button>
          <button type="submit" className="btn-submit">
            Create Event
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEventForm;