import { GoogleLogin } from "@react-oauth/google";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Briefcase, Code, X, ArrowRight } from "lucide-react";

/**
 * Reusable Google Sign-In button component.
 * Uses @react-oauth/google's GoogleLogin which handles the full popup + ID token flow.
 * Handles the edge case of first-time signups requiring a role choice.
 */
const GoogleSignInButton = ({ role = null, onSuccess, context = "signup" }) => {
  const { googleLogin } = useContext(AuthContext);
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [tempCredential, setTempCredential] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);

  const handleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      toast.error("Google sign-in returned no credential. Please try again.");
      return;
    }

    setLoading(true);
    try {
      // If role is explicitly passed (e.g. from Register page), send it. Otherwise pass null.
      const data = await googleLogin(credentialResponse.credential, role);
      
      if (data?.needsRole) {
        // First-time login without a role chosen yet (e.g. from Login page)
        setTempCredential(credentialResponse.credential);
        setShowRoleModal(true);
      } else {
        onSuccess?.(data);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Google sign-in failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSubmit = async () => {
    if (!tempCredential) return;
    if (!selectedRole) {
      toast.warning("Please choose a role to continue.");
      return;
    }
    setLoading(true);
    try {
      const data = await googleLogin(tempCredential, selectedRole);
      setShowRoleModal(false);
      onSuccess?.(data);
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleError = () => {
    toast.error("Google sign-in was cancelled or failed. Please try again.");
  };

  // Check if Google Client ID is configured
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) {
    return null; // Don't render button if not configured
  }

  if (loading && !showRoleModal) {
    return (
      <div className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl border font-bold text-sm bg-white opacity-60"
        style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}>
        <div className="spinner w-4 h-4" /> Connecting to Google...
      </div>
    );
  }

  return (
    <>
      <div className="w-full flex justify-center [&>div]:!w-full">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          text={context === "signin" ? "signin_with" : "signup_with"}
          shape="pill"
          size="large"
          theme="outline"
          logo_alignment="center"
        />
      </div>

      {/* Role Selection Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md transition-all duration-300 animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 sm:p-8 relative overflow-hidden">
            {/* Top color accent */}
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-600 to-sky-500" />
            
            <button 
              onClick={() => {
                setShowRoleModal(false);
                setTempCredential(null);
              }}
              className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-50 transition-colors text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-6 mt-2">
              <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">Complete Your Profile</h3>
              <p className="text-xs font-semibold text-slate-500 mt-1.5">
                First time signing up? Tell us how you plan to use GigFlow.
              </p>
            </div>

            <div className="space-y-3.5 mb-6">
              {/* Client Card */}
              <button
                type="button"
                onClick={() => setSelectedRole("client")}
                className="w-full p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer flex items-center gap-4 relative overflow-hidden bg-white shadow-sm hover:shadow"
                style={{ borderColor: selectedRole === "client" ? "rgba(79, 70, 229, 0.4)" : "var(--border)" }}
              >
                {selectedRole === "client" && (
                  <div className="absolute top-0 right-0 w-8 h-8 bg-indigo-50/70 rounded-bl-2xl flex items-center justify-center border-l border-b border-indigo-100">
                    <div className="w-2 h-2 rounded-full bg-indigo-600" />
                  </div>
                )}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 shrink-0">
                  <Briefcase className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-slate-800">Hire Talent</div>
                  <div className="text-[10px] leading-tight font-semibold text-slate-500 mt-0.5">
                    Post gigs, review bids, and manage deliverables.
                  </div>
                </div>
              </button>

              {/* Freelancer Card */}
              <button
                type="button"
                onClick={() => setSelectedRole("freelancer")}
                className="w-full p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer flex items-center gap-4 relative overflow-hidden bg-white shadow-sm hover:shadow"
                style={{ borderColor: selectedRole === "freelancer" ? "rgba(79, 70, 229, 0.4)" : "var(--border)" }}
              >
                {selectedRole === "freelancer" && (
                  <div className="absolute top-0 right-0 w-8 h-8 bg-indigo-50/70 rounded-bl-2xl flex items-center justify-center border-l border-b border-indigo-100">
                    <div className="w-2 h-2 rounded-full bg-indigo-600" />
                  </div>
                )}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 shrink-0">
                  <Code className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-slate-800">Find Work</div>
                  <div className="text-[10px] leading-tight font-semibold text-slate-500 mt-0.5">
                    Apply to projects, place bids, and earn money.
                  </div>
                </div>
              </button>
            </div>

            <button
              onClick={handleRoleSubmit}
              disabled={loading || !selectedRole}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-sm text-white transition-all duration-300 hover:shadow-lg hover:shadow-indigo-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-indigo-600 to-indigo-700"
            >
              {loading ? "Completing setup..." : (
                <>
                  Get Started <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default GoogleSignInButton;
