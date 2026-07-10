import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('thikana_admin_token');
    if (!token) { setLoading(false); return; }
    api.get('/auth/me')
      .then((data) => {
        if (data.user.role.includes('admin')) setUser(data.user);
        else localStorage.removeItem('thikana_admin_token');
      })
      .catch(() => localStorage.removeItem('thikana_admin_token'))
      .finally(() => setLoading(false));
  }, []);

  async function login(emailOrPhone, password) {
    const data = await api.post('/auth/login', { emailOrPhone, password }, { auth: false });
    if (!data.user.role.includes('admin')) {
      throw new Error('This account does not have admin access');
    }
    localStorage.setItem('thikana_admin_token', data.token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem('thikana_admin_token');
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() { return useContext(AuthContext); }
