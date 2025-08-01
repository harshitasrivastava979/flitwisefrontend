import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  getUserBudgets, 
  getBudgetSummary, 
  createBudget, 
  deleteBudget,
  getExceededBudgets,
  getNearingLimit
} from '../services/budgetService';

const BudgetContext = createContext();

export const BudgetProvider = ({ children }) => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [summary, setSummary] = useState(null);
  const [exceededBudgets, setExceededBudgets] = useState([]);
  const [nearingLimitBudgets, setNearingLimitBudgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const fetchBudgets = async (month = currentMonth, year = currentYear) => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const [budgetsRes, summaryRes, exceededRes, nearingRes] = await Promise.all([
        getUserBudgets(user.id, month, year),
        getBudgetSummary(user.id, month, year),
        getExceededBudgets(user.id, month, year),
        getNearingLimit(user.id, month, year)
      ]);
      
      setBudgets(budgetsRes.data || []);
      setSummary(summaryRes.data || null);
      setExceededBudgets(exceededRes.data || []);
      setNearingLimitBudgets(nearingRes.data || []);
    } catch (err) {
      setError('Failed to fetch budgets: ' + (err.response?.data?.message || err.message));
      console.error('Error fetching budgets:', err);
    } finally {
      setLoading(false);
    }
  };

  const createNewBudget = async (budgetData) => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const budgetWithUser = {
        ...budgetData,
        userId: user.id
      };
      
      const response = await createBudget(budgetWithUser);
      
      // Refresh budgets after creation
      await fetchBudgets(currentMonth, currentYear);
      
      return response.data;
    } catch (err) {
      setError('Failed to create budget: ' + (err.response?.data?.message || err.message));
      console.error('Error creating budget:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteBudgetById = async (budgetId) => {
    try {
      setLoading(true);
      setError(null);
      
      await deleteBudget(budgetId);
      
      // Refresh budgets after deletion
      await fetchBudgets(currentMonth, currentYear);
    } catch (err) {
      setError('Failed to delete budget: ' + (err.response?.data?.message || err.message));
      console.error('Error deleting budget:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const changeMonth = (month, year) => {
    setCurrentMonth(month);
    setCurrentYear(year);
    fetchBudgets(month, year);
  };

  useEffect(() => {
    if (user?.id) {
      fetchBudgets();
    }
  }, [user]);

  const value = {
    budgets,
    summary,
    exceededBudgets,
    nearingLimitBudgets,
    loading,
    error,
    currentMonth,
    currentYear,
    createBudget: createNewBudget,
    deleteBudget: deleteBudgetById,
    fetchBudgets,
    changeMonth,
    clearError: () => setError(null)
  };

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
}; 