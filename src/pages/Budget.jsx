import { useState, useEffect } from "react";
import { 
  DollarSign, 
  Plus, 
  Trash2, 
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { 
  createBudget, 
  getUserBudgets, 
  deleteBudget, 
  getNearingLimit, 
  getExceededBudgets 
} from "../services/budgetService";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function Budget() {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [nearingLimit, setNearingLimit] = useState([]);
  const [exceeded, setExceeded] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newBudget, setNewBudget] = useState({
    name: '',
    amount: '',
    category: ''
  });

  useEffect(() => {
    fetchBudgetData();
  }, []);

  const fetchBudgetData = async () => {
    try {
      setLoading(true);
      
      if (user?.id) {
        const [budgetsRes, nearingRes, exceededRes] = await Promise.all([
          getUserBudgets(user.id),
          getNearingLimit(user.id),
          getExceededBudgets(user.id)
        ]);
        
        console.log('Budget data responses:', { budgetsRes, nearingRes, exceededRes });
        
        setBudgets(budgetsRes.data || []);
        setNearingLimit(nearingRes.data || []);
        setExceeded(exceededRes.data || []);
      }
    } catch (err) {
      setError('Failed to fetch budget data');
      console.error('Error fetching budget data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBudget = async () => {
    if (newBudget.name && newBudget.amount) {
      try {
        const budgetData = {
          userId: user?.id,
          category: newBudget.category || newBudget.name,
          monthlyLimit: parseFloat(newBudget.amount)
        };
        const response = await createBudget(budgetData);
        console.log('Create budget response:', response);
        setBudgets([...budgets, response.data]);
        setNewBudget({ name: '', amount: '', category: '' });
        setShowModal(false);
      } catch (err) {
        setError('Failed to create budget');
        console.error('Error creating budget:', err);
      }
    }
  };

  const handleDeleteBudget = async (budgetId) => {
    try {
      await deleteBudget(budgetId);
      setBudgets(budgets.filter(budget => budget.id !== budgetId));
    } catch (err) {
      setError('Failed to delete budget');
      console.error('Error deleting budget:', err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Budget</h1>
          <p className="text-gray-600 mt-1">Manage your spending limits</p>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading budgets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Budget</h1>
          <p className="text-gray-600 mt-1">Manage your spending limits</p>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchBudgetData}
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
          <h1 className="text-3xl font-bold text-gray-900">Budget</h1>
          <p className="text-gray-600 mt-1">Manage your spending limits</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Create Budget</span>
        </button>
      </div>

      {/* Alerts */}
      {exceeded.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Budget Exceeded</h3>
              <p className="text-sm text-red-700">You have {exceeded.length} budget(s) that have exceeded their limits.</p>
            </div>
          </div>
        </div>
      )}

      {nearingLimit.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-5 h-5 text-yellow-600" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Nearing Limit</h3>
              <p className="text-sm text-yellow-700">You have {nearingLimit.length} budget(s) nearing their limits.</p>
            </div>
          </div>
        </div>
      )}

      {/* Budget Cards */}
      {budgets.length === 0 ? (
        <div className="text-center py-12">
          <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No budgets yet</h3>
          <p className="text-gray-600 mb-4">Create your first budget to start tracking your spending</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700"
          >
            Create Budget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {budgets.map((budget) => {
            const percentage = (budget.spent / budget.amount) * 100;
            const isExceeded = percentage > 100;
            const isNearing = percentage > 80 && percentage <= 100;
            
            return (
              <div key={budget.id} className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 hover:-translate-y-1 relative">
                <div className={`h-2 ${
                  isExceeded ? 'bg-red-500' : 
                  isNearing ? 'bg-yellow-500' : 'bg-green-500'
                }`}></div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        isExceeded ? 'bg-red-100' : 
                        isNearing ? 'bg-yellow-100' : 'bg-green-100'
                      }`}>
                        <DollarSign className={`w-6 h-6 ${
                          isExceeded ? 'text-red-600' : 
                          isNearing ? 'text-yellow-600' : 'text-green-600'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{budget.name}</h3>
                        <p className="text-sm text-gray-600">{budget.category || 'General'}</p>
                      </div>
                    </div>
                    <Trash2
                      onClick={() => handleDeleteBudget(budget.id)}
                      className="w-5 h-5 text-red-500 hover:text-red-700 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Spent:</span>
                      <span className="text-sm font-bold text-gray-900">₹{budget.spent || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Limit:</span>
                      <span className="text-sm font-bold text-gray-900">₹{budget.amount}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          isExceeded ? 'bg-red-500' : 
                          isNearing ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">{percentage.toFixed(1)}% used</span>
                      {isExceeded && (
                        <span className="text-red-600 flex items-center space-x-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Exceeded</span>
                        </span>
                      )}
                      {isNearing && !isExceeded && (
                        <span className="text-yellow-600 flex items-center space-x-1">
                          <TrendingUp className="w-3 h-3" />
                          <span>Nearing</span>
                        </span>
                      )}
                      {!isNearing && !isExceeded && (
                        <span className="text-green-600 flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Good</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Budget Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96 space-y-4 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">Create New Budget</h2>
            <input
              type="text"
              value={newBudget.name}
              onChange={(e) => setNewBudget({...newBudget, name: e.target.value})}
              placeholder="Budget name"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <input
              type="number"
              value={newBudget.amount}
              onChange={(e) => setNewBudget({...newBudget, amount: e.target.value})}
              placeholder="Amount"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <input
              type="text"
              value={newBudget.category}
              onChange={(e) => setNewBudget({...newBudget, category: e.target.value})}
              placeholder="Category (optional)"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowModal(false)} className="text-sm text-gray-500 hover:underline">
                Cancel
              </button>
              <button onClick={handleCreateBudget} className="bg-teal-600 text-white px-4 py-2 rounded-md text-sm hover:bg-teal-700">
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 