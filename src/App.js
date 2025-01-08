import Login from "./components/Login/Login";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedaRoutes/ProtectedRoutes";
import { Navigate } from "react-router-dom";
import Dashboard from "./components/Dashboard/Dashboard";
import { UserProvider } from "./components/Contexts/UserContext";

function App() {
  return (
    <div className="">
      <UserProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            {/* Default Route */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </Router>
      </UserProvider>
    </div>
  );
}

export default App;
