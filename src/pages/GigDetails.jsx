import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const GigDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const toast = useToast();

  const [gig, setGig] = useState(null);
  const [bids, setBids] = useState([]);
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hiringId, setHiringId] = useState(null);
  const [myBid, setMyBid] = useState(null);
  const [hasAlreadyBid, setHasAlreadyBid] = useState(false);

  // Fetch gig
  useEffect(() => {
    api.get(`/gigs/${id}`)
      .then(res => setGig(res.data))
      .catch(() => {
        toast.error("Gig not found");
        navigate("/");
      });
  }, [id]);

  // Fetch bids for gig owner
  useEffect(() => {
    if (user?.role === "client" && gig) {
      const isOwner =
        gig.ownerId?._id === user.id ||
        gig.ownerId === user.id ||
        gig.ownerId?._id?.toString() === user.id;

      if (isOwner) {
        api.get(`/bids/${id}`)
          .then(res => setBids(res.data))
          .catch(() => { });
      }
    }
  }, [user, gig, id]);

  // Check if freelancer already bid
  useEffect(() => {
    if (user?.role === "freelancer" && gig) {
      api.get("/bids/my-bids")
        .then(res => {
          const existingBid = res.data.find(b =>
            b.gigId?._id === id || b.gigId === id
          );
          if (existingBid) {
            setMyBid(existingBid);
            setHasAlreadyBid(true);
          }
        })
        .catch(() => { });
    }
  }, [user, gig, id]);

  const placeBid = async () => {
    if (!price || !message) {
      toast.warning("Please fill in both price and message");
      return;
    }
    setSubmitting(true);
    try {
      const bid = await api.post("/bids", {
        gigId: id,
        price: Number(price),
        message,
        deliveryDays: deliveryDays ? Number(deliveryDays) : null
      });
      toast.success("Bid placed successfully! The client will review your proposal.");
      setPrice("");
      setMessage("");
      setDeliveryDays("");
      setHasAlreadyBid(true);
      setMyBid(bid.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place bid");
    } finally {
      setSubmitting(false);
    }
  };

  const withdrawBid = async () => {
    if (!myBid) return;
    try {
      await api.delete(`/bids/${myBid._id}/withdraw`);
      toast.success("Bid withdrawn successfully");
      setHasAlreadyBid(false);
      setMyBid(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to withdraw bid");
    }
  };

  const hire = async (bidId) => {
    setHiringId(bidId);
    try {
      await api.patch(`/bids/${bidId}/hire`);
      toast.success("🎉 Freelancer hired successfully!");
      setGig(prev => ({ ...prev, status: "assigned" }));
      setBids(prev => prev.map(b => ({
        ...b,
        status: b._id === bidId ? "hired" : "rejected"
      })));
    } catch (err) {
      toast.error(err.response?.data?.message || "Hiring failed");
    } finally {
      setHiringId(null);
    }
  };

  const completeGig = async () => {
    try {
      await api.patch(`/gigs/${id}/complete`);
      toast.success("✅ Gig marked as completed!");
      setGig(prev => ({ ...prev, status: "completed" }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to complete gig");
    }
  };

  const deleteGig = async () => {
    if (!window.confirm("Are you sure you want to delete this gig?")) return;
    try {
      await api.delete(`/gigs/${id}`);
      toast.success("Gig deleted");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete gig");
    }
  };

  const isOwner = gig && (
    gig.ownerId?._id === user?.id ||
    gig.ownerId === user?.id ||
    gig.ownerId?._id?.toString() === user?.id
  );

  const isHiredFreelancer = gig && user?.role === "freelancer" && (
    gig.hiredFreelancerId?._id === user?.id ||
    gig.hiredFreelancerId === user?.id
  );

  if (!gig) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
        <div className="text-center">
          <div className="spinner w-10 h-10 mx-auto mb-4" />
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Loading gig details...</p>
        </div>
      </div>
    );
  }

  const daysLeft = gig.deadline
    ? Math.ceil((new Date(gig.deadline) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  const formattedDeadline = gig.deadline
    ? new Date(gig.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <div className="min-h-screen pb-16" style={{ background: "var(--bg-primary)" }}>
      <div className="section-container py-8">
        <div className="max-w-5xl mx-auto">

          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm mb-6 transition-colors"
            style={{ color: "var(--text-secondary)" }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to gigs
          </button>

          <div className="grid gap-6 lg:grid-cols-3">

            {/* Main content (2/3) */}
            <div className="lg:col-span-2 space-y-6">

              {/* Gig Header Card */}
              <div className="card-dark p-6 sm:p-8">
                {/* Category + Status */}
                <div className="flex items-center gap-3 flex-wrap mb-4">
                  <span className="badge badge-purple">{gig.category || "Other"}</span>
                  {gig.status === "open" && <span className="badge badge-open">Open for Bids</span>}
                  {gig.status === "assigned" && <span className="badge badge-assigned">Assigned</span>}
                  {gig.status === "completed" && <span className="badge badge-completed">Completed</span>}
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-[#f0f0fa] mb-4 leading-snug">
                  {gig.title}
                </h1>

                {/* Tags */}
                {gig.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {gig.tags.map(tag => (
                      <span key={tag} className="skill-tag">{tag}</span>
                    ))}
                  </div>
                )}

                <div className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "var(--text-secondary)" }}>
                  {gig.description}
                </div>

                {/* Skills Required */}
                {gig.skillsRequired?.length > 0 && (
                  <div className="mt-6 pt-6 border-t" style={{ borderColor: "var(--border)" }}>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
                      Skills Required
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {gig.skillsRequired.map(skill => (
                        <span key={skill} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Owner actions */}
                {isOwner && (
                  <div className="mt-6 pt-6 border-t flex flex-wrap gap-3" style={{ borderColor: "var(--border)" }}>
                    {gig.status === "assigned" && (
                      <button onClick={completeGig} className="btn-success">
                        ✅ Mark as Completed
                      </button>
                    )}
                    {gig.status === "open" && (
                      <button onClick={deleteGig} className="btn-danger">
                        🗑️ Delete Gig
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* FREELANCER: Already bid — show status */}
              {user?.role === "freelancer" && hasAlreadyBid && myBid && (
                <div className="card-dark p-6 border-amber-500/30" style={{ borderColor: "rgba(245,158,11,0.3)" }}>
                  <h3 className="font-bold text-[#f0f0fa] mb-3 flex items-center gap-2">
                    <span>📨</span> Your Bid
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm mb-3">
                    <span className="text-violet-400 font-bold text-lg">₹{Number(myBid.price).toLocaleString()}</span>
                    {myBid.deliveryDays && (
                      <span style={{ color: "var(--text-secondary)" }}>⏱ {myBid.deliveryDays} days delivery</span>
                    )}
                    <span className={`badge badge-${myBid.status}`}>{myBid.status}</span>
                  </div>
                  <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>{myBid.message}</p>
                  {myBid.status === "pending" && (
                    <button onClick={withdrawBid} className="btn-danger">
                      Withdraw Bid
                    </button>
                  )}
                </div>
              )}

              {/* FREELANCER: Place bid */}
              {user?.role === "freelancer" && gig.status === "open" && !hasAlreadyBid && (
                <div className="card-dark p-6 sm:p-8">
                  <h2 className="text-xl font-bold text-[#f0f0fa] mb-6">Submit Your Bid</h2>
                  <div className="space-y-5">

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="form-label">Your Price (₹) <span className="text-red-400">*</span></label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--text-muted)" }}>₹</span>
                          <input
                            type="number"
                            min="1"
                            value={price}
                            onChange={e => setPrice(e.target.value)}
                            placeholder={gig.budget}
                            className="input-dark pl-7"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="form-label">Delivery Time (Days)</label>
                        <input
                          type="number"
                          min="1"
                          value={deliveryDays}
                          onChange={e => setDeliveryDays(e.target.value)}
                          placeholder="e.g. 7"
                          className="input-dark"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="form-label">Cover Letter <span className="text-red-400">*</span></label>
                      <textarea
                        rows={5}
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        placeholder="Highlight your relevant experience, approach to this project, portfolio links, etc."
                        className="input-dark resize-none"
                      />
                    </div>

                    <button
                      onClick={placeBid}
                      disabled={submitting}
                      className="btn-primary py-3 px-8 disabled:opacity-60"
                    >
                      {submitting ? (
                        <span className="flex items-center gap-2">
                          <div className="spinner w-4 h-4" /> Placing bid...
                        </span>
                      ) : "🎯 Place Bid"}
                    </button>
                  </div>
                </div>
              )}

              {/* FREELANCER: Hired confirmation */}
              {user?.role === "freelancer" && isHiredFreelancer && (
                <div className="rounded-2xl p-6 text-center"
                  style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)" }}>
                  <div className="text-4xl mb-3">🎉</div>
                  <h3 className="text-xl font-bold text-emerald-400 mb-2">You've been hired!</h3>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    Congratulations! The client has selected you for this gig.
                  </p>
                </div>
              )}

              {/* CLIENT: Bids received */}
              {isOwner && (
                <div className="card-dark p-6 sm:p-8">
                  <h2 className="text-xl font-bold text-[#f0f0fa] mb-2">
                    Received Bids
                    {bids.length > 0 && (
                      <span className="ml-2 text-sm font-normal badge badge-purple">{bids.length}</span>
                    )}
                  </h2>

                  {bids.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-3">📭</div>
                      <p className="font-medium text-[#f0f0fa]">No bids yet</p>
                      <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
                        Share your gig link to attract freelancers
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 mt-4">
                      {bids.map(bid => (
                        <div
                          key={bid._id}
                          className={`rounded-xl border p-5 transition-all ${bid.status === "hired" ? "border-emerald-500/40" :
                              bid.status === "rejected" ? "opacity-50" :
                                "hover:border-violet-500/30"
                            }`}
                          style={{
                            background: bid.status === "hired"
                              ? "rgba(16,185,129,0.07)"
                              : "var(--bg-secondary)",
                            borderColor: bid.status === "hired"
                              ? "rgba(16,185,129,0.4)"
                              : "var(--border)"
                          }}
                        >
                          {/* Freelancer info */}
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0"
                                style={{ background: "linear-gradient(135deg, #7c3aed, #c084fc)" }}
                              >
                                {bid.freelancerId?.name?.charAt(0)?.toUpperCase() || "?"}
                              </div>
                              <div>
                                <p className="font-semibold text-[#f0f0fa]">{bid.freelancerId?.name || "Freelancer"}</p>
                                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{bid.freelancerId?.email}</p>
                                {bid.freelancerId?.totalHires > 0 && (
                                  <p className="text-xs text-emerald-400 mt-0.5">
                                    ✅ {bid.freelancerId.totalHires} successful hire{bid.freelancerId.totalHires > 1 ? "s" : ""}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <p className="text-violet-400 font-bold text-lg">₹{Number(bid.price).toLocaleString()}</p>
                              {bid.deliveryDays && (
                                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                                  {bid.deliveryDays} days delivery
                                </p>
                              )}
                              <div className="mt-1">
                                <span className={`badge badge-${bid.status}`}>
                                  {bid.status === "pending" ? "Pending" :
                                    bid.status === "hired" ? "✓ Hired" : "Rejected"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Skills */}
                          {bid.freelancerId?.skills?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {bid.freelancerId.skills.slice(0, 4).map(skill => (
                                <span key={skill} className="skill-tag text-xs">{skill}</span>
                              ))}
                            </div>
                          )}

                          {/* Message */}
                          <div className="rounded-lg p-4 mb-4" style={{ background: "var(--bg-card)" }}>
                            <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "var(--text-secondary)" }}>
                              {bid.message}
                            </p>
                          </div>

                          {/* Hire button */}
                          {gig.status === "open" && bid.status === "pending" && (
                            <button
                              onClick={() => hire(bid._id)}
                              disabled={hiringId === bid._id}
                              className="btn-success disabled:opacity-60"
                            >
                              {hiringId === bid._id ? (
                                <span className="flex items-center gap-2">
                                  <div className="spinner w-4 h-4" /> Hiring...
                                </span>
                              ) : "✅ Hire This Freelancer"}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar (1/3) */}
            <div className="space-y-5">

              {/* Budget & Deadline */}
              <div className="card-dark p-5 space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Budget</p>
                  <p className="text-3xl font-black gradient-text">₹{Number(gig.budget).toLocaleString()}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Fixed price project</p>
                </div>

                {gig.bidCount > 0 && (
                  <div className="flex items-center gap-2 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                    <svg className="w-4 h-4" style={{ color: "var(--text-muted)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      {gig.bidCount} proposal{gig.bidCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}

                {formattedDeadline && (
                  <div className="flex items-center gap-2 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                    <svg className="w-4 h-4 shrink-0" style={{ color: "var(--text-muted)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>Deadline</p>
                      <p className="text-sm font-medium text-[#f0f0fa]">{formattedDeadline}</p>
                      {daysLeft !== null && (
                        <p className={`text-xs ${daysLeft > 3 ? "text-emerald-400" : "text-red-400"}`}>
                          {daysLeft > 0 ? `${daysLeft} days left` : "Expired"}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Client info */}
              {gig.ownerId?.name && (
                <div className="card-dark p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
                    Posted by
                  </p>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0"
                      style={{ background: "linear-gradient(135deg, #7c3aed, #c084fc)" }}
                    >
                      {gig.ownerId.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-[#f0f0fa] text-sm">{gig.ownerId.name}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>Client</p>
                    </div>
                  </div>
                  {gig.ownerId.bio && (
                    <p className="text-xs mt-3 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      {gig.ownerId.bio}
                    </p>
                  )}
                </div>
              )}

              {/* Hired freelancer (owner view) */}
              {isOwner && gig.status !== "open" && gig.hiredFreelancerId && (
                <div className="card-dark p-5"
                  style={{ borderColor: "rgba(16,185,129,0.3)" }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3 text-emerald-400">
                    Hired Freelancer
                  </p>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
                      style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}
                    >
                      {gig.hiredFreelancerId.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <p className="font-semibold text-[#f0f0fa] text-sm">
                        {gig.hiredFreelancerId.name || "Freelancer"}
                      </p>
                      <p className="text-xs text-emerald-400">Active</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Share link */}
              <div className="card-dark p-5">
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
                  Share this Gig
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Link copied to clipboard!");
                  }}
                  className="btn-secondary w-full text-sm py-2.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GigDetails;