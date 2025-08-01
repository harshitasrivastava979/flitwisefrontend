import React, { useState, useEffect } from 'react';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  UserPlus, 
  Settings,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Calendar,
  PieChart,
  Plus,
  Eye,
  Edit,
  Trash2,
  Receipt
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGroups, settleUp, markGroupSettled } from '../services/groupService';
import { getAllUsers } from '../services/userService';
import { getExpenses } from '../services/expenseService';
import { useAuth } from '../contexts/AuthContext';
import AddExpenseModal from './AddExpenseModal';

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
        setError('Group not found');
      }
      
      setUsers(usersRes.data || []);
    } catch (err) {
      setError('Failed to fetch group data');
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
      setExpenses([]);
    }
  };

  const handleSettleUp = async () => {
    if (!group || !user) return;
    
    try {
      const response = await settleUp(group.id, user.id);
      setSettleUpData(response.data);
      setShowSettleUp(true);
    } catch (err) {
      setError('Failed to calculate settle up');
      console.error('Error settling up:', err);
    }
  };

  const handleMarkSettled = async (transactionId) => {
    try {
      await markGroupSettled({
        groupId: group.id,
        transactionId: transactionId,
        settledBy: user.id
      });
      // Refresh settle up data
      handleSettleUp();
    } catch (err) {
      setError('Failed to mark as settled');
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

  const calculateUserBalance = (userId) => {
    let balance = 0;
    expenses.forEach(expense => {
      if (expense.paidByUserID === userId) {
        balance += expense.amount || 0;
      }
      // Subtract user's share
      const userSplit = expense.userSplit?.find(split => split.userId === userId);
      if (userSplit) {
        balance -= userSplit.amount || (expense.amount / expense.userSplit.length);
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
          <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>
      </div>

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
              <DollarSign className="w-6 h-6 text-green-600" />
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
              { id: 'expenses', label: 'Expenses', icon: DollarSign },
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
                    <DollarSign className="w-5 h-5 mr-2 text-teal-600" />
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    {expenses.slice(0, 5).map((expense, index) => (
                      <div key={expense.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{expense.description}</p>
                          <p className="text-sm text-gray-600">Paid by {getUserName(expense.paidByUserID)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">₹{expense.amount?.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">{formatDate(expense.timestamp)}</p>
                        </div>
                      </div>
                    ))}
                    {expenses.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <DollarSign className="w-12 h-12 mx-auto mb-2 text-gray-300" />
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
                    {group.usersList?.map((member) => {
                      const balance = calculateUserBalance(member.id);
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
                          <div className={`text-right ${balance > 0 ? 'text-green-600' : balance < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                            <p className="font-semibold">
                              {balance > 0 ? '+' : ''}₹{balance.toFixed(2)}
                            </p>
                            <p className="text-xs">
                              {balance > 0 ? 'Gets back' : balance < 0 ? 'Owes' : 'Settled'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
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
                        <span className={`font-semibold text-sm ${
                          calculateUserBalance(member.id) > 0 
                            ? 'text-green-600' 
                            : calculateUserBalance(member.id) < 0 
                              ? 'text-red-600' 
                              : 'text-gray-600'
                        }`}>
                          ₹{calculateUserBalance(member.id).toFixed(2)}
                        </span>
                      </div>
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
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expenses Tab */}
          {activeTab === 'expenses' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Group Expenses</h3>
                <button
                  onClick={handleAddExpense}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Expense</span>
                </button>
              </div>
              
              {expenses.length > 0 ? (
                <div className="space-y-4">
                  {expenses.map((expense) => (
                    <div key={expense.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-gray-900">{expense.description}</h4>
                            {expense.category && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                                {expense.category}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-1" />
                              ₹{expense.amount?.toFixed(2)}
                            </span>
                            <span className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              Paid by {getUserName(expense.paidByUserID)}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDate(expense.timestamp)}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors" title="View Details">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-green-600 transition-colors" title="Edit">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-red-600 transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses yet</h3>
                  <p className="text-gray-600 mb-4">Add your first expense to start tracking</p>
                  <button
                    onClick={handleAddExpense}
                    className="bg-teal-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-700"
                  >
                    Add Expense
                  </button>
                </div>
              )}
            </div>
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

              {settleUpData && settleUpData.length > 0 ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <h3 className="text-sm font-medium text-green-800">Settlement Plan</h3>
                        <p className="text-sm text-green-700">Here's how to settle up the group expenses efficiently.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {settleUpData.map((transaction, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {getUserName(transaction.fromUser).charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {getUserName(transaction.fromUser)} → {getUserName(transaction.toUser)}
                              </p>
                              <p className="text-sm text-gray-600">Settlement transaction</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">₹{transaction.amount}</p>
                            <button
                              onClick={() => handleMarkSettled(transaction.id)}
                              className="text-sm text-green-600 hover:text-green-800 font-medium"
                            >
                              Mark as Settled
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : settleUpData && settleUpData.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">All Settled!</h3>
                  <p className="text-gray-600">Everyone in the group is settled up.</p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No settlements needed</h3>
                  <p className="text-gray-600 mb-4">Click "Calculate Settlements" to see if any settlements are needed.</p>
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