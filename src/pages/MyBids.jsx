import { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const MyBids = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const toast = useToast();
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");

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

    const withdrawBid = async (bidId, gigId) => {
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
            <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
                <div className="text-center">
                    <div className="spinner w-10 h-10 mx-auto mb-4" />
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Loading your bids...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-16" style={{ background: "var(--bg-primary)" }}>
            <div className="section-container py-8">

                {/* Page header */}
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#f0f0fa]">My Bids</h1>
                    <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
                        Track all proposals you've submitted to clients
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: "Total Bids", value: stats.total, color: "text-violet-400", icon: "📊" },
                        { label: "Pending", value: stats.pending, color: "text-amber-400", icon: "⏳" },
                        { label: "Hired", value: stats.hired, color: "text-emerald-400", icon: "✅" },
                        { label: "Rejected", value: stats.rejected, color: "text-red-400", icon: "❌" },
                    ].map(s => (
                        <div key={s.label} className="stat-card">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg">{s.icon}</span>
                                <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{s.label}</span>
                            </div>
                            <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
                        </div>
                    ))}
                </div>

                {/* Filter tabs */}
                <div className="flex gap-2 mb-6 flex-wrap">
                    {[
                        { val: "all", label: "All" },
                        { val: "pending", label: "Pending" },
                        { val: "hired", label: "Hired" },
                        { val: "rejected", label: "Rejected" },
                    ].map(f => (
                        <button
                            key={f.val}
                            onClick={() => setFilter(f.val)}
                            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border ${filter === f.val
                                    ? "text-white border-transparent"
                                    : "border text-[#8888aa] hover:text-[#f0f0fa]"
                                }`}
                            style={filter === f.val
                                ? { background: "linear-gradient(135deg, #7c3aed, #6d28d9)", borderColor: "transparent" }
                                : { background: "transparent", borderColor: "var(--border)" }
                            }
                        >
                            {f.label}
                            {f.val !== "all" && (
                                <span className="ml-2 text-xs opacity-70">({stats[f.val]})</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Bid list */}
                {filteredBids.length === 0 ? (
                    <div className="card-dark p-12 text-center">
                        <div className="text-5xl mb-4">📭</div>
                        <p className="text-lg font-semibold text-[#f0f0fa]">
                            {filter === "all" ? "No bids yet" : `No ${filter} bids`}
                        </p>
                        <p className="text-sm mt-2 mb-6" style={{ color: "var(--text-secondary)" }}>
                            {filter === "all"
                                ? "Browse available gigs and start bidding to find work"
                                : `You don't have any ${filter} bids`}
                        </p>
                        <Link to="/" className="btn-primary">
                            Browse Gigs →
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
                                    className={`card-dark p-5 sm:p-6 transition-all ${bid.status === "hired" ? "" :
                                            bid.status === "rejected" ? "opacity-60" : ""
                                        }`}
                                    style={bid.status === "hired" ? { borderColor: "rgba(16,185,129, 0.35)" } : {}}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">

                                        {/* Left: Gig info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                {gig?.category && (
                                                    <span className="badge badge-purple">{gig.category}</span>
                                                )}
                                                <span className={`badge badge-${bid.status} capitalize`}>{bid.status}</span>
                                                {gig?.status === "open" && bid.status === "pending" && (
                                                    <span className="badge badge-open">Still Open</span>
                                                )}
                                            </div>

                                            <h3 className="font-bold text-[#f0f0fa] text-base mb-1 line-clamp-2">
                                                {gig?.title || "Gig Deleted"}
                                            </h3>

                                            <div className="flex items-center flex-wrap gap-4 text-xs mb-3" style={{ color: "var(--text-secondary)" }}>
                                                <span>Gig Budget: <span className="text-[#f0f0fa] font-semibold">₹{gig?.budget?.toLocaleString() || "—"}</span></span>
                                                <span>Your Bid: <span className="text-violet-400 font-bold">₹{Number(bid.price).toLocaleString()}</span></span>
                                                {bid.deliveryDays && (
                                                    <span>⏱ {bid.deliveryDays} days</span>
                                                )}
                                                {daysLeft !== null && (
                                                    <span className={daysLeft > 0 ? "text-amber-400" : "text-red-400"}>
                                                        {daysLeft > 0 ? `${daysLeft}d left` : "Deadline passed"}
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-sm line-clamp-2 leading-relaxed" style={{ color: "var(--text-muted)" }}>
                                                {bid.message}
                                            </p>
                                        </div>

                                        {/* Right: Actions */}
                                        <div className="flex sm:flex-col gap-2 shrink-0">
                                            {gig?._id && (
                                                <Link
                                                    to={`/gig/${gig._id}`}
                                                    className="btn-secondary text-xs py-2 px-4"
                                                >
                                                    View Gig
                                                </Link>
                                            )}
                                            {bid.status === "pending" && (
                                                <button
                                                    onClick={() => withdrawBid(bid._id, gig?._id)}
                                                    className="btn-danger text-xs py-2 px-4"
                                                >
                                                    Withdraw
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Hired banner */}
                                    {bid.status === "hired" && (
                                        <div className="mt-4 pt-4 border-t flex items-center gap-2"
                                            style={{ borderColor: "rgba(16,185,129,0.3)" }}>
                                            <span className="text-emerald-400">🎉</span>
                                            <p className="text-sm text-emerald-400 font-semibold">
                                                You've been hired! Contact the client to get started.
                                            </p>
                                        </div>
                                    )}

                                    {/* Submitted time */}
                                    <div className="mt-3 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                            Submitted {new Date(bid.createdAt).toLocaleDateString("en-IN", {
                                                day: "numeric", month: "short", year: "numeric"
                                            })}
                                        </p>
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
