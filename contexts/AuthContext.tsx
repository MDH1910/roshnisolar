import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthState, User, UserRole } from '@/types/auth';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo - in production, this would come from your backend
const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Sales',
    email: 'john@roshni.com',
    phone: '+91-9876543210',
    role: 'salesman',
    isActive: true,
    createdAt: '2024-01-01'
  },
  {
    id: '2',
    name: 'Sarah Operator',
    email: 'sarah@roshni.com',
    phone: '+91-9876543211',
    role: 'call_operator',
    isActive: true,
    createdAt: '2024-01-01'
  },
  {
    id: '3',
    name: 'Mike Tech',
    email: 'mike@roshni.com',
    phone: '+91-9876543212',
    role: 'technician',
    isActive: true,
    createdAt: '2024-01-01'
  },
  {
    id: '4',
    name: 'Admin User',
    email: 'admin@roshni.com',
    phone: '+91-9876543213',
    role: 'super_admin',
    isActive: true,
    createdAt: '2024-01-01'
  }
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  useEffect(() => {
    // Simulate checking for stored auth token
    setTimeout(() => {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }, 1000);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock authentication - in production, this would call your backend
    const user = mockUsers.find(u => u.email === email);
    
    if (user && password === 'password123') {
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false
      });
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
  };

  const updateUser = (user: User) => {
    setAuthState(prev => ({ ...prev, user }));
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};