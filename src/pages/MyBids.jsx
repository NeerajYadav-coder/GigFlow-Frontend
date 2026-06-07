import { useEffect, useState, useContext } from "react";
import api, { BACKEND_URL } from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { FileText, Clock, CheckCircle, XCircle, Inbox, Trash2, ArrowRight, ExternalLink, Download, User } from "lucide-react";

const MyBids = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const toast = useToast();
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [downloadingResume, setDownloadingResume] = useState(false);

    useEffect(() => {
        if (user?.role !== "freelancer") {
            navigate("/");
            return;
        }
        api.get("/bids/my-bids")
            .then(res => setBids(res.data))
            .catch(() => toast.error("Failed to load bids"))
            .finally(() => setLoading(false));
    }, [user]);

    // Downloads a file via fetch so auth cookies are included (cross-origin <a download> doesn't send cookies)
    const triggerDownload = async (url, fallbackFilename = "resume.pdf") => {
        setDownloadingResume(true);
        try {
            const res = await fetch(url, { credentials: "include" });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || `Download failed (${res.status})`);
            }
            // Extract filename from Content-Disposition header if available
            const disposition = res.headers.get("Content-Disposition") || "";
            const match = disposition.match(/filename="?([^"]+)"?/);
            const filename = match ? match[1] : fallbackFilename;

            const blob = await res.blob();
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(blobUrl);
            toast.success(`Downloading: ${filename}`);
        } catch (err) {
            toast.error(err.message || "Failed to download resume");
        } finally {
            setDownloadingResume(false);
        }
    };

    const withdrawBid = async (bidId, gigId) => {
        if (!window.confirm("Are you sure you want to withdraw this proposal?")) return;
        try {
            await api.delete(`/bids/${bidId}/withdraw`);
            setBids(prev => prev.filter(b => b._id !== bidId));
            toast.success("Bid withdrawn successfully");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to withdraw bid");
        }
    };

    const filteredBids = filter === "all"
        ? bids
        : bids.filter(b => b.status === filter);

    const stats = {
        total: bids.length,
        pending: bids.filter(b => b.status === "pending").length,
        hired: bids.filter(b => b.status === "hired").length,
        rejected: bids.filter(b => b.status === "rejected").length,
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-secondary)" }}>
                <div className="text-center">
                    <div className="spinner w-10 h-10 mx-auto mb-4" />
                    <p className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Loading proposal data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-16" style={{ background: "var(--bg-secondary)" }}>
            <div className="section-container py-8">

                {/* Page header */}
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">My Bids & Proposals</h1>
                    <p className="text-xs font-semibold mt-2 text-slate-500">
                        Track and manage bids you have submitted to client projects.
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: "Total Proposals", value: stats.total, color: "text-indigo-650", icon: <FileText className="w-4 h-4 text-indigo-600" /> },
                        { label: "Pending Review", value: stats.pending, color: "text-amber-600", icon: <Clock className="w-4 h-4 text-amber-500" /> },
                        { label: "Hired Gigs", value: stats.hired, color: "text-emerald-600", icon: <CheckCircle className="w-4 h-4 text-emerald-500" /> },
                        { label: "Unaccepted Bids", value: stats.rejected, color: "text-rose-600", icon: <XCircle className="w-4 h-4 text-rose-500" /> },
                    ].map(s => (
                        <div key={s.label} className="stat-card shadow-sm">
                            <div className="flex items-center gap-2 mb-1">
                                {s.icon}
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{s.label}</span>
                            </div>
                            <div className={`text-2xl font-black mt-1 ${s.color}`}>{s.value}</div>
                        </div>
                    ))}
                </div>

                {/* Filter tabs */}
                <div className="flex gap-2 mb-8 flex-wrap">
                    {[
                        { val: "all", label: "All" },
                        { val: "pending", label: "Pending" },
                        { val: "hired", label: "Hired" },
                        { val: "rejected", label: "Rejected" },
                    ].map(f => (
                        <button
                            key={f.val}
                            onClick={() => setFilter(f.val)}
                            className={`px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 border cursor-pointer shadow-sm ${filter === f.val
                                    ? "text-white border-transparent"
                                    : "text-slate-650 border-slate-200 hover:text-indigo-600 bg-white"
                                }`}
                            style={filter === f.val
                                ? { background: "linear-gradient(135deg, var(--accent), var(--accent-secondary))" }
                                : {}
                            }
                        >
                            {f.label}
                            {f.val !== "all" && (
                                <span className="ml-1.5 opacity-80">({stats[f.val]})</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Bid list */}
                {filteredBids.length === 0 ? (
                    <div className="card-dark p-16 text-center border-slate-200 bg-white shadow-sm">
                        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center text-slate-400 bg-slate-50 border border-slate-100">
                            <Inbox className="w-6 h-6" />
                        </div>
                        <p className="text-lg font-bold text-slate-800">
                            {filter === "all" ? "No bids yet" : `No ${filter} bids`}
                        </p>
                        <p className="text-xs mt-2 mb-6 max-w-sm mx-auto text-slate-500 font-medium">
                            {filter === "all"
                                ? "Search open opportunities and submit pitches to start earning."
                                : `You don't have any bids marked as ${filter} currently.`}
                        </p>
                        <Link to="/" className="btn-primary">
                            Browse Gigs <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredBids.map(bid => {
                            const gig = bid.gigId;
                            const daysLeft = gig?.deadline
                                ? Math.ceil((new Date(gig.deadline) - new Date()) / (1000 * 60 * 60 * 24))
                                : null;

                            return (
                                <div
                                    key={bid._id}
                                    className={`card-dark p-6 transition-all duration-350 border shadow-sm ${bid.status === "hired" ? "glow-accent border-emerald-300" :
                                            bid.status === "rejected" ? "opacity-60" : ""
                                        }`}
                                    style={bid.status === "hired" ? { borderColor: "rgba(16,185,129, 0.4)" } : {}}
                                >
                                    <div className="flex flex-col md:flex-row md:items-start gap-5">

                                        {/* Left: Gig info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-3 flex-wrap">
                                                {gig?.category && (
                                                    <span className="badge badge-purple text-[10px] uppercase tracking-wide">{gig.category}</span>
                                                )}
                                                <span className={`badge badge-${bid.status} text-[10px] uppercase tracking-wide`}>{bid.status}</span>
                                                {gig?.status === "open" && bid.status === "pending" && (
                                                    <span className="badge badge-open text-[10px] uppercase tracking-wide">Active Listing</span>
                                                )}
                                            </div>

                                            <h3 className="font-extrabold text-slate-850 text-base mb-2 line-clamp-2">
                                                {gig?.title || "Gig Details (Listing Deleted)"}
                                            </h3>

                                            <div className="flex items-center flex-wrap gap-4 text-xs font-semibold mb-4 text-slate-500">
                                                {(gig?.type === "gig" || !gig?.type) ? (
                                                    <>
                                                        <span>Budget: <span className="text-slate-800">₹{gig?.budget?.toLocaleString() || "—"}</span></span>
                                                        <span>My Pitch: <span className="text-indigo-650">₹{Number(bid.price).toLocaleString()}</span></span>
                                                        {bid.deliveryDays && (
                                                            <span className="flex items-center gap-1 text-slate-500"><Clock className="w-3.5 h-3.5" /> {bid.deliveryDays} days</span>
                                                        )}
                                                    </>
                                                ) : (
                                                    <>
                                                        <span>
                                                            {gig?.type === "job" ? "Salary Package: " : "Monthly Stipend: "}
                                                            <span className="text-slate-850 font-extrabold text-slate-800">
                                                                ₹{gig?.budget?.toLocaleString() || "—"}
                                                                {gig?.type === "job" && (gig?.salaryType === "yearly" ? "/yr" : "/mo")}
                                                                {gig?.type === "internship" && "/mo"}
                                                            </span>
                                                        </span>
                                                        {gig?.companyName && (
                                                            <span>Company: <span className="text-slate-850 font-extrabold text-slate-800">{gig.companyName}</span></span>
                                                        )}
                                                    </>
                                                )}
                                                {daysLeft !== null && (
                                                    <span className={daysLeft > 0 ? "text-amber-600" : "text-rose-500"}>
                                                        {daysLeft > 0 ? `${daysLeft}d left` : "Deadline passed"}
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-xs leading-relaxed text-slate-650" style={{ color: "var(--text-secondary)" }}>
                                                {bid.message}
                                            </p>
                                        </div>

                                        {/* Right: Actions */}
                                        <div className="flex flex-row md:flex-col gap-2 shrink-0 self-start md:self-auto">
                                            {gig?._id && (
                                                <Link
                                                    to={`/gig/${gig._id}`}
                                                    className="btn-secondary text-xs py-2.5 px-4 flex items-center gap-1.5 shadow-sm"
                                                >
                                                    View Project <ExternalLink className="w-3.5 h-3.5" />
                                                </Link>
                                            )}
                                            {bid.status === "pending" && (
                                                <button
                                                    onClick={() => withdrawBid(bid._id, gig?._id)}
                                                    className="btn-danger text-xs py-2.5 px-4 flex items-center gap-1.5"
                                                >
                                                    Withdraw Pitch <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Hired banner */}
                                    {bid.status === "hired" && (
                                        <div className="mt-5 pt-5 border-t flex items-center gap-2 border-emerald-100">
                                            <span className="text-emerald-500">🎉</span>
                                            <p className="text-xs text-emerald-650 font-extrabold uppercase tracking-wider">
                                                {(gig?.type === "gig" || !gig?.type)
                                                    ? "You've been selected! The client will establish contact."
                                                    : "Your application has been accepted! The company will reach out soon."
                                                }
                                            </p>
                                        </div>
                                    )}

                                    {/* Submitted time */}
                                    <div className="mt-4 pt-4 border-t border-slate-100">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            Submitted {new Date(bid.createdAt).toLocaleDateString("en-IN", {
                                                day: "numeric", month: "short", year: "numeric"
                                            })}
                                        </p>
                                    </div>

                                    {/* Resume status panel */}
                                    <div className="mt-4 pt-4 border-t border-slate-100">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                                            Resume on Your Profile
                                        </p>
                                        {user?.resume ? (
                                            <div className="flex flex-wrap items-center gap-2">
                                                {/* Filename badge */}
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50/60 px-2.5 py-1.5 rounded-lg border border-emerald-200 max-w-max">
                                                    <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                                    <span className="truncate max-w-[160px]" title={user.resumeOriginalName}>
                                                        {user.resumeOriginalName || "My Resume"}
                                                    </span>
                                                </div>
                                                {/* Download via fetch+Blob so auth cookie is sent */}
                                                <button
                                                    onClick={() => triggerDownload(
                                                        `${BACKEND_URL}/api/profile/me/resume/download`,
                                                        user.resumeOriginalName || "My_Resume.pdf"
                                                    )}
                                                    disabled={downloadingResume}
                                                    className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-700 bg-indigo-50/60 px-2.5 py-1.5 rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors max-w-max disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                                                >
                                                    {downloadingResume ? (
                                                        <span className="flex items-center gap-1"><span className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin inline-block" /> Downloading...</span>
                                                    ) : (
                                                        <><Download className="w-3.5 h-3.5" /> Download My Resume</>
                                                    )}
                                                </button>
                                                {/* Preview link (static, no auth needed) */}
                                                <a
                                                    href={`${BACKEND_URL}${user.resume}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors max-w-max"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                    Preview
                                                </a>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50/60 border border-amber-200">
                                                <User className="w-4 h-4 text-amber-500 shrink-0" />
                                                <div>
                                                    <p className="text-[10px] font-bold text-amber-700">No resume on profile</p>
                                                    <p className="text-[9px] text-amber-600 font-semibold mt-0.5">
                                                        Employers can't view your resume.{" "}
                                                        <Link to="/profile" className="underline hover:no-underline">Upload now →</Link>
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyBids;
