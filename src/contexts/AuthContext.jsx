import { createContext, useContext, useState, useEffect } from 'react';
import { apiGet, apiPost, setToken } from '../services/api';
import { setProFromAuth } from '../services/pro';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setLoading(false);
      return;
    }
    apiGet('/api/auth/me')
      .then(data => setUser(data))
      .catch(() => {
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function signUp(email, password) {
    const data = await apiPost('/api/auth/signup', { email, password });
    setToken(data.token);
    setUser(data.user);
    return data;
  }

  async function signIn(email, password) {
    const data = await apiPost('/api/auth/login', { email, password });
    setToken(data.token);
    setUser(data.user);
    return data;
  }

  // Sync pro status to global service
  useEffect(() => {
    setProFromAuth(user?.pro_status === true ? true : user ? false : null);
  }, [user]);

  function signOut() {
    setToken(null);
    setUser(null);
    setProFromAuth(null);
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    isAdmin: user?.role === 'admin',
    isPro: user?.pro_status === true,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
