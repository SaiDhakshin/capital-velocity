
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import type { User } from '../services/authService';
import { dataService } from '../services/storageService';

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  updateUser: (u: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = authService.getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
      // Initialize DB with user ID
      dataService.initialize(storedUser.id);
    } else {
      // Initialize DB with guest ID or default
      dataService.initialize('guest');
    }
    setLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    const user = await authService.login(email, pass);
    setUser(user);
    // Switch DB context to this user
    dataService.initialize(user.id);
  };

  const register = async (email: string, pass: string, name: string) => {
    const user = await authService.register(email, pass, name);
    setUser(user);
    // Switch DB context to new user (will be empty/seeded)
    dataService.initialize(user.id);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    dataService.initialize('guest'); // Reset to guest or clear
  };
  
  const updateUser = async (u: User) => {
      await authService.updateProfile(u);
      setUser(u);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user, updateUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
