import api from './api';
 
export const login = async (credentials) => {
  const response = await api.post('/api/auth/login', credentials);
  return response;
};

export const register = async (data) => {
  const response = await api.post('/api/auth/register', data);
  return response;
};

// Helper function to extract token from login response
export const extractTokenFromResponse = (response) => {
  // Adjust this based on your backend response structure
  return response.data.token || response.data.jwt || response.data.accessToken;
}; 