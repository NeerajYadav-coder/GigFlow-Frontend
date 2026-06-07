import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link, useSearchParams, useLocation } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { User, Mail, Lock, Eye, EyeOff, Briefcase, Code, ArrowLeft, ArrowRight } from "lucide-react";

const Register = () => {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: searchParams.get("role") || "client",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, user } = useContext(AuthContext);
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

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const submit = async (e) => {
    e.preventDefault();
    
    if (form.name.trim().length < 2) {
      toast.warning("Name must be at least 2 characters");
      return;
    }
    if (!validateEmail(form.email)) {
      toast.warning("Please enter a valid email address");
      return;
    }
    if (form.password.length < 6) {
      toast.warning("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await register(form);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const ROLES = [
    {
      value: "client",
      icon: <Briefcase className="w-6 h-6 text-indigo-650" />,
      title: "Hire Talent",
      desc: "Post gigs, review bids, and manage deliverables."
    },
    {
      value: "freelancer",
      icon: <Code className="w-6 h-6 text-cyan-600" />,
      title: "Find Work",
      desc: "Apply to projects, place bids, and earn money."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden" style={{ background: "var(--bg-secondary)" }}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full blur-3xl opacity-30"
          style={{ background: "radial-gradient(circle, var(--accent-light), transparent)" }} />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg relative z-10 px-4 sm:px-0">
        
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
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-655 to-sky-500" />

          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Create Your Account</h2>
            <p className="mt-2 text-xs font-semibold text-slate-500">
              Join GigFlow and discover professional work opportunities.
            </p>
          </div>

          <form className="space-y-5" onSubmit={submit}>
            
            {/* Role selector */}
            <div>
              <label className="form-label">I want to</label>
              <div className="grid grid-cols-2 gap-3 mt-1.5">
                {ROLES.map(r => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setForm({ ...form, role: r.value })}
                    className="p-4.5 rounded-2xl border text-left transition-all duration-300 cursor-pointer flex flex-col items-start gap-2 relative overflow-hidden bg-white shadow-sm"
                    style={{
                      borderColor: form.role === r.value
                        ? "rgba(79, 70, 229, 0.4)"
                        : "var(--border)"
                    }}
                  >
                    {form.role === r.value && (
                      <div className="absolute top-0 right-0 w-8 h-8 bg-indigo-50/70 rounded-bl-2xl flex items-center justify-center border-l border-b border-indigo-100">
                        <div className="w-2 h-2 rounded-full bg-indigo-600" />
                      </div>
                    )}
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      {r.icon}
                    </div>
                    <div className="text-xs font-extrabold text-slate-800 mt-1">{r.title}</div>
                    <div className="text-[10px] leading-tight font-semibold text-slate-450">{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="form-label">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="input-dark pl-11 bg-white"
                />
              </div>
            </div>

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
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="At least 6 characters"
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
              className="btn-primary w-full py-3.5 text-sm font-bold disabled:opacity-60 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="spinner w-4 h-4" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-slate-100" style={{ borderColor: "var(--border)" }}>
            <p className="text-xs font-semibold text-slate-500">
              Already have an account?{" "}
              <Link to="/login" className="text-indigo-600 hover:text-indigo-750 font-bold transition-colors underline decoration-indigo-500/20">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;