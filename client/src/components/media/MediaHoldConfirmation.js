import React from "react";
import "../../styles/media/media.css";

const MediaHoldConfirmation = ({ media, handleAction, navigateToMedia }) => {
  return (
    <div className="content-container">
      <h2>Hold Confirmation</h2>
      <p>Are you sure you want to place a hold on this media?</p>
      <div className="media-details">
        <p><strong>Type:</strong> {media.Type}</p>
        <p><strong>Title:</strong> {media.Title}</p>
        <p><strong>Author:</strong> {media.Author}</p>
      </div>
      <p>We will notify you when this item becomes available.</p>
      <div className="button-group">
        <button onClick={navigateToMedia} className="btn-secondary">Cancel</button>
        <button onClick={handleAction} className="btn-primary">Confirm</button>
      </div>
    </div>
  );
};

export default MediaHoldConfirmation;