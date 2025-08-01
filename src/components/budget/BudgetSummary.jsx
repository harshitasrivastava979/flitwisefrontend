import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Calendar,
  Users
} from 'lucide-react';

export default function BudgetSummary({ summary, exceededBudgets, nearingLimitBudgets }) {
  if (!summary) return null;

  const getOverallStatusColor = () => {
    const percentage = summary.overallPercentageUsed;
    if (percentage >= 100) return 'text-red-600';
    if (percentage >= 80) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getOverallStatusIcon = () => {
    const percentage = summary.overallPercentageUsed;
    if (percentage >= 100) return <AlertTriangle className="w-6 h-6 text-red-500" />;
    if (percentage >= 80) return <TrendingUp className="w-6 h-6 text-yellow-500" />;
    return <CheckCircle className="w-6 h-6 text-green-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Main Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Budget</p>
              <p className="text-2xl font-bold text-gray-900">₹{summary.totalBudget?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">₹{summary.totalSpent?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Remaining</p>
              <p className="text-2xl font-bold text-gray-900">₹{summary.totalRemaining?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              {getOverallStatusIcon()}
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Usage</p>
              <p className={`text-2xl font-bold ${getOverallStatusColor()}`}>
                {summary.overallPercentageUsed?.toFixed(1) || '0.0'}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Overall Budget Progress</h3>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {summary.month}/{summary.year}
            </span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">
              ₹{summary.totalSpent?.toFixed(2) || '0.00'} / ₹{summary.totalBudget?.toFixed(2) || '0.00'}
            </span>
            <span className={`font-medium ${getOverallStatusColor()}`}>
              {summary.overallPercentageUsed?.toFixed(1) || '0.0'}%
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`${getOverallStatusColor().replace('text-', 'bg-').replace('-600', '-500')} h-3 rounded-full transition-all duration-300 ease-in-out`}
              style={{ 
                width: `${Math.min(summary.overallPercentageUsed || 0, 100)}%` 
              }}
            />
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {(exceededBudgets?.length > 0 || nearingLimitBudgets?.length > 0) && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Alerts</h3>
          
          <div className="space-y-4">
            {exceededBudgets?.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <h4 className="font-medium text-red-800">Exceeded Budgets</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {exceededBudgets.map((budget) => (
                    <div key={budget.id} className="text-sm text-red-700">
                      • {budget.category}: ₹{budget.amountSpent.toFixed(2)} / ₹{budget.monthlyLimit.toFixed(2)}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {nearingLimitBudgets?.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-yellow-600" />
                  <h4 className="font-medium text-yellow-800">Nearing Limit</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {nearingLimitBudgets.map((budget) => (
                    <div key={budget.id} className="text-sm text-yellow-700">
                      • {budget.category}: ₹{budget.amountSpent.toFixed(2)} / ₹{budget.monthlyLimit.toFixed(2)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 