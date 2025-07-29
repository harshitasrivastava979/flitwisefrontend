import api from './api';
 
// Create a new group
export const createGroup = (data) => api.post('/createGroup', data);

// Get all users (temporary endpoint for groups)
export const getGroups = () => api.get('/api/users');

// Add an expense to a group
export const addExpense = (data) => api.post('/addExpense', data);

// Settle up for a group
export const settleUp = (groupId, userId) => api.get(`/settleUp/${groupId}/${userId}`);

// Get expenses with filters
export const getExpenses = (groupId, category, startDate, endDate) => {
  const params = new URLSearchParams();
  params.append('groupId', groupId);
  if (category) params.append('category', category);
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  return api.get(`/expenses?${params.toString()}`);
};

// Mark group as settled
export const markGroupSettled = (data) => api.post(`/${data.groupId}/settled`, data); 