import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context';
import { MainLayout, ProtectedRoute } from './components';
import { 
  LandingPage, 
  LoginPage, 
  RegisterPage, 
  VotingBoothPage, 
  VoteSuccessPage, 
  ResultsPage,
  AdminDashboardPage,
  ManageElectionsPage,
  ManagePositionsPage,
  ManageCandidatesPage,
  ManageVotersPage
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

      {/* --- MAIN APP ROUTES WITH NAVBAR/LAYOUT --- */}
      <Route element={<MainLayout />}>
        
        {/* Public Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Protected Routes for All Authenticated Users */}
        <Route
          path="/results"
          element={
            <ProtectedRoute>
              <ResultsPage />
            </ProtectedRoute>
          }
        />

        {/* Voter-Specific Routes */}
        <Route
          path="/vote"
          element={
            <ProtectedRoute allowedRoles={['voter']}>
              <VotingBoothPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vote/success"
          element={
            <ProtectedRoute allowedRoles={['voter']}>
              <VoteSuccessPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/elections"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageElectionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/positions"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManagePositionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/candidates"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageCandidatesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/voters"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageVotersPage />
            </ProtectedRoute>
          }
        />

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