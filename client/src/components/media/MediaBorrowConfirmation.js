import React from "react";
import "../../styles/media/media.css";

const MediaBorrowConfirmation = ({ media, userData, actionType, handleAction, navigateToMedia }) => {
  const borrowDays = userData.Role === "Student" ? 7 : 14;

  return (
    <div className="content-container">
      <h2>{actionType} Confirmation</h2>
      <p>Are you sure you want to {actionType.toLowerCase()} this media?</p>
      <div className="media-details">
        <p><strong>Type:</strong> {media.Type}</p>
        <p><strong>Title:</strong> {media.Title}</p>
        <p><strong>Author:</strong> {media.Author}</p>
        <p><strong>Borrow Duration:</strong> {borrowDays} days</p>
      </div>
      <div className="button-group">
        <button onClick={navigateToMedia} className="btn-secondary">Cancel</button>
        <button onClick={handleAction} className="btn-primary">Confirm</button>
      </div>
    </div>
  );
};

export default MediaBorrowConfirmation;
