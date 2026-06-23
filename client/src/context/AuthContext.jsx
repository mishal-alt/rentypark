import { createContext, useContext, useState } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('rentypark_user');
    return stored ? JSON.parse(stored) : null;
  });

  function persistSession(token, user) {
    localStorage.setItem('rentypark_token', token);
    localStorage.setItem('rentypark_user', JSON.stringify(user));
    setUser(user);
  }

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    persistSession(data.token, data.user);
  }

  async function signup(payload) {
    const { data } = await api.post('/auth/signup', payload);
    persistSession(data.token, data.user);
  }

  function logout() {
    localStorage.removeItem('rentypark_token');
    localStorage.removeItem('rentypark_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
