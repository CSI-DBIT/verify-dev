import { useEffect } from 'react';
import { refreshToken } from '../api/authApi';
import { useAuthStore } from '@/stores';

const useAuth = () => {
  const { 
    accessToken, 
    clearCredentials, 
    setAccessToken 
  } = useAuthStore();

  useEffect(() => {
    if (!accessToken) {
      clearCredentials();
    }
  }, [accessToken, clearCredentials]);

  const validateToken = async () => {
    try {
      // Attempt a protected call to check token validity
    } catch (error) {
      // Refresh token if needed
      const newAccessToken = await refreshToken();
      setAccessToken(newAccessToken);
    }
  };

  return { accessToken, validateToken };
};

export default useAuth;
