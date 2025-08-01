import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext.jsx';
import { BudgetProvider } from './contexts/BudgetContext.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <BudgetProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected routes - redirect to login if not authenticated */}
          <Route path="/*" element={
            isAuthenticated() ? <HomePage /> : <Navigate to="/login" replace />
          } />
        </Routes>
      </BudgetProvider>
    </Router>
  );
}

export default App;