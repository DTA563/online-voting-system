import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials } from '../types';
import { authApi } from '../api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isVoter: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 🛠️ DEVELOPMENT SWITCH
// Set this to 'true' if you want to skip the backend and use mock data.
// Set this to 'false' to connect to the real API.
const ENABLE_MOCK_AUTH = false; 

// Only allow mocking if we are in Dev mode AND the switch is on
const isMockingEnabled = import.meta.env.DEV && ENABLE_MOCK_AUTH;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsLoading(false);
      return;
    }

    // ✅ DEVELOPMENT MODE: Auto-login as mock user
    if (isMockingEnabled) {
      console.log('🚀 Development mode: Auto-login enabled (Mock)');
      
      const mockUser: User = {
        user_id: 'dev-admin-123',
        full_name: 'Development Administrator',
        role: 'voter', // Change to 'voter' to test voter pages
      };
      
      const mockToken = 'dev-mock-token-' + Date.now();
      
      setToken(mockToken);
      setUser(mockUser);
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    // ✅ DEVELOPMENT: Mock login
    if (isMockingEnabled) {
      console.log('🔧 Development login with:', credentials);
      
      const isAdminLogin = credentials.userId.toLowerCase().includes('admin');
      const role = isAdminLogin ? 'admin' : 'voter';
      
      const mockUser: User = {
        user_id: credentials.userId,
        full_name: credentials.userId === 'admin' ? 'Administrator' : 'Test Voter',
        role: role,
      };
      
      const mockToken = 'dev-token-' + Date.now();
      
      setToken(mockToken);
      setUser(mockUser);
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));
      return;
    }
    
    // ✅ PRODUCTION: Real API
    const response = await authApi.login(credentials);
    setToken(response.token);
    setUser(response.user);
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    if (isMockingEnabled) {
      console.log('🔄 Development: Logged out');
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
    isAdmin: user?.role === 'admin',
    isVoter: user?.role === 'voter',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}