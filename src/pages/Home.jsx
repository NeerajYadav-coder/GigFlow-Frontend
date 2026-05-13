import { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const CATEGORIES = [
  "All", "Web Development", "Mobile Development", "UI/UX Design",
  "Graphic Design", "Content Writing", "Digital Marketing",
  "Video & Animation", "Data Science & AI", "DevOps & Cloud", "Other"
];

const CATEGORY_ICONS = {
  "Web Development": "🌐",
  "Mobile Development": "📱",
  "UI/UX Design": "🎨",
  "Graphic Design": "✏️",
  "Content Writing": "📝",
  "Digital Marketing": "📊",
  "Video & Animation": "🎬",
  "Data Science & AI": "🤖",
  "DevOps & Cloud": "☁️",
  "Cybersecurity": "🔒",
  "Database": "🗃️",
  "Other": "⚙️",
};

const Home = () => {
  const { user } = useContext(AuthContext);
  const [gigs, setGigs] = useState([]);
  const [myGigs, setMyGigs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);


  // Fetch available gigs with filters
  useEffect(() => {
    const fetchGigs = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 9 };
        if (search) params.search = search;
        if (category !== "All") params.category = category;

        const res = await api.get("/gigs", { params });
        setGigs(res.data.gigs || []);
        setTotal(res.data.total || 0);
        setPages(res.data.pages || 1);
      } catch {
        setGigs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchGigs();
  }, [search, category, page]);



  // Fetch client's own gigs
  useEffect(() => {
    if (user?.role === "client") {
      api.get("/gigs/my/list")
        .then(res => setMyGigs(res.data))
        .catch(() => setMyGigs([]));
    }
  }, [user]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleCategoryClick = (cat) => {
    setCategory(cat);
    setPage(1);
  };

  // If not logged in, show landing page
  if (!user) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen pb-16" style={{ background: "var(--bg-primary)" }}>
      <div className="section-container py-8">

        {/* Welcome Banner */}
        <div className="mb-8 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(192,132,252,0.08))", border: "1px solid rgba(139,92,246,0.25)" }}>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#f0f0fa]">
              Welcome back, <span className="gradient-text">{user.name}</span> 👋
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              {user.role === "client"
                ? "Manage your gigs and find the best freelancers"
                : "Discover new opportunities and bid on projects"}
            </p>
          </div>
          {user.role === "client" && (
            <Link to="/create" className="btn-primary shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Post a Gig
            </Link>
          )}
        </div>

        {/* CLIENT: My Gigs */}
        {user.role === "client" && myGigs.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-[#f0f0fa]">My Gigs</h2>
              <Link to="/create" className="text-sm text-violet-400 hover:text-violet-300 transition-colors">
                + Add new
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {myGigs.slice(0, 3).map(gig => (
                <GigCard key={gig._id} gig={gig} isOwner />
              ))}
            </div>
          </section>
        )}

        {/* CLIENT: No gigs yet */}
        {user.role === "client" && myGigs.length === 0 && (
          <section className="mb-10">
            <div className="rounded-2xl p-8 text-center border border-dashed" style={{ borderColor: "var(--border)" }}>
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center text-3xl"
                style={{ background: "rgba(139,92,246,0.1)" }}>
                📋
              </div>
              <h3 className="text-lg font-semibold text-[#f0f0fa] mb-2">No gigs yet</h3>
              <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                Post your first gig and start receiving bids from talented freelancers
              </p>
              <Link to="/create" className="btn-primary">
                Create your first gig →
              </Link>
            </div>
          </section>
        )}

        {/* Divider for client */}
        {user.role === "client" && (
          <h2 className="text-xl font-bold text-[#f0f0fa] mb-5">Other Open Gigs</h2>
        )}



        {/* FREELANCER: Section header */}
        {user.role === "freelancer" && (
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-[#f0f0fa]">Browse All Gigs</h2>
              <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                {total} open {total === 1 ? "gig" : "gigs"} available
              </p>
            </div>
            <Link to="/my-bids" className="btn-secondary text-sm py-2">
              My Bids →
            </Link>
          </div>
        )}

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search gigs..."
                className="input-dark pl-10 w-full"
              />
            </div>
            <button type="submit" className="btn-primary px-5 py-2.5">Search</button>
            {(search || category !== "All") && (
              <button
                type="button"
                onClick={() => { setSearch(""); setSearchInput(""); setCategory("All"); setPage(1); }}
                className="btn-secondary px-4 py-2.5 text-sm"
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {/* Category filter chips */}
        <div className="flex gap-2 flex-wrap mb-6">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border ${category === cat
                ? "text-white border-transparent"
                : "text-[#8888aa] hover:text-[#f0f0fa]"
                }`}
              style={category === cat
                ? { background: "linear-gradient(135deg, #7c3aed, #c084fc)", borderColor: "transparent" }
                : { background: "transparent", borderColor: "var(--border)" }
              }
            >
              {CATEGORY_ICONS[cat] && cat !== "All" ? `${CATEGORY_ICONS[cat]} ` : ""}{cat}
            </button>
          ))}
        </div>

        {/* Gig Grid */}
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : gigs.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-lg font-semibold text-[#f0f0fa]">No gigs found</p>
            <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
              Try adjusting your search or filter
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {gigs.map(gig => (
                <GigCard key={gig._id} gig={gig} isOwner={gig.ownerId?._id === user.id || gig.ownerId === user.id} />
              ))}
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
                >
                  ← Prev
                </button>
                {[...Array(pages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${page === i + 1
                      ? "text-white"
                      : "text-[#8888aa] hover:text-[#f0f0fa]"
                      }`}
                    style={page === i + 1
                      ? { background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }
                      : { background: "var(--bg-card)", border: "1px solid var(--border)" }
                    }
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(pages, p + 1))}
                  disabled={page === pages}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ----- GIG CARD -----
function GigCard({ gig, isOwner, showMatch }) {
  const daysLeft = gig.deadline
    ? Math.ceil((new Date(gig.deadline) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  const statusBadge = () => {
    if (gig.status === "open") return <span className="badge badge-open">Open</span>;
    if (gig.status === "assigned") return <span className="badge badge-assigned">Assigned</span>;
    if (gig.status === "completed") return <span className="badge badge-completed">Completed</span>;
    return null;
  };

  return (
    <div className="card-dark hover:glow-purple p-5 flex flex-col gap-4 group transition-all duration-300 hover:scale-[1.01]">
      {/* Top */}
      <div className="flex items-start justify-between gap-2">
        <span className="badge badge-purple text-xs shrink-0">
          {CATEGORY_ICONS[gig.category] || "⚙️"} {gig.category || "Other"}
        </span>
        <div className="flex items-center gap-2">
          {showMatch && gig.matchScore && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>
              {gig.matchScore}% Match
            </div>
          )}
          {statusBadge()}
        </div>
      </div>

      {/* Title */}
      <div>
        <h3 className="font-semibold text-[#f0f0fa] line-clamp-2 text-base leading-snug group-hover:text-violet-300 transition-colors">
          {gig.title}
        </h3>
        {showMatch && gig.matchReasons && gig.matchReasons.length > 0 && (
          <div className="mt-1.5 flex flex-col gap-0.5">
            {gig.matchReasons.map((reason, idx) => (
              <p key={idx} className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-emerald-400" /> {reason}
              </p>
            ))}
          </div>
        )}
        <p className="text-xs mt-1.5 line-clamp-2 leading-relaxed" style={{ color: "var(--text-muted)" }}>
          {gig.description}
        </p>
      </div>

      {/* Tags */}
      {gig.tags && gig.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {gig.tags.slice(0, 3).map(tag => (
            <span key={tag} className="skill-tag">{tag}</span>
          ))}
        </div>
      )}

      {/* Meta */}
      <div className="flex items-center gap-4 text-xs" style={{ color: "var(--text-secondary)" }}>
        <div className="flex items-center gap-1">
          <span className="text-violet-400 font-bold text-base">₹{Number(gig.budget).toLocaleString()}</span>
        </div>
        {gig.bidCount > 0 && (
          <span>{gig.bidCount} bid{gig.bidCount !== 1 ? "s" : ""}</span>
        )}
        {daysLeft !== null && daysLeft > 0 && (
          <span className="text-amber-400">{daysLeft}d left</span>
        )}
        {daysLeft !== null && daysLeft <= 0 && (
          <span className="text-red-400">Expired</span>
        )}
      </div>

      {/* Owner */}
      {gig.ownerId?.name && (
        <div className="flex items-center gap-2 pt-1 border-t" style={{ borderColor: "var(--border)" }}>
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ background: "linear-gradient(135deg, #7c3aed, #c084fc)" }}>
            {gig.ownerId.name.charAt(0)}
          </div>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>by {gig.ownerId.name}</span>
          {isOwner && <span className="text-xs text-violet-400 ml-auto">(you)</span>}
        </div>
      )}

      {/* CTA */}
      <Link
        to={`/gig/${gig._id}`}
        className="w-full text-center py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 mt-auto"
        style={{ background: "rgba(139,92,246,0.1)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.25)" }}
        onMouseEnter={e => {
          e.target.style.background = "linear-gradient(135deg,#7c3aed,#6d28d9)";
          e.target.style.color = "white";
          e.target.style.borderColor = "transparent";
        }}
        onMouseLeave={e => {
          e.target.style.background = "rgba(139,92,246,0.1)";
          e.target.style.color = "#a78bfa";
          e.target.style.borderColor = "rgba(139,92,246,0.25)";
        }}
      >
        View Details →
      </Link>
    </div>
  );
}

// ----- SKELETON -----
function SkeletonCard() {
  return (
    <div className="card-dark p-5 space-y-4 animate-pulse">
      <div className="h-4 w-24 rounded-full" style={{ background: "var(--bg-secondary)" }} />
      <div className="space-y-2">
        <div className="h-5 rounded-lg w-3/4" style={{ background: "var(--bg-secondary)" }} />
        <div className="h-3 rounded w-full" style={{ background: "var(--bg-secondary)" }} />
        <div className="h-3 rounded w-5/6" style={{ background: "var(--bg-secondary)" }} />
      </div>
      <div className="h-8 rounded-xl" style={{ background: "var(--bg-secondary)" }} />
    </div>
  );
}

// ----- LANDING PAGE (unauthenticated) -----
function LandingPage() {
  const stats = [
    { label: "Active Gigs", value: "1,200+", icon: "📋" },
    { label: "Freelancers", value: "800+", icon: "👨‍💻" },
    { label: "Projects Done", value: "3,400+", icon: "✅" },
    { label: "Categories", value: "12+", icon: "🎯" },
  ];

  const features = [
    {
      icon: "🚀",
      title: "Post Gigs Instantly",
      desc: "Clients can post detailed gigs with budget, category, skills, and deadline in minutes."
    },
    {
      icon: "💼",
      title: "Smart Bidding",
      desc: "Freelancers submit competitive bids with proposed price, delivery time, and pitch."
    },
    {
      icon: "⚡",
      title: "Atomic Hiring",
      desc: "One-click hire, powered by MongoDB transactions — accepted bid hired, rest rejected automatically."
    },
    {
      icon: "🔒",
      title: "Secure Auth",
      desc: "JWT-secured sessions with HTTP-only cookies ensure your account stays protected."
    },
    {
      icon: "📊",
      title: "Role-Based Views",
      desc: "Separate dashboards for clients (gig management) and freelancers (bid tracking)."
    },
    {
      icon: "🎨",
      title: "Modern UI",
      desc: "A premium, dark-mode interface built for productivity and great user experience."
    },
  ];

  const categories = [
    { icon: "🌐", label: "Web Dev" },
    { icon: "📱", label: "Mobile Dev" },
    { icon: "🎨", label: "UI/UX Design" },
    { icon: "🤖", label: "AI & ML" },
    { icon: "📊", label: "Marketing" },
    { icon: "📝", label: "Writing" },
    { icon: "☁️", label: "DevOps" },
    { icon: "🎬", label: "Video" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-10"
            style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-10"
            style={{ background: "radial-gradient(circle, #c084fc, transparent)" }} />
        </div>

        <div className="section-container relative">
          <div className="text-center max-w-4xl mx-auto">


            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-tight">
              <span className="text-[#f0f0fa]">The Smarter Way</span>
              <br />
              <span className="gradient-text">to Hire & Get Hired</span>
            </h1>

            <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              GigFlow connects clients with top freelancers. Post gigs, receive bids,
              and hire the perfect talent — all in one seamless platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register?role=client" className="btn-primary text-base px-8 py-3.5">
                I want to Hire →
              </Link>
              <Link to="/register?role=freelancer" className="btn-secondary text-base px-8 py-3.5" style={{ background: "rgba(255,255,255,0.05)" }}>
                I want to Work
              </Link>
            </div>
            <div className="mt-6 text-sm" style={{ color: "var(--text-muted)" }}>
              Already have an account? <Link to="/login" className="text-violet-400 hover:underline">Sign In</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12" style={{ background: "var(--bg-secondary)" }}>
        <div className="section-container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map(s => (
              <div key={s.label} className="stat-card text-center">
                <div className="text-3xl mb-2">{s.icon}</div>
                <div className="text-2xl font-black gradient-text">{s.value}</div>
                <div className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="section-container">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#f0f0fa]">Browse by Category</h2>
            <p className="mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>
              Find the expertise you need across 12+ specialized fields
            </p>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-4">
            {categories.map(c => (
              <Link to="/register" key={c.label}
                className="card-dark flex flex-col items-center gap-2 p-4 text-center hover:scale-105 transition-all duration-200 hover:border-violet-500/40 group cursor-pointer">
                <span className="text-2xl group-hover:scale-110 transition-transform">{c.icon}</span>
                <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{c.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16" style={{ background: "var(--bg-secondary)" }}>
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#f0f0fa]">Everything You Need</h2>
            <p className="mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>
              Built with modern technologies to power your freelancing journey
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(f => (
              <div key={f.title} className="card-dark p-6 hover:border-violet-500/30 transition-all duration-300 group">
                <div className="text-3xl mb-4 group-hover:scale-110 transition-transform inline-block">{f.icon}</div>
                <h3 className="font-bold text-[#f0f0fa] mb-2">{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="section-container text-center">
          <div className="max-w-2xl mx-auto rounded-3xl p-10"
            style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(192,132,252,0.1))", border: "1px solid rgba(139,92,246,0.3)" }}>
            <h2 className="text-2xl sm:text-3xl font-black text-[#f0f0fa] mb-4">
              Ready to get started?
            </h2>
            <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
              Join hundreds of clients and freelancers on GigFlow today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register?role=client" className="btn-primary text-base py-3 px-8">
                I need a freelancer
              </Link>
              <Link to="/register?role=freelancer" className="btn-secondary text-base py-3 px-8">
                I want to find work
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t text-center" style={{ borderColor: "var(--border)" }}>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          © {new Date().getFullYear()} GigFlow. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default Home;