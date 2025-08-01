import React, { useState } from 'react';
import { 
  Plus, 
  Calendar,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { useBudget } from '../contexts/BudgetContext';
import BudgetSummary from '../components/budget/BudgetSummary';
import BudgetCard from '../components/budget/BudgetCard';
import BudgetForm from '../components/budget/BudgetForm';

export default function Budgets() {
  const {
    budgets,
    summary,
    exceededBudgets,
    nearingLimitBudgets,
    loading,
    error,
    currentMonth,
    currentYear,
    createBudget,
    deleteBudget,
    fetchBudgets,
    changeMonth,
    clearError
  } = useBudget();

  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i);

  const handleCreateBudget = async (budgetData) => {
    try {
      await createBudget(budgetData);
      setShowForm(false);
    } catch (error) {
      // Error is handled in the context
    }
  };

  const handleEditBudget = (budget) => {
    setEditingBudget(budget);
    setShowForm(true);
  };

  const handleDeleteBudget = async (budgetId) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await deleteBudget(budgetId);
      } catch (error) {
        // Error is handled in the context
      }
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingBudget(null);
  };

  const getStatusStats = () => {
    const onTrack = budgets.filter(b => {
      const percentage = b.monthlyLimit > 0 ? (b.amountSpent / b.monthlyLimit) * 100 : 0;
      return percentage < 80;
    }).length;

    const nearing = budgets.filter(b => {
      const percentage = b.monthlyLimit > 0 ? (b.amountSpent / b.monthlyLimit) * 100 : 0;
      return percentage >= 80 && percentage < 100;
    }).length;

    const exceeded = budgets.filter(b => {
      const percentage = b.monthlyLimit > 0 ? (b.amountSpent / b.monthlyLimit) * 100 : 0;
      return percentage >= 100;
    }).length;

    return { onTrack, nearing, exceeded };
  };

  const statusStats = getStatusStats();

  if (loading && budgets.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Budgets</h1>
            <p className="text-gray-600 mt-1">Manage your monthly budgets</p>
          </div>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading budgets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Budgets</h1>
          <p className="text-gray-600 mt-1">Manage your monthly budgets</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchBudgets()}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Create Budget</span>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <p className="text-red-700">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Month/Year Selector */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Budget Period</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <select
                value={currentMonth}
                onChange={(e) => changeMonth(parseInt(e.target.value), currentYear)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {months.map(month => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
              <select
                value={currentYear}
                onChange={(e) => changeMonth(currentMonth, parseInt(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">On Track</p>
              <p className="text-2xl font-bold text-gray-900">{statusStats.onTrack}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Nearing Limit</p>
              <p className="text-2xl font-bold text-gray-900">{statusStats.nearing}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Exceeded</p>
              <p className="text-2xl font-bold text-gray-900">{statusStats.exceeded}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Summary */}
      <BudgetSummary 
        summary={summary} 
        exceededBudgets={exceededBudgets}
        nearingLimitBudgets={nearingLimitBudgets}
      />

      {/* Budget List */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Your Budgets</h2>
          <span className="text-sm text-gray-600">{budgets.length} budget{budgets.length !== 1 ? 's' : ''}</span>
        </div>

        {budgets.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No budgets yet</h3>
            <p className="text-gray-600 mb-4">Create your first budget to start tracking your spending</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700"
            >
              Create Budget
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {budgets.map((budget) => (
              <BudgetCard
                key={budget.id}
                budget={budget}
                onEdit={handleEditBudget}
                onDelete={handleDeleteBudget}
              />
            ))}
          </div>
        )}
      </div>

      {/* Budget Form Modal */}
      <BudgetForm
        isOpen={showForm}
        onClose={handleFormClose}
        onSubmit={handleCreateBudget}
        budget={editingBudget}
        loading={loading}
      />
    </div>
  );
} 