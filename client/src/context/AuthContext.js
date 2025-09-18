import React, { createContext, useState, useContext } from 'react';
import API from '../services/api';

// Create the authentication context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  // Login function
  const login = async (email, password) => {
    try {
      const data = await API.login(email, password);
      
      if (data.success) {
        setIsLoggedIn(true);
        setUserData(data.user);
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error || 'Invalid credentials' };
      }
    } catch (error) {
      console.error('Error during login:', error);
      return { success: false, error: 'An error occurred while logging in.' };
    }
  };

  // Logout function
  const logout = () => {
    setIsLoggedIn(false);
    setUserData(null);
  };

  // Register function
  const register = async (userData) => {
    try {
      const data = await API.register(userData);
      return data;
    } catch (error) {
      console.error('Error during registration:', error);
      return { success: false, error: 'An error occurred while registering.' };
    }
  };

  // Values to provide to consumers of this context
  const value = {
    isLoggedIn,
    userData,
    login,
    logout,
    register
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
