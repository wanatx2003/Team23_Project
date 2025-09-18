import React, { useState } from 'react';
import '../../styles/fines/PayFine.css';

const PayFine = ({ fine, navigateToFines, onConfirmPayment }) => {
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [securityCode, setSecurityCode] = useState('');

  const handleConfirm = async () => {
    console.log("Submitting fine with FineID:", fine.FineID);
    try {
      const response = await fetch('/api/payFine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fineId: fine.FineID }),
      });
      const data = await response.json();
      if (data.success) {
        onConfirmPayment({ fine });
      } else {
        alert("Failed to update fine: " + data.error);
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("An error occurred while processing the payment.");
    }
  };

  return (
    <div className="content-container">
      <h2>Pay Fine</h2>
      <form className="pay-fine-form">
        <div className="form-group">
          <label>Cardholder Name:</label>
          <input
            type="text"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Card Number:</label>
          <input
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Expiration Date:</label>
          <input
            type="text"
            placeholder="MM/YY"
            value={expirationDate}
            onChange={(e) => setExpirationDate(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Security Code:</label>
          <input
            type="text"
            value={securityCode}
            onChange={(e) => setSecurityCode(e.target.value)}
            required
          />
        </div>
        <div className="button-group">
          <button type="button" onClick={navigateToFines} className="btn-secondary">
            Cancel
          </button>
          <button type="button" onClick={handleConfirm} className="btn-primary">
            Confirm
          </button>
        </div>
      </form>
    </div>
  );
};

export default PayFine;