import { Link, useLocation } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navLink = (path, label) => (
    <Link
      to={path}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${isActive(path)
          ? "bg-violet-500/15 text-violet-400"
          : "text-[#8888aa] hover:text-[#f0f0fa] hover:bg-white/5"
        }`}
    >
      {label}
    </Link>
  );

  const avatar = user?.name?.charAt(0)?.toUpperCase() || "?";

  return (
    <nav
      className="sticky top-0 z-50 glass border-b"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-black"
              style={{ background: "linear-gradient(135deg, #7c3aed, #c084fc)" }}>
              G
            </div>
            <span className="gradient-text">igFlow</span>
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-1">
            {!user && navLink("/", "Browse Gigs")}

            {user?.role === "client" && (
              <>
                {navLink("/", "Dashboard")}
                {navLink("/create", "Post a Gig")}
              </>
            )}

            {user?.role === "freelancer" && (
              <>
                {navLink("/", "Browse Gigs")}
                {navLink("/my-bids", "My Bids")}
              </>
            )}

            {/* Auth buttons */}
            {!user ? (
              <div className="flex items-center gap-3 ml-4 pl-4 border-l" style={{ borderColor: "var(--border)" }}>
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-[#8888aa] hover:text-[#f0f0fa] transition-colors">
                  Log in
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2">
                  Sign up free
                </Link>
              </div>
            ) : (
              <div className="relative ml-4 pl-4 border-l" style={{ borderColor: "var(--border)" }}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 hover:bg-white/5"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #c084fc)" }}
                  >
                    {avatar}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-sm font-semibold text-[#f0f0fa] max-w-[120px] truncate">{user.name}</p>
                    <p className="text-xs capitalize" style={{ color: "var(--text-muted)" }}>{user.role}</p>
                  </div>
                  <svg className={`w-4 h-4 text-[#55556a] transition-transform ${profileOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown */}
                {profileOpen && (
                  <div
                    className="absolute right-0 top-12 w-52 rounded-2xl border shadow-2xl py-2 z-50 animate-fadeIn"
                    style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
                    onMouseLeave={() => setProfileOpen(false)}
                  >
                    <div className="px-4 py-3 border-b mb-1" style={{ borderColor: "var(--border)" }}>
                      <p className="text-sm font-semibold text-[#f0f0fa]">{user.name}</p>
                      <p className="text-xs text-[#55556a] truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#8888aa] hover:text-[#f0f0fa] hover:bg-white/5 transition-colors"
                      onClick={() => setProfileOpen(false)}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      My Profile
                    </Link>
                    {user.role === "client" && (
                      <Link
                        to="/create"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#8888aa] hover:text-[#f0f0fa] hover:bg-white/5 transition-colors"
                        onClick={() => setProfileOpen(false)}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Post New Gig
                      </Link>
                    )}
                    {user.role === "freelancer" && (
                      <Link
                        to="/my-bids"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#8888aa] hover:text-[#f0f0fa] hover:bg-white/5 transition-colors"
                        onClick={() => setProfileOpen(false)}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        My Bids
                      </Link>
                    )}
                    <div className="border-t mt-1 pt-1" style={{ borderColor: "var(--border)" }}>
                      <button
                        onClick={() => { logout(); setProfileOpen(false); }}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
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
            className="md:hidden p-2 rounded-lg text-[#55556a] hover:text-[#f0f0fa] hover:bg-white/5 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t animate-fadeIn" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="px-4 py-4 space-y-1">
            {user ? (
              <>
                <div className="flex items-center gap-3 px-3 py-3 mb-3 rounded-xl" style={{ background: "var(--bg-secondary)" }}>
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #c084fc)" }}
                  >
                    {avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#f0f0fa]">{user.name}</p>
                    <p className="text-xs text-[#55556a] capitalize">{user.role}</p>
                  </div>
                </div>

                {user.role === "client" && (
                  <>
                    <MobileLink to="/" label="Dashboard" onClick={() => setMobileOpen(false)} />
                    <MobileLink to="/create" label="Post a Gig" onClick={() => setMobileOpen(false)} />
                  </>
                )}
                {user.role === "freelancer" && (
                  <>
                    <MobileLink to="/" label="Browse Gigs" onClick={() => setMobileOpen(false)} />
                    <MobileLink to="/my-bids" label="My Bids" onClick={() => setMobileOpen(false)} />
                  </>
                )}
                <MobileLink to="/profile" label="My Profile" onClick={() => setMobileOpen(false)} />

                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm font-medium rounded-xl text-red-400 hover:bg-red-500/10 transition-colors mt-2"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <MobileLink to="/" label="Browse Gigs" onClick={() => setMobileOpen(false)} />
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

function MobileLink({ to, label, onClick }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`block px-4 py-2.5 text-sm font-medium rounded-xl transition-colors ${isActive ? "text-violet-400 bg-violet-500/10" : "text-[#8888aa] hover:text-[#f0f0fa] hover:bg-white/5"
        }`}
    >
      {label}
    </Link>
  );
}

export default Navbar;