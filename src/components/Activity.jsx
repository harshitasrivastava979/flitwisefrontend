import { 
  Users,  
  DollarSign,
  Receipt,
  Calendar
} from "lucide-react";
import { useState, useEffect } from "react";
import { getExpenses } from "../services/expenseService";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function Activity() {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      // Use a default group ID of 1 for now
      const response = await getExpenses(1);
      console.log('Activities response:', response);
      setActivities(response.data || []);
    } catch (err) {
      setError('Failed to fetch activities');
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
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
            onClick={fetchActivities}
            className="mt-4 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Activity</h1>
          <p className="text-gray-600 mt-1">Recent transactions and updates</p>
        </div>
        <div className="text-center py-12">
          <Receipt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No activities yet</h3>
          <p className="text-gray-600">Start adding expenses to see your activity feed</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Activity</h1>
        <p className="text-gray-600 mt-1">Recent transactions and updates</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {activities.map((item, index) => (
            <div key={item.id || index} className="flex items-start space-x-4 p-6 hover:bg-gray-50 transition-colors">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                item.type === 'expense' ? 'bg-orange-100' : 
                item.type === 'settlement' ? 'bg-green-100' : 'bg-blue-100'
              }`}>
                {item.type === 'expense' ? 
                  <Receipt className="w-6 h-6 text-orange-600" /> :
                  item.type === 'settlement' ?
                  <DollarSign className="w-6 h-6 text-green-600" /> :
                  <Users className="w-6 h-6 text-blue-600" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 leading-relaxed">{item.title || item.description}</p>
                {item.amount && (
                  <p className="text-sm text-gray-600 mt-1">
                    ₹{item.amount}
                    {item.owed && item.owed !== 'settled' && item.owed !== 'You paid' && ` • ₹${item.owed}`}
                    {item.owed === 'settled' && ` • Settled`}
                    {item.owed === 'You paid' && ` • You paid`}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-2 flex items-center space-x-2">
                  <Calendar className="w-3 h-3" />
                  <span>{item.time || item.createdAt}</span>
                </p>
              </div>
              {item.type === 'settlement' && (
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Settled
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
