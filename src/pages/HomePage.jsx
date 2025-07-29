import { Routes, Route, useNavigate } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import Dashboard from "../components/Dashboard.jsx";
import Groups from "../components/Groups.jsx";
import Activity from "../components/Activity.jsx";

export default function HomePage({ user, setUser }) {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard user={user} />;
      case 'groups':
        return <Groups />;
      case 'activity':
        return <Activity />;
      default:
        return <Dashboard user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} setUser={setUser} user={user} />
      
      <main className="lg:ml-80 transition-all duration-300">
        <div className="p-6 lg:p-8">
          {renderCurrentView()}
        </div>
      </main>
    </div>
  );
}

