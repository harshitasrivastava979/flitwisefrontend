import { 
  Users,  
  DollarSign,
  Receipt,
  Calendar,
  Filter,
  Search,
  Tag,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { getExpenses } from "../services/expenseService";
import { getGroups } from "../services/groupService";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function Activity() {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    groupId: '',
    category: '',
    startDate: '',
    endDate: '',
    searchTerm: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [expensesRes, groupsRes] = await Promise.all([
        getExpenses(filters.groupId || 1, filters.category, filters.startDate, filters.endDate),
        getGroups()
      ]);
      console.log('Activity data responses:', { expensesRes, groupsRes });
      setActivities(expensesRes.data || []);
      setGroups(groupsRes.data || []);
    } catch (err) {
      setError('Failed to fetch activities');
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    fetchData();
  };

  const clearFilters = () => {
    setFilters({
      groupId: '',
      category: '',
      startDate: '',
      endDate: '',
      searchTerm: ''
    });
    fetchData();
  };

  const filteredActivities = activities.filter(item =>
    (item.title || item.description || '').toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
    (item.category || '').toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
    (item.groupName || '').toLowerCase().includes(filters.searchTerm.toLowerCase())
  );

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

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'food & dining':
        return '🍽️';
      case 'transportation':
        return '🚗';
      case 'entertainment':
        return '🎬';
      case 'shopping':
        return '🛍️';
      case 'bills & utilities':
        return '💡';
      case 'healthcare':
        return '🏥';
      case 'travel':
        return '✈️';
      case 'education':
        return '📚';
      default:
        return '💰';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'settled':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'overdue':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const calculateTotalSpent = () => {
    return filteredActivities.reduce((total, activity) => total + (activity.amount || 0), 0);
  };

  const calculateAverageSpent = () => {
    return filteredActivities.length > 0 ? calculateTotalSpent() / filteredActivities.length : 0;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Activity</h1>
          <p className="text-gray-600 mt-1">Recent transactions and updates</p>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading activities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Activity</h1>
          <p className="text-gray-600 mt-1">Recent transactions and updates</p>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchData}
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Activity</h1>
          <p className="text-gray-600 mt-1">Recent transactions and updates</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search activities..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent w-64"
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Activities</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Group</label>
              <select
                value={filters.groupId}
                onChange={(e) => handleFilterChange('groupId', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">All Groups</option>
                {groups.map(group => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Clear
            </button>
            <button
              onClick={applyFilters}
              className="bg-teal-600 text-white px-4 py-2 rounded-md font-medium hover:bg-teal-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Receipt className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Activities</p>
              <p className="text-2xl font-bold text-gray-900">{filteredActivities.length}</p>
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
              <p className="text-sm font-medium text-gray-600">Average per Activity</p>
              <p className="text-2xl font-bold text-gray-900">₹{calculateAverageSpent().toFixed(0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Activities List */}
      {filteredActivities.length === 0 ? (
        <div className="text-center py-12">
          <Receipt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
          <p className="text-gray-600">Try adjusting your filters or add some expenses to see activity here</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {filteredActivities.map((item, index) => (
              <div key={item.id || index} className="flex items-start space-x-4 p-6 hover:bg-gray-50 transition-colors">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  item.type === 'expense' ? 'bg-orange-100' : 
                  item.type === 'settlement' ? 'bg-green-100' : 'bg-blue-100'
                }`}>
                  <span className="text-lg">{getCategoryIcon(item.category)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 leading-relaxed">{item.title || item.description}</h3>
                    <div className="flex items-center space-x-2">
                      {item.category && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <Tag className="w-3 h-3 mr-1" />
                          {item.category}
                        </span>
                      )}
                      {item.owed === 'settled' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Settled
                        </span>
                      )}
                      {item.owed && item.owed !== 'settled' && item.owed !== 'You paid' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                    <span className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      ₹{item.amount || 0}
                    </span>
                    {item.groupName && (
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {item.groupName}
                      </span>
                    )}
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(item.time || item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {item.owed && item.owed !== 'settled' && item.owed !== 'You paid' && (
                    <p className="text-sm text-blue-600">
                      You owe ₹{item.owed}
                    </p>
                  )}
                  {item.owed === 'You paid' && (
                    <p className="text-sm text-green-600">
                      You paid for this expense
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
