import React, { useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { logout } from '../../services/auth';
import toast from 'react-hot-toast';
import usePageTitle from '../../hooks/usePageTitle';

// Global flag to prevent multiple execution across renders
let isLogoutProcessed = false;

const LogoutHandler: React.FC = () => {
  // Mengatur judul halaman
  usePageTitle('Logout');
  
  // Use state to track if we've finished logout
  const [isLogoutComplete, setIsLogoutComplete] = useState(false);
  // Use a ref to track if we've already started the logout process
  const logoutStarted = useRef(false);

  useEffect(() => {
    const performLogout = async () => {
      // Check both the component-level ref and the global flag
      if (logoutStarted.current || isLogoutProcessed) return;
      
      try {
        // Mark as started both locally and globally
        logoutStarted.current = true;
        isLogoutProcessed = true;
        
        // Clear any existing logout toasts first
        toast.dismiss('logout-success');
        
        await logout(true);
        
        // Show toast only once
        toast.success('You have been logged out', { 
          duration: 5000, // 5 seconds
          id: 'logout-success', // Add unique ID to prevent duplicates
          icon: '👋', // Add waving hand icon
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
            fontSize: '16px',
            padding: '16px'
          }
        });
        
        // Delay navigation to allow toast to be visible
        setTimeout(() => {
          setIsLogoutComplete(true);
        }, 2000); // Wait 3 seconds before redirecting
      } catch (error) {
        console.error('Logout error:', error);
        // Even on error, delay navigation
        setTimeout(() => {
          setIsLogoutComplete(true);
        }, 2000);
      }
    };
    
    performLogout();
    
    // Cleanup function to clear any pending toasts if component unmounts
    return () => {
      toast.dismiss('logout-success');
    };
  }, []); // Empty dependency array ensures this runs only once

  // Only redirect after logout is complete
  if (isLogoutComplete) {
    return <Navigate to="/login" replace />;
  }
  
  // Show nothing while logout is in progress
  return null;
};

export default LogoutHandler; 