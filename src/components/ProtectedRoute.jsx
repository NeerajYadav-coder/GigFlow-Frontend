import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05050a]">
        <div className="spinner w-8 h-8" />
      </div>
    );
  }

  if (!user) {
    // Redirect to login but save the current location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && user.role !== role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05050a]">
        <div className="text-center p-8 card-dark max-w-md mx-auto">
          <div className="text-5xl mb-4">🚫</div>
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-sm text-gray-400 mb-6">
            This page is only accessible to users with the <strong>{role}</strong> role.
            You are currently logged in as a <strong>{user.role}</strong>.
          </p>
          <button 
            onClick={() => window.history.back()}
            className="btn-primary w-full"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
