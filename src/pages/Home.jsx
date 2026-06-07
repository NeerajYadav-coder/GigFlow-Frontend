import { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { 
  Globe, Smartphone, Palette, PenTool, FileText, BarChart, Film, 
  Brain, Cloud, Shield, Database, Settings, Layers, Users, 
  CheckCircle, Target, Search, ArrowRight, Clock, Plus, Sparkles,
  Coins, Zap, Lock, Eye, ArrowUpRight, DollarSign, Calendar, Briefcase, Building,
  SlidersHorizontal, MapPin
} from "lucide-react";

const CATEGORIES = [
  "All", "Web Development", "Mobile Development", "UI/UX Design",
  "Graphic Design", "Content Writing", "Digital Marketing",
  "Video & Animation", "Data Science & AI", "DevOps & Cloud", "Other"
];

// Map categories to Lucide Icons
const getCategoryIcon = (cat, className = "w-5 h-5") => {
  switch (cat) {
    case "Web Development": return <Globe className={className} />;
    case "Mobile Development": return <Smartphone className={className} />;
    case "UI/UX Design": return <Palette className={className} />;
    case "Graphic Design": return <PenTool className={className} />;
    case "Content Writing": return <FileText className={className} />;
    case "Digital Marketing": return <BarChart className={className} />;
    case "Video & Animation": return <Film className={className} />;
    case "Data Science & AI": return <Brain className={className} />;
    case "DevOps & Cloud": return <Cloud className={className} />;
    case "Cybersecurity": return <Shield className={className} />;
    case "Database": return <Database className={className} />;
    default: return <Settings className={className} />;
  }
};

const Home = () => {
  const { user } = useContext(AuthContext);
  const toast = useToast();
  const [gigs, setGigs] = useState([]);
  const [myGigs, setMyGigs] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [recLoading, setRecLoading] = useState(false);
  
  // Search and tabs
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState("All");
  const [type, setType] = useState("all"); // all | gig | job | internship
  
  // Smart filters
  const [locationType, setLocationType] = useState("all");
  const [experienceLevel, setExperienceLevel] = useState("all");
  const [jobType, setJobType] = useState("all");
  const [locationInput, setLocationInput] = useState("");
  const [minBudget, setMinBudget] = useState("");
  const [nearMe, setNearMe] = useState(false);

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
        if (type !== "all") params.type = type;
        if (locationType !== "all") params.locationType = locationType;
        if (experienceLevel !== "all") params.experienceLevel = experienceLevel;
        if (jobType !== "all") params.jobType = jobType;
        if (locationInput) params.location = locationInput;
        if (minBudget) params.minBudget = minBudget;
        if (nearMe && user?.location) {
          params.nearMe = true;
          params.userLocation = user.location;
        }

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
  }, [
    search, category, type, locationType, experienceLevel, 
    jobType, locationInput, minBudget, nearMe, page, user?.location
  ]);

  // Fetch client's own gigs
  useEffect(() => {
    if (user?.role === "client") {
      api.get("/gigs/my/list")
        .then(res => setMyGigs(res.data))
        .catch(() => setMyGigs([]));
    }
  }, [user]);

  // Fetch SmartMatch recommendations for freelancers
  useEffect(() => {
    if (user?.role === "freelancer") {
      setRecLoading(true);
      api.get("/recommendations")
        .then(res => setRecommendations(res.data || []))
        .catch(() => setRecommendations([]))
        .finally(() => setRecLoading(false));
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

  const handleNearMeToggle = () => {
    if (!user?.location) {
      toast.warning("Please update your location in your Profile first.");
      return;
    }
    setNearMe(!nearMe);
    setPage(1);
  };

  const resetFilters = () => {
    setLocationType("all");
    setExperienceLevel("all");
    setJobType("all");
    setLocationInput("");
    setMinBudget("");
    setNearMe(false);
    setSearch("");
    setSearchInput("");
    setCategory("All");
    setPage(1);
  };

  // If not logged in, show landing page
  if (!user) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen pb-16" style={{ background: "var(--bg-secondary)" }}>
      <div className="section-container py-8">

        {/* Welcome Banner */}
        <div className="mb-10 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 relative overflow-hidden bg-white border border-slate-150 shadow-sm">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/40 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, <span className="gradient-text">{user.name}</span> <span className="inline-block animate-bounce">👋</span>
            </h1>
            <p className="text-sm mt-2 font-semibold text-slate-500">
              {user.role === "client"
                ? "Manage your project dashboard and find top-tier freelancers."
                : "Discover premium projects and pitch your best proposals."}
            </p>
          </div>
          {user.role === "client" && (
            <Link to="/create" className="btn-primary shrink-0 relative z-10">
              <Plus className="w-4 h-4" />
              Post a Gig
            </Link>
          )}
        </div>

        {/* CLIENT: My Gigs */}
        {user.role === "client" && myGigs.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900">My Posted Gigs</h2>
              <Link to="/create" className="text-sm font-bold text-indigo-600 hover:text-indigo-750 transition-colors flex items-center gap-1">
                <Plus className="w-4 h-4" /> Add new gig
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {myGigs.slice(0, 3).map(gig => (
                <GigCard key={gig._id} gig={gig} isOwner />
              ))}
            </div>
          </section>
        )}

        {/* CLIENT: No gigs yet */}
        {user.role === "client" && myGigs.length === 0 && (
          <section className="mb-12">
            <div className="rounded-3xl p-10 text-center border-2 border-dashed border-slate-200 bg-white shadow-sm">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100"
                style={{ background: "rgba(79,70,229,0.03)" }}>
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Create your first gig listing</h3>
              <p className="text-sm max-w-md mx-auto mb-6 text-slate-500 font-medium">
                Describe your requirements and budget. You'll start receiving bids from qualified freelancers in minutes.
              </p>
              <Link to="/create" className="btn-primary">
                Post a Gig now <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </section>
        )}

        {/* Divider for client */}
        {user.role === "client" && (
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900 mb-6">Explore Open Gigs</h2>
        )}

        {/* FREELANCER: SmartMatch Recommendations */}
        {user.role === "freelancer" && recommendations.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-indigo-650 animate-pulse" />
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900">SmartMatch Matches for You</h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recommendations.map(gig => (
                <GigCard key={gig._id} gig={gig} isOwner={false} showMatch={true} />
              ))}
            </div>
          </section>
        )}

        {/* FREELANCER: Section header */}
        {user.role === "freelancer" && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Browse Open Opportunities</h2>
              <p className="text-sm mt-1 text-slate-500 font-semibold">
                We found <span className="text-indigo-650 font-bold">{total}</span> open {total === 1 ? "gig" : "gigs"} matching your criteria
              </p>
            </div>
            <Link to="/my-bids" className="btn-secondary text-sm py-2.5 flex items-center gap-1.5 self-start sm:self-auto shadow-sm">
              View Submitted Bids <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-4 items-start">
          
          {/* Smart Filters Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="card-dark p-6 bg-white border-slate-200 shadow-sm text-left relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-600 to-sky-500" />
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-indigo-600" /> Smart Filters
                </h3>
                <button
                  onClick={resetFilters}
                  className="text-[10px] font-extrabold text-indigo-650 hover:underline cursor-pointer uppercase tracking-wider"
                >
                  Reset All
                </button>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                {/* Near me matching */}
                {user?.role === "freelancer" && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/40 border border-indigo-100/50">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">Near me</p>
                        <p className="text-[9px] text-slate-400 font-semibold mt-0.5">
                          {user.location ? `Matching "${user.location}"` : "Add location in profile"}
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={nearMe}
                      onChange={handleNearMeToggle}
                      className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                    />
                  </div>
                )}

                {/* Specific Location Search */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">City / Region</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={locationInput}
                      onChange={e => { setLocationInput(e.target.value); setPage(1); }}
                      placeholder="Search city e.g. Mumbai"
                      className="input-dark pl-9 py-2 text-xs bg-white border border-slate-200"
                    />
                  </div>
                </div>

                {/* Location Type */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Work Setup</label>
                  <select
                    value={locationType}
                    onChange={e => { setLocationType(e.target.value); setPage(1); }}
                    className="input-dark py-2 text-xs bg-white border border-slate-200"
                  >
                    <option value="all">All Setups</option>
                    <option value="Remote">Remote</option>
                    <option value="On-site">On-site</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                {/* Experience Level */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Experience Level</label>
                  <select
                    value={experienceLevel}
                    onChange={e => { setExperienceLevel(e.target.value); setPage(1); }}
                    className="input-dark py-2 text-xs bg-white border border-slate-200"
                  >
                    <option value="all">All Levels</option>
                    <option value="Entry-level">Entry-level</option>
                    <option value="Mid-level">Mid-level</option>
                    <option value="Senior">Senior</option>
                  </select>
                </div>

                {/* Employment/Job Type */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Employment Type</label>
                  <select
                    value={jobType}
                    onChange={e => { setJobType(e.target.value); setPage(1); }}
                    className="input-dark py-2 text-xs bg-white border border-slate-200"
                  >
                    <option value="all">All Types</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>

                {/* Budget/Salary Range */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Compensation (Min Budget/CTC)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      value={minBudget}
                      onChange={e => { setMinBudget(e.target.value); setPage(1); }}
                      placeholder="e.g. 50000"
                      className="input-dark pl-7 py-2 text-xs bg-white border border-slate-200"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main List Area (3/4) */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Listing Type tabs */}
            <div className="flex gap-1.5 mb-6 bg-slate-100 p-1.5 rounded-2xl max-w-lg shadow-inner">
              {[
                { val: "all", label: "All Opportunities" },
                { val: "gig", label: "Freelance Gigs" },
                { val: "job", label: "Jobs" },
                { val: "internship", label: "Internships" }
              ].map(t => (
                <button
                  key={t.val}
                  type="button"
                  onClick={() => { setType(t.val); setPage(1); }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    type === t.val 
                      ? "bg-white text-indigo-650 shadow-sm font-extrabold" 
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Search + Clear Action */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <form onSubmit={handleSearch} className="flex gap-2.5 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-450" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                    placeholder="Search by keywords, titles, or tags..."
                    className="input-dark pl-11 w-full bg-white border border-slate-205"
                  />
                </div>
                <button type="submit" className="btn-primary px-6">Search</button>
                {(search || category !== "All" || locationType !== "all" || experienceLevel !== "all" || jobType !== "all" || locationInput || minBudget || nearMe) && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="btn-secondary px-5 text-sm"
                  >
                    Clear All
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
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 border flex items-center gap-1.5 cursor-pointer shadow-sm ${category === cat
                    ? "text-white border-transparent"
                    : "text-slate-650 border-slate-200 hover:text-indigo-600 hover:border-indigo-100 hover:bg-slate-50"
                    }`}
                  style={category === cat
                    ? { background: "linear-gradient(135deg, var(--accent), var(--accent-secondary))" }
                    : { background: "var(--bg-card)" }
                  }
                >
                  {cat !== "All" && getCategoryIcon(cat, "w-3.5 h-3.5")}
                  {cat}
                </button>
              ))}
            </div>

            {/* Gig Grid */}
            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {[...Array(6)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : gigs.length === 0 ? (
              <div className="text-center py-24 rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center text-slate-400 bg-slate-50 border border-slate-100">
                  <Search className="w-6 h-6" />
                </div>
                <p className="text-lg font-bold text-slate-800">No matches found</p>
                <p className="text-xs mt-2 max-w-sm mx-auto text-slate-500 font-medium">
                  We couldn't find any opportunities matching your filters. Try resetting filters or adjusting search.
                </p>
              </div>
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2">
                  {gigs.map(gig => (
                    <GigCard key={gig._id} gig={gig} isOwner={gig.ownerId?._id === user.id || gig.ownerId === user.id} />
                  ))}
                </div>

                {/* Pagination */}
                {pages > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-12">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed border cursor-pointer bg-white"
                      style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                    >
                      Prev
                    </button>
                    {[...Array(pages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPage(i + 1)}
                        className={`w-10 h-10 rounded-xl text-sm font-extrabold transition-all border cursor-pointer shadow-sm ${page === i + 1
                          ? "text-white border-transparent"
                          : "text-slate-650 border-slate-200 hover:text-indigo-600 bg-white"
                          }`}
                        style={page === i + 1
                          ? { background: "linear-gradient(135deg, var(--accent), var(--accent-secondary))" }
                          : {}
                        }
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage(p => Math.min(pages, p + 1))}
                      disabled={page === pages}
                      className="px-4 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed border cursor-pointer bg-white"
                      style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
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

  const typeBadge = () => {
    if (gig.type === "job") return <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border bg-sky-50 text-sky-805 border-sky-200">Job</span>;
    if (gig.type === "internship") return <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border bg-emerald-50 text-emerald-800 border-emerald-200">Internship</span>;
    return <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border bg-purple-50 text-purple-800 border-purple-200">Gig</span>;
  };

  return (
    <div className="card-dark p-6 flex flex-col gap-4 group transition-all duration-300 hover:translate-y-[-3px] hover:border-slate-350 bg-white">
      
      {/* Top row */}
      <div className="flex items-center justify-between gap-3">
        <span className="badge badge-purple text-[10px] uppercase tracking-wider shrink-0 flex items-center gap-1.5">
          {getCategoryIcon(gig.category, "w-3 h-3")}
          {gig.category || "Other"}
        </span>
        <div className="flex items-center gap-2">
          {showMatch && gig.matchScore && (
            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border"
              style={{ background: "rgba(16,185,129,0.05)", color: "#10b981", borderColor: "rgba(16,185,129,0.15)" }}>
              {gig.matchScore}% Match
            </div>
          )}
          {typeBadge()}
          {statusBadge()}
        </div>
      </div>

      {/* Title & Description */}
      <div className="flex-1 flex flex-col gap-2 text-left">
        <div>
          <h3 className="font-extrabold text-slate-800 text-base leading-snug line-clamp-2 group-hover:text-indigo-650 transition-colors">
            {gig.title}
          </h3>
          {gig.companyName && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 font-bold mt-1.5">
              <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{gig.companyName}</span>
              <span className="text-slate-300">•</span>
              <span className="text-indigo-600 bg-indigo-50/50 px-1.5 py-0.5 rounded text-[10px] font-extrabold border border-indigo-100/40">
                {gig.locationType || "Remote"}
              </span>
              {gig.location && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-600 flex items-center gap-0.5">
                    <MapPin className="w-3 h-3 text-slate-400" /> {gig.location}
                  </span>
                </>
              )}
              {gig.jobType && gig.type === "job" && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-emerald-700 bg-emerald-50/50 px-1.5 py-0.5 rounded text-[10px] font-extrabold border border-emerald-100/40">
                    {gig.jobType}
                  </span>
                </>
              )}
            </div>
          )}
        </div>
        {showMatch && gig.matchReasons && gig.matchReasons.length > 0 && (
          <div className="mt-1.5 flex flex-col gap-1">
            {gig.matchReasons.map((reason, idx) => (
              <p key={idx} className="text-[10px] text-emerald-650 font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {reason}
              </p>
            ))}
          </div>
        )}
        <p className="text-xs line-clamp-3 leading-relaxed mt-1 text-slate-500 font-semibold">
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

      {/* Meta parameters */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-left">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {gig.type === "gig" ? "Budget" : gig.type === "job" ? "Salary" : "Stipend"}
          </span>
          <span className="text-indigo-600 font-black text-base">
            ₹{Number(gig.budget).toLocaleString()}
            {gig.type === "job" && <span className="text-[10px] text-slate-400 font-bold">/{gig.salaryType === "yearly" ? "yr" : "mo"}</span>}
            {gig.type === "internship" && <span className="text-[10px] text-slate-400 font-bold">/mo</span>}
          </span>
        </div>
        <div className="text-right flex flex-col items-end">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Timeline / Details</span>
          {gig.type === "gig" ? (
            daysLeft !== null ? (
              daysLeft > 0 ? (
                <span className="text-amber-600 text-xs font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {daysLeft}d left
                </span>
              ) : (
                <span className="text-rose-500 text-xs font-bold">Expired</span>
              )
            ) : (
              <span className="text-slate-500 text-xs font-semibold">Flexible</span>
            )
          ) : (
            <span className="text-indigo-600 text-xs font-bold capitalize">
              {gig.experienceLevel || "Entry-level"}
            </span>
          )}
        </div>
      </div>

      {/* Footer / Owner Info */}
      {gig.ownerId?.name && (
        <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-secondary))" }}>
            {gig.ownerId.name.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs font-semibold text-slate-400">by {gig.ownerId.name}</span>
          {isOwner && <span className="text-[10px] font-bold text-indigo-500 ml-auto uppercase tracking-wide">Owner</span>}
        </div>
      )}

      {/* CTA Button */}
      <Link
        to={`/gig/${gig._id}`}
        className="w-full text-center py-3 rounded-2xl text-xs font-bold transition-all duration-300 mt-2 flex items-center justify-center gap-1.5 border border-indigo-500/10 hover:border-transparent"
        style={{ background: "rgba(79,70,229,0.04)", color: "#4f46e5" }}
        onMouseEnter={e => {
          e.target.style.background = "linear-gradient(135deg, var(--accent), var(--accent-secondary))";
          e.target.style.color = "white";
        }}
        onMouseLeave={e => {
          e.target.style.background = "rgba(79,70,229,0.04)";
          e.target.style.color = "#4f46e5";
        }}
      >
        View Details <ArrowUpRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

// ----- SKELETON -----
function SkeletonCard() {
  return (
    <div className="card-dark p-6 space-y-4 animate-pulse">
      <div className="h-4.5 w-24 rounded-lg bg-slate-100" />
      <div className="space-y-2.5">
        <div className="h-5 rounded-lg w-3/4 bg-slate-100" />
        <div className="h-3 rounded-lg w-full bg-slate-100" />
        <div className="h-3 rounded-lg w-5/6 bg-slate-100" />
      </div>
      <div className="h-10 rounded-2xl bg-slate-100" />
    </div>
  );
}

// ----- LANDING PAGE (unauthenticated) -----
function LandingPage() {
  const stats = [
    { label: "Active Gig Postings", value: "1,200+", icon: <Layers className="w-5 h-5" /> },
    { label: "Vetted Freelancers", value: "800+", icon: <Users className="w-5 h-5" /> },
    { label: "Completed Projects", value: "3,400+", icon: <CheckCircle className="w-5 h-5" /> },
    { label: "Specialty Fields", value: "12+", icon: <Target className="w-5 h-5" /> },
  ];

  const features = [
    {
      icon: <Briefcase className="w-6 h-6 text-indigo-600" />,
      title: "Post Gigs Instantly",
      desc: "Define parameters, tags, categories, budget ranges, and deadlines in a high-productivity interface."
    },
    {
      icon: <Coins className="w-6 h-6 text-cyan-600" />,
      title: "Competitive Bidding",
      desc: "Freelancers customize quotes, delivery times, and write persuasive pitches to win client bids."
    },
    {
      icon: <Zap className="w-6 h-6 text-indigo-600" />,
      title: "Atomic Hiring Flows",
      desc: "One-click hiring. When you accept a proposal, alternative bids transition gracefully automatically."
    },
    {
      icon: <Lock className="w-6 h-6 text-cyan-600" />,
      title: "Secure Authentication",
      desc: "State-of-the-art security featuring JWT-secured sessions and HTTP-only cookie parameters."
    },
    {
      icon: <Eye className="w-6 h-6 text-indigo-600" />,
      title: "Tailored Dashboards",
      desc: "Role-specific user views created explicitly for client project tracking or freelancer proposal management."
    },
    {
      icon: <Sparkles className="w-6 h-6 text-cyan-600" />,
      title: "Obsidian Aesthetics",
      desc: "Designed using beautiful dark principles, glowing border micro-actions, and professional layout flow."
    },
  ];

  const categories = [
    { icon: <Globe className="w-6 h-6" />, label: "Web Dev" },
    { icon: <Smartphone className="w-6 h-6" />, label: "Mobile Dev" },
    { icon: <Palette className="w-6 h-6" />, label: "UI/UX Design" },
    { icon: <Brain className="w-6 h-6" />, label: "AI & ML" },
    { icon: <BarChart className="w-6 h-6" />, label: "Marketing" },
    { icon: <FileText className="w-6 h-6" />, label: "Writing" },
    { icon: <Cloud className="w-6 h-6" />, label: "DevOps" },
    { icon: <Film className="w-6 h-6" />, label: "Video" },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "var(--bg-secondary)" }}>
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-50/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-50/20 blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 sm:pt-32 sm:pb-24">
        <div className="section-container relative">
          <div className="text-center max-w-4xl mx-auto">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-100 bg-indigo-50/60 mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600">Elevate Your Workflow</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-none text-slate-900">
              <span>The Smarter Platform</span>
              <br />
              <span className="gradient-text font-black">to Hire & Get Hired</span>
            </h1>

            <p className="text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed text-slate-600 font-medium">
              GigFlow connects elite talent with high-impact projects. Post detailed requirements, receive competitive pitches, and build products seamlessly.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/register?role=client" className="btn-primary text-sm px-8 py-3.5 w-full sm:w-auto">
                Hire Talent <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/register?role=freelancer" className="btn-secondary text-sm px-8 py-3.5 w-full sm:w-auto shadow-sm">
                Find Work
              </Link>
            </div>
            
            <div className="mt-8 text-sm text-slate-500 font-bold">
              Already registered? <Link to="/login" className="text-indigo-650 hover:text-indigo-750 transition-colors font-bold underline decoration-indigo-500/20">Sign In</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 border-y border-slate-100 bg-white/70 shadow-sm">
        <div className="section-container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map(s => (
              <div key={s.label} className="stat-card text-center flex flex-col items-center shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-indigo-600 mb-3 shadow-inner">
                  {s.icon}
                </div>
                <div className="text-2xl font-black gradient-text">{s.value}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Explore Categories</h2>
            <p className="mt-3 text-sm text-slate-500 font-semibold">
              Discover industry professionals ready to scale your next build
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map(c => (
              <Link to="/register" key={c.label}
                className="card-dark flex flex-col items-center gap-3.5 p-5 text-center transition-all duration-300 hover:translate-y-[-3px] hover:border-indigo-200 group cursor-pointer shadow-sm">
                <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 group-hover:text-indigo-600 transition-colors">
                  {c.icon}
                </div>
                <span className="text-xs font-bold text-slate-600 group-hover:text-slate-800 transition-colors">{c.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t border-slate-100 bg-white/40">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Feature Stack</h2>
            <p className="mt-3 text-sm text-slate-500 font-semibold">
              All the tools you need to publish listings and secure contracts
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <div key={i} className="card-dark p-7 hover:border-indigo-150 transition-all duration-300 group shadow-sm bg-white">
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  {f.icon}
                </div>
                <h3 className="font-extrabold text-slate-800 text-base mb-2 group-hover:text-indigo-600 transition-colors">{f.title}</h3>
                <p className="text-xs leading-relaxed text-slate-500 font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="py-20 border-t border-slate-100">
        <div className="section-container text-center">
          <div className="max-w-3xl mx-auto rounded-3xl p-8 sm:p-12 relative overflow-hidden bg-white border border-slate-150 shadow-md">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/20 rounded-full blur-3xl pointer-events-none" />
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              Join the Flow
            </h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto mb-8 leading-relaxed font-semibold">
              Launch your profile as a client or freelancer today and get hired or post gigs instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/register?role=client" className="btn-primary text-sm py-3 px-8 w-full sm:w-auto">
                I need a Freelancer
              </Link>
              <Link to="/register?role=freelancer" className="btn-secondary text-sm py-3 px-8 w-full sm:w-auto shadow-sm">
                I want to work
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-slate-150 bg-white/70 text-center shadow-inner" style={{ borderColor: "var(--border)" }}>
        <p className="text-xs text-slate-500 font-bold">
          © {new Date().getFullYear()} GigFlow. All rights reserved. Built for professional work.
        </p>
      </footer>
    </div>
  );
}

export default Home;