import { 
  Users, 
  Plus, 
  Trash2, 
  ChevronRight 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Groups() {
  const navigate = useNavigate();

  const [groups, setGroups] = useState([
    { name: 'Trip to Vegas', members: 5, youOwe: 125.50, youAreOwed: 75.25, color: 'from-purple-500 to-purple-600' },
    { name: 'House Expenses', members: 3, youOwe: 89.75, youAreOwed: 156.30, color: 'from-blue-500 to-blue-600' },
    { name: 'Office Lunch', members: 8, youOwe: 23.40, youAreOwed: 45.80, color: 'from-green-500 to-green-600' },
    { name: 'Weekend Getaway', members: 4, youOwe: 0, youAreOwed: 234.60, color: 'from-orange-500 to-orange-600' }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  const handleCreateGroup = () => {
    if (newGroupName.trim()) {
      setGroups([
        ...groups,
        { name: newGroupName, members: 1, youOwe: 0, youAreOwed: 0, color: 'from-gray-500 to-gray-600' }
      ]);
      setNewGroupName('');
      setShowModal(false);
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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {groups.map((group, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 hover:-translate-y-1 relative">
            <div className={`h-2 bg-gradient-to-r ${group.color}`}></div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 bg-gradient-to-r ${group.color} rounded-lg flex items-center justify-center`}>
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{group.name}</h3>
                    <p className="text-sm text-gray-600">{group.members} members</p>
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
                  <span className="text-sm font-bold text-red-600">₹{group.youOwe.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">You are owed:</span>
                  <span className="text-sm font-bold text-green-600">₹{group.youAreOwed.toFixed(2)}</span>
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
    </div>
  );
}
