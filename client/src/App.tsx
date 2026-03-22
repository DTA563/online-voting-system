import { useEffect } from 'react'; // ADDED: useEffect for the socket connection
import { io } from 'socket.io-client'; // ADDED: Socket.io client
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context';
import { MainLayout, ProtectedRoute, SuperAdminLayout, AdminLayout, VoterLayout } from './components';
import { 
  LandingPage, 
  LoginPage, 
  RegisterPage, 
  VotingBoothPage, 
  VoteSuccessPage, 
  VoterResultsPage,
  AdminResultsPage,
  AdminDashboardPage,
  ManageElectionsPage,
  ManagePositionsPage,
  ManageCandidatesPage,
  ManageVotersPage,
  SuperAdminDashboardPage,
  AccountOversightPage,
  AuditLogsPage
} from './pages';

function AppRoutes() {
  const { isAuthenticated, isAdmin } = useAuth();

  // ==========================================
  // 🚨 THE PANIC BUTTON LISTENER
  // ==========================================
  useEffect(() => {
    // Only connect if the user is actually logged in
    if (isAuthenticated) {
      const userData = sessionStorage.getItem('user');
      
      if (userData) {
        try {
          const user = JSON.parse(userData);
          
          // Connect to the backend (Update this URL if your backend is hosted elsewhere!)
          const socket = io('http://localhost:5001'); 

          // Tell the backend who we are to join our personal room
          if (user && (user.id || user.user_id)) {
             const stringId = String(user.id || user.user_id);
             console.log("🔌 Joining Socket Room:", stringId);
             socket.emit('register_user', stringId);
          }

          // Listen for the kick-out signal from the Super Admin
          socket.on('force_logout', (data) => {
            alert(data.message); // Show the reason
            sessionStorage.removeItem('token'); // Destroy local session
            sessionStorage.removeItem('user');
            window.location.href = '/login'; // Instantly redirect
          });

          // Cleanup: Disconnect when the user logs out or leaves
          return () => {
            socket.disconnect();
          };
        } catch (err) {
          console.error("Error setting up socket:", err);
        }
      }
    }
  }, [isAuthenticated]);
  // ==========================================

  return (
    <Routes>
      {/* --- PUBLIC ROUTES WITHOUT NAVBAR/LAYOUT --- */}
      
      {/* Login Page */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? (
            <Navigate to={isAdmin ? '/admin' : '/vote'} replace />
          ) : (
            <LoginPage />
          )
        } 
      />

      {/* Register Page (Added Here) */}
      <Route 
        path="/register" 
        element={
          isAuthenticated ? (
            <Navigate to={isAdmin ? '/admin' : '/vote'} replace />
          ) : (
            <RegisterPage />
          )
        } 
      />

      {/* --- SUPER ADMIN ROUTES --- */}
      <Route 
        path="/super-admin"
        element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <SuperAdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<SuperAdminDashboardPage />} />
        <Route path="accounts" element={<AccountOversightPage />} />
        <Route path="audit" element={<AuditLogsPage />} />
        <Route path="logs" element={<AuditLogsPage />} />
      </Route>

      {/* --- ADMIN ROUTES --- */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="elections" element={<ManageElectionsPage />} />
        <Route path="positions" element={<ManagePositionsPage />} />
        <Route path="candidates" element={<ManageCandidatesPage />} />
        <Route path="voters" element={<ManageVotersPage />} />
        <Route path="results" element={<AdminResultsPage />} />
      </Route>

      {/* --- VOTER ROUTES --- */}
      <Route
        path="/vote"
        element={
          <ProtectedRoute allowedRoles={['voter']}>
            <VoterLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<VotingBoothPage />} />
        <Route path="success" element={<VoteSuccessPage />} />
        <Route path="results" element={<VoterResultsPage />} />
      </Route>

      {/* --- MAIN APP ROUTES (Landing & Shared) --- */}
      <Route element={<MainLayout />}>
        
        {/* Public Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* 404 Page (with Navbar) */}
        <Route
          path="*"
          element={
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">🔍</span>
              <h2 className="text-2xl font-bold text-gray-900">Page Not Found</h2>
              <p className="text-gray-600">The page you're looking for doesn't exist.</p>
            </div>
          }
        />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;