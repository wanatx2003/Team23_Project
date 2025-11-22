import React, { useState, useEffect } from 'react';
import '../../styles/admin/UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching users from /api/admin/users...');
      
      const response = await fetch('/api/admin/users');
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Data received:', data);
      
      if (data.success) {
        setUsers(data.users || []);
        setError('');
      } else {
        setError(data.error || 'Failed to fetch users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(`Error loading users: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      const response = await fetch('/api/admin/users/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ UserID: userId, AccountStatus: newStatus })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setUsers(users.map(user => 
          user.UserID === userId ? { ...user, AccountStatus: newStatus } : user
        ));
      } else {
        alert('Failed to update user status');
      }
    } catch (err) {
      console.error('Error updating user status:', err);
      alert('Error updating user status');
    }
  };

  const getFilteredAndSortedUsers = () => {
    let filtered = users.filter(user => {
      const matchesSearch = 
        (user.FullName && user.FullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.Username && user.Username.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesRole = filterRole === 'all' || user.Role === filterRole;
      const matchesStatus = filterStatus === 'all' || user.AccountStatus === filterStatus;
      
      return matchesSearch && matchesRole && matchesStatus;
    });

    // Sort users
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.FullName || '').localeCompare(b.FullName || '');
        case 'username':
          return (a.Username || '').localeCompare(b.Username || '');
        case 'role':
          return (a.Role || '').localeCompare(b.Role || '');
        default:
          return 0;
      }
    });

    return filtered;
  };

  const filteredUsers = getFilteredAndSortedUsers();

  if (loading) {
    return (
      <div className="user-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-management">
      <div className="user-management-header">
        <div className="header-top">
          <h1>User Management</h1>
          <div className="user-stats">
            <div className="stat-card">
              <span className="stat-number">{users.length}</span>
              <span className="stat-label">Total Users</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{users.filter(u => u.Role === 'volunteer').length}</span>
              <span className="stat-label">Volunteers</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{users.filter(u => u.Role === 'admin').length}</span>
              <span className="stat-label">Admins</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{users.filter(u => u.AccountStatus === 'Active').length}</span>
              <span className="stat-label">Active</span>
            </div>
          </div>
        </div>

        <div className="filters-container">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by name or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>

          <div className="filter-group">
            <label>Role:</label>
            <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
              <option value="all">All Roles</option>
              <option value="volunteer">Volunteer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Status:</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="name">Name (A-Z)</option>
              <option value="username">Username (A-Z)</option>
              <option value="role">Role</option>
            </select>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Full Name</th>
              <th>Username</th>
              <th>Role</th>
              <th>Account Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">
                  No users found matching your criteria
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user.UserID} className={user.AccountStatus === 'Suspended' ? 'suspended-row' : ''}>
                  <td className="user-id">#{user.UserID}</td>
                  <td className="user-name">
                    <strong>{user.FullName || 'N/A'}</strong>
                  </td>
                  <td className="user-username">{user.Username}</td>
                  <td>
                    <span className={`role-badge ${user.Role}`}>
                      {user.Role === 'admin' ? '👑 Admin' : '🙋 Volunteer'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${user.AccountStatus.toLowerCase()}`}>
                      {user.AccountStatus}
                    </span>
                  </td>
                  <td className="actions-cell">
                    {user.Role !== 'admin' && (
                      <select
                        value={user.AccountStatus}
                        onChange={(e) => handleStatusChange(user.UserID, e.target.value)}
                        className="status-dropdown"
                      >
                        <option value="Active">Active</option>
                        <option value="Suspended">Suspended</option>
                      </select>
                    )}
                    {user.Role === 'admin' && (
                      <span className="admin-label">Admin Account</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <p>Showing {filteredUsers.length} of {users.length} users</p>
      </div>
    </div>
  );
};

export default UserManagement;
