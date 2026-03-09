import React from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import NoteEditor from "./pages/NoteEditor";
import Settings from "./pages/Settings";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null; // Context handles loading UI mostly, but double check
  return user ? children : <Navigate to="/auth" />;
};

// Route for redirecting authenticated users away from Auth page
const AuthRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/" /> : children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/auth"
        element={
          <AuthRoute>
            <Auth />
          </AuthRoute>
        }
      />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />
      <Route
        path="/note/new"
        element={
          <PrivateRoute>
            <NoteEditor />
          </PrivateRoute>
        }
      />
      <Route
        path="/note/:id"
        element={
          <PrivateRoute>
            <NoteEditor />
          </PrivateRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}
