
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "sonner";

type User = {
  id: string;
  name: string;
  email: string;
};

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for user in localStorage on initial load
    const storedUser = localStorage.getItem('deepchat_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user', error);
        localStorage.removeItem('deepchat_user');
      }
    }
    setIsLoading(false);
  }, []);

  // Mock login function (in a real app, this would call your API)
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real application, you would validate credentials with your backend
      // For demo purposes, we'll accept any email/password with basic validation
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      // Create a mock user for demonstration
      const mockUser = {
        id: `user_${Date.now()}`,
        name: email.split('@')[0],
        email
      };
      
      // Save user to localStorage for persistence
      localStorage.setItem('deepchat_user', JSON.stringify(mockUser));
      setUser(mockUser);
      toast.success('Login successful!');
    } catch (error) {
      toast.error(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real application, you would register the user with your backend
      // For demo purposes, we'll accept any valid input
      if (!name || !email || !password) {
        throw new Error('All fields are required');
      }
      
      // Create a new user
      const newUser = {
        id: `user_${Date.now()}`,
        name,
        email
      };
      
      // Save user to localStorage for persistence
      localStorage.setItem('deepchat_user', JSON.stringify(newUser));
      setUser(newUser);
      toast.success('Registration successful!');
    } catch (error) {
      toast.error(`Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('deepchat_user');
    setUser(null);
    toast.info('You have been logged out');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
