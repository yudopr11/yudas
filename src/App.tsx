import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import Login from './components/Login';
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './components/admin/Dashboard';
import Posts from './components/admin/Posts';
import Users from './components/admin/Users';
import LogoutHandler from './components/admin/LogoutHandler';

export default function App() {
  return (
    <HelmetProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          
          {/* CMS Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="posts" element={<Posts />} />
            <Route path="users" element={<Users />} />
          </Route>
          <Route path="/admin/logout" element={<LogoutHandler />} />
          
          {/* Default Route - Redirect to CMS */}
          <Route path="/" element={<Navigate to="/admin" replace />} />
          
          {/* Redirect any unknown routes to CMS */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </Router>
    </HelmetProvider>
  );
} 