import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUsers, saveUsers } from '../utils/database';

interface AuthContextType {
  user: any;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  updatePassword: (currentPassword: string, newPassword: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (username: string, password: string) => {
    const users = getUsers();
    const foundUser = users.find(
      (u: any) => u.username === username && u.password === password
    );

    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const updatePassword = (currentPassword: string, newPassword: string) => {
    if (!user) return false;

    const users = getUsers();
    const userIndex = users.findIndex((u: any) => u.id === user.id);

    if (userIndex === -1 || users[userIndex].password !== currentPassword) {
      return false;
    }

    users[userIndex].password = newPassword;
    saveUsers(users);
    setUser(users[userIndex]);
    localStorage.setItem('currentUser', JSON.stringify(users[userIndex]));
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updatePassword }}>
      {children}
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