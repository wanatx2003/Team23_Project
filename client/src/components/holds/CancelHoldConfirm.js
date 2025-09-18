import React from 'react';
import '../../styles/holds/Holds.css';

const CancelHoldConfirm = ({ selectedHold, handleConfirmCancel, navigateToHolds }) => {
  return (
    <div className="content-container cancel-hold-confirm">
      <h2>Cancel Hold Confirmation</h2>
      <p>
        Are you sure you want to cancel the hold for: <strong>{selectedHold.Title}</strong> by <strong>{selectedHold.AuthorOrBrand}</strong>?
      </p>
      <div className="button-group">
        <button onClick={navigateToHolds} className="btn-secondary">Cancel</button>
        <button onClick={handleConfirmCancel} className="btn-primary">Confirm Cancel</button>
      </div>
    </div>
  );
};

export default CancelHoldConfirm;