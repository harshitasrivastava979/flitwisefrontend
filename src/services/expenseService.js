import api from './api';
 
// Get expenses with filters
export const getExpenses = (groupId, category, startDate, endDate) => {
  const params = new URLSearchParams();
  params.append('groupId', groupId || 1); // Default to group 1 if not provided
  if (category) params.append('category', category);
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  return api.get(`/expenses?${params.toString()}`);
};

// Add an expense to a group
export const addExpense = (data) => api.post('/addExpense', data); 