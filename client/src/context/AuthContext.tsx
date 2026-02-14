import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LoginCredentials } from '../types';
import { authApi } from '../api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  // login function accepts credentials AND an optional role check
  login: (credentials: LoginCredentials, allowedRoles?: string[]) => Promise<User>;
  logout: () => void;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isVoter: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 🛠️ DEVELOPMENT SWITCH
const ENABLE_MOCK_AUTH = false; 
const isMockingEnabled = import.meta.env.DEV && ENABLE_MOCK_AUTH;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing token on mount
  useEffect(() => {
    const initializeAuth = () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Add this useEffect to handle automatic redirect on logout
  useEffect(() => {
    // Only redirect if not loading and user is not authenticated
    if (!isLoading && !user && !token) {
      // Check current path to avoid redirecting from public pages
      const currentPath = window.location.pathname;
      const publicPaths = ['/login', '/register', '/'];
      
      if (!publicPaths.includes(currentPath)) {
        navigate('/login', { replace: true });
      }
    }
  }, [isLoading, user, token, navigate]);

  const login = async (credentials: LoginCredentials, allowedRoles?: string[]): Promise<User> => {
    
    // --- Mock Login Logic (Keep existing if you use it) ---
    if (isMockingEnabled) {
       // ... (your existing mock logic)
       return {} as User;
    }

    try {
      console.log("🔵 Attempting login...", credentials);
      
      const data = await authApi.login(credentials);

      // 1. Check if token exists
      if (!data || !data.token) {
        throw new Error("Login failed: Server response is missing the token.");
      }

      // 2. Role Check (The "Bouncer")
      if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(data.user.role)) {
        console.warn(`⛔ Access Denied: User is ${data.user.role}, but allowed roles are: ${allowedRoles.join(', ')}.`);
        throw new Error("Access Denied: You do not have permission to access this area.");
      }

      // 3. Success! Update State
      setToken(data.token);
      setUser(data.user);
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      return data.user;

    } catch (error: any) {
      console.error("❌ Login Error:", error);

      // ✅ NEW ERROR HANDLING LOGIC ✅
      // If the server sends a response (404, 401, etc.)
      if (error.response) {
        const status = error.response.status;

        // 404 = User Not Found
        // 401 = Password Incorrect
        if (status === 404 || status === 401) {
          // We intentionally hide the specific detail for security (and to fix your UI issue)
          throw new Error("Invalid credentials. Please check your ID and Password.");
        }
      }

      // If it's a different error (like the "Access Denied" we threw above), pass it through.
      throw error; 
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Note: The useEffect above will handle the redirect automatically
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
    isAdmin: user?.role === 'admin',
    isSuperAdmin: user?.role === 'super_admin',
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