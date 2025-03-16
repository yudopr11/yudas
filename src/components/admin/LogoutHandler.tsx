import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { logout } from '../../services/auth';

const LogoutHandler: React.FC = () => {
  const [isLoggedOut, setIsLoggedOut] = React.useState(false);

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await logout(true);
        setIsLoggedOut(true);
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