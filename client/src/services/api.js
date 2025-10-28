// API service for volunteer management system

const API = {
  // Auth API calls
  login: async (email, password) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      return await response.json();
    } catch (error) {
      console.error('Login API error:', error);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      return await response.json();
    } catch (error) {
      console.error('Register API error:', error);
      throw error;
    }
  },

  // Profile API calls
  getUserProfile: async (userId) => {
    try {
      const response = await fetch(`/api/profile/${userId}`);
      return await response.json();
    } catch (error) {
      console.error('Get profile API error:', error);
      throw error;
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      return await response.json();
    } catch (error) {
      console.error('Update profile API error:', error);
      throw error;
    }
  },

  // States and Skills API calls
  getStates: async () => {
    try {
      const response = await fetch('/api/states');
      return await response.json();
    } catch (error) {
      console.error('Get states API error:', error);
      throw error;
    }
  },

  getSkills: async () => {
    try {
      const response = await fetch('/api/skills');
      return await response.json();
    } catch (error) {
      console.error('Get skills API error:', error);
      throw error;
    }
  },

  // Events API calls
  getEvents: async () => {
    try {
      const response = await fetch('/api/events');
      return await response.json();
    } catch (error) {
      console.error('Get events API error:', error);
      throw error;
    }
  },

  createEvent: async (eventData) => {
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });
      return await response.json();
    } catch (error) {
      console.error('Create event API error:', error);
      throw error;
    }
  },

  updateEvent: async (eventId, eventData) => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });
      return await response.json();
    } catch (error) {
      console.error('Update event API error:', error);
      throw error;
    }
  },

  deleteEvent: async (eventId) => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE'
      });
      return await response.json();
    } catch (error) {
      console.error('Delete event API error:', error);
      throw error;
    }
  },

  // Volunteer matching API calls
  getVolunteerMatches: async () => {
    try {
      const response = await fetch('/api/volunteer-matches');
      return await response.json();
    } catch (error) {
      console.error('Get volunteer matches API error:', error);
      throw error;
    }
  },

  createVolunteerMatch: async (matchData) => {
    try {
      const response = await fetch('/api/volunteer-matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(matchData)
      });
      return await response.json();
    } catch (error) {
      console.error('Create volunteer match API error:', error);
      throw error;
    }
  },

  // History API calls
  getVolunteerHistory: async (userId) => {
    try {
      const endpoint = userId ? `/api/volunteer-history/${userId}` : '/api/volunteer-history/all';
      const response = await fetch(endpoint);
      return await response.json();
    } catch (error) {
      console.error('Get volunteer history API error:', error);
      throw error;
    }
  },

  // Notifications API calls
  getNotifications: async (userId) => {
    try {
      const response = await fetch(`/api/notifications/${userId}`);
      return await response.json();
    } catch (error) {
      console.error('Get notifications API error:', error);
      throw error;
    }
  },

  markNotificationRead: async (notificationId) => {
    try {
      const response = await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ NotificationID: notificationId })
      });
      return await response.json();
    } catch (error) {
      console.error('Mark notification read API error:', error);
      throw error;
    }
  },

  getUnreadCount: async (userId) => {
    try {
      const response = await fetch(`/api/notifications/unread/${userId}`);
      return await response.json();
    } catch (error) {
      console.error('Get unread count API error:', error);
      throw error;
    }
  }
};

export default API;