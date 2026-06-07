import { Link, useLocation } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { Briefcase, LogOut, User as UserIcon, Plus, Menu, X, ChevronDown, LayoutDashboard, Search, FileText } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  // Close dropdown on navigation
  useEffect(() => {
    setProfileOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  const navLink = (path, label, icon) => (
    <Link
      to={path}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300 border ${isActive(path)
        ? "bg-indigo-50 text-indigo-600 border-indigo-100"
        : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50 border-transparent"
        }`}
    >
      {icon}
      {label}
    </Link>
  );

  const avatar = user?.name?.charAt(0)?.toUpperCase() || "?";

  return (
    <nav
      className="sticky top-0 z-50 glass border-b border-slate-100 shadow-sm"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-black shadow-sm transition-transform duration-300 group-hover:scale-105"
              style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-secondary))" }}>
              <Briefcase className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="gradient-text font-black tracking-tight text-xl">GigFlow</span>
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-2">
            {user?.role === "client" && (
              <>
                {navLink("/", "Dashboard", <LayoutDashboard className="w-4 h-4" />)}
                {navLink("/create", "Post a Gig", <Plus className="w-4 h-4" />)}
              </>
            )}

            {user?.role === "freelancer" && (
              <>
                {navLink("/", "Browse Gigs", <Search className="w-4 h-4" />)}
                {navLink("/my-bids", "My Bids", <FileText className="w-4 h-4" />)}
              </>
            )}

            {/* Auth buttons */}
            {!user ? (
              <div className="flex items-center gap-3 ml-4 pl-4 border-l" style={{ borderColor: "var(--border)" }}>
                <Link to="/login" className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">
                  Log in
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-5 rounded-xl">
                  Sign up
                </Link>
              </div>
            ) : (
              <div className="relative ml-4 pl-4 border-l" style={{ borderColor: "var(--border)" }}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl transition-all duration-300 hover:bg-slate-50 border border-transparent hover:border-slate-200"
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-sm"
                    style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-secondary))" }}
                  >
                    {avatar}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-bold text-slate-800 max-w-[120px] truncate leading-none">{user.name}</p>
                    <p className="text-[10px] capitalize font-semibold mt-0.5 leading-none" style={{ color: "var(--text-muted)" }}>{user.role}</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${profileOpen ? "rotate-180 text-indigo-600" : ""}`} />
                </button>

                {/* Dropdown */}
                {profileOpen && (
                  <div
                    className="absolute right-0 top-12 w-56 rounded-2xl border shadow-xl py-2 z-50 animate-fadeIn"
                    style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
                    onMouseLeave={() => setProfileOpen(false)}
                  >
                    <div className="px-4 py-3 border-b mb-1" style={{ borderColor: "var(--border)" }}>
                      <p className="text-sm font-bold text-slate-800">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
                      onClick={() => setProfileOpen(false)}
                    >
                      <UserIcon className="w-4 h-4" />
                      My Profile
                    </Link>
                    {user.role === "client" && (
                      <Link
                        to="/create"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
                        onClick={() => setProfileOpen(false)}
                      >
                        <Plus className="w-4 h-4" />
                        Post New Gig
                      </Link>
                    )}
                    {user.role === "freelancer" && (
                      <Link
                        to="/my-bids"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
                        onClick={() => setProfileOpen(false)}
                      >
                        <FileText className="w-4 h-4" />
                        My Bids
                      </Link>
                    )}
                    <div className="border-t mt-1 pt-1" style={{ borderColor: "var(--border)" }}>
                      <button
                        onClick={() => { logout(); setProfileOpen(false); }}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors font-bold"
                      >
                        <LogOut className="w-4 h-4" />
                        Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t animate-fadeIn shadow-lg bg-white" style={{ borderColor: "var(--border)" }}>
          <div className="px-4 py-4 space-y-2">
            {user ? (
              <>
                <div className="flex items-center gap-3 px-3 py-3 mb-3 rounded-2xl border border-slate-100 bg-slate-50/55">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-sm"
                    style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-secondary))" }}
                  >
                    {avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 leading-none">{user.name}</p>
                    <p className="text-[10px] text-slate-500 capitalize mt-1 leading-none">{user.role}</p>
                  </div>
                </div>

                {user.role === "client" && (
                  <>
                    <MobileLink to="/" label="Dashboard" icon={<LayoutDashboard className="w-4 h-4" />} onClick={() => setMobileOpen(false)} />
                    <MobileLink to="/create" label="Post a Gig" icon={<Plus className="w-4 h-4" />} onClick={() => setMobileOpen(false)} />
                  </>
                )}
                {user.role === "freelancer" && (
                  <>
                    <MobileLink to="/" label="Browse Gigs" icon={<Search className="w-4 h-4" />} onClick={() => setMobileOpen(false)} />
                    <MobileLink to="/my-bids" label="My Bids" icon={<FileText className="w-4 h-4" />} onClick={() => setMobileOpen(false)} />
                  </>
                )}
                <MobileLink to="/profile" label="My Profile" icon={<UserIcon className="w-4 h-4" />} onClick={() => setMobileOpen(false)} />

                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="w-full text-left px-4 py-3 text-sm font-bold rounded-2xl text-rose-600 hover:bg-rose-50 transition-colors mt-2 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Log out
                </button>
              </>
            ) : (
              <>
                <MobileLink to="/login" label="Log in" onClick={() => setMobileOpen(false)} />
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center btn-primary mt-2"
                >
                  Sign up free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

function MobileLink({ to, label, icon, onClick }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-2.5 px-4 py-3 text-sm font-bold rounded-2xl transition-colors border ${isActive ? "text-indigo-600 bg-indigo-50 border-indigo-100" : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50 border-transparent"
        }`}
    >
      {icon}
      {label}
    </Link>
  );
}

export default Navbar;