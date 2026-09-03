import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    const saved = localStorage.getItem('raksha_token') || '';
    if (saved) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${saved}`;
    }
    return saved;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[Dashboard] Authentication check started');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchProfile();
    } else {
      console.log('[Dashboard] Authentication resolved (no token)');
      setLoading(false);
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('/api/v1/auth/me');
      setUser(res.data);
      console.log('[Dashboard] Authentication resolved (user:', res.data.email, ')');
    } catch (err) {
      console.error('[Dashboard ERROR] Auth check failed:', err?.message || err);
      if (err.response && err.response.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await axios.post('/api/v1/auth/login', { email, password });
    const { access_token, user_id, full_name, role } = res.data;
    localStorage.setItem('raksha_token', access_token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    setUser({ id: user_id, full_name, email, role });
    setToken(access_token);
    setLoading(false);
    console.log('[Dashboard] Logged in successfully as:', email);
    return res.data;
  };

  const register = async (full_name, email, password, role = 'user') => {
    const res = await axios.post('/api/v1/auth/register', { full_name, email, password, role });
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('raksha_token');
    setToken('');
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    console.log('[Dashboard] User logged out');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
