import React from 'react';
import { Link } from 'react-router-dom';
import usePageTitle from '../../hooks/usePageTitle';

const Dashboard: React.FC = () => {
  // Mengatur judul halaman
  usePageTitle('Dashboard');
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome to your Dashboard</h1>
        <p className="text-gray-400">Manage your content from here</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-primary-400 mb-4">Blog Posts</h2>
          <p className="text-gray-300 mb-4">Manage your blog content - create, edit, and delete posts.</p>
          <Link 
            to="/admin/posts" 
            className="inline-block btn-secondary"
          >
            Manage Posts
          </Link>
        </div>
        
        <div className="card bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-primary-400 mb-4">User Management</h2>
          <p className="text-gray-300 mb-4">Add or remove users who can access the CMS.</p>
          <Link 
            to="/admin/users" 
            className="inline-block btn-secondary"
          >
            Manage Users
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 