import { 
  Users, 
  Plus, 
  Trash2, 
  ChevronRight,
  Receipt,
  DollarSign,
  Calendar
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { createGroup, getGroups, deleteGroup } from "../services/groupService";
import { getExpenses } from "../services/expenseService";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function Groups() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [users, setUsers] = useState([{ name: user?.name || '', mail: user?.mail || '' }]);

  const isCurrentUserEditable = !(user?.name && user?.mail);

  useEffect(() => {
    fetchGroups();
    fetchExpenses();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getGroups();
      console.log('Groups response:', response);
      const groupsData = response.data || [];
      setGroups(groupsData);
    } catch (err) {
      setError('Failed to fetch groups: ' + (err.response?.data?.message || err.message));
      console.error('Error fetching groups:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async () => {
    try {
      const response = await getExpenses();
      console.log('Expenses response:', response);
      setExpenses(response.data || []);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setExpenses([]);
    }
  };

  const handleUserChange = (index, field, value) => {
    const updated = [...users];
    updated[index][field] = value;
    setUsers(updated);
  };

  const addUserField = () => setUsers([...users, { name: '', mail: '' }]);

  const removeUserField = (index) => {
    if (index === 0) return; // Prevent removing the current user
    setUsers(users.filter((_, i) => i !== index));
  };

  const handleCreateGroup = async () => {
    if (newGroupName.trim() && users.every(u => u.name.trim() && u.mail.trim())) {
      try {
        const groupData = {
          name: newGroupName,
          description: `Group created by ${user?.name || 'User'}`,
          currency: 'INR',
          usersList: users
        };
        const response = await createGroup(groupData);
        setGroups([...groups, response.data]);
        setNewGroupName('');
        setUsers([{ name: user?.name || '', mail: user?.mail || '' }]);
        setShowModal(false);
      } catch (err) {
        setError('Failed to create group');
        console.error('Error creating group:', err);
      }
    }
  };

  const handleDelete = async (groupId) => {
    try {
      await deleteGroup(groupId);
      // Remove the group from the local state
      setGroups(groups.filter(group => group.id !== groupId));
    } catch (err) {
      setError('Failed to delete group');
      console.error('Error deleting group:', err);
    }
  };

  const handleViewDetails = (groupName) => {
    navigate(`/groups/${encodeURIComponent(groupName)}`);
  };

  const getGroupExpenses = (groupId) => {
    return expenses.filter(expense => expense.groupID === groupId).slice(0, 3);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Groups</h1>
            <p className="text-gray-600 mt-1">Manage your expense groups</p>
          </div>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading groups...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Groups</h1>
            <p className="text-gray-600 mt-1">Manage your expense groups</p>
          </div>
        </div>
        <div className="text-center py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button 
              onClick={fetchGroups}
              className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Groups</h1>
          <p className="text-gray-600 mt-1">Manage your expense groups</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Create Group</span>
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No groups yet</h3>
          <p className="text-gray-600 mb-4">Create your first group to start splitting expenses</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700"
          >
            Create Group
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {groups.map((group, index) => {
            const groupExpenses = getGroupExpenses(group.id);
            return (
              <div key={group.id || index} className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 hover:-translate-y-1 relative">
                <div className="h-2 bg-gradient-to-r from-teal-500 to-teal-600"></div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{group.name}</h3>
                        <p className="text-sm text-gray-600">{group.usersList?.length || 0} members</p>
                      </div>
                    </div>
                    <Trash2
                      onClick={() => handleDelete(group.id)}
                      className="w-5 h-5 text-red-500 hover:text-red-700 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Total Spending:</span>
                      <span className="text-sm font-bold text-gray-900">₹{group.totalSpending || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Currency:</span>
                      <span className="text-sm font-bold text-blue-600">{group.currency || 'INR'}</span>
                    </div>
                  </div>

                  {/* Recent Expenses Section */}
                  {groupExpenses.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Receipt className="w-4 h-4 mr-1" />
                        Recent Expenses
                      </h4>
                      <div className="space-y-2">
                        {groupExpenses.map((expense, expIndex) => (
                          <div key={expense.id || expIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {expense.description || expense.title || 'Expense'}
                              </p>
                              <p className="text-xs text-gray-500 flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {formatDate(expense.timestamp || expense.createdAt)}
                              </p>
                            </div>
                            <div className="text-right ml-2">
                              <p className="text-sm font-semibold text-gray-900">₹{expense.amount || 0}</p>
                              <p className="text-xs text-gray-500">
                                {expense.paidBy?.name || expense.userName || 'Unknown'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => handleViewDetails(group.name)}
                    className="w-full mt-4 text-teal-600 hover:text-teal-700 hover:bg-teal-50 py-2 px-4 rounded-lg transition-colors text-sm font-medium flex justify-center items-center space-x-2"
                  >
                    <span>View Details</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* All Expenses Section */}
      {expenses.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">All Expenses</h2>
              <span className="text-sm text-gray-600">{expenses.length} total expenses</span>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {expenses.slice(0, 10).map((expense, index) => (
              <div key={expense.id || index} className="flex items-center space-x-4 p-6 hover:bg-gray-50 transition-colors">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Receipt className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {expense.description || expense.title || 'Expense'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {expense.groupName || 'Unknown Group'} • {formatDate(expense.timestamp || expense.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">₹{expense.amount || 0}</p>
                  <p className="text-sm text-gray-500">
                    {expense.paidBy?.name || expense.userName || 'Unknown'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96 space-y-4 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">Create New Group</h2>
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Enter group name"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Group Members</label>
              {users.map((u, idx) => (
                <div key={idx} className="flex items-center space-x-2 mb-1">
                  <input
                    type="text"
                    value={u.name}
                    onChange={e => handleUserChange(idx, 'name', e.target.value)}
                    placeholder="Name"
                    className="border border-gray-300 rounded-md px-2 py-1 flex-1"
                    disabled={idx === 0 && !isCurrentUserEditable}
                  />
                  <input
                    type="email"
                    value={u.mail}
                    onChange={e => handleUserChange(idx, 'mail', e.target.value)}
                    placeholder="Email"
                    className="border border-gray-300 rounded-md px-2 py-1 flex-1"
                    disabled={idx === 0 && !isCurrentUserEditable}
                  />
                  {idx !== 0 && (
                    <button type="button" onClick={() => removeUserField(idx)} className="text-red-500 hover:text-red-700">&times;</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addUserField} className="text-teal-600 hover:underline text-sm mt-1">+ Add another member</button>
            </div>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowModal(false)} className="text-sm text-gray-500 hover:underline">
                Cancel
              </button>
              <button onClick={handleCreateGroup} className="bg-teal-600 text-white px-4 py-2 rounded-md text-sm hover:bg-teal-700">
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
