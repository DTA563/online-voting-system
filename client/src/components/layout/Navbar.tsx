import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context';
import { Button } from '../ui';

export function Navbar() {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo / Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl">🗳️</span>
              <span className="font-bold text-xl text-gray-900">SecureVote</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {isAdmin ? (
                  // Admin Navigation
                  <>
                    <Link
                      to="/admin"
                      className="text-gray-600 hover:text-gray-900 font-medium"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/admin/elections"
                      className="text-gray-600 hover:text-gray-900 font-medium"
                    >
                      Elections
                    </Link>
                    <Link
                      to="/admin/positions"
                      className="text-gray-600 hover:text-gray-900 font-medium"
                    >
                      Positions
                    </Link>
                    <Link
                      to="/admin/candidates"
                      className="text-gray-600 hover:text-gray-900 font-medium"
                    >
                      Candidates
                    </Link>
                    <Link
                      to="/admin/voters"
                      className="text-gray-600 hover:text-gray-900 font-medium"
                    >
                      Voters
                    </Link>
                    <Link
                      to="/results"
                      className="text-gray-600 hover:text-gray-900 font-medium"
                    >
                      Results
                    </Link>
                  </>
                ) : (
                  // Voter Navigation
                  <>
                    <Link
                      to="/vote"
                      className="text-gray-600 hover:text-gray-900 font-medium"
                    >
                      Vote
                    </Link>
                    <Link
                      to="/results"
                      className="text-gray-600 hover:text-gray-900 font-medium"
                    >
                      Results
                    </Link>
                  </>
                )}

                {/* User Info & Logout */}
                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
                  <span className="text-sm text-gray-600">
                    {user?.full_name}
                    <span className="ml-1 text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                      {user?.role}
                    </span>
                  </span>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <Link to="/login">
                <Button>Login</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
