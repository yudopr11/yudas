import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { 
  ChevronRightIcon, 
  Bars3Icon,
  RectangleGroupIcon,
  DocumentTextIcon,
  UsersIcon,
  ArrowRightStartOnRectangleIcon 
} from '@heroicons/react/24/solid';
import { isAuthenticated } from '../../services/auth';
import usePageTitle from '../../hooks/usePageTitle';

// Navigation link component with active state
interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ to, icon, label, isActive, onClick }) => (
  <Link 
    to={to} 
    className={`flex items-center py-3 px-4 rounded-lg transition-all duration-200 
      ${isActive 
        ? 'bg-gray-700/60 text-primary-400 font-medium shadow-sm' 
        : 'text-gray-300 hover:bg-gray-700/40 hover:text-white'}`}
    onClick={onClick}
  >
    <span className="mr-3 text-xl">{icon}</span>
    <span className="transition-all duration-300">{label}</span>
    {isActive && (
      <span className="ml-auto">
        <ChevronRightIcon className="h-5 w-5" />
      </span>
    )}
  </Link>
);

const AdminLayout: React.FC = () => {
  // Set default title jika tidak ada halaman aktif
  usePageTitle('Admin Panel');
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Close sidebar when route changes on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  // Handle window resize to show sidebar on larger screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    // Set initial state based on screen size
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Verify authentication
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Main navigation items
  const navItems = [
    { to: '/admin/dashboard', icon: <RectangleGroupIcon className="h-6 w-6" />, label: 'Dashboard' },
    { to: '/admin/posts', icon: <DocumentTextIcon className="h-6 w-6" />, label: 'Posts' },
    { to: '/admin/users', icon: <UsersIcon className="h-6 w-6" />, label: 'Users' },
  ];

  const isPathActive = (path: string) => currentPath === path;

  return (
    <div className="flex h-screen bg-gradient-to-b from-gray-900 to-gray-950 overflow-hidden">
      {/* Sidebar overlay on mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* CMS Logo/Brand */}
          <div className="p-4 pt-6 pb-8">
            <h1 className="text-2xl font-bold text-primary-400 tracking-tight">yudas</h1>
            <p className="text-gray-400 text-sm">Content Management System</p>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                isActive={isPathActive(item.to)}
                onClick={() => setSidebarOpen(false)}
              />
            ))}
          </nav>
          
          {/* Bottom section with logout */}
          <div className="p-4 border-t border-gray-700">
            <Link 
              to="/admin/logout" 
              className="flex items-center py-2 px-4 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            >
              <span className="mr-3"><ArrowRightStartOnRectangleIcon className="h-6 w-6 text-red-400" /></span>
              Log out
            </Link>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="bg-gray-800 shadow-md z-10">
          <div className="px-4 py-3 sm:px-6 flex justify-between items-center">
            {/* Hamburger menu for mobile */}
            <button
              className="lg:hidden text-gray-300 hover:text-white"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>

            {/* Current section title - shows which page we're on */}
            <h2 className="text-xl font-semibold text-white">
              {navItems.find(item => isPathActive(item.to))?.label || 'Admin Panel'}
            </h2>
            
            {/* User menu/profile placeholder */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm text-gray-300">Welcome,</p>
                <p className="text-sm font-medium text-primary-400">Admin</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white">
                A
              </div>
            </div>
          </div>
        </header>
        
        {/* Main content with scrolling */}
        <main className="flex-1 overflow-y-auto p-6 bg-opacity-90">
          <div className="w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 