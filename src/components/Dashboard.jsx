import { useState, useEffect } from "react";
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
  ChevronRight
} from "lucide-react";
import { getBudgetSummary, getUserBudgets } from "../services/budgetService";
import { getExpenses } from "../services/expenseService";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [budgetSummary, setBudgetSummary] = useState({
    totalBudget: 0,
    totalSpent: 0,
    totalRemaining: 0,
    overallPercentageUsed: 0
  });
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch budget summary
      if (user?.id) {
        const summaryResponse = await getBudgetSummary(user.id);
        console.log('Budget summary response:', summaryResponse);
        setBudgetSummary(summaryResponse.data || {
          totalBudget: 0,
          totalSpent: 0,
          totalRemaining: 0,
          overallPercentageUsed: 0
        });
      }

      // Fetch recent expenses
      const expensesResponse = await getExpenses(1); // Use default group ID
      console.log('Expenses response:', expensesResponse);
      setRecentExpenses(expensesResponse.data || []);
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredExpenses = recentExpenses.filter(item =>
    (item.title || item.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.user || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.time || item.createdAt || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your expenses and balances</p>
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
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
          </button>
        </div>
      </div>

      {/* Budget Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      </div>

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
            {filteredExpenses.map((item, index) => (
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
                  <p className="text-sm text-gray-600">Added by {item.user || 'Unknown'} • {item.time || item.createdAt}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">₹{item.amount || 0}</p>
                  {item.owed === 'settled' ? (
                    <p className="text-sm text-gray-500">Settled</p>
                  ) : (
                    <p className="text-sm text-green-600">You are owed ₹{item.owed || 0}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
