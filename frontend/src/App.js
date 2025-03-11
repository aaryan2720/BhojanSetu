import { ThemeProvider } from '@mui/material';
import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import UserManagement from './pages/admin/UserManagement';
import AdminDashboard from './pages/AdminDashboard';
import CreateListing from './pages/CreateListing';
import Dashboard from './pages/Dashboard';
import EventManagerDashboard from './pages/EventManagerDashboard';
import CreateEvent from './pages/EventManagerDashboard/CreateEvent';
import ManageEvent from './pages/EventManagerDashboard/ManageEvent';
import Login from './pages/Login';
import MyListings from './pages/MyListings';
import Profile from './pages/Profile';
import Register from './pages/Register';
import theme from './theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Event Manager Routes */}
            <Route
              path="/event-manager/*"
              element={
                <ProtectedRoute allowedTypes={['eventManager']}>
                  <Routes>
                    <Route path="/" element={<EventManagerDashboard />} />
                    <Route path="create-event" element={<CreateEvent />} />
                    <Route path="events/:eventId" element={<ManageEvent />} />
                  </Routes>
                </ProtectedRoute>
              }
            />

            {/* Other existing routes */}
            <Route
              path="/create-listing"
              element={
                <ProtectedRoute allowedTypes={['donor', 'ngo']}>
                  <CreateListing />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-listings"
              element={
                <ProtectedRoute allowedTypes={['donor', 'ngo']}>
                  <MyListings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedTypes={['admin']}>
                  <Routes>
                    <Route path="/" element={<AdminDashboard />} />
                    <Route path="/users" element={<UserManagement />} />
                  </Routes>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 