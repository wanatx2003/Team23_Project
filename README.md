# Team 7 Library Database Project

This project was created for the course Database Systems (3380) at the University of Houston. The objective of our design was to create a library database website named BookFinder where users such as Faculty, Admin, and Student are able to use the library website.

## About 
BookFinder is our custom-made library management system made for a university, which have users such as students, faculty, and administrators. It provides them a digital interface for browsing and managing books, music, and electronics. Since there are three roles with different access to the website, there will exist special features where each role has different checkouts, waitlists, fines, and admin tasks. The website will have triggers and data reports.

## Technologies Used:

### Frontend
![React](https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=white&style=flat-square) &nbsp;&nbsp; ![Tailwind CSS](https://img.shields.io/badge/-Tailwind%20CSS-38B2AC?logo=tailwind-css&logoColor=white&style=flat-square)


### Backend
![Node.js](https://img.shields.io/badge/-Node.js-339933?logo=node.js&logoColor=white&style=flat-square) 

### Database
![MySQL](https://img.shields.io/badge/-MySQL-4479A1?logo=mysql&logoColor=white&style=flat-square) 

### Version Control:
![GitHub](https://img.shields.io/badge/-GitHub-181717?logo=github&logoColor=white&style=flat-square)

### Deployment
![Oracle](https://img.shields.io/badge/-Oracle-F80000?logo=oracle&logoColor=white&style=flat-square) &nbsp;&nbsp; ![Oracle](https://img.shields.io/badge/-Oracle-F80000?logo=oracle&logoColor=white&style=flat-square) &nbsp;&nbsp; ![Azure](https://img.shields.io/badge/-Azure-0078D4?logo=microsoft-azure&logoColor=white&style=flat-square)

## How to host website locally

### Cloning the repository
```bash
git clone https://github.com/dahrail/Library-Database
cd client
code .
```

### Deploying the website
```bash
cd client
npx create-react-app .
npm install react-scripts
npm start
```

### Deploying the backend/server
```bash
Backend:
cd server
npm install react react-dom
npm start
```

Deployed Website: http://170.9.244.55:3000/

## 5 Must Haves

1. **User authentication for different user roles**
   - The system supports authentication for Students, Faculty, and Admins, each with different permissions and access levels.

2. **Data entry forms**
   - The application provides forms to add, update, and delete data for books, media, devices, rooms, events, and users. Admins can manage inventory and user records through intuitive interfaces.

3. **Triggers (At least 2)**
   - The backend database implements triggers, such as:
     - Automatically generating a fine when an item is overdue.
     - Updating item availability when a loan is returned or a reservation is cancelled.

4. **Data queries (At least 3)**
   - The application executes various queries, including:
     - Retrieving available items by category and genre.
     - Fetching user loan and fine history.
     - Searching and filtering items and users based on multiple criteria.

5. **Data reports (At least 3)**
   - The admin dashboard features multiple reports:
     - **Item Report:** Usage statistics for books, media, and devices (borrows, holds, etc.).
     - **User Report:** User activity, loan history, and borrowing patterns.
     - **Fines Report:** Fines data with payment status tracking.
     - **Event Report:** Attendance, check-in rates, and room utilization for events.

## Project Functionality

BookFinder provides a comprehensive library management system with the following features:

### User Authentication and Role Management
- **Students**: Can borrow two item per category with a one-week checkout period
- **Faculty**: Can borrow three items per category with a two-week checkout period
- **Admins**: Have complete control over inventory management and reporting

### Inventory Management
- Books, media, and electronics cataloging
- ISBN validation ensures accurate book information
- Inventory tracking for available and checked-out items
- Detailed item information including publication dates, authors, and genres

### Borrowing System
- Check out and check in functionality
- Reservation system for unavailable items
- Waitlist management with automatic notifications
- Due date tracking and reminders

### Reporting and Analytics
- Fines reporting with payment status tracking
- Item usage statistics showing popular materials
- User activity reports for administrative oversight
- Event attendance and registration tracking

### Room and Event Management
- Room reservation system
- Event scheduling and management
- Attendance tracking for library events
- Room utilization reporting

### Financial Management
- Fine calculation based on overdue items
- Payment processing and tracking
- Outstanding balance reporting