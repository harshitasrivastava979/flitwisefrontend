import api from './api';

// Get all users
export const getAllUsers = () => api.get('/api/users');

// Get user by ID
export const getUserById = (userId) => api.get(`/api/users/${userId}`);

// Update user profile
export const updateUserProfile = (userId, userData) => api.put(`/api/users/${userId}`, userData); 