import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { Mail, Lock, Eye, EyeOff, Briefcase, ArrowLeft, ArrowRight } from "lucide-react";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const from = location.state?.from?.pathname || "/";

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden" style={{ background: "var(--bg-secondary)" }}>
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-30"
          style={{ background: "radial-gradient(circle, var(--accent-light), transparent)" }} />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        
        {/* Back Link */}
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to landing page
        </Link>

        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2.5 font-bold text-2xl tracking-tight mb-8 group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black shadow-md transition-transform duration-300 group-hover:scale-105"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-secondary))" }}>
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <span className="gradient-text text-2xl font-black tracking-tight">GigFlow</span>
        </Link>

        {/* Form Box */}
        <div className="rounded-3xl border p-6 sm:p-10 shadow-xl relative bg-white"
          style={{ borderColor: "var(--border)" }}>
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-650 to-sky-500" />
          
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Welcome Back</h2>
            <p className="mt-2 text-xs font-semibold text-slate-500">
              Sign in to manage your gigs or submit bids.
            </p>
          </div>

          <form className="space-y-6" onSubmit={submit}>
            {/* Email */}
            <div>
              <label className="form-label">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="name@domain.com"
                  className="input-dark pl-11 bg-white"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••••••"
                  className="input-dark pl-11 pr-12 bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-sm font-bold disabled:opacity-60 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="spinner w-4 h-4" />
                  Verifying account...
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-slate-100" style={{ borderColor: "var(--border)" }}>
            <p className="text-xs font-semibold text-slate-500">
              Don't have an account?{" "}
              <Link to="/register" className="text-indigo-600 hover:text-indigo-750 font-bold transition-colors underline decoration-indigo-500/10">
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;