import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Tag, 
  Calendar,
  Save,
  X,
  AlertCircle
} from 'lucide-react';

export default function BudgetForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  budget = null, 
  loading = false 
}) {
  const [formData, setFormData] = useState({
    category: '',
    monthlyLimit: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });
  const [errors, setErrors] = useState({});

  const categories = [
    'Food & Dining',
    'Transportation',
    'Entertainment',
    'Shopping',
    'Bills & Utilities',
    'Healthcare',
    'Travel',
    'Education',
    'Other'
  ];

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

  useEffect(() => {
    if (budget) {
      setFormData({
        category: budget.category || '',
        monthlyLimit: budget.monthlyLimit?.toString() || '',
        month: budget.month || new Date().getMonth() + 1,
        year: budget.year || new Date().getFullYear()
      });
    } else {
      setFormData({
        category: '',
        monthlyLimit: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
      });
    }
    setErrors({});
  }, [budget, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (!formData.monthlyLimit || parseFloat(formData.monthlyLimit) <= 0) {
      newErrors.monthlyLimit = 'Monthly limit must be greater than 0';
    }

    if (!formData.month) {
      newErrors.month = 'Month is required';
    }

    if (!formData.year) {
      newErrors.year = 'Year is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const budgetData = {
      category: formData.category,
      monthlyLimit: parseFloat(formData.monthlyLimit),
      month: parseInt(formData.month),
      year: parseInt(formData.year)
    };

    try {
      await onSubmit(budgetData);
      onClose();
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const handleClose = () => {
    setFormData({
      category: '',
      monthlyLimit: '',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear()
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {budget ? 'Edit Budget' : 'Create New Budget'}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errors.category ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.category}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Limit (₹) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.monthlyLimit}
                  onChange={(e) => setFormData({...formData, monthlyLimit: e.target.value})}
                  className={`w-full pl-10 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.monthlyLimit ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
              </div>
              {errors.monthlyLimit && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.monthlyLimit}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Month *
                </label>
                <select
                  value={formData.month}
                  onChange={(e) => setFormData({...formData, month: parseInt(e.target.value)})}
                  className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.month ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  {months.map(month => (
                    <option key={month.value} value={month.value}>{month.label}</option>
                  ))}
                </select>
                {errors.month && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.month}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year *
                </label>
                <select
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                  className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.year ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                {errors.year && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.year}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 flex items-center space-x-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Saving...' : (budget ? 'Update' : 'Create')}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 