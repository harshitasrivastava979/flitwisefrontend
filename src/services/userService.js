import api from './api';

// Get all users
export const getAllUsers = () => api.get('/api/users');

// Get user by ID
export const getUserById = (userId) => api.get(`/api/users/${userId}`);

// Update user profile
export const updateUserProfile = (userId, userData) => api.put(`/api/users/${userId}`, userData);

// Note: The following endpoints don't exist in the backend yet, so they're commented out
// Get user groups
// export const getUserGroups = (userId) => api.get(`/api/users/${userId}/groups`);

// Get user expenses
// export const getUserExpenses = (userId) => api.get(`/api/users/${userId}/expenses`);

// Get user summary/statistics
// export const getUserSummary = (userId) => api.get(`/api/users/${userId}/summary`);

// Search users
// export const searchUsers = (query) => api.get(`/api/users/search?q=${encodeURIComponent(query)}`); 