import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  DollarSign, 
  Users, 
  Calendar,
  Tag,
  FileText,
  Repeat,
  Save,
  X,
  AlertCircle
} from 'lucide-react';
import { addExpense } from '../services/expenseService';
import { getGroups } from '../services/groupService';
import { getAllUsers } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';

export default function AddExpenseModal({ isOpen, onClose, groupId = null, onExpenseAdded }) {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newExpense, setNewExpense] = useState({
    groupID: groupId || '',
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
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, groupId]);

  const fetchData = async () => {
    try {
      const [groupsRes, usersRes] = await Promise.all([
        getGroups(),
        getAllUsers()
      ]);
      setGroups(groupsRes.data || []);
      setUsers(usersRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data');
    }
  };

  const handleCreateExpense = async () => {
    if (!newExpense.amount || !newExpense.description || !newExpense.groupID) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get the selected group to find its members
      const selectedGroup = groups.find(g => g.id === parseInt(newExpense.groupID));
      if (!selectedGroup) {
        setError('Selected group not found');
        return;
      }

      // Prepare user split data based on split type - only for group members
      const userSplitData = selectedGroup.usersList.map(u => ({
        userId: u.id,
        amount: newExpense.splitType === 'EQUAL' ? null : 0,
        percentage: newExpense.splitType === 'PERCENTAGE' ? 100 / selectedGroup.usersList.length : null,
        shares: newExpense.splitType === 'SHARES' ? 1 : null
      }));

      // Convert date to proper timestamp format
      const formatTimestamp = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      };

      const expenseData = {
        ...newExpense,
        timestamp: formatTimestamp(newExpense.timestamp),
        nextDueDate: newExpense.recurring ? formatTimestamp(newExpense.nextDueDate) : null,
        userSplit: userSplitData
      };

      const response = await addExpense(expenseData);
      
      // Reset form
      setNewExpense({
        groupID: groupId || '',
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
      
      onClose();
      if (onExpenseAdded) onExpenseAdded(response.data);
    } catch (err) {
      setError('Failed to create expense: ' + (err.response?.data?.message || err.message));
      console.error('Error creating expense:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setNewExpense({
      groupID: groupId || '',
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
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Add New Expense</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group *
                </label>
                <select
                  value={newExpense.groupID}
                  onChange={(e) => setNewExpense({...newExpense, groupID: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  disabled={!!groupId}
                >
                  <option value="">Select a group</option>
                  {groups.map(group => (
                    <option key={group.id} value={group.id}>{group.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
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
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
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
                  value={newExpense.paidByUserID}
                  onChange={(e) => setNewExpense({...newExpense, paidByUserID: parseInt(e.target.value)})}
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
                  value={newExpense.splitType}
                  onChange={(e) => setNewExpense({...newExpense, splitType: e.target.value})}
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
                  value={newExpense.timestamp}
                  onChange={(e) => setNewExpense({...newExpense, timestamp: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={newExpense.notes}
                onChange={(e) => setNewExpense({...newExpense, notes: e.target.value})}
                rows="3"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Add any additional notes..."
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newExpense.recurring}
                  onChange={(e) => setNewExpense({...newExpense, recurring: e.target.checked})}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="ml-2 text-sm text-gray-700">Recurring expense</span>
              </label>
            </div>

            {newExpense.recurring && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Interval
                  </label>
                  <select
                    value={newExpense.interval}
                    onChange={(e) => setNewExpense({...newExpense, interval: e.target.value})}
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
                    value={newExpense.nextDueDate}
                    onChange={(e) => setNewExpense({...newExpense, nextDueDate: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateExpense}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 flex items-center space-x-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Creating...' : 'Create Expense'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 