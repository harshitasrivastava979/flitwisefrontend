import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  IndianRupee,
  TrendingUp, 
  UserPlus, 
  Settings,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  PieChart,
  Plus,
  Eye,
  Edit,
  Trash2,
  Receipt,
  ArrowRight
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGroups, settleUp, markGroupSettled, markExpensesAsSettled } from '../services/groupService';
import { getAllUsers } from '../services/userService';
import { getExpenses } from '../services/expenseService';
import { useAuth } from '../contexts/AuthContext';
import AddExpenseModal from './AddExpenseModal';
import ExpenseManagerWithTabs from './ExpenseManagerWithTabs';
import RecurringExpenses from './RecurringExpenses';
import RecurringExpenseCalendar from './RecurringExpenseCalendar';

export default function GroupDetails() {
  const { groupName } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [users, setUsers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [settleUpData, setSettleUpData] = useState(null);
  const [showSettleUp, setShowSettleUp] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);

  useEffect(() => {
    fetchGroupData();
  }, [groupName]);

  // Debug logging for expenses
  useEffect(() => {
    console.log('Expenses state updated:', expenses);
    console.log('Number of expenses in state:', expenses.length);
    
    // Debug each expense structure
    expenses.forEach((expense, index) => {
      console.log(`Expense ${index + 1}:`, {
        id: expense.id,
        description: expense.description,
        amount: expense.amount,
        paidByUserID: expense.paidByUserID,
        splitType: expense.splitType,
        userSplit: expense.userSplit
      });
    });
  }, [expenses]);

  const fetchGroupData = async () => {
    try {
      setLoading(true);
      const [groupsRes, usersRes] = await Promise.all([
        getGroups(),
        getAllUsers()
      ]);
      
      const decodedGroupName = decodeURIComponent(groupName);
      const foundGroup = groupsRes.data.find(g => g.name === decodedGroupName);
      
      if (foundGroup) {
        setGroup(foundGroup);
        // Fetch expenses for this specific group
        await fetchGroupExpenses(foundGroup.id);
      } else {
        setError('Group not found or you do not have access to this group');
      }
      
      setUsers(usersRes.data || []);
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Please log in to view group details');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to access this group');
      } else {
        setError('Failed to fetch group data: ' + (err.response?.data?.message || err.message));
      }
      console.error('Error fetching group data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupExpenses = async (groupId) => {
    try {
      console.log('Fetching expenses for group ID:', groupId);
      const response = await getExpenses(groupId);
      console.log('Group expenses response:', response);
      console.log('Group expenses data:', response.data);
      console.log('Number of expenses:', response.data?.length || 0);
      setExpenses(response.data || []);
    } catch (err) {
      console.error('Error fetching group expenses:', err);
      console.error('Error details:', err.response?.data);
      if (err.response?.status === 403) {
        setError('You do not have permission to view expenses for this group');
      } else {
        setExpenses([]);
      }
    }
  };

  // Helper functions
  const formatCurrency = (amount) => `₹${Math.abs(amount).toFixed(2)}`;

  const getBalanceStatus = (balance) => {
    if (Math.abs(balance) < 0.01) return 'settled';
    return balance > 0 ? 'gets_back' : 'owes';
  };

  // Settlement Display Component
  const SettlementDisplay = ({ settlementData, onMarkSettled }) => {
    if (!settlementData) return null;

    return (
      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <IndianRupee className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-600">Total Settlements</p>
                <p className="text-xl font-bold text-blue-900">{settlementData.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-600">Group Members</p>
                <p className="text-xl font-bold text-green-900">{group.usersList?.length || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-orange-600">Total Amount</p>
                <p className="text-xl font-bold text-orange-900">
                  ₹{settlementData.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Settlement Transactions */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Settlement Plan</h3>
          
          {settlementData.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">All Settled!</h4>
              <p className="text-gray-600">Everyone is even. No settlements needed.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <h4 className="text-sm font-medium text-green-800">Optimal Settlement Plan</h4>
                    <p className="text-sm text-green-700">
                      Complete these {settlementData.length} transaction(s) to settle all expenses efficiently.
                    </p>
                  </div>
                </div>
              </div>

              {settlementData.map((transaction, index) => (
                <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {transaction.fromUserName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {transaction.toUserName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          <span className="text-red-600">{transaction.fromUserName}</span> pays{' '}
                          <span className="text-green-600">{transaction.toUserName}</span>
                        </p>
                        <p className="text-sm text-gray-600">{transaction.description}</p>
                        {transaction.status && (
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            transaction.status === 'SETTLED' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {transaction.status}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">₹{transaction.amount.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">Amount to settle</p>
                    </div>
                  </div>
                </div>
              ))}

              <div className="mt-6 pt-4 border-t border-gray-200">
                <button 
                  onClick={onMarkSettled}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Mark All Expenses as Settled</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleSettleUp = async () => {
    if (!group || !user) return;
    
    try {
      const response = await settleUp(group.id, user.id);
      setSettleUpData(response.data);
      setShowSettleUp(true);
    } catch (err) {
      setError('Failed to calculate settlements: ' + err.message);
      console.error('Error in settlement calculation:', err);
    }
  };

  const handleMarkSettled = async () => {
    try {
      await markExpensesAsSettled(group.id, user.id);
      setError(null);
      // Refresh group data and settle up data
      fetchGroupData();
      setSettleUpData(null);
      setShowSettleUp(false);
    } catch (err) {
      setError('Failed to mark expenses as settled');
      console.error('Error marking settled:', err);
    }
  };

  const handleAddExpense = () => {
    setShowAddExpenseModal(true);
  };

  const handleExpenseAdded = (expense) => {
    // Refresh group data and expenses to include the new expense
    fetchGroupData();
  };

  const getUserName = (userId) => {
    const foundUser = users.find(u => u.id === userId);
    return foundUser ? foundUser.name : 'Unknown User';
  };

  const getUserEmail = (userId) => {
    const foundUser = users.find(u => u.id === userId);
    return foundUser ? foundUser.email : 'Unknown Email';
  };

  const calculateTotalSpent = () => {
    return expenses.reduce((total, expense) => total + (expense.amount || 0), 0);
  };

  // Calculate user balance from settlement data (if available) or show 0
  const calculateUserBalance = (userId) => {
    if (!settleUpData || !Array.isArray(settleUpData)) {
      return 0; // No settlement data available
    }
    
    let balance = 0;
    
    // Calculate balance from settlement transactions
    settleUpData.forEach(transaction => {
      if (transaction.fromUserId === userId) {
        balance -= transaction.amount; // User owes money
      }
      if (transaction.toUserId === userId) {
        balance += transaction.amount; // User gets money back
      }
    });
    
    return balance;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading group details...</p>
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
            <p className="text-red-700 mb-4">{error || 'Group not found'}</p>
            <button 
              onClick={() => navigate('/groups')}
              className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 font-medium"
            >
              Back to Groups
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/groups')}
            className="text-gray-600 hover:text-gray-800 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
            <p className="text-gray-600 mt-1">Group created by {getUserName(group.usersList?.[0]?.id)}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleAddExpense}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
          <button
            onClick={handleSettleUp}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Settle Up</span>
          </button>
        </div>
      </div>

      {/* Group Settlement Status */}
      {group.isSettled === 'SETTLED' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <h3 className="text-sm font-medium text-green-800">Group Settled</h3>
              <p className="text-sm text-green-700">All expenses have been settled. All member balances are zero.</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Members</p>
              <p className="text-2xl font-bold text-gray-900">{group.usersList?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <IndianRupee className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">₹{calculateTotalSpent().toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Expenses</p>
              <p className="text-2xl font-bold text-gray-900">{expenses.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Currency</p>
              <p className="text-2xl font-bold text-gray-900">{group.currency || 'INR'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: PieChart },
              { id: 'members', label: 'Members', icon: Users },
              { id: 'expenses', label: 'Expenses', icon: IndianRupee },
              { id: 'recurring', label: 'Recurring', icon: Receipt },
              { id: 'calendar', label: 'Calendar', icon: Calendar },
              { id: 'settleup', label: 'Settle Up', icon: CheckCircle }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <IndianRupee className="w-5 h-5 mr-2 text-teal-600" />
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    {expenses.slice(0, 5).map((expense, index) => (
                      <div key={expense.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-gray-900">{expense.description}</p>
                            {expense.isSettled === 'SETTLED' && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Settled
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">Paid by {getUserName(expense.paidByUserID)}</p>
                          
                          {/* Show participating members */}
                          {expense.userSplit && expense.userSplit.length > 0 && (
                            <div className="mt-2 flex items-center space-x-2">
                              <Users className="w-3 h-3 text-gray-400" />
                              <div className="flex items-center space-x-1">
                                <span className="text-xs text-gray-500">Split with:</span>
                                <div className="flex items-center space-x-1">
                                  {/* Deduplicate users by userId before displaying */}
                                  {(() => {
                                    const uniqueUsers = expense.userSplit
                                      .filter((split, index, self) => 
                                        index === self.findIndex(s => s.userId === split.userId)
                                      )
                                      .slice(0, 3);
                                    
                                    return uniqueUsers.map((split, splitIndex) => (
                                      <span key={`${split.userId}-${splitIndex}`} className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                                        {getUserName(split.userId)}
                                      </span>
                                    ));
                                  })()}
                                  {(() => {
                                    const uniqueUsers = expense.userSplit
                                      .filter((split, index, self) => 
                                        index === self.findIndex(s => s.userId === split.userId)
                                      );
                                    return uniqueUsers.length > 3 && (
                                      <span className="text-xs text-gray-500">
                                        +{uniqueUsers.length - 3} more
                                      </span>
                                    );
                                  })()}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">₹{expense.amount?.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">{formatDate(expense.timestamp)}</p>
                          <p className="text-xs text-gray-400">{expense.splitType}</p>
                        </div>
                      </div>
                    ))}
                    {expenses.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <IndianRupee className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>No expenses yet</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-teal-600" />
                    Member Balances
                  </h3>
                  <div className="space-y-3">
                    {!settleUpData ? (
                      <div className="text-center py-4">
                        <p className="text-gray-500 text-sm">Click "Settle Up" to see member balances</p>
                      </div>
                    ) : (
                      group.usersList?.map((member) => {
                        const balance = calculateUserBalance(member.id);
                        const isGroupSettled = group.isSettled === 'SETTLED';
                        
                        return (
                          <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">
                                  {getUserName(member.id).charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{getUserName(member.id)}</p>
                                <p className="text-sm text-gray-600">{getUserEmail(member.id)}</p>
                              </div>
                            </div>
                            <div className={`text-right ${isGroupSettled ? 'text-green-600' : balance > 0 ? 'text-green-600' : balance < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                              <p className="font-semibold">
                                {isGroupSettled ? '₹0.00' : `${balance > 0 ? '+' : ''}₹${balance.toFixed(2)}`}
                              </p>
                              <p className="text-xs">
                                {isGroupSettled ? 'Settled' : balance > 0 ? 'Gets back' : balance < 0 ? 'Owes' : 'Settled'}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={handleAddExpense}
                    className="flex items-center justify-center space-x-2 p-4 border border-teal-200 rounded-lg hover:bg-teal-50 transition-colors"
                  >
                    <Plus className="w-5 h-5 text-teal-600" />
                    <span className="font-medium text-teal-600">Add Expense</span>
                  </button>
                  <button
                    onClick={handleSettleUp}
                    className="flex items-center justify-center space-x-2 p-4 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
                  >
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-600">Settle Up</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Group Members</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.usersList?.map((member) => (
                  <div key={member.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {getUserName(member.id).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{getUserName(member.id)}</p>
                        <p className="text-sm text-gray-600">{getUserEmail(member.id)}</p>
                      </div>
                      <div className="flex space-x-1">
                        <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors" title="View Profile">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-green-600 transition-colors" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-red-600 transition-colors" title="Remove">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">Balance:</p>
                        {!settleUpData ? (
                          <span className="text-gray-400 text-sm">Calculate settlements</span>
                        ) : (
                          <span className={`font-semibold text-sm ${
                            calculateUserBalance(member.id) > 0 
                              ? 'text-green-600' 
                              : calculateUserBalance(member.id) < 0 
                                ? 'text-red-600' 
                                : 'text-gray-600'
                          }`}>
                            ₹{calculateUserBalance(member.id).toFixed(2)}
                          </span>
                        )}
                      </div>
                      {settleUpData && (
                        <div className="mt-1">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                calculateUserBalance(member.id) > 0 
                                  ? 'bg-green-500' 
                                  : calculateUserBalance(member.id) < 0 
                                    ? 'bg-red-500' 
                                    : 'bg-gray-400'
                              }`}
                              style={{ 
                                width: `${Math.min(Math.abs(calculateUserBalance(member.id)) / 100 * 100, 100)}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expenses Tab */}
          {activeTab === 'expenses' && (
            <ExpenseManagerWithTabs 
              groupId={group.id} 
              onExpenseAdded={handleExpenseAdded}
            />
          )}

          {/* Recurring Expenses Tab */}
          {activeTab === 'recurring' && (
            <RecurringExpenses groupId={group.id} />
          )}

          {/* Calendar Tab */}
          {activeTab === 'calendar' && (
            <RecurringExpenseCalendar groupId={group.id} />
          )}

          {/* Settle Up Tab */}
          {activeTab === 'settleup' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Settle Up</h3>
                <button
                  onClick={handleSettleUp}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Calculate Settlements</span>
                </button>
              </div>

              {settleUpData ? (
                <SettlementDisplay 
                  settlementData={settleUpData} 
                  onMarkSettled={handleMarkSettled}
                />
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IndianRupee className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No settlements calculated</h3>
                  <p className="text-gray-600 mb-4">Click "Calculate Settlements" to see detailed balance breakdown and settlement plan.</p>
                  <button
                    onClick={handleSettleUp}
                    className="bg-teal-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-700"
                  >
                    Calculate Settlements
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddExpenseModal
        isOpen={showAddExpenseModal}
        onClose={() => setShowAddExpenseModal(false)}
        groupId={group?.id}
        onExpenseAdded={handleExpenseAdded}
      />
    </div>
  );
} 