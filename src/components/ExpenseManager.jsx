import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign, 
  Users, 
  Calendar,
  Tag,
  FileText,
  Repeat,
  Save,
  X
} from 'lucide-react';
import { addExpense, getExpenses } from '../services/expenseService';
import { getAllUsers } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';

export default function ExpenseManager({ groupId, onExpenseAdded }) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [newExpense, setNewExpense] = useState({
    groupID: groupId,
    amount: '',
    description: '',
    paidByUserID: user?.id,
    splitType: 'EQUAL',
    category: '',
    notes: '',
    timestamp: new Date().toISOString().split('T')[0],
    recurring: false,
    interval: 'MONTHLY',
    nextDueDate: '',
    userSplit: []
  });

  const splitTypes = [
    { value: 'EQUAL', label: 'Split Equally' },
    { value: 'PERCENTAGE', label: 'Split by Percentage' },
    { value: 'EXACT', label: 'Split by Exact Amount' },
    { value: 'SHARES', label: 'Split by Shares' }
  ];

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

  const intervals = [
    { value: 'DAILY', label: 'Daily' },
    { value: 'WEEKLY', label: 'Weekly' },
    { value: 'MONTHLY', label: 'Monthly' },
    { value: 'YEARLY', label: 'Yearly' }
  ];

  useEffect(() => {
    fetchData();
  }, [groupId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [expensesRes, usersRes] = await Promise.all([
        getExpenses(groupId),
        getAllUsers()
      ]);
      setExpenses(expensesRes.data || []);
      setUsers(usersRes.data || []);
    } catch (err) {
      setError('Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExpense = async () => {
    if (!newExpense.amount || !newExpense.description) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      // Prepare user split data based on split type
      const userSplitData = users.map(u => ({
        userId: u.id,
        amount: newExpense.splitType === 'EQUAL' ? null : 0,
        percentage: newExpense.splitType === 'PERCENTAGE' ? 100 / users.length : null,
        shares: newExpense.splitType === 'SHARES' ? 1 : null
      }));

      const expenseData = {
        ...newExpense,
        userSplit: userSplitData
      };

      const response = await addExpense(expenseData);
      setExpenses([...expenses, response.data]);
      setNewExpense({
        groupID: groupId,
        amount: '',
        description: '',
        paidByUserID: user?.id,
        splitType: 'EQUAL',
        category: '',
        notes: '',
        timestamp: new Date().toISOString().split('T')[0],
        recurring: false,
        interval: 'MONTHLY',
        nextDueDate: '',
        userSplit: []
      });
      setShowModal(false);
      if (onExpenseAdded) onExpenseAdded(response.data);
    } catch (err) {
      setError('Failed to create expense');
      console.error('Error creating expense:', err);
    }
  };

  const handleUpdateExpense = async () => {
    if (!editingExpense.amount || !editingExpense.description) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      // Note: Update endpoint doesn't exist in backend yet
      setError('Update functionality not available yet');
      setEditingExpense(null);
    } catch (err) {
      setError('Failed to update expense');
      console.error('Error updating expense:', err);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        // Note: Delete endpoint doesn't exist in backend yet
        setError('Delete functionality not available yet');
      } catch (err) {
        setError('Failed to delete expense');
        console.error('Error deleting expense:', err);
      }
    }
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown User';
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading expenses...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Expenses</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Expense</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {expenses.length === 0 ? (
        <div className="text-center py-12">
          <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses yet</h3>
          <p className="text-gray-600 mb-4">Add your first expense to start tracking</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-700"
          >
            Add Expense
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {expenses.map((expense) => (
            <div key={expense.id} className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{expense.description}</h3>
                    {expense.recurring && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Repeat className="w-3 h-3 mr-1" />
                        Recurring
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      ₹{expense.amount}
                    </span>
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      Paid by {getUserName(expense.paidByUserID)}
                    </span>
                    <span className="flex items-center">
                      <Tag className="w-4 h-4 mr-1" />
                      {expense.category || 'No category'}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(expense.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  {expense.notes && (
                    <p className="text-sm text-gray-600 mt-2 flex items-start">
                      <FileText className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
                      {expense.notes}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingExpense(expense)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteExpense(expense.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Expense Modal */}
      {(showModal || editingExpense) && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingExpense ? 'Edit Expense' : 'Add New Expense'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingExpense(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <input
                      type="text"
                      value={editingExpense?.description || newExpense.description}
                      onChange={(e) => {
                        if (editingExpense) {
                          setEditingExpense({...editingExpense, description: e.target.value});
                        } else {
                          setNewExpense({...newExpense, description: e.target.value});
                        }
                      }}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Enter expense description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingExpense?.amount || newExpense.amount}
                      onChange={(e) => {
                        if (editingExpense) {
                          setEditingExpense({...editingExpense, amount: e.target.value});
                        } else {
                          setNewExpense({...newExpense, amount: e.target.value});
                        }
                      }}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={editingExpense?.category || newExpense.category}
                      onChange={(e) => {
                        if (editingExpense) {
                          setEditingExpense({...editingExpense, category: e.target.value});
                        } else {
                          setNewExpense({...newExpense, category: e.target.value});
                        }
                      }}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">Select category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Paid By
                    </label>
                    <select
                      value={editingExpense?.paidByUserID || newExpense.paidByUserID}
                      onChange={(e) => {
                        if (editingExpense) {
                          setEditingExpense({...editingExpense, paidByUserID: parseInt(e.target.value)});
                        } else {
                          setNewExpense({...newExpense, paidByUserID: parseInt(e.target.value)});
                        }
                      }}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      {users.map(user => (
                        <option key={user.id} value={user.id}>{user.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Split Type
                    </label>
                    <select
                      value={editingExpense?.splitType || newExpense.splitType}
                      onChange={(e) => {
                        if (editingExpense) {
                          setEditingExpense({...editingExpense, splitType: e.target.value});
                        } else {
                          setNewExpense({...newExpense, splitType: e.target.value});
                        }
                      }}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      {splitTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={editingExpense?.timestamp || newExpense.timestamp}
                      onChange={(e) => {
                        if (editingExpense) {
                          setEditingExpense({...editingExpense, timestamp: e.target.value});
                        } else {
                          setNewExpense({...newExpense, timestamp: e.target.value});
                        }
                      }}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={editingExpense?.notes || newExpense.notes}
                    onChange={(e) => {
                      if (editingExpense) {
                        setEditingExpense({...editingExpense, notes: e.target.value});
                      } else {
                        setNewExpense({...newExpense, notes: e.target.value});
                      }
                    }}
                    rows="3"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Add any additional notes..."
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingExpense?.recurring || newExpense.recurring}
                      onChange={(e) => {
                        if (editingExpense) {
                          setEditingExpense({...editingExpense, recurring: e.target.checked});
                        } else {
                          setNewExpense({...newExpense, recurring: e.target.checked});
                        }
                      }}
                      className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Recurring expense</span>
                  </label>
                </div>

                {(editingExpense?.recurring || newExpense.recurring) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Interval
                      </label>
                      <select
                        value={editingExpense?.interval || newExpense.interval}
                        onChange={(e) => {
                          if (editingExpense) {
                            setEditingExpense({...editingExpense, interval: e.target.value});
                          } else {
                            setNewExpense({...newExpense, interval: e.target.value});
                          }
                        }}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        {intervals.map(interval => (
                          <option key={interval.value} value={interval.value}>{interval.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Next Due Date
                      </label>
                      <input
                        type="date"
                        value={editingExpense?.nextDueDate || newExpense.nextDueDate}
                        onChange={(e) => {
                          if (editingExpense) {
                            setEditingExpense({...editingExpense, nextDueDate: e.target.value});
                          } else {
                            setNewExpense({...newExpense, nextDueDate: e.target.value});
                          }
                        }}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingExpense(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={editingExpense ? handleUpdateExpense : handleCreateExpense}
                  className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingExpense ? 'Update' : 'Create'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 