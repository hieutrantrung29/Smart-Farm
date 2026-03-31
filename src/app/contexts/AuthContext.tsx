import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type UserRole = 'admin'| 'operator'| 'viewer';

export interface User {
  user_id: string;
  user_name: string;
  email: string;
  user_type: UserRole;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, user_name: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const API_BASE_URL = 'http://localhost:5001/api';

// Mock users
// const mockUsers: Record<string, { password: string; user: User }> = {
//   'admin@smartfarm.com': {
//     password: 'admin123',
//     user: {
//       id: '1',
//       name: 'John Admin',
//       email: 'admin@smartfarm.com',
//       role: 'Admin',
//     },
//   },
//   'operator@smartfarm.com': {
//     password: 'operator123',
//     user: {
//       id: '2',
//       name: 'Jane Operator',
//       email: 'operator@smartfarm.com',
//       role: 'Operator',
//       assignedZones: ['z1', 'z3'],
//     },
//   },
// };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Load token từ localStorage khi component mount
  useEffect (() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, [] );

  
  const login = async (email: string, password: string): Promise<boolean> => {
    try{
      const response = await fetch(
        `${API_BASE_URL}/auth/login` , {
          method: 'POST',
          headers: { 'Content-Type': 'application/json'}, 
          body: JSON.stringify({email,password}),
        }
      );

      const data = await response.json(); 
      if (!response.ok){return false;}

      // 1. Save in state of React
      setToken(data.token); 
      setUser(data.user);
      // 2. Save in Browser 
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      return true;
    }
    catch (error){
      console.error('ERROR LOGIN'); 
      return false; 
    }
    
  };

  const register = async (email: string, user_name:string, password:string): Promise<boolean> => {
    try {
      const response = await fetch (`${API_BASE_URL}/auth/register`, {
        method: 'POST', 
        headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify({email, user_name, password, user_type: 'operator'}),

      });

      const data = await response.json(); 
      if (!response.ok){
        console.error('Register failed:', data.error);
        return false; 
      }

      return await login (email, password); 

    }
    catch (error){
      console.error('Register error', error);
      return false;
    }
  }





  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };


  return (
    <AuthContext.Provider
      value = {{
        user,
        token,
        login,
        register,
        logout,
        isAuthenticated: !!token,
        // canAccessZone và canEditZone tạm thời được gỡ ra vì chưa có hàm định nghĩa.
        // Bạn có thể thêm lại sau khi viết logic phân quyền.
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}