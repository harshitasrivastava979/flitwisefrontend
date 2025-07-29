import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext.jsx';
import Dashboard from './pages/HomePage.jsx';
import Groups from './components/Groups.jsx';
import Expenses from './components/Activity.jsx';
import Budget from './pages/Budget.jsx';
import Profile from './pages/Profile.jsx';
import LoginPage from './pages/LoginPage.jsx';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected routes - redirect to login if not authenticated */}
        <Route path="/" element={
          isAuthenticated() ? <Dashboard /> : <Navigate to="/login" replace />
        } />
        <Route path="/groups" element={
          isAuthenticated() ? <Groups /> : <Navigate to="/login" replace />
        } />
        <Route path="/expenses" element={
          isAuthenticated() ? <Expenses /> : <Navigate to="/login" replace />
        } />
        <Route path="/budget" element={
          isAuthenticated() ? <Budget /> : <Navigate to="/login" replace />
        } />
        <Route path="/profile" element={
          isAuthenticated() ? <Profile /> : <Navigate to="/login" replace />
        } />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;