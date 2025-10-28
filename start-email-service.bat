@echo off
ECHO =====================================
ECHO Volunteer Management - EMAIL SERVICE
ECHO =====================================
ECHO.

ECHO Checking if Node.js is installed...
where node >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    ECHO Node.js is not installed or not in your PATH.
    ECHO Please run setup-nodejs.bat first to install Node.js.
    PAUSE
    EXIT /B 1
)

ECHO Node.js found! Version:
node --version
ECHO.

ECHO Navigating to server directory...
cd server

ECHO Starting email notification service...
ECHO This service will check for notifications every 2 minutes.
ECHO.
call npm run email-service

PAUSE
