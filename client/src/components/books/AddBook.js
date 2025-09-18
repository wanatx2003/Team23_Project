import React, { useState } from 'react';
import '../../styles/books/Books.css';

const AddBook = ({ onAddBook, navigateToHome }) => {
  const [newBook, setNewBook] = useState({
    Title: '',
    Author: '',
    Genre: '',
    PublicationYear: '',
    Publisher: '',
    Language: '',
    Format: '',
    ISBN: '',
    TotalCopies: '',
    AvailableCopies: '',
    ShelfLocation: ''
  });
  const [coverImage, setCoverImage] = useState(null);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewBook(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing again
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleFileChange = (e) => {
    setCoverImage(e.target.files[0]);
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate ISBN has exactly 13 digits
    if (!/^\d{13}$/.test(newBook.ISBN)) {
      newErrors.ISBN = "ISBN must be exactly 13 digits";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    // Create a FormData to include text fields and (if provided) the file
    const formData = new FormData();
    // Ensure numeric fields are correctly sent
    const formattedData = {
      ...newBook,
      TotalCopies: Number(newBook.TotalCopies),
      AvailableCopies: Number(newBook.AvailableCopies)
    };
    Object.entries(formattedData).forEach(([key, value]) => {
      formData.append(key, value);
    });
    if (coverImage) {
      formData.append('coverImage', coverImage);
    }
    try {
      const response = await fetch("/api/addBook", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      // If a valid BookID is provided, treat the add as successful
      if (data.BookID) {
        alert("Book added successfully!");
        navigateToHome();
      } 
    } catch (error) {
      console.error("Error adding book:", error);
      alert("An error occurred while adding the book.");
    }
  };

  return (
    <div className="content-container">
      <h2>Add New Book</h2>
      <form onSubmit={handleSubmit} className="add-book-form">
        <div className="form-row">
          <div className="form-group">
            <label>Title:</label>
            <input type="text" name="Title" value={newBook.Title} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Author:</label>
            <input type="text" name="Author" value={newBook.Author} onChange={handleChange} required />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Genre:</label>
            <select name="Genre" value={newBook.Genre} onChange={handleChange} required>
              <option value="">Select Genre</option>
              <option value="Fiction">Fiction</option>
              <option value="Fantasy">Fantasy</option>
              <option value="Romance">Romance</option>
              <option value="Thriller">Thriller</option>
              <option value="Novel">Novel</option>
            </select>
          </div>
          <div className="form-group">
            <label>Publication Year:</label>
            <input type="number" name="PublicationYear" value={newBook.PublicationYear} onChange={handleChange} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Publisher:</label>
            <input type="text" name="Publisher" value={newBook.Publisher} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Language:</label>
            <input type="text" name="Language" value={newBook.Language} onChange={handleChange} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Format:</label>
            <input type="text" name="Format" value={newBook.Format} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>ISBN:</label>
            <input 
              type="text" 
              name="ISBN" 
              value={newBook.ISBN} 
              onChange={handleChange} 
              required 
              className={errors.ISBN ? "input-error" : ""}
            />
            {errors.ISBN && <div className="error-message">{errors.ISBN}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Total Copies:</label>
            <input type="number" name="TotalCopies" value={newBook.TotalCopies} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Available Copies:</label>
            <input type="number" name="AvailableCopies" value={newBook.AvailableCopies} onChange={handleChange} required />
          </div>
        </div>

        <div className="form-group">
          <label>Shelf Location:</label>
          <input type="text" name="ShelfLocation" value={newBook.ShelfLocation} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Cover Image:</label>
          <input type="file" name="coverImage" accept="image/*" onChange={handleFileChange} />
        </div>

        <div className="button-group">
          <button type="button" onClick={navigateToHome} className="btn-secondary">Back to Home</button>
          <button type="submit" className="btn-primary">Confirm</button>
        </div>
      </form>
    </div>
  );
};

export default AddBook;
