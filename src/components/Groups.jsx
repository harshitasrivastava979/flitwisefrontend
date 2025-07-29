import { 
  Users, 
  Plus, 
  Trash2, 
  ChevronRight 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { createGroup, getGroups } from "../services/groupService";
import { checkBackendHealth } from "../services/api";
import { useAuth } from "../contexts/AuthContext.jsx";
import TroubleshootingGuide from "./TroubleshootingGuide.jsx";

export default function Groups() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');

  const [showModal, setShowModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);

  useEffect(() => {
    checkBackendAndFetchGroups();
  }, []);

  const checkBackendAndFetchGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First check if backend is accessible
      const isBackendHealthy = await checkBackendHealth();
      setBackendStatus(isBackendHealthy ? 'connected' : 'disconnected');
      
      if (!isBackendHealthy) {
        setError('Backend server is not accessible. Please ensure the backend is running on port 8080.');
        return;
      }
      
      // If backend is healthy, fetch groups
      await fetchGroups();
    } catch (err) {
      setError('Failed to connect to backend server');
      console.error('Error checking backend:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await getGroups();
      console.log('Groups response:', response);
      // Since we're using the users endpoint temporarily, we'll treat users as groups
      const groupsData = response.data || [];
      setGroups(groupsData);
    } catch (err) {
      setError('Failed to fetch groups: ' + (err.response?.data?.message || err.message));
      console.error('Error fetching groups:', err);
    }
  };

  const handleCreateGroup = async () => {
    if (newGroupName.trim()) {
      try {
        const groupData = {
          name: newGroupName,
          description: `Group created by ${user?.name || 'User'}`,
          currency: 'INR',
          usersList: [user] // Add current user to the group
        };
        const response = await createGroup(groupData);
        console.log('Create group response:', response);
        setGroups([...groups, response.data]);
        setNewGroupName('');
        setShowModal(false);
      } catch (err) {
        setError('Failed to create group');
        console.error('Error creating group:', err);
      }
    }
  };

  const handleDelete = (index) => {
    const updated = [...groups];
    updated.splice(index, 1);
    setGroups(updated);
  };

  const handleViewDetails = (groupName) => {
    navigate(`/groups/${encodeURIComponent(groupName)}`);
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
            <h3 className="text-lg font-medium text-red-800 mb-2">Connection Error</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <div className="space-y-2 text-sm text-red-600">
              <p>Backend Status: <span className={`font-medium ${backendStatus === 'connected' ? 'text-green-600' : 'text-red-600'}`}>
                {backendStatus === 'connected' ? 'Connected' : backendStatus === 'disconnected' ? 'Disconnected' : 'Checking...'}
              </span></p>
              <p>API URL: http://localhost:8080</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button 
                onClick={checkBackendAndFetchGroups}
                className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 font-medium"
              >
                Retry Connection
              </button>
              <button 
                onClick={() => setShowTroubleshooting(true)}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 font-medium"
              >
                Troubleshooting Guide
              </button>
            </div>
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
          {groups.map((group, index) => (
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
                      <p className="text-sm text-gray-600">{group.members || 1} members</p>
                    </div>
                  </div>
                  <Trash2
                    onClick={() => handleDelete(index)}
                    className="w-5 h-5 text-red-500 hover:text-red-700 cursor-pointer"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">You owe:</span>
                    <span className="text-sm font-bold text-red-600">₹{group.youOwe || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">You are owed:</span>
                    <span className="text-sm font-bold text-green-600">₹{group.youAreOwed || 0}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleViewDetails(group.name)}
                  className="w-full mt-4 text-teal-600 hover:text-teal-700 hover:bg-teal-50 py-2 px-4 rounded-lg transition-colors text-sm font-medium flex justify-center items-center space-x-2"
                >
                  <span>View Details</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
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

      {/* Troubleshooting Guide */}
      <TroubleshootingGuide 
        isVisible={showTroubleshooting} 
        onClose={() => setShowTroubleshooting(false)} 
      />
    </div>
  );
}
