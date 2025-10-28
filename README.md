# VolunteerConnect - Volunteer Management System

A comprehensive volunteer management platform that connects volunteers with meaningful opportunities in their community.

## About 
VolunteerConnect is a full-stack volunteer management system that allows volunteers to register, complete their profiles, and sign up for events. Administrators can create events, match volunteers to suitable opportunities, and track volunteer participation history.

## Technologies Used

### Frontend
![React](https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=white&style=flat-square)

### Backend
![Node.js](https://img.shields.io/badge/-Node.js-339933?logo=node.js&logoColor=white&style=flat-square) 

### Database
![MySQL](https://img.shields.io/badge/-MySQL-4479A1?logo=mysql&logoColor=white&style=flat-square) 

### Email Service
![Nodemailer](https://img.shields.io/badge/-Nodemailer-339933?logo=nodemailer&logoColor=white&style=flat-square)

## System Requirements

### Prerequisites
1. **Node.js and npm** - Use the `setup-nodejs.bat` file or download from [https://nodejs.org/](https://nodejs.org/)
2. **MySQL Server** - Running on localhost:3306
   - Database: `volunteer_management`
   - Username: `root`
   - Password: `!Mm042326323`

### Database Setup
1. Start your MySQL server
2. Create the database and tables:
   ```bash
   mysql -u root -p"!Mm042326323" < sql/volunteer_management.sql
   ```

## Quick Start

### Easy Start (Recommended)
1. **Start Backend Server**: Double-click `start-server.bat`
2. **Start Email Service**: Double-click `start-email-service.bat`
3. **Start Frontend**: Double-click `start-client.bat`

### Manual Start
```bash
# Terminal 1 - Backend server
cd server
npm install
npm start

# Terminal 2 - Email service
cd server
npm run email-service

# Terminal 3 - Frontend client
cd client
npm install
npm start
```

### Application URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Email Service**: http://localhost:3001

## System Architecture

### Backend Modules

1. **Login Module**
   - User authentication and registration
   - Password validation
   - Session management

2. **User Profile Management Module**
   - Profile creation and updates
   - Skills and preferences management
   - Availability tracking

3. **Event Management Module**
   - Event creation and management
   - Required skills specification
   - Event status tracking

4. **Volunteer Matching Module**
   - Smart matching based on skills and availability
   - Match status tracking
   - Automated notifications

5. **Notification Module**
   - Email notifications for assignments
   - Event reminders and updates
   - Real-time notification system

6. **Volunteer History Module**
   - Participation tracking
   - Hours logging
   - Historical reporting

### Frontend Components

1. **Authentication System**
   - Login/Register forms with validation
   - Role-based access control

2. **User Profile Management**
   - Complete profile forms with:
     - Full Name (50 characters, required)
     - Address fields with validation
     - State dropdown (2-character codes)
     - Zip code (5-9 characters)
     - Multi-select skills dropdown
     - Preferences text area
     - Availability date picker

3. **Event Management (Admin)**
   - Event creation form with:
     - Event Name (100 characters, required)
     - Description (text area, required)
     - Location (text area, required)
     - Required Skills (multi-select, required)
     - Urgency dropdown (required)
     - Event Date (calendar picker)

4. **Volunteer Matching (Admin)**
   - Auto-populated volunteer lists
   - Skill-based event matching
   - One-click volunteer assignment

5. **Notification System**
   - Real-time notification display
   - Email integration
   - Assignment and reminder notifications

6. **Volunteer History**
   - Tabular participation history
   - Status tracking
   - Hours volunteered

### Database Schema

#### Core Tables
- **UserCredentials**: Login information with encrypted passwords
- **UserProfile**: Detailed user information and location
- **EventDetails**: Complete event information
- **VolunteerHistory**: Participation tracking
- **States**: State codes and names for dropdown

#### Supporting Tables
- **UserSkill**: Multi-select skills
- **UserPreference**: Text preferences
- **UserAvailability**: Date/time availability
- **EventRequiredSkill**: Event skill requirements
- **VolunteerMatches**: Volunteer-event assignments
- **Notifications**: System notifications

## Validation Features

### Frontend Validations
- Required field validation
- Character length limits (50, 100 chars)
- Email format validation
- Zip code format (5-9 characters)
- Date validation
- Multi-select requirements

### Backend Validations
- Data type validation
- SQL injection prevention
- Input sanitization
- Foreign key constraints

## Default Login Credentials

### Admin Account
- **Email**: admin@volunteer.com
- **Password**: admin123

### Test Volunteer Account
- **Email**: volunteer@test.com
- **Password**: volunteer123

## Features

### For Volunteers
- ✅ Simple registration and login
- ✅ Complete profile management
- ✅ Event browsing and signup
- ✅ Real-time notifications
- ✅ Participation history tracking

### For Administrators
- ✅ Event creation and management
- ✅ Volunteer-event matching
- ✅ Participant tracking
- ✅ Notification management
- ✅ Comprehensive reporting

### System Features
- ✅ Email notification service
- ✅ Skill-based matching
- ✅ Real-time updates
- ✅ Mobile-responsive design
- ✅ Data validation throughout

## Support

For technical issues or questions about the volunteer management system, please check the console logs in your browser's developer tools and the server terminal output for detailed error messages.