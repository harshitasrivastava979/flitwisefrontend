import api from './api';

// Create or update a budget
export const createBudget = (data) => api.post('/api/budget', data);

// Get budget by ID
export const getBudget = (budgetId) => api.get(`/api/budget/${budgetId}`);

// Delete a budget
export const deleteBudget = (budgetId) => api.delete(`/api/budget/${budgetId}`);

// Get all budgets for a user in a specific month/year
export const getUserBudgets = (userId, month, year) => {
  const params = new URLSearchParams();
  if (month) params.append('month', month);
  if (year) params.append('year', year);
  return api.get(`/api/budget/user/${userId}?${params.toString()}`);
};

// Get budget summary for a user
export const getBudgetSummary = (userId, month, year) => {
  const params = new URLSearchParams();
  if (month) params.append('month', month);
  if (year) params.append('year', year);
  return api.get(`/api/budget/summary/${userId}?${params.toString()}`);
};

// Get budgets nearing limit for a user
export const getNearingLimit = (userId, month, year) => {
  const params = new URLSearchParams();
  if (month) params.append('month', month);
  if (year) params.append('year', year);
  return api.get(`/api/budget/nearing-limit/${userId}?${params.toString()}`);
};

// Get exceeded budgets for a user
export const getExceededBudgets = (userId, month, year) => {
  const params = new URLSearchParams();
  if (month) params.append('month', month);
  if (year) params.append('year', year);
  return api.get(`/api/budget/exceeded/${userId}?${params.toString()}`);
}; 