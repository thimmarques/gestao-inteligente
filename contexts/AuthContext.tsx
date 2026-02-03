
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'lawyer' | 'assistant';
  oab?: string;
  office_id: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, name: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const session = localStorage.getItem('legaltech_fake_session');
    if (session) {
      setUser(JSON.parse(session));
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, name: string) => {
    const userData: User = { 
      id: 'lawyer-default',
      email, 
      name, 
      role: 'admin',
      office_id: 'office-default'
    };
    setUser(userData);
    localStorage.setItem('legaltech_fake_session', JSON.stringify(userData));
    localStorage.setItem('current_lawyer', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('legaltech_fake_session');
    localStorage.removeItem('current_lawyer');
  };

  if (isLoading) return null;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
