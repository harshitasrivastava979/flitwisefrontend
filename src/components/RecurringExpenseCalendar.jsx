import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Repeat,
  DollarSign
} from 'lucide-react';
import { getExpenses } from '../services/expenseService';

export default function RecurringExpenseCalendar({ groupId }) {
  const [recurringExpenses, setRecurringExpenses] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecurringExpenses();
  }, [groupId]);

  const fetchRecurringExpenses = async () => {
    try {
      setLoading(true);
      const response = await getExpenses(groupId);
      const allExpenses = response.data || [];
      
      // Filter recurring expenses
      const recurring = allExpenses.filter(expense => expense.recurring);
      setRecurringExpenses(recurring);
    } catch (err) {
      setError('Failed to fetch recurring expenses');
      console.error('Error fetching recurring expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getExpensesForDay = (day) => {
    return recurringExpenses.filter(expense => {
      if (!expense.nextDueDate) return false;
      
      const dueDate = new Date(expense.nextDueDate);
      return dueDate.getDate() === day && 
             dueDate.getMonth() === currentDate.getMonth() && 
             dueDate.getFullYear() === currentDate.getFullYear();
    });
  };

  const getUpcomingExpenses = () => {
    const today = new Date();
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    return recurringExpenses.filter(expense => {
      if (!expense.nextDueDate) return false;
      
      const dueDate = new Date(expense.nextDueDate);
      return dueDate >= today && dueDate <= endOfMonth;
    }).sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate));
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading calendar...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = getFirstDayOfMonth(currentDate);
  const upcomingExpenses = getUpcomingExpenses();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Recurring Expense Calendar</h2>
          <p className="text-gray-600 mt-1">View your recurring expenses by month</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            <Repeat className="w-4 h-4 mr-1" />
            {recurringExpenses.length} Active
          </span>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex justify-between items-center bg-white rounded-lg shadow border border-gray-200 p-4">
        <button
          onClick={goToPreviousMonth}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-gray-900">{getMonthName(currentDate)}</h3>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm font-medium text-teal-600 bg-teal-50 rounded-md hover:bg-teal-100 transition-colors"
          >
            Today
          </button>
        </div>
        
        <button
          onClick={goToNextMonth}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        {/* Calendar Header */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="px-3 py-2 text-center text-sm font-medium text-gray-700">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {/* Empty cells for days before the first day of the month */}
          {Array.from({ length: firstDayOfMonth }, (_, index) => (
            <div key={`empty-${index}`} className="h-24 border-r border-b border-gray-200 bg-gray-50"></div>
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }, (_, index) => {
            const day = index + 1;
            const expenses = getExpensesForDay(day);
            const isToday = new Date().getDate() === day && 
                           new Date().getMonth() === currentDate.getMonth() && 
                           new Date().getFullYear() === currentDate.getFullYear();
            
            return (
              <div 
                key={day} 
                className={`h-24 border-r border-b border-gray-200 p-1 ${
                  isToday ? 'bg-teal-50' : ''
                }`}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isToday ? 'text-teal-600' : 'text-gray-900'
                }`}>
                  {day}
                </div>
                
                {expenses.map((expense, expIndex) => (
                  <div 
                    key={expense.id} 
                    className="text-xs bg-blue-100 text-blue-800 rounded px-1 py-0.5 mb-1 truncate flex items-center"
                    title={`${expense.description} - ₹${expense.amount}`}
                  >
                    <Repeat className="w-2 h-2 mr-1 flex-shrink-0" />
                    <span className="truncate">{expense.description}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Expenses List */}
      {upcomingExpenses.length > 0 && (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CalendarIcon className="w-5 h-5 mr-2" />
            Upcoming This Month
          </h3>
          
          <div className="space-y-3">
            {upcomingExpenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Repeat className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{expense.description}</p>
                    <p className="text-sm text-gray-600">
                      Due: {new Date(expense.nextDueDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">₹{expense.amount}</p>
                  <p className="text-xs text-gray-500">{expense.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Recurring Expenses Message */}
      {recurringExpenses.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-200">
          <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No recurring expenses yet</h3>
          <p className="text-gray-600 mb-4">Create your first recurring expense to see it in the calendar</p>
          <button className="bg-teal-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-700">
            Add Recurring Expense
          </button>
        </div>
      )}
    </div>
  );
} 