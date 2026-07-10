import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('thikana_token');
    if (!token) { setLoading(false); return; }
    api.get('/auth/me')
      .then((data) => setUser(data.user))
      .catch(() => localStorage.removeItem('thikana_token'))
      .finally(() => setLoading(false));
  }, []);

  async function login(emailOrPhone, password) {
    const data = await api.post('/auth/login', { emailOrPhone, password }, { auth: false });
    localStorage.setItem('thikana_token', data.token);
    setUser(data.user);
    return data.user;
  }

  async function register(payload) {
    const data = await api.post('/auth/register', payload, { auth: false });
    localStorage.setItem('thikana_token', data.token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem('thikana_token');
    setUser(null);
  }

  async function becomeSeller(storeName, bio) {
    const data = await api.patch('/auth/become-seller', { storeName, bio });
    setUser(data.user);
    return data.user;
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, becomeSeller, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
