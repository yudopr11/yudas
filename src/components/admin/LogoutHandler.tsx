import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { logout } from '../../services/auth';
import { toast } from 'react-hot-toast';

const LogoutHandler: React.FC = () => {
  const [isLoggedOut, setIsLoggedOut] = React.useState(false);

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await logout(true);
        setIsLoggedOut(true);
        toast.success('Successfully logged out');
      } catch (error) {
        console.error('Logout error:', error);
        setIsLoggedOut(true);
      }
    };
    
    handleLogout();
  }, []);

  if (isLoggedOut) {
    return <Navigate to="/login" replace />;
  }
  
  return null;
};

export default LogoutHandler; 