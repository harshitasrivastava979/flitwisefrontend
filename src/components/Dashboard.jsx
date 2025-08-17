import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Home, 
  Users, 
  Activity, 
  Plus, 
  Bell, 
  Search, 
  Settings,
  User,
  DollarSign,
  TrendingUp,
  Menu,
  X,
  Calendar,
  Receipt,
  ChevronRight,
  PieChart,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { getBudgetSummary, getUserBudgets, getExceededBudgets, getNearingLimit } from "../services/budgetService";
import { getExpenses } from "../services/expenseService";
import { getGroups } from "../services/groupService";
import { getAllUsers } from "../services/userService";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [budgetSummary, setBudgetSummary] = useState({
    totalBudget: 0,
    totalSpent: 0,
    totalRemaining: 0,
    overallPercentageUsed: 0
  });
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [exceededBudgets, setExceededBudgets] = useState([]);
  const [nearingLimitBudgets, setNearingLimitBudgets] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Dashboard fetchDashboardData - user:', user);
      console.log('Dashboard fetchDashboardData - user.id:', user?.id);
      
      // Handle different possible user object structures
      const userId = user?.id || user?.userId || null;
      console.log('Dashboard fetchDashboardData - resolved userId:', userId);
      
      if (userId) {
        // Test basic API connectivity first
        try {
          console.log('Testing basic API connectivity...');
          const testResponse = await getGroups();
          console.log('Basic API test successful:', testResponse);
        } catch (err) {
          console.error('Basic API test failed:', err);
          setError('Unable to connect to the server. Please check your connection.');
          setLoading(false);
          return;
        }

        // Make API calls individually to handle failures gracefully
        try {
          console.log('Fetching budget summary for user:', userId);
          const summaryResponse = await getBudgetSummary(userId);
          console.log('Budget summary response:', summaryResponse);
          setBudgetSummary(summaryResponse.data || {
            totalBudget: 0,
            totalSpent: 0,
            totalRemaining: 0,
            overallPercentageUsed: 0
          });
        } catch (err) {
          console.warn('Failed to fetch budget summary:', err);
          setBudgetSummary({
            totalBudget: 0,
            totalSpent: 0,
            totalRemaining: 0,
            overallPercentageUsed: 0
          });
        }

        try {
          console.log('Fetching groups and users');
          const [groupsResponse, usersResponse] = await Promise.all([
            getGroups(),
            getAllUsers()
          ]);
          console.log('Groups response:', groupsResponse);
          console.log('Users response:', usersResponse);
          const groups = groupsResponse.data || [];
          const users = usersResponse.data || [];
          setUserGroups(groups);
          setAllUsers(users);
          
          // Fetch expenses for each group
          if (groups.length > 0) {
            const allExpenses = [];
            for (const group of groups) {
              try {
                const expensesResponse = await getExpenses(group.id);
                const groupExpenses = expensesResponse.data || [];
                allExpenses.push(...groupExpenses);
              } catch (err) {
                console.warn(`Failed to fetch expenses for group ${group.id}:`, err);
                // Continue with other groups even if one fails
              }
            }
            setRecentExpenses(allExpenses);
          } else {
            setRecentExpenses([]);
          }
        } catch (err) {
          console.warn('Failed to fetch groups or users:', err);
          setUserGroups([]);
          setAllUsers([]);
          setRecentExpenses([]);
        }

        try {
          console.log('Fetching exceeded budgets for user:', userId);
          const exceededResponse = await getExceededBudgets(userId);
          console.log('Exceeded budgets response:', exceededResponse);
          setExceededBudgets(exceededResponse.data || []);
        } catch (err) {
          console.warn('Failed to fetch exceeded budgets:', err);
          setExceededBudgets([]);
        }

        try {
          console.log('Fetching nearing limit budgets for user:', userId);
          const nearingResponse = await getNearingLimit(userId);
          console.log('Nearing limit response:', nearingResponse);
          setNearingLimitBudgets(nearingResponse.data || []);
        } catch (err) {
          console.warn('Failed to fetch nearing limit budgets:', err);
          setNearingLimitBudgets([]);
        }

        // Note: getUserSummary endpoint doesn't exist in backend yet
        setUserStats(null);
      } else {
        console.log('No user ID found, setting default values');
        // If no user ID, set default values
        setBudgetSummary({
          totalBudget: 0,
          totalSpent: 0,
          totalRemaining: 0,
          overallPercentageUsed: 0
        });
        setUserGroups([]);
        setRecentExpenses([]);
        setExceededBudgets([]);
        setNearingLimitBudgets([]);
        setUserStats(null);
      }
    } catch (err) {
      console.error('Error in fetchDashboardData:', err);
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const filteredExpenses = recentExpenses.filter(item =>
    (item.title || item.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.user || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.time || item.createdAt || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewAllGroups = () => {
    navigate('/groups');
  };

  // Helper function to get username by ID
  const getUserName = (userId) => {
    const foundUser = allUsers.find(u => u.id === userId);
    return foundUser ? foundUser.name : 'Unknown User';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Track your expenses and balances</p>
          </div>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Track your expenses and balances</p>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="mt-4 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name || 'User'}!</h1>
          <p className="text-gray-600 mt-1">Here's what's happening with your expenses</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search expenses..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {exceededBudgets.length + nearingLimitBudgets.length}
            </span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {exceededBudgets.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Budget Alerts</h3>
              <p className="text-sm text-red-700">
                You have {exceededBudgets.length} budget(s) that have exceeded their limits.
              </p>
            </div>
          </div>
        </div>
      )}

      {nearingLimitBudgets.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-5 h-5 text-yellow-600" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Budget Warnings</h3>
              <p className="text-sm text-yellow-700">
                You have {nearingLimitBudgets.length} budget(s) nearing their limits.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 font-medium text-sm">Total Budget</p>
              <p className="text-3xl font-bold mt-1">₹{budgetSummary.totalBudget || 0}</p>
              <p className="text-green-200 text-sm mt-2">Monthly budget limit</p>
            </div>
            <div className="bg-green-400/30 p-3 rounded-lg">
              <DollarSign className="w-8 h-8 text-green-100" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 font-medium text-sm">Total Spent</p>
              <p className="text-3xl font-bold mt-1">₹{budgetSummary.totalSpent || 0}</p>
              <p className="text-orange-200 text-sm mt-2">{budgetSummary.overallPercentageUsed?.toFixed(1) || 0}% of budget used</p>
            </div>
            <div className="bg-orange-400/30 p-3 rounded-lg">
              <TrendingUp className="w-8 h-8 text-orange-100" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 font-medium text-sm">Remaining</p>
              <p className="text-3xl font-bold mt-1">₹{budgetSummary.totalRemaining || 0}</p>
              <p className="text-blue-200 text-sm mt-2">Available budget</p>
            </div>
            <div className="bg-blue-400/30 p-3 rounded-lg">
              <Activity className="w-8 h-8 text-blue-100" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 font-medium text-sm">Groups</p>
              <p className="text-3xl font-bold mt-1">{userGroups.length}</p>
              <p className="text-purple-200 text-sm mt-2">Active groups</p>
            </div>
            <div className="bg-purple-400/30 p-3 rounded-lg">
              <Users className="w-8 h-8 text-purple-100" />
            </div>
          </div>
        </div>
      </div>

      {/* Groups Overview */}
      {userGroups.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Your Groups</h2>
              <button 
                onClick={handleViewAllGroups}
                className="text-teal-600 hover:text-teal-700 text-sm font-medium flex items-center space-x-1 transition-colors"
              >
                <span>View all</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userGroups.slice(0, 6).map((group, index) => (
                <div key={group.id || index} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{group.name}</h3>
                    <span className="text-xs text-gray-500">{group.usersList?.length || 0} members</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total spent</span>
                    <span className="font-semibold text-gray-900">₹{group.totalSpending || 0}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-gray-600">Expenses</span>
                    <span className="text-sm text-gray-900">{group.expenses?.length || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            <button className="text-teal-600 hover:text-teal-700 text-sm font-medium flex items-center space-x-1">
              <span>View all</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No recent activity</h3>
            <p className="text-gray-600">Start adding expenses to see your activity feed</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredExpenses.slice(0, 10).map((item, index) => (
              <div key={item.id || index} className="flex items-center space-x-4 p-6 hover:bg-gray-50 transition-colors">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  item.type === 'expense' ? 'bg-orange-100' : 'bg-green-100'
                }`}>
                  {item.type === 'expense' ? 
                    <Receipt className="w-6 h-6 text-orange-600" /> :
                    <DollarSign className="w-6 h-6 text-green-600" />
                  }
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.title || item.description}</p>
                  <p className="text-sm text-gray-600">
                    {item.groupName ? `${item.groupName} • ` : ''}
                    {item.time || item.createdAt}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">₹{item.amount || 0}</p>
                  {(() => {
                    // Check if the current user paid for this expense
                    const currentUserPaid = item.paidByUserID === user?.id || item.paidBy?.id === user?.id;
                    
                    if (item.isSettled === 'SETTLED') {
                      return (
                        <p className="text-sm text-green-600 flex items-center">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Settled
                        </p>
                      );
                    } else if (currentUserPaid) {
                      return (
                        <p className="text-sm text-gray-500">You paid</p>
                      );
                    } else if (item.paidBy?.name) {
                      return (
                        <p className="text-sm text-blue-600 flex items-center">
                          <ArrowUpRight className="w-3 h-3 mr-1" />
                          Paid by {item.paidBy.name}
                        </p>
                      );
                    } else if (item.paidByUserID) {
                      return (
                        <p className="text-sm text-blue-600 flex items-center">
                          <ArrowUpRight className="w-3 h-3 mr-1" />
                          Paid by {getUserName(item.paidByUserID)}
                        </p>
                      );
                    } else {
                      return (
                        <p className="text-sm text-gray-500">Unknown payer</p>
                      );
                    }
                  })()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
