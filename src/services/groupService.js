import api from './api';
 
// Create a new group
export const createGroup = (data) => api.post('/api/createGroup', data);

// Get all groups
export const getGroups = () => api.get('/api/groups');

// Delete a group
export const deleteGroup = (groupId) => api.delete(`/api/groups/${groupId}`);

// Add an expense to a group
export const addExpense = (data) => api.post('/api/addExpense', data);

// Settle up for a group
export const settleUp = (groupId, userId) => api.get(`/api/settleUp/${groupId}/${userId}`);

// Get expenses with filters
export const getExpenses = (groupId, category, startDate, endDate) => {
  const params = new URLSearchParams();
  params.append('groupId', groupId);
  if (category) params.append('category', category);
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  return api.get(`/api/expenses?${params.toString()}`);
};

// Mark group as settled
export const markGroupSettled = (data) => api.post(`/api/${data.groupId}/settled`, data); 