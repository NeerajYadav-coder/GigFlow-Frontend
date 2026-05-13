import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link, useSearchParams, useLocation } from "react-router-dom";
import { useToast } from "../context/ToastContext";

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
      icon: "📋",
      title: "I'm a Client",
      desc: "I want to post gigs and hire freelancers"
    },
    {
      value: "freelancer",
      icon: "💻",
      title: "I'm a Freelancer",
      desc: "I want to find projects and earn money"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative" style={{ background: "var(--bg-primary)" }}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full blur-3xl opacity-10"
          style={{ background: "radial-gradient(circle, #c084fc, transparent)" }} />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg relative">
        <Link to="/" className="flex items-center justify-center gap-2 font-bold text-2xl tracking-tight mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black"
            style={{ background: "linear-gradient(135deg, #7c3aed, #c084fc)" }}>
            G
          </div>
          <span className="gradient-text text-xl">igFlow</span>
        </Link>

        <div className="rounded-3xl border p-8 shadow-2xl"
          style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-purple px-3 py-1 text-[10px] uppercase tracking-wider">
                Signing up as {form.role}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-[#f0f0fa]">Create your account</h2>
            <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              Join GigFlow and start your journey today
            </p>
          </div>

          <form className="space-y-5" onSubmit={submit}>
            {/* Role selector */}
            <div>
              <label className="form-label">I want to</label>
              <div className="grid grid-cols-2 gap-3 mt-1">
                {ROLES.map(r => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setForm({ ...form, role: r.value })}
                    className={`p-4 rounded-xl border text-left transition-all duration-200 ${form.role === r.value
                      ? "border-violet-500/60"
                      : "hover:border-violet-500/30"
                      }`}
                    style={{
                      background: form.role === r.value
                        ? "rgba(139,92,246,0.12)"
                        : "var(--bg-secondary)",
                      borderColor: form.role === r.value
                        ? "rgba(139,92,246,0.6)"
                        : "var(--border)"
                    }}
                  >
                    <div className="text-2xl mb-1.5">{r.icon}</div>
                    <div className="text-sm font-semibold text-[#f0f0fa]">{r.title}</div>
                    <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="form-label">Full Name</label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="John Doe"
                className="input-dark"
              />
            </div>

            {/* Email */}
            <div>
              <label className="form-label">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="input-dark"
              />
            </div>

            {/* Password */}
            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Min. 6 characters"
                  className="input-dark pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#55556a] hover:text-[#8888aa] transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d={showPassword
                        ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        : "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      }
                    />
                  </svg>
                </button>
              </div>
              {form.password.length > 0 && form.password.length < 6 && (
                <p className="text-xs mt-1 text-red-400">Password must be at least 6 characters</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <div className="spinner w-4 h-4" />
                  Creating account...
                </span>
              ) : "Create Account →"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Already have an account?{" "}
              <Link to="/login" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;