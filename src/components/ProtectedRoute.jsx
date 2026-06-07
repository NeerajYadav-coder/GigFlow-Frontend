import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-secondary)" }}>
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
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg-secondary)" }}>
        <div className="text-center p-8 sm:p-10 card-dark max-w-md mx-auto bg-white shadow-xl border relative overflow-hidden" style={{ borderColor: "var(--border)" }}>
          <div className="absolute top-0 left-0 w-full h-[3px] bg-red-500" />
          <div className="text-5xl mb-4">🚫</div>
          <h2 className="text-xl font-extrabold text-slate-800 mb-2">Access Denied</h2>
          <p className="text-xs font-semibold text-slate-500 mb-6 leading-relaxed">
            This page is only accessible to users with the <strong className="text-indigo-600 font-bold">{role}</strong> role.
            You are currently logged in as a <strong className="text-indigo-600 font-bold">{user.role}</strong>.
          </p>
          <button 
            onClick={() => window.history.back()}
            className="btn-primary w-full py-3 text-xs font-bold"
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
