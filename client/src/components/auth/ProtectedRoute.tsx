import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context';
import { LoadingScreen } from '../ui';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('voter' | 'admin' | 'super_admin')[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading while checking auth state
  if (isLoading) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // User doesn't have required role - redirect to appropriate page
    const redirectPath = user.role === 'super_admin' ? '/super-admin' : user.role === 'admin' ? '/admin' : '/vote';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}
