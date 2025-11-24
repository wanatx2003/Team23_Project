# Authentication System Refactor - Complete Guide

## Overview
The authentication system has been refactored to separate signup credentials from profile information. This change improves security and user experience by:
- Keeping authentication simple (email, password, phone number only)
- Moving personal information (name, address, skills) to profile completion stage
- Removing redundant FirstName/LastName fields from database
- **Admin role protection with security passcode requirement**

## Changes Made

### 1. Database Schema Changes

**Updated Table: UserCredentials**
- **REMOVED**: `FirstName VARCHAR(50)`, `LastName VARCHAR(50)`
- **KEPT**: `Username`, `Email`, `Password`, `PhoneNumber`, `Role`

**UserProfile Table (unchanged)**
- Contains `FullName` field for display purposes
- Contains address, city, state, zipcode
- Linked to UserCredentials via UserID

### 2. Backend Changes

#### authRoutes.js
- **Registration**: Now only accepts `email`, `password`, `phoneNumber`, `role`, `adminPasscode`
- **Admin Protection**: Validates admin passcode before allowing admin registration
- **Login**: Returns `UserID`, `Email`, `Role` (removed FirstName)
- Simplified validation and data handling

#### Updated Route Files
All SQL queries have been updated to remove FirstName/LastName:
- `volunteerRoutes.js` - Uses `FullName` from UserProfile
- `matchingRoutes.js` - Uses `FullName` from UserProfile  
- `eventRoutes.js` - Uses `Email` or `FullName` where needed
- `historyRoutes.js` - Uses `FullName` from UserProfile
- `userRoutes.js` - Uses `FullName` from UserProfile
- `volunteerReportRoutes.js` - Uses `FullName` from UserProfile

### 3. Frontend Changes

#### Register Component
**Removed Fields:**
- First Name input
- Last Name input
- Related validation

**Remaining Fields:**
- Email (Username)
- Password
- Confirm Password
- Phone Number (optional)
- Role (volunteer/admin)
- **Admin Security Passcode** (shown only when admin role is selected)

#### Updated Components
- `TopBar.js` - Displays email username instead of FirstName
- `VolunteerDashboard.js` - Generic welcome message
- `VolunteerMatching.js` - Uses FullName or Email as fallback
- `VolunteerHistory.js` - Uses FullName from profile
- `admin/VolunteerMatching.js` - Uses FullName or Email as fallback

#### App.js Flow
- After registration, user is automatically logged in
- User is redirected to profile completion page
- Profile page requires: FullName, Address, Skills, Availability

## Migration Guide

### For Existing Databases

1. **Backup your database first!**
```bash
mysqldump -u root -p volunteer_management > backup_before_migration.sql
```

2. **Run the migration script:**
```bash
mysql -u root -p volunteer_management < sql/migration_remove_names.sql
```

3. **Verify the changes:**
```sql
DESCRIBE UserCredentials;
-- Should NOT show FirstName or LastName columns
```

### For Fresh Installation

1. **Drop and recreate database:**
```bash
mysql -u root -p < sql
```

The main `sql` file has been updated with the new schema.

## User Experience Flow

### New User Registration

**For Volunteers:**
1. User fills out registration form (email, password, phone)
2. Selects "Volunteer" role
3. Account is created with credentials only
4. User is automatically logged in
5. User is redirected to profile completion page
6. User fills out: Full Name, Address, Skills, Availability
7. Profile is saved and user can now browse events

**For Admins:**
1. User fills out registration form (email, password, phone)
2. Selects "Administrator" role
3. **Admin Security Passcode field appears**
4. User enters the correct admin passcode (provided by organization)
5. Passcode is validated on backend
6. If valid, account is created with admin privileges
7. User is automatically logged in and redirected to profile completion

### Existing Users (After Migration)
- Users can still log in with existing credentials
- If profile is incomplete, they'll see a banner prompting profile completion
- Profile page will show empty fields for FullName if not previously set

## API Changes

### Registration Endpoint
**POST /api/auth/register**

**Before:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "phoneNumber": "1234567890",
  "role": "volunteer"
}
```

**After (Volunteer):**
```json
{
  "email": "john@example.com",
  "password": "password123",
  "phoneNumber": "1234567890",
  "role": "volunteer"
}
```

**After (Admin):**
```json
{
  "email": "admin@example.com",
  "password": "password123",
  "phoneNumber": "1234567890",
  "role": "admin",
  "adminPasscode": "ADMIN2024SECURE"
}
```

### Login Response
**POST /api/auth/login**

**Before:**
```json
{
  "success": true,
  "user": {
    "UserID": 1,
    "FirstName": "John",
    "Role": "volunteer"
  }
}
```

**After:**
```json
{
  "success": true,
  "user": {
    "UserID": 1,
    "Email": "john@example.com",
    "Role": "volunteer"
  }
}
```

## Testing Checklist

- [ ] New volunteer can register with email, password, phone
- [ ] Admin registration shows passcode field when admin role selected
- [ ] Admin registration rejects incorrect passcode
- [ ] Admin registration succeeds with correct passcode
- [ ] Registration redirects to profile completion
- [ ] Profile page saves FullName correctly
- [ ] TopBar displays email username
- [ ] Dashboard shows generic welcome message
- [ ] Volunteer matching displays FullName or email
- [ ] Reports generate correctly with FullName
- [ ] History shows FullName for all volunteers
- [ ] Existing users can still log in
- [ ] Database migration completes without errors

## Rollback Plan

If issues occur, restore from backup:
```bash
mysql -u root -p volunteer_management < backup_before_migration.sql
```

Then revert code changes:
```bash
git revert <commit-hash>
```

## Benefits

1. **Separation of Concerns**: Authentication credentials separate from profile data
2. **Privacy**: Personal information collected only when user is ready
3. **Flexibility**: Users can update their display name in profile without affecting login
4. **Database Normalization**: Removed redundant name fields (FullName in UserProfile is sufficient)
5. **Simplified Registration**: Faster signup process with fewer fields
6. **Admin Security**: Protected admin role with passcode verification to prevent unauthorized admin accounts

## Security Configuration

### Setting Admin Passcode

1. **Create .env file in server directory:**
```bash
cd server
cp .env.example .env
```

2. **Edit .env and set your secure admin passcode:**
```
ADMIN_PASSCODE=YourSecurePasscode123!
```

3. **Default Passcode** (if .env not configured):
   - Default: `ADMIN2024SECURE`
   - **Important**: Change this in production!

4. **Best Practices:**
   - Use a strong, unique passcode
   - Share only with authorized administrators
   - Change periodically
   - Never commit .env file to version control

## Notes

- All queries now use LEFT JOIN with UserProfile to gracefully handle incomplete profiles
- Frontend components have fallback to display email if FullName is not available
- Profile completion is encouraged but not strictly enforced (banner notification)
- Phone number remains optional during registration
- **Admin passcode is validated server-side for security**
- **Passcode field only appears when admin role is selected in registration form**
