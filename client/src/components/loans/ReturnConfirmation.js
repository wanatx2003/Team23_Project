import React from 'react';
import '../../styles/loans/Loans.css';

const ReturnConfirmation = ({ selectedLoan, handleConfirmReturn, navigateToLoans }) => {
  return (
    <div className="loans-page">
      <div className="return-confirmation">
        <h2>Return Confirmation</h2>
        <p>
          Are you sure you want to return the item: <strong>{selectedLoan.Title}</strong> by <strong>{selectedLoan.AuthorOrBrand}</strong>?
        </p>
        <div className="button-group">
          <button onClick={navigateToLoans} className="btn-secondary">Cancel</button>
          <button onClick={handleConfirmReturn} className="btn-primary">Confirm Return</button>
        </div>
      </div>
    </div>
  );
};

export default ReturnConfirmation;
