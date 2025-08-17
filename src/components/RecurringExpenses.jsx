import React, { useState, useEffect } from 'react';
import { 
  Repeat, 
  Calendar, 
  DollarSign, 
  Edit, 
  Trash2, 
  Plus,
  Clock,
  AlertCircle
} from 'lucide-react';
import { getExpenses } from '../services/expenseService';

export default function RecurringExpenses({ groupId }) {
  const [recurringExpenses, setRecurringExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'recurring', 'one-time'

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

  const getIntervalLabel = (interval) => {
    const labels = {
      'DAILY': 'Daily',
      'WEEKLY': 'Weekly', 
      'MONTHLY': 'Monthly',
      'YEARLY': 'Yearly'
    };
    return labels[interval] || interval;
  };

  const getDaysUntilDue = (nextDueDate) => {
    if (!nextDueDate) return null;
    
    const dueDate = new Date(nextDueDate);
    const today = new Date();
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { days: Math.abs(diffDays), status: 'overdue' };
    } else if (diffDays === 0) {
      return { days: 0, status: 'today' };
    } else if (diffDays <= 3) {
      return { days: diffDays, status: 'soon' };
    } else {
      return { days: diffDays, status: 'normal' };
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'overdue': return 'text-red-600 bg-red-50 border-red-200';
      case 'today': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'soon': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'overdue': return <AlertCircle className="w-4 h-4" />;
      case 'today': return <Clock className="w-4 h-4" />;
      case 'soon': return <Clock className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading recurring expenses...</p>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Recurring Expenses</h2>
          <p className="text-gray-600 mt-1">Manage your monthly and recurring expenses</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            <Repeat className="w-4 h-4 mr-1" />
            {recurringExpenses.length} Active
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Repeat className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Recurring</p>
              <p className="text-2xl font-bold text-gray-900">{recurringExpenses.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Monthly Total</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{recurringExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Due This Week</p>
              <p className="text-2xl font-bold text-gray-900">
                {recurringExpenses.filter(exp => {
                  const dueInfo = getDaysUntilDue(exp.nextDueDate);
                  return dueInfo && dueInfo.days <= 7 && dueInfo.status !== 'overdue';
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recurring Expenses List */}
      {recurringExpenses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-200">
          <Repeat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No recurring expenses yet</h3>
          <p className="text-gray-600 mb-4">Create your first recurring expense to start tracking</p>
          <button className="bg-teal-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-700">
            Add Recurring Expense
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {recurringExpenses.map((expense) => {
            const dueInfo = getDaysUntilDue(expense.nextDueDate);
            
            return (
              <div key={expense.id} className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {/* Header with title and recurring badge */}
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{expense.description}</h3>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Repeat className="w-3 h-3 mr-1" />
                        {getIntervalLabel(expense.interval)}
                      </span>
                    </div>

                    {/* Amount */}
                    <div className="text-2xl font-bold text-gray-900 mb-3">
                      ₹{parseFloat(expense.amount).toFixed(2)}
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Next Due: {expense.nextDueDate ? new Date(expense.nextDueDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : 'Not set'}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Created: {new Date(expense.timestamp).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>

                      {expense.category && (
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                          <span>{expense.category}</span>
                        </div>
                      )}

                      {dueInfo && (
                        <div className={`flex items-center space-x-2 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(dueInfo.status)}`}>
                          {getStatusIcon(dueInfo.status)}
                          <span>
                            {dueInfo.status === 'overdue' && `${dueInfo.days} days overdue`}
                            {dueInfo.status === 'today' && 'Due today'}
                            {dueInfo.status === 'soon' && `Due in ${dueInfo.days} days`}
                            {dueInfo.status === 'normal' && `Due in ${dueInfo.days} days`}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    {expense.notes && (
                      <p className="text-sm text-gray-600 mt-3 italic">
                        "{expense.notes}"
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => console.log('Edit expense:', expense.id)}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit expense"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => console.log('Delete expense:', expense.id)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete expense"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 