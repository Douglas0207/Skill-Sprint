import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import OKRList from './pages/OKRList';
import OKRDetail from './pages/OKRDetail';
import CreateOKR from './pages/CreateOKR';
import EditOKR from './pages/EditOKR';
import LoadingSpinner from './components/LoadingSpinner';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  const { user } = useAuth();

  return (
    <div className="App">
      {user && <Navbar />}
      <main className="container">
        <Routes>
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/okrs" 
            element={
              <ProtectedRoute>
                <OKRList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/okrs/create" 
            element={
              <ProtectedRoute>
                <CreateOKR />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/okrs/:id" 
            element={
              <ProtectedRoute>
                <OKRDetail />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/okrs/:id/edit" 
            element={
              <ProtectedRoute>
                <EditOKR />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/" 
            element={<Navigate to="/dashboard" replace />} 
          />
        </Routes>
      </main>
    </div>
  );
}

export default App; 