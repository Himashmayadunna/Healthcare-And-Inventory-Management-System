import React, { createContext, useState, useContext } from 'react';
import api from '../services/api';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  login: (username: string, password_plain: string) => Promise<void>;
  registerUser: (username: string, password_plain: string, email: string, fullName: string, role: string) => Promise<void>;
  loginAsGuest: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('medilex_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('medilex_auth_token');
  });
  const [isGuest, setIsGuest] = useState<boolean>(() => {
    return localStorage.getItem('medilex_is_guest') === 'true';
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Login handler linking to our backend JWT login route
  const login = async (username: string, password_plain: string) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { username, password: password_plain });
      const { user: userPayload, token: jwtToken } = response.data.data;

      setUser(userPayload);
      setToken(jwtToken);
      setIsGuest(false);

      localStorage.setItem('medilex_auth_token', jwtToken);
      localStorage.setItem('medilex_user', JSON.stringify(userPayload));
      localStorage.setItem('medilex_is_guest', 'false');
    } catch (error) {
      // Try local fallback for sandbox users
      const localUsersStr = localStorage.getItem('medilex_local_users') || '[]';
      const localUsers = JSON.parse(localUsersStr) as Record<string, string>[];
      const matchedUser = localUsers.find((u) => (u.username === username || u.email === username) && u.password === password_plain);

      if (matchedUser) {
        const payloadUser: User = {
          userId: Math.floor(Math.random() * 1000) + 1000,
          username: matchedUser.username,
          email: matchedUser.email,
          fullName: matchedUser.fullName,
          role: matchedUser.role as 'Admin' | 'Receptionist' | 'Doctor' | 'Pharmacist',
        };
        const mockJwt = 'mock_jwt_token_' + matchedUser.username;
        setUser(payloadUser);
        setToken(mockJwt);
        setIsGuest(false);
        localStorage.setItem('medilex_auth_token', mockJwt);
        localStorage.setItem('medilex_user', JSON.stringify(payloadUser));
        localStorage.setItem('medilex_is_guest', 'false');
      } else {
        setIsLoading(false);
        throw error;
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Register handler linking to backend /auth/register with local sandbox fallback
  const registerUser = async (username: string, password_plain: string, email: string, fullName: string, role: string) => {
    setIsLoading(true);
    try {
      await api.post('/auth/register', { username, password: password_plain, email, fullName, role });
    } catch (err) {
      console.warn("Backend registration failed, registering locally in sandbox mode:", err);
      // Fallback: register in localStorage if backend fails or is offline
      const localUsersStr = localStorage.getItem('medilex_local_users') || '[]';
      const localUsers = JSON.parse(localUsersStr) as Record<string, string>[];
      if (localUsers.some((u) => u.username === username)) {
        throw new Error('Username already taken.', { cause: err });
      }
      localUsers.push({ username, password: password_plain, email, fullName, role });
      localStorage.setItem('medilex_local_users', JSON.stringify(localUsers));
    } finally {
      setIsLoading(false);
    }
  };

  // Mock Explore as Guest mode handler
  const loginAsGuest = () => {
    setIsLoading(true);
    const mockGuestUser: User = {
      userId: 0,
      username: 'guest_admin',
      email: 'guest@medilex.com',
      fullName: 'Dr. Guest Administrator',
      role: 'Admin',
    };
    const mockToken = 'mock_guest_jwt_token_payload';

    setUser(mockGuestUser);
    setToken(mockToken);
    setIsGuest(true);

    localStorage.setItem('medilex_auth_token', mockToken);
    localStorage.setItem('medilex_user', JSON.stringify(mockGuestUser));
    localStorage.setItem('medilex_is_guest', 'true');
    setIsLoading(false);
  };

  // Logout clearing all persistent records
  const logout = () => {
    setUser(null);
    setToken(null);
    setIsGuest(false);
    localStorage.removeItem('medilex_auth_token');
    localStorage.removeItem('medilex_user');
    localStorage.removeItem('medilex_is_guest');
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isGuest,
        isLoading,
        login,
        registerUser,
        loginAsGuest,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
