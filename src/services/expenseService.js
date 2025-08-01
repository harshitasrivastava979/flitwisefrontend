import api from './api';
 
// Get expenses with filters
export const getExpenses = (groupId, category, startDate, endDate) => {
  const params = new URLSearchParams();
  params.append('groupId', groupId || 1); // Default to group 1 if not provided
  if (category) params.append('category', category);
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  return api.get(`/api/expenses?${params.toString()}`);
};

// Add an expense to a group
export const addExpense = (data) => api.post('/api/addExpense', data);

// Note: The following endpoints don't exist in the backend yet, so they're commented out
// Get expense by ID
// export const getExpenseById = (expenseId) => api.get(`/api/expenses/${expenseId}`);

// Update an expense
// export const updateExpense = (expenseId, data) => api.put(`/api/expenses/${expenseId}`, data);

// Delete an expense
// export const deleteExpense = (expenseId) => api.delete(`/api/expenses/${expenseId}`);

// Get expenses by user
// export const getExpensesByUser = (userId, groupId) => {
//   const params = new URLSearchParams();
//   if (groupId) params.append('groupId', groupId);
//   return api.get(`/api/expenses/user/${userId}?${params.toString()}`);
// };

// Get expense statistics
// export const getExpenseStats = (groupId, period = 'month') => {
//   return api.get(`/api/expenses/stats/${groupId}?period=${period}`);
// }; 