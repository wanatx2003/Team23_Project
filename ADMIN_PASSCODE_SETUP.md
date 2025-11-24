# Admin Security Passcode - Quick Setup

## Default Configuration

The system comes with a default admin passcode: **`775512`**

⚠️ **Important**: This passcode should be changed if needed for security!

## How to Change Admin Passcode

### Option 1: Using Environment Variable (Recommended)

1. Navigate to the server directory:
```bash
cd server
```

2. Create a `.env` file (if it doesn't exist):
```bash
cp .env.example .env
```

3. Edit `.env` and set your custom passcode:
```
ADMIN_PASSCODE=YourCustomSecurePasscode123!
```

4. Restart the server for changes to take effect

### Option 2: Direct Code Change (Not Recommended)

Edit `server/routes/authRoutes.js` line 8:
```javascript
const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || 'YOUR_NEW_PASSCODE';
```

## How Admin Registration Works

1. User goes to registration page
2. User selects **"Administrator"** from Account Type dropdown
3. **Admin Security Passcode** field appears automatically
4. User enters the correct admin passcode
5. Backend validates the passcode before creating admin account
6. If passcode is incorrect, registration is rejected with error message

## Testing Admin Registration

### Test with Default Passcode:
- Email: `admin@test.com`
- Password: `password123`
- Role: **Administrator**
- Admin Passcode: `775512`

### Test with Wrong Passcode:
- Should see error: "Invalid admin security passcode"

### Test Volunteer Registration:
- No passcode required when selecting "Volunteer" role

## Security Best Practices

1. ✅ Use a strong, unique passcode (mix of letters, numbers, symbols)
2. ✅ Change the default passcode immediately in production
3. ✅ Share passcode only with authorized administrators via secure channels
4. ✅ Rotate passcode periodically (e.g., every 6 months)
5. ✅ Never commit `.env` file to version control
6. ✅ Keep `.env` in `.gitignore`
7. ✅ Log failed admin registration attempts for security monitoring

## Troubleshooting

**Issue**: Admin registration always fails
- **Solution**: Check if `.env` file exists and `ADMIN_PASSCODE` is set correctly

**Issue**: Can't find the passcode
- **Solution**: Check with your organization's system administrator or use default if in development

**Issue**: Want to disable admin passcode temporarily for testing
- **Solution**: Set `ADMIN_PASSCODE=` (empty) in `.env`, but remember to re-enable for production!

## Sharing Passcode with Team

When sharing the admin passcode with authorized administrators:

1. ✅ Use encrypted communication (Signal, encrypted email)
2. ✅ Share verbally in person when possible
3. ✅ Use temporary secure note services (expire after 1 view)
4. ❌ Don't send via regular email or Slack
5. ❌ Don't write it down in shared documents
6. ❌ Don't include in screenshots or documentation

---

**Current Default Passcode**: `775512`  
**Remember to keep this secure and share only with authorized administrators!**
