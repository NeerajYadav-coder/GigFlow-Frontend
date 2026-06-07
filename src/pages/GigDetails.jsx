import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import api, { BACKEND_URL } from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { 
  ArrowLeft, Calendar, Clock, DollarSign, User, Share2, 
  Trash2, CheckCircle, Send, Inbox, Check, FileText, ExternalLink,
  Building, MapPin, Briefcase, Download, Sparkles
} from "lucide-react";
import AIRecommendModal from "../components/AIRecommendModal";

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
  const [downloadingBidderId, setDownloadingBidderId] = useState(null);
  const [showAiModal, setShowAiModal] = useState(false);

  // Downloads a file via fetch+Blob so auth cookies are sent (cross-origin <a download> doesn't send cookies)
  const triggerDownload = async (url, fallbackFilename, bidderId = "__self__") => {
    setDownloadingBidderId(bidderId);
    try {
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Download failed (${res.status})`);
      }
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
      setDownloadingBidderId(null);
    }
  };

  // Fetch gig
  useEffect(() => {
    api.get(`/gigs/${id}`)
      .then(res => setGig(res.data))
      .catch(() => {
        toast.error("Listing not found");
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
    const isFreelanceGig = gig.type === "gig" || !gig.type;
    if (isFreelanceGig && !price) {
      toast.warning("Please fill in your bid price");
      return;
    }
    if (!message) {
      toast.warning("Please write a cover letter");
      return;
    }
    setSubmitting(true);
    try {
      const bid = await api.post("/bids", {
        gigId: id,
        price: isFreelanceGig ? Number(price) : null,
        message,
        deliveryDays: isFreelanceGig && deliveryDays ? Number(deliveryDays) : null
      });
      toast.success(
        isFreelanceGig 
          ? "Bid placed successfully! The client will review your proposal." 
          : "Application submitted successfully! The company will review your profile."
      );
      setPrice("");
      setMessage("");
      setDeliveryDays("");
      setHasAlreadyBid(true);
      setMyBid(bid.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit proposal");
    } finally {
      setSubmitting(false);
    }
  };

  const withdrawBid = async () => {
    if (!myBid) return;
    if (!window.confirm("Are you sure you want to withdraw your application?")) return;
    try {
      await api.delete(`/bids/${myBid._id}/withdraw`);
      toast.success("Application withdrawn successfully");
      setHasAlreadyBid(false);
      setMyBid(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to withdraw application");
    }
  };

  const hire = async (bidId) => {
    setHiringId(bidId);
    try {
      await api.patch(`/bids/${bidId}/hire`);
      const isFreelanceGig = gig.type === "gig" || !gig.type;
      toast.success(
        isFreelanceGig 
          ? "🎉 Freelancer hired successfully!" 
          : "🎉 Candidate accepted successfully!"
      );
      if (isFreelanceGig) {
        setGig(prev => ({ ...prev, status: "assigned" }));
        setBids(prev => prev.map(b => ({
          ...b,
          status: b._id === bidId ? "hired" : "rejected"
        })));
      } else {
        setBids(prev => prev.map(b => b._id === bidId ? { ...b, status: "hired" } : b));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Selection failed");
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

  const deleteListing = async () => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    try {
      await api.delete(`/gigs/${id}`);
      toast.success("Listing deleted successfully");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete listing");
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-secondary)" }}>
        <div className="text-center">
          <div className="spinner w-10 h-10 mx-auto mb-4" />
          <p className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Loading details...</p>
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

  const isFreelanceGig = gig.type === "gig" || !gig.type;

  return (
    <div className="min-h-screen pb-16" style={{ background: "var(--bg-secondary)" }}>
      <div className="section-container py-8">
        <div className="max-w-5xl mx-auto text-left">

          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-650 transition-colors mb-6 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to browse
          </button>

          <div className="grid gap-6 lg:grid-cols-3">

            {/* Main content (2/3) */}
            <div className="lg:col-span-2 space-y-6">

              {/* Header Card */}
              <div className="card-dark p-6 sm:p-10 relative bg-white border-slate-200 shadow-sm">
                <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-600 to-sky-500" />
                
                {/* Category + Type + Status */}
                <div className="flex items-center gap-2 flex-wrap mb-5">
                  <span className="badge badge-purple text-[10px] uppercase tracking-wide">{gig.category || "Other"}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border ${
                    gig.type === "job" 
                      ? "bg-sky-50 text-sky-850 border-sky-200" 
                      : gig.type === "internship" 
                        ? "bg-emerald-50 text-emerald-800 border-emerald-250" 
                        : "bg-purple-50 text-purple-800 border-purple-200"
                  }`}>
                    {gig.type === "job" ? "Job Position" : gig.type === "internship" ? "Internship" : "Freelance Gig"}
                  </span>
                  {gig.status === "open" && <span className="badge badge-open text-[10px] uppercase tracking-wide">Open</span>}
                  {gig.status === "assigned" && <span className="badge badge-assigned text-[10px] uppercase tracking-wide">Assigned</span>}
                  {gig.status === "completed" && <span className="badge badge-completed text-[10px] uppercase tracking-wide">Completed</span>}
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-2 leading-snug tracking-tight">
                  {gig.title}
                </h1>

                {gig.companyName && (
                  <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 font-bold mb-6">
                    <Building className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{gig.companyName}</span>
                    <span className="text-slate-350">•</span>
                    <span className="text-indigo-600 bg-indigo-50/50 px-2 py-0.5 rounded text-xs font-extrabold border border-indigo-100/40">
                      {gig.locationType || "Remote"}
                    </span>
                    {gig.location && (
                      <>
                        <span className="text-slate-350">•</span>
                        <span className="text-slate-600 flex items-center gap-0.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" /> {gig.location}
                        </span>
                      </>
                    )}
                    {gig.jobType && (
                      <>
                        <span className="text-slate-350">•</span>
                        <span className="text-emerald-700 bg-emerald-50/50 px-2 py-0.5 rounded text-xs font-extrabold border border-emerald-100/40">
                          {gig.jobType}
                        </span>
                      </>
                    )}
                  </div>
                )}

                {/* Tags */}
                {gig.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {gig.tags.map(tag => (
                      <span key={tag} className="skill-tag">{tag}</span>
                    ))}
                  </div>
                )}

                <div className="text-sm leading-relaxed whitespace-pre-line text-slate-600 font-medium border-t border-slate-100 pt-6">
                  {gig.description}
                </div>

                {/* Skills Required */}
                {gig.skillsRequired?.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-slate-100">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider mb-3.5 text-slate-400">
                      Required Expertise
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {gig.skillsRequired.map(skill => (
                        <span key={skill} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Owner actions */}
                {isOwner && (
                  <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap gap-3">
                    {isFreelanceGig && gig.status === "assigned" && (
                      <button onClick={completeGig} className="btn-success">
                        <CheckCircle className="w-4 h-4" /> Mark as Completed
                      </button>
                    )}
                    {gig.status === "open" && (
                      <button onClick={deleteListing} className="btn-danger">
                        <Trash2 className="w-4 h-4" /> Delete Listing
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* FREELANCER: Already applied/bid — show status */}
              {user?.role === "freelancer" && hasAlreadyBid && myBid && (
                <div className="card-dark p-6 border-indigo-200 bg-indigo-50/5 shadow-sm">
                  <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600" /> Submitted Proposal Status
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs font-semibold mb-4">
                    {isFreelanceGig && myBid.price && (
                      <span className="text-indigo-650 font-black text-base">₹{Number(myBid.price).toLocaleString()}</span>
                    )}
                    {isFreelanceGig && myBid.deliveryDays && (
                      <span className="flex items-center gap-1 text-slate-500"><Clock className="w-3.5 h-3.5" /> {myBid.deliveryDays} days delivery</span>
                    )}
                    <span className={`badge badge-${myBid.status} text-[10px] uppercase tracking-wider`}>{myBid.status}</span>
                  </div>
                  <p className="text-xs leading-relaxed mb-5 text-slate-650 font-medium">{myBid.message}</p>
                  {myBid.status === "pending" && (
                    <button onClick={withdrawBid} className="btn-danger py-2 px-4 text-xs font-bold cursor-pointer">
                      Withdraw Proposal
                    </button>
                  )}
                </div>
              )}

              {/* FREELANCER: Apply / Place bid */}
              {user?.role === "freelancer" && gig.status === "open" && !hasAlreadyBid && (
                <div className="card-dark p-6 sm:p-8 bg-white border-slate-200 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-800 mb-6 tracking-tight">
                    {isFreelanceGig ? "Pitch Your Proposal" : "Apply for this Position"}
                  </h2>
                  <div className="space-y-5">

                    {isFreelanceGig && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="form-label">My Bid Price (₹) <span className="text-rose-500 font-bold">*</span></label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₹</span>
                            <input
                              type="number"
                              min="1"
                              value={price}
                              onChange={e => setPrice(e.target.value)}
                              placeholder={gig.budget}
                              className="input-dark pl-8 bg-white"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="form-label">Delivery Days</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                              <Clock className="w-4 h-4" />
                            </div>
                            <input
                              type="number"
                              min="1"
                              value={deliveryDays}
                              onChange={e => setDeliveryDays(e.target.value)}
                              placeholder="e.g. 7"
                              className="input-dark pl-11 bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="form-label">
                        {isFreelanceGig ? "Cover Letter & Scope of Work" : "Introduce Yourself / Cover Letter"}{" "}
                        <span className="text-rose-500 font-bold">*</span>
                      </label>
                      <textarea
                        rows={5}
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        placeholder={
                          isFreelanceGig
                            ? "Detail your experience, strategy for this project, deliverables, and estimated work milestones..."
                            : "Write a brief cover letter highlighting your qualifications, relevant background, why you're interested, and when you can join..."
                        }
                        className="input-dark resize-none leading-relaxed bg-white"
                      />
                    </div>

                    <button
                      onClick={placeBid}
                      disabled={submitting}
                      className="btn-primary py-3.5 px-8 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer font-bold"
                    >
                      {submitting ? (
                        <>
                          <div className="spinner w-4 h-4" /> Submitting application...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" /> {isFreelanceGig ? "Submit Proposal" : "Submit Application"}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* FREELANCER: Hired confirmation */}
              {user?.role === "freelancer" && isHiredFreelancer && (
                <div className="rounded-3xl p-6 text-center border bg-emerald-50/10 border-emerald-200 shadow-sm">
                  <div className="text-3xl mb-3">🎉</div>
                  <h3 className="text-lg font-bold text-emerald-650 mb-1">Hired!</h3>
                  <p className="text-xs leading-relaxed max-w-md mx-auto text-slate-650 font-semibold">
                    {isFreelanceGig 
                      ? "The client accepted your proposal. They will reach out to schedule kick-off."
                      : "The company accepted your application! They will reach out for the next steps."}
                  </p>
                </div>
              )}

              {/* CLIENT: Bids/Applications received */}
              {isOwner && (
                <div className="card-dark p-6 sm:p-8 bg-white border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                    <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
                      {isFreelanceGig ? "Received Proposals" : "Candidate Applications"}
                      {bids.length > 0 && (
                        <span className="badge badge-purple text-[10px] tracking-wide">{bids.length}</span>
                      )}
                    </h2>
                    {bids.length >= 2 && (
                      <button
                        onClick={() => setShowAiModal(true)}
                        className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 px-4 py-2 rounded-xl border border-indigo-200 transition-all cursor-pointer shadow-sm hover:shadow"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                        AI Candidate Shortlist
                      </button>
                    )}
                  </div>

                  {bids.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl bg-slate-50/30">
                      <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-slate-400 bg-slate-100 border border-slate-200">
                        <Inbox className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-bold text-slate-800">No applications received yet</p>
                      <p className="text-xs mt-1.5 max-w-xs mx-auto text-slate-450 font-semibold">
                        Candidates will apply with their resume and profile details.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bids.map(bid => (
                        <div
                          key={bid._id}
                          id={`bid-${bid._id}`}
                          className={`rounded-2xl border p-5 transition-all duration-300 shadow-sm ${
                            bid.status === "hired" 
                              ? "border-emerald-300 bg-emerald-50/5" 
                              : bid.status === "rejected" 
                                ? "opacity-55" 
                                : "hover:border-slate-350 bg-white"
                          }`}
                        >
                          {/* Freelancer/Candidate info */}
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                            <div className="flex items-start gap-3">
                              <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white shrink-0 shadow-sm mt-0.5"
                                style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-secondary))" }}
                              >
                                {bid.freelancerId?.name?.charAt(0)?.toUpperCase() || "?"}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-850">{bid.freelancerId?.name || "Candidate"}</p>
                                <p className="text-[10px] font-bold mt-0.5 text-slate-400">{bid.freelancerId?.email}</p>
                                
                                {bid.freelancerId?.totalHires > 0 && isFreelanceGig && (
                                  <p className="text-[10px] text-emerald-650 font-extrabold mt-1">
                                    ✓ {bid.freelancerId.totalHires} successful hire{bid.freelancerId.totalHires > 1 ? "s" : ""}
                                  </p>
                                )}

                                {bid.freelancerId?.resume && (
                                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                                    {/* View Resume in new tab (static URL, no auth needed) */}
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 bg-indigo-50/50 px-2.5 py-1.5 rounded-lg border border-indigo-100 max-w-max">
                                      <FileText className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                      <a
                                        href={`${BACKEND_URL}${bid.freelancerId.resume}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:underline flex items-center gap-0.5"
                                      >
                                        View Resume
                                        <ExternalLink className="w-2.5 h-2.5 text-indigo-400 ml-0.5" />
                                      </a>
                                    </div>
                                    {/* Download via fetch+Blob so auth cookie is sent */}
                                    {(() => {
                                      const bidderId = bid.freelancerId?._id?.toString() || bid.freelancerId?.id?.toString();
                                      const isDownloading = downloadingBidderId === bidderId;
                                      return (
                                        <button
                                          onClick={() => triggerDownload(
                                            `${BACKEND_URL}/api/profile/${bidderId}/resume/download/${id}`,
                                            bid.freelancerId.resumeOriginalName || `resume_${bid.freelancerId.name?.replace(/\s+/g, "_") || "candidate"}.pdf`,
                                            bidderId
                                          )}
                                          disabled={!!downloadingBidderId}
                                          className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50/60 px-2.5 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors max-w-max disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                          {isDownloading ? (
                                            <span className="flex items-center gap-1">
                                              <span className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin inline-block" />
                                              Downloading...
                                            </span>
                                          ) : (
                                            <><Download className="w-3.5 h-3.5" /> Download Resume</>
                                          )}
                                        </button>
                                      );
                                    })()}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="text-left sm:text-right shrink-0">
                              {isFreelanceGig ? (
                                <>
                                  <p className="text-indigo-600 font-black text-base">₹{Number(bid.price).toLocaleString()}</p>
                                  {bid.deliveryDays && (
                                    <p className="text-[10px] font-bold mt-0.5 text-slate-400">
                                      {bid.deliveryDays} days delivery
                                    </p>
                                  )}
                                </>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border bg-indigo-50 text-indigo-700 border-indigo-150">
                                  Applicant
                                </span>
                              )}
                              <div className="mt-2">
                                <span className={`badge badge-${bid.status} text-[9px] uppercase tracking-wider`}>
                                  {bid.status === "pending" ? "Pending" :
                                    bid.status === "hired" ? "✓ Hired" : "Rejected"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Skills */}
                          {bid.freelancerId?.skills?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-4">
                              {bid.freelancerId.skills.slice(0, 4).map(skill => (
                                <span key={skill} className="skill-tag text-[10px] font-bold">{skill}</span>
                              ))}
                            </div>
                          )}

                          {/* Message */}
                          <div className="rounded-xl p-4 mb-4 border border-slate-100 bg-slate-50/60">
                            <p className="text-xs leading-relaxed whitespace-pre-line text-slate-650 font-medium">
                              {bid.message}
                            </p>
                          </div>

                          {/* Selection actions */}
                          {gig.status === "open" && bid.status === "pending" && (
                            <button
                              onClick={() => hire(bid._id)}
                              disabled={hiringId === bid._id}
                              className="btn-success disabled:opacity-60 py-2 px-4 text-xs font-bold cursor-pointer"
                            >
                              {hiringId === bid._id ? (
                                <span className="flex items-center gap-1.5">
                                  <div className="spinner w-3.5 h-3.5" /> Processing...
                                </span>
                              ) : (
                                <span className="flex items-center gap-1.5">
                                  <Check className="w-3.5 h-3.5" /> {isFreelanceGig ? "Hire Freelancer" : "Accept Candidate"}
                                </span>
                              )}
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

              {/* Compensation Details */}
              <div className="card-dark p-6 space-y-5 relative bg-white border-slate-200 shadow-sm text-left">
                <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-600 to-sky-500" />
                
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1 text-slate-400">
                    {isFreelanceGig ? "Project Budget" : gig.type === "job" ? "Salary Package (CTC)" : "Monthly Stipend"}
                  </p>
                  <p className="text-2xl font-black gradient-text">
                    ₹{Number(gig.budget).toLocaleString()}
                    {gig.type === "job" && <span className="text-xs text-slate-400 font-bold">/{gig.salaryType === "yearly" ? "yr" : "mo"}</span>}
                    {gig.type === "internship" && <span className="text-xs text-slate-400 font-bold">/mo</span>}
                  </p>
                  <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wide">
                    {isFreelanceGig ? "Fixed Price Contract" : gig.type === "job" ? "Job CTC Opportunity" : "Internship Stipend"}
                  </p>
                </div>

                {!isFreelanceGig && (
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Location Type</p>
                      <p className="text-xs font-extrabold text-slate-700 mt-0.5">{gig.locationType || "Remote"}</p>
                    </div>
                    {gig.jobType && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Employment Type</p>
                        <p className="text-xs font-extrabold text-slate-700 mt-0.5">{gig.jobType}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Experience Required</p>
                      <p className="text-xs font-extrabold text-slate-700 mt-0.5">{gig.experienceLevel || "Entry-level"}</p>
                    </div>
                  </div>
                )}

                {gig.bidCount > 0 && (
                  <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-500">
                      {gig.bidCount} active {gig.bidCount === 1 ? "applicant" : "applicants"}
                    </span>
                  </div>
                )}

                {formattedDeadline && (
                  <div className="flex items-start gap-2 pt-4 border-t border-slate-100">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {isFreelanceGig ? "Milestone Deadline" : "Application Deadline"}
                      </p>
                      <p className="text-xs font-extrabold text-slate-700 mt-1">{formattedDeadline}</p>
                      {daysLeft !== null && (
                        <p className={`text-[10px] font-bold uppercase tracking-wide mt-1.5 ${daysLeft > 0 ? (daysLeft > 3 ? "text-emerald-600" : "text-rose-500") : "text-rose-500"}`}>
                          {daysLeft > 0 ? `${daysLeft} days remaining` : "Expired"}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Client/Company Manager Info */}
              {gig.ownerId?.name && (
                <div className="card-dark p-6 bg-white border-slate-200 shadow-sm text-left">
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-4 text-slate-400">
                    {isFreelanceGig ? "Project Manager" : "Hiring Manager"}
                  </p>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shrink-0"
                      style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-secondary))" }}
                    >
                      {gig.ownerId.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-xs">{gig.ownerId.name}</p>
                      <p className="text-[10px] font-semibold text-slate-450 capitalize mt-0.5">{gig.ownerId.role || "Client"}</p>
                    </div>
                  </div>
                  {gig.ownerId.bio && (
                    <p className="text-[11px] leading-relaxed mt-4 border-t border-slate-100 pt-3 text-slate-500 font-medium">
                      {gig.ownerId.bio}
                    </p>
                  )}
                </div>
              )}

              {/* Hired freelancer (For gigs only) */}
              {isFreelanceGig && isOwner && gig.status !== "open" && gig.hiredFreelancerId && (
                <div className="card-dark p-6 border-emerald-250 bg-emerald-50/10 shadow-sm text-left">
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-4 text-emerald-600">
                    Contractor Selected
                  </p>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white"
                      style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}
                    >
                      {gig.hiredFreelancerId.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-xs">
                        {gig.hiredFreelancerId.name || "Freelancer"}
                      </p>
                      <p className="text-[10px] text-emerald-650 font-bold uppercase tracking-wider mt-0.5">Active</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Share link widget */}
              <div className="card-dark p-6 bg-white border-slate-200 shadow-sm text-left">
                <p className="text-[10px] font-bold uppercase tracking-wider mb-3.5 text-slate-400">
                  Share Listing
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Listing URL copied to clipboard!");
                  }}
                  className="btn-secondary w-full text-xs py-3 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm bg-white"
                >
                  <Share2 className="w-3.5 h-3.5" /> Copy Link
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAiModal && (
        <AIRecommendModal
          gigId={id}
          gigTitle={gig.title}
          bids={bids}
          onClose={() => setShowAiModal(false)}
          onHire={(bidId) => {
            setShowAiModal(false);
          }}
        />
      )}
    </div>
  );
};

export default GigDetails;