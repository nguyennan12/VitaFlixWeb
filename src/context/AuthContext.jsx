import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { STORAGE_KEYS, ASSETS } from '../config/constants';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => storage.get(STORAGE_KEYS.CURRENT_USER, null));

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEYS.CURRENT_USER) {
        setUser(storage.get(STORAGE_KEYS.CURRENT_USER, null));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = (identifier, password) => {
    const users = storage.get(STORAGE_KEYS.USERS, []);
    const cleanId = identifier.trim();
    
    const foundUser = users.find(
      (u) => (u.username === cleanId || u.email === cleanId) && u.password === password
    );

    if (foundUser) {
      storage.set(STORAGE_KEYS.CURRENT_USER, foundUser);
      setUser(foundUser);
      return { success: true, user: foundUser };
    }
    return { success: false, message: 'Tài khoản hoặc mật khẩu không chính xác' };
  };

  const register = ({ username, email, password, firstName, lastName }) => {
    const users = storage.get(STORAGE_KEYS.USERS, []);
    
    const usernameExists = users.some((u) => u.username?.toLowerCase() === username.toLowerCase());
    if (usernameExists) {
      return { success: false, message: 'Tên người dùng đã tồn tại' };
    }

    const emailExists = users.some((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (emailExists) {
      return { success: false, message: 'Email đã được đăng ký' };
    }

    const newUser = {
      id: Date.now().toString(),
      username: username.trim(),
      email: email.trim(),
      password,
      fullname: `${lastName || ''} ${firstName || ''}`.trim() || username,
      avatar: ASSETS.DEFAULT_AVATAR,
      bio: 'Yêu điện ảnh, thích hòa bình.',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    storage.set(STORAGE_KEYS.USERS, users);
    
    // Auto login
    storage.set(STORAGE_KEYS.CURRENT_USER, newUser);
    setUser(newUser);

    return { success: true, user: newUser };
  };

  const logout = () => {
    storage.remove(STORAGE_KEYS.CURRENT_USER);
    setUser(null);
  };

  const updateProfile = (updatedFields) => {
    if (!user) return { success: false, message: 'Chưa đăng nhập' };

    const updatedUser = { ...user, ...updatedFields };
    
    // Update current user
    storage.set(STORAGE_KEYS.CURRENT_USER, updatedUser);
    setUser(updatedUser);

    // Update in users database
    const users = storage.get(STORAGE_KEYS.USERS, []);
    const userIndex = users.findIndex((u) => u.email === user.email || u.username === user.username);
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updatedFields };
      storage.set(STORAGE_KEYS.USERS, users);
    }

    return { success: true, user: updatedUser };
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
