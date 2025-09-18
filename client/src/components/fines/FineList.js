import React, { useState } from 'react';
import '../../styles/fines/Fines.css';

const FineList = ({ fines, navigateToHome, navigateToPayFine }) => {
  const [selectedItemType, setSelectedItemType] = useState('All');

  // Get unique item types for the filter
  const itemTypes = ['All', ...new Set(fines.map(fine => fine.ItemType))];

  // Filter fines based on selectedItemType and sort by BorrowedAt date (newest first)
  const filteredFines = fines
    .filter(fine => selectedItemType === 'All' || fine.ItemType === selectedItemType)
    .sort((a, b) => {
      return new Date(b.BorrowedAt) - new Date(a.BorrowedAt);
    });

  // Function to render the title field based on item type
  const renderTitle = (fine) => {
    return fine.Title || 'Unknown Item';
  };

  // Function to render the creator field based on item type
  const renderCreator = (fine) => {
    switch (fine.ItemType) {
      case 'Book':
        return fine.Author || 'Unknown Author';
      case 'Media':
        return fine.Artist || fine.Director || fine.Author || 'Unknown Creator';
      case 'Device':
        return fine.Brand || 'Unknown Brand';
      default:
        return fine.Author || 'Unknown';
    }
  };

  return (
    <div className="content-container">
      <h2>Your Fines</h2>
      
      {fines.length === 0 ? (
        <p>You have no fines.</p>
      ) : (
        <>
          {/* Filter by item type */}
          <div className="filter-container">
            <div className="filter-group">
              <label htmlFor="itemTypeFilter">Item Type: </label>
              <select
                id="itemTypeFilter"
                value={selectedItemType}
                onChange={(e) => setSelectedItemType(e.target.value)}
              >
                {itemTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <table className="fines-table">
            <thead>
              <tr>
                <th>Item Type</th>
                <th>Title</th>
                <th>Creator</th>
                <th>Borrowed At</th>
                <th>Due At</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFines.map((fine, index) => (
                <tr key={index} className={fine.Status === "Unpaid" ? "unpaid" : ""}>
                  <td>{fine.ItemType}</td>
                  <td>{renderTitle(fine)}</td>
                  <td>{renderCreator(fine)}</td>
                  <td>{new Date(fine.BorrowedAt).toLocaleString()}</td>
                  <td>{new Date(fine.DueAT).toLocaleString()}</td>
                  <td>${parseFloat(fine.Amount).toFixed(2)}</td>
                  <td>{fine.Status}</td>
                  <td>
                    {fine.Status === "Paid" ? (
                      <button className="btn-disabled" disabled>
                        Paid
                      </button>
                    ) : (
                      <button className="btn-pay" onClick={() => navigateToPayFine(fine)}>
                        Pay Fine
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      <button onClick={navigateToHome} className="btn-back">Back to Home</button>
    </div>
  );
};

export default FineList;
