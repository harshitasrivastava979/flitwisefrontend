import { 
  Users,  
  Calendar,
  Filter,
  Search,
  Tag,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  IndianRupee,
  Receipt
} from "lucide-react";
import { useState, useEffect } from "react";
import { getExpenses } from "../services/expenseService";
import { getGroups } from "../services/groupService";
import { getAllUsers } from "../services/userService";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function Activity() {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [groups, setGroups] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
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
  }, [filters.groupId, filters.category, filters.startDate, filters.endDate]);

  
  const formatDate = (timestamp) => {
    if (!timestamp) return "No date";
    const safe = timestamp.replace(" ", "T");
    const d = new Date(safe);
    return isNaN(d) ? "No date" : d.toLocaleDateString();
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      const [groupsRes, usersRes] = await Promise.all([
        getGroups(),
        getAllUsers()
      ]);

      const groups = groupsRes.data || [];
      const users = usersRes.data || [];
      setGroups(groups);
      setAllUsers(users);

      if (groups.length > 0) {
        const allExpenses = [];
        for (const group of groups) {
          if (!filters.groupId || group.id === parseInt(filters.groupId)) {
            const res = await getExpenses(
              group.id,
              filters.category,
              filters.startDate,
              filters.endDate
            );
            const expensesWithGroupName = (res.data || []).map(e => ({
              ...e,
              groupName: group.name
            }));
            allExpenses.push(...expensesWithGroupName);
          }
        }
        setActivities(allExpenses);
      } else {
        setActivities([]);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch activities");
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = activities.filter(item =>
    (item.title || item.description || '').toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
    (item.category || '').toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
    (item.groupName || '').toLowerCase().includes(filters.searchTerm.toLowerCase())
  );

  const calculateTotalSpent = () =>
    filteredActivities.reduce((t, a) => t + (a.amount || 0), 0);

  const calculateAverageSpent = () =>
    filteredActivities.length ? calculateTotalSpent() / filteredActivities.length : 0;

  const getUserName = (userId) =>
    allUsers.find(u => u.id === userId)?.name || "Unknown User";

  if (loading) {
    return <p className="text-center">Loading activities...</p>;
  }

  if (error) {
    return <p className="text-center text-red-600">{error}</p>;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <p>Total Activities</p>
          <p className="text-2xl font-bold">{filteredActivities.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <p>Total Spent</p>
          <p className="text-2xl font-bold">₹{calculateTotalSpent()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <p>Average per Activity</p>
          <p className="text-2xl font-bold">₹{calculateAverageSpent().toFixed(0)}</p>
        </div>
      </div>

      {/* Activities */}
      <div className="bg-white rounded-xl shadow divide-y">
        {filteredActivities.map(item => (
          <div key={item.id} className="p-6 flex space-x-4">
            <div className="flex-1">
              <h3 className="font-semibold">{item.description}</h3>

              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                <span className="flex items-center">
                  <IndianRupee className="w-4 h-4 mr-1" />
                  ₹{item.amount}
                </span>

                <span className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {item.groupName}
                </span>

                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(item.timestamp)}
                </span>
              </div>

              {item.paidByUserID === user?.id ? (
                <p className="text-green-600 mt-1">You paid for this expense</p>
              ) : (
                <p className="text-blue-600 mt-1">
                  Paid by {getUserName(item.paidByUserID)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
