import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Calendar,
  Tag,
  FileText,
  Repeat,
  Save,
  X,
  Filter,
  IndianRupee,
  CheckSquare,
  Square
} from 'lucide-react';
import { addExpense, getExpenses } from '../services/expenseService';
import { getGroups } from '../services/groupService';
import { useAuth } from '../contexts/AuthContext';

export default function ExpenseManagerWithTabs({ groupId, onExpenseAdded, openAddModal, onAddModalClose }) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'recurring', 'one-time'
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
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

  // Allow parent to open the modal
  useEffect(() => {
    if (openAddModal) {
      setShowModal(true);
    }
  }, [openAddModal]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [expensesRes, groupsRes] = await Promise.all([
        getExpenses(groupId),
        getGroups()
      ]);
      setExpenses(expensesRes.data || []);

      // Find the current group and set members as users
      const groups = groupsRes.data || [];
      const currentGroup = groups.find(g => g.id === groupId);
      const groupUsers = currentGroup?.usersList || [];
      setUsers(groupUsers);
      setSelectedMemberIds(groupUsers.map(u => u.id)); // default select all group members
    } catch (err) {
      setError('Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredExpenses = () => {
    switch (activeTab) {
      case 'recurring':
        return expenses.filter(expense => expense.recurring);
      case 'one-time':
        return expenses.filter(expense => !expense.recurring);
      default:
        return expenses;
    }
  };

  const getTabStats = () => {
    const recurring = expenses.filter(exp => exp.recurring).length;
    const oneTime = expenses.filter(exp => !exp.recurring).length;
    const total = expenses.length;
    
    return { recurring, oneTime, total };
  };

  const handleToggleMember = (id) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => setSelectedMemberIds(users.map(u => u.id));
  const handleDeselectAll = () => setSelectedMemberIds([]);

  const handleCreateExpense = async () => {
    if (!newExpense.amount || !newExpense.description) {
      setError('Please fill in all required fields');
      return;
    }

    if (selectedMemberIds.length === 0) {
      setError('Select at least one member to split with');
      return;
    }

    try {
      // Equal split among selected members
      const userSplitData = selectedMemberIds.map(id => ({
        userId: id,
        amount: null,
        percentage: null,
        shares: null
      }));

      const expenseData = {
        ...newExpense,
        splitType: 'EQUAL',
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
        setError('Delete functionality not available yet');
      } catch (err) {
        setError('Failed to delete expense');
        console.error('Error deleting expense:', err);
      }
    }
  };

  const getUserName = (userId) => {
    const u = users.find(u => u.id === userId);
    return u ? u.name : 'Unknown User';
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

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading expenses...</p>
      </div>
    );
  }

  const stats = getTabStats();
  const filteredExpenses = getFilteredExpenses();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Expenses</h2>
          <p className="text-gray-600 mt-1">Manage and track all your group expenses</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All Expenses
            <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
              {stats.total}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('recurring')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
              activeTab === 'recurring'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Repeat className="w-4 h-4 mr-1" />
            Recurring Expenses
            <span className="ml-2 bg-blue-100 text-blue-900 py-0.5 px-2.5 rounded-full text-xs">
              {stats.recurring}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('one-time')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'one-time'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            One-time Expenses
            <span className="ml-2 bg-green-100 text-green-900 py-0.5 px-2.5 rounded-full text-xs">
              {stats.oneTime}
            </span>
          </button>
        </nav>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Stats Cards for Current Tab */}
      {activeTab === 'recurring' && stats.recurring > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Repeat className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Recurring</p>
                <p className="text-2xl font-bold text-gray-900">{stats.recurring}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <IndianRupee className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{filteredExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredExpenses.filter(exp => {
                    const expDate = new Date(exp.timestamp);
                    const now = new Date();
                    return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expenses List */}
      {filteredExpenses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-200">
          <IndianRupee className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeTab === 'recurring' ? 'No recurring expenses yet' : 
             activeTab === 'one-time' ? 'No one-time expenses yet' : 'No expenses yet'}
          </h3>
          <p className="text-gray-600 mb-0">
            {activeTab === 'recurring' ? 'Create your first recurring expense to start tracking' :
             activeTab === 'one-time' ? 'Add your first one-time expense' : 'Add your first expense to start tracking'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredExpenses.map((expense) => (
            <div key={expense.id} className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{expense.description}</h3>
                    {expense.recurring && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Repeat className="w-3 h-3 mr-1" />
                        {getIntervalLabel(expense.interval)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <IndianRupee className="w-4 h-4 mr-1" />
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
                    {expense.recurring && expense.nextDueDate && (
                      <span className="flex items-center text-blue-600">
                        <Calendar className="w-4 h-4 mr-1" />
                        Next: {new Date(expense.nextDueDate).toLocaleDateString()}
                      </span>
                    )}
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
                    onAddModalClose && onAddModalClose();
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
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
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

                {/* Equal split member selection */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-900 flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      Select Members to Split With
                    </h4>
                    <div className="text-sm">
                      <button onClick={handleSelectAll} className="text-teal-600 hover:underline mr-2">Select All</button>
                      <button onClick={handleDeselectAll} className="text-teal-600 hover:underline">Deselect All</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {users.map(u => {
                      const selected = selectedMemberIds.includes(u.id);
                      return (
                        <button
                          type="button"
                          key={u.id}
                          onClick={() => handleToggleMember(u.id)}
                          className={`flex items-center justify-between w-full px-3 py-3 rounded border ${selected ? 'border-teal-400 bg-teal-50' : 'border-gray-200 bg-white'}`}
                        >
                          <span className="flex items-center space-x-2">
                            {selected ? <CheckSquare className="w-4 h-4 text-teal-600" /> : <Square className="w-4 h-4 text-gray-400" />}
                            <span className="font-medium text-gray-900">{u.name}</span>
                          </span>
                          <span className="text-xs text-gray-500">{selected ? 'Selected' : 'Tap to select'}</span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-600 mt-2">Selected {selectedMemberIds.length} of {users.length} members</p>
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
                    <span className="ml-2 text-sm text-gray-700">Make this a recurring expense</span>
                    <Repeat className="w-4 h-4 ml-1 text-blue-600" />
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
                    onAddModalClose && onAddModalClose();
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