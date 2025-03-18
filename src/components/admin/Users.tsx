import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import usePageTitle from '../../hooks/usePageTitle';
import { getAllUsers, createUser, deleteUser, type User } from '../../services/api';
import DeleteModal from '../common/DeleteModal';

const Users: React.FC = () => {
  // Mengatur judul halaman
  usePageTitle('Manage Users');
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Form state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSuperuser, setIsSuperuser] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      toast.error('Failed to load users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setIsSuperuser(false);
    setShowForm(true);
  };

  const handleDelete = async (userId: number) => {
    setUserToDelete(userId);
    setShowDeleteModal(true);
  };
  
  const confirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      setDeleteLoading(true);
      await deleteUser(userToDelete);
      toast.success('User deleted successfully');
      
      // Remove the deleted user from the current users list
      setUsers(users.filter(user => user.user_id !== userToDelete));
    } catch (error) {
      toast.error('Failed to delete user');
      console.error('Error deleting user:', error);
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };
  
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    try {
      const userData = {
        username,
        email,
        password,
        is_superuser: isSuperuser
      };
      
      await createUser(userData);
      toast.success('User created successfully');
      
      setShowForm(false);
      fetchUsers();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.detail || 'Failed to create user');
      } else {
        toast.error('Failed to create user');
      }
      console.error('Error creating user:', error);
    }
  };

  return (
    <div className="w-full h-full">
      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        itemLabel="User"
        isLoading={deleteLoading}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Users</h1>
          <p className="text-gray-400">Manage users who can access the yudopr app</p>
        </div>
        <button
          onClick={handleCreateNew}
          className="btn-primary"
        >
          Add New User
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card bg-gray-800 p-6 rounded-xl shadow-lg mb-8">
          <h2 className="text-xl font-semibold text-primary-400 mb-4">
            Create New User
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-1">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field text-white bg-gray-700 w-full"
                placeholder="Username"
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field text-white bg-gray-700 w-full"
                placeholder="user@example.com"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field text-white bg-gray-700 w-full"
                placeholder="Password"
                required
                minLength={8}
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-400 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field text-white bg-gray-700 w-full"
                placeholder="Confirm password"
                required
                minLength={8}
              />
            </div>
            
            <div className="flex items-center">
              <input
                id="isSuperuser"
                type="checkbox"
                checked={isSuperuser}
                onChange={(e) => setIsSuperuser(e.target.checked)}
                className="h-4 w-4 text-primary-500 focus:ring-primary-400 border-gray-600 rounded"
              />
              <label htmlFor="isSuperuser" className="ml-2 block text-sm text-gray-300">
                Super User (can manage all content)
              </label>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                Create User
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin h-10 w-10 border-t-2 border-b-2 border-primary-400 rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">No users found. Create your first user!</p>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden shadow-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Username
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Created Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-900 divide-y divide-gray-800">
              {users.map((user) => (
                <tr key={user.user_id} className="hover:bg-gray-800 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{user.username}</div>
                    <div className="text-xs text-gray-400">{user.uuid}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-400">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-400">
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.is_superuser ? 'bg-purple-900 text-purple-100' : 'bg-blue-900 text-blue-100'
                    }`}>
                      {user.is_superuser ? 'Admin' : 'Editor'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDelete(user.user_id)}
                      className="text-red-400 hover:text-red-300 ml-4"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Users; 