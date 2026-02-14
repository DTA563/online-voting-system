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