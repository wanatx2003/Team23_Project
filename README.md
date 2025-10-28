# Volunteer Management System

This project was created as a comprehensive volunteer management platform where volunteers and administrators can connect, manage events, and track volunteer activities.

## About 
This is a custom-made volunteer management system that allows volunteers to register, complete their profiles, and sign up for events. Administrators can create events, match volunteers to suitable opportunities, and track volunteer participation history.

## Technologies Used:

### Frontend
![React](https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=white&style=flat-square)

### Backend
![Node.js](https://img.shields.io/badge/-Node.js-339933?logo=node.js&logoColor=white&style=flat-square) 

### Database
![MySQL](https://img.shields.io/badge/-MySQL-4479A1?logo=mysql&logoColor=white&style=flat-square) 

### Version Control:
![GitHub](https://img.shields.io/badge/-GitHub-181717?logo=github&logoColor=white&style=flat-square)

## Local Setup Instructions

### Prerequisites
1. **Node.js and npm** - Use the `setup-nodejs.bat` file or download from [https://nodejs.org/](https://nodejs.org/)
2. **MySQL Server** - Make sure MySQL is running on localhost:3306
   - Database: `volunteer_management`
   - Username: `root`
   - Password: `!Mm042326323`

### Database Setup
1. Start your MySQL server
2. Create the database and tables using the provided SQL file:
   ```sql
   mysql -u root -p"!Mm042326323" < sql/volunteer_management.sql
   ```

### Running the Application

#### Easy Start (Recommended)
1. **Start Backend Server**: Double-click `start-server.bat`
2. **Start Email Service**: Double-click `start-email-service.bat`
3. **Start Frontend**: Double-click `start-client.bat`

#### Manual Start
```bash
# Terminal 1 - Start the backend server
cd server
npm install
npm start

# Terminal 2 - Start the email service
cd server
npm run email-service

# Terminal 3 - Start the frontend client
cd client
npm install
npm start
```

### Application URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Email Service**: http://localhost:3001

## System Features

### For Volunteers:
- **Registration & Login** - Simple email/password registration
- **Profile Management** - Complete profile with skills, location, and availability
- **Event Browsing** - View available volunteer opportunities
- **Notifications** - Receive updates about event assignments
- **Volunteer History** - Track participation and hours volunteered

### For Administrators:
- **Event Management** - Create and manage volunteer events
- **Volunteer Matching** - Match volunteers to events based on skills
- **Participant Tracking** - Monitor volunteer participation and history
- **Notification System** - Send updates to volunteers

### Database Schema
The system uses the following main tables:
- `UserCredentials` - User login information
- `UserProfile` - Detailed user profiles
- `UserSkill` - Volunteer skills
- `EventDetails` - Event information
- `VolunteerMatches` - Volunteer-event assignments
- `VolunteerHistory` - Participation tracking
- `Notifications` - System notifications

## Validation Features
- **Required Field Validation** - All forms validate required fields
- **Character Limits** - Enforced on frontend and backend
- **Email Format Validation** - Proper email format checking
- **Skill Matching** - Events matched based on required skills
- **Date Validation** - Proper date formatting and validation

## Email Notifications
The system includes an automated email service that sends:
- Welcome emails for new registrations
- Event assignment notifications
- Reminder emails for upcoming events
- Status updates for event changes