import React from 'react';

export default function BudgetProgress({ 
  spent, 
  limit, 
  showAmounts = true, 
  showPercentage = true,
  height = 'h-2',
  className = ''
}) {
  const percentage = limit > 0 ? (spent / limit) * 100 : 0;
  const clampedPercentage = Math.min(percentage, 100);

  const getProgressColor = (percent) => {
    if (percent >= 100) return 'bg-red-500';
    if (percent >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getTextColor = (percent) => {
    if (percent >= 100) return 'text-red-600';
    if (percent >= 80) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex justify-between items-center text-sm">
        {showAmounts && (
          <span className="text-gray-600">
            ₹{spent.toFixed(2)} / ₹{limit.toFixed(2)}
          </span>
        )}
        {showPercentage && (
          <span className={`font-medium ${getTextColor(percentage)}`}>
            {percentage.toFixed(1)}%
          </span>
        )}
      </div>
      
      <div className={`w-full bg-gray-200 rounded-full ${height}`}>
        <div
          className={`${getProgressColor(percentage)} ${height} rounded-full transition-all duration-300 ease-in-out`}
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>
      
      {percentage > 100 && (
        <div className="text-xs text-red-600 font-medium">
          Exceeded by ₹{(spent - limit).toFixed(2)}
        </div>
      )}
    </div>
  );
} 