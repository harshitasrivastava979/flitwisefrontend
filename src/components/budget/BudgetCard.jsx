import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Edit,
  Trash2
} from 'lucide-react';
import BudgetProgress from './BudgetProgress';

export default function BudgetCard({ 
  budget, 
  onEdit, 
  onDelete, 
  onClick,
  showActions = true 
}) {
  const getStatusIcon = () => {
    const percentage = budget.monthlyLimit > 0 ? (budget.amountSpent / budget.monthlyLimit) * 100 : 0;
    
    if (percentage >= 100) {
      return <AlertTriangle className="w-5 h-5 text-red-500" />;
    } else if (percentage >= 80) {
      return <TrendingUp className="w-5 h-5 text-yellow-500" />;
    } else {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  const getStatusText = () => {
    const percentage = budget.monthlyLimit > 0 ? (budget.amountSpent / budget.monthlyLimit) * 100 : 0;
    
    if (percentage >= 100) {
      return 'Exceeded';
    } else if (percentage >= 80) {
      return 'Nearing Limit';
    } else {
      return 'On Track';
    }
  };

  const getStatusColor = () => {
    const percentage = budget.monthlyLimit > 0 ? (budget.amountSpent / budget.monthlyLimit) * 100 : 0;
    
    if (percentage >= 100) {
      return 'text-red-600 bg-red-50';
    } else if (percentage >= 80) {
      return 'text-yellow-600 bg-yellow-50';
    } else {
      return 'text-green-600 bg-green-50';
    }
  };

  return (
    <div 
      className={`bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 hover:-translate-y-1 cursor-pointer ${onClick ? 'hover:border-teal-300' : ''}`}
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg capitalize">
                {budget.category}
              </h3>
              <div className="flex items-center space-x-2">
                {getStatusIcon()}
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${getStatusColor()}`}>
                  {getStatusText()}
                </span>
              </div>
            </div>
          </div>
          
          {showActions && (
            <div className="flex space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(budget);
                }}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit Budget"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(budget.id);
                }}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete Budget"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <BudgetProgress 
            spent={budget.amountSpent} 
            limit={budget.monthlyLimit}
            showAmounts={true}
            showPercentage={true}
          />
          
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600">Remaining</p>
              <p className="text-lg font-bold text-gray-900">
                ₹{Math.max(0, budget.monthlyLimit - budget.amountSpent).toFixed(2)}
              </p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600">Used</p>
              <p className="text-lg font-bold text-gray-900">
                {budget.monthlyLimit > 0 ? ((budget.amountSpent / budget.monthlyLimit) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 