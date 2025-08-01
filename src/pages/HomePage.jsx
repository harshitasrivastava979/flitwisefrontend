import { Routes, Route } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import Dashboard from "../components/Dashboard.jsx";
import Groups from "../components/Groups.jsx";
import GroupDetails from "../components/GroupDetails.jsx";
import Activity from "../components/Activity.jsx";
import Budgets from "./Budgets.jsx";
import Profile from "./Profile.jsx";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <main className="lg:ml-80 transition-all duration-300">
        <div className="p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/groups/:groupName" element={<GroupDetails />} />
            <Route path="/expenses" element={<Activity />} />
            <Route path="/budgets" element={<Budgets />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

