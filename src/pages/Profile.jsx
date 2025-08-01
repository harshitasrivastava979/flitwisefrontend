import { useState, useEffect } from "react";
import { 
  User, 
  Mail, 
  Phone, 
  Edit, 
  Save, 
  X,
  Settings,
  Shield,
  Bell,
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  LogOut
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { updateUserProfile } from "../services/userService";

export default function Profile() {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [userGroups, setUserGroups] = useState([]);
  const [userExpenses, setUserExpenses] = useState([]);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  useEffect(() => {
    if (user?.id) {
      fetchUserData();
    }
  }, [user?.id]);

  const fetchUserData = async () => {
    try {
      // Note: getUserGroups, getUserExpenses, and getUserSummary endpoints don't exist in backend yet
      // For now, we'll set empty arrays and null values
      setUserStats(null);
      setUserGroups([]);
      setUserExpenses([]);
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  const handleSave = async () => {
    if (!user?.id) {
      setError('User ID not available');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await updateUserProfile(user.id, editForm);
      console.log('Profile update response:', response);
      
      // Update the local user context if needed
      // You might want to update the AuthContext here
      
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update profile');
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditForm({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || ''
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  const calculateTotalSpent = () => {
    return userExpenses.reduce((total, expense) => total + expense.amount, 0);
  };

  const calculateTotalOwed = () => {
    return userExpenses.reduce((total, expense) => {
      const userSplit = expense.userSplit?.find(split => split.userId === user.id);
      if (userSplit) {
        return total + (userSplit.amount || expense.amount / expense.userSplit.length);
      }
      return total;
    }, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account settings</p>
        </div>
        <div className="flex space-x-3">
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl flex items-center space-x-2"
            >
              <Edit className="w-5 h-5" />
              <span>Edit Profile</span>
            </button>
          )}
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl flex items-center space-x-2"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
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
              <p className="text-sm font-medium text-gray-600">Groups</p>
              <p className="text-2xl font-bold text-gray-900">{userGroups.length}</p>
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
              <p className="text-2xl font-bold text-gray-900">₹{calculateTotalSpent()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Owed</p>
              <p className="text-2xl font-bold text-gray-900">₹{calculateTotalOwed()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Expenses</p>
              <p className="text-2xl font-bold text-gray-900">{userExpenses.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{user?.name || 'User Name'}</h3>
                  <p className="text-gray-600">{user?.email || 'user@example.com'}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    ) : (
                      <p className="mt-1 text-gray-900">{user?.name || 'Not provided'}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                        className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    ) : (
                      <p className="mt-1 text-gray-900">{user?.email || 'Not provided'}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                        className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    ) : (
                      <p className="mt-1 text-gray-900">{user?.phone || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-teal-600 text-white px-4 py-2 rounded-md font-medium hover:bg-teal-700 flex items-center space-x-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mt-6">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="p-6">
              {userExpenses.length > 0 ? (
                <div className="space-y-4">
                  {userExpenses.slice(0, 5).map((expense, index) => (
                    <div key={expense.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{expense.description}</p>
                        <p className="text-sm text-gray-600">{expense.groupName || 'Unknown Group'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">₹{expense.amount}</p>
                        <p className="text-xs text-gray-500">{new Date(expense.timestamp).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No recent activity</h3>
                  <p className="text-gray-600">Start adding expenses to see your activity here.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Settings Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <div className="p-4 space-y-3">
              <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <Settings className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">Account Settings</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <Shield className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">Privacy & Security</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">Notifications</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-semibold text-gray-900">Account Info</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Member since</span>
                <span className="text-gray-900">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last login</span>
                <span className="text-gray-900">{user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span className="text-green-600 font-medium">Active</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-semibold text-gray-900">Your Groups</h3>
            </div>
            <div className="p-4 space-y-3">
              {userGroups.length > 0 ? (
                userGroups.slice(0, 5).map((group, index) => (
                  <div key={group.id || index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{group.name}</p>
                      <p className="text-xs text-gray-600">{group.usersList?.length || 0} members</p>
                    </div>
                    <span className="text-sm text-gray-600">₹{group.totalSpending || 0}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-sm">No groups yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 