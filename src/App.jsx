import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";

export default function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route
            path="/"
            element={user ? <Navigate to="/home" /> : <LoginPage setUser={setUser} />}
          />
          <Route
            path="/home/*"
            element={user ? <HomePage user={user} setUser={setUser} /> : <Navigate to="/" />}
          />
        </Routes>
      </div>
    </Router>
  );
}