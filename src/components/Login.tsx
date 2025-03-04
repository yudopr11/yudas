import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/auth';
import toast from 'react-hot-toast';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import usePageTitle from '../hooks/usePageTitle';

export default function Login() {
  usePageTitle('Login');
  
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return; // Prevent multiple submissions
    setIsLoading(true);

    try {
      await login(username, password);
      toast.success('Login successful!', {
        duration: 3000
      });
      navigate('/');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message, {
          duration: 5000,
          icon: '🔒'
        });
      } else {
        toast.error('Login failed. Please try again.', {
          duration: 5000,
          icon: '❌'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 flex flex-col justify-start items-center pt-24 px-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-400 mb-2">yudas</h1>
          <p className="text-gray-400">Content Management System by yudopr</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-6">Login to continue</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-1">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field text-white bg-gray-800"
                  placeholder="Enter your username"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field text-white bg-gray-800 pr-10"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200 transition-colors"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !username || !password}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
} 