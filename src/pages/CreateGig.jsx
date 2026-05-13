import { useState, useContext } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const CATEGORIES = [
  "Web Development", "Mobile Development", "UI/UX Design",
  "Graphic Design", "Content Writing", "Digital Marketing",
  "Video & Animation", "Data Science & AI", "DevOps & Cloud",
  "Cybersecurity", "Database", "Other"
];

const CreateGig = () => {
  const { user } = useContext(AuthContext);
  const [form, setForm] = useState({
    title: "",
    description: "",
    budget: "",
    category: "Web Development",
    deadline: "",
    tags: "",
    skillsRequired: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        budget: Number(form.budget),
        category: form.category,
        deadline: form.deadline || null,
        tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
        skillsRequired: form.skillsRequired
          ? form.skillsRequired.split(",").map(s => s.trim()).filter(Boolean)
          : [],
      };

      await api.post("/gigs", payload);
      toast.success("Gig posted successfully! 🎉");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post gig");
    } finally {
      setLoading(false);
    }
  };

  const get = (key) => form[key];
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const minDeadline = new Date();
  minDeadline.setDate(minDeadline.getDate() + 1);
  const minDateStr = minDeadline.toISOString().split("T")[0];

  return (
    <div className="min-h-screen pb-16" style={{ background: "var(--bg-primary)" }}>
      <div className="section-container py-8">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm mb-4 transition-colors"
              style={{ color: "var(--text-secondary)" }}
              onMouseEnter={e => e.target.style.color = "#f0f0fa"}
              onMouseLeave={e => e.target.style.color = "var(--text-secondary)"}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#f0f0fa]">Post a New Gig</h1>
            <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              Describe your project clearly to attract the best talent
            </p>
          </div>

          <div className="card-dark p-6 sm:p-8">
            <form onSubmit={submit} className="space-y-7">

              {/* Title */}
              <div>
                <label className="form-label">Gig Title <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  required
                  value={get("title")}
                  onChange={set("title")}
                  placeholder="e.g. Build a responsive React landing page"
                  className="input-dark"
                />
                <p className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>
                  Be specific and clear to get better proposals
                </p>
              </div>

              {/* Category */}
              <div>
                <label className="form-label">Category <span className="text-red-400">*</span></label>
                <select
                  value={get("category")}
                  onChange={set("category")}
                  className="input-dark"
                  style={{ appearance: "none", cursor: "pointer" }}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="form-label">Full Description <span className="text-red-400">*</span></label>
                <textarea
                  rows={6}
                  required
                  value={get("description")}
                  onChange={set("description")}
                  placeholder="Provide detailed requirements: tech stack preferences, timeline expectations, specific features, deliverables, etc."
                  className="input-dark resize-none"
                />
                <p className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>
                  The more details you provide, the better bids you'll receive.
                </p>
              </div>

              {/* Skills Required */}
              <div>
                <label className="form-label">Skills Required</label>
                <input
                  type="text"
                  value={get("skillsRequired")}
                  onChange={set("skillsRequired")}
                  placeholder="React, Node.js, MongoDB, Tailwind CSS (comma separated)"
                  className="input-dark"
                />
                <p className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>
                  List key skills to attract the right freelancers
                </p>
              </div>

              {/* Budget + Deadline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Budget (₹ INR) <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: "var(--text-muted)" }}>₹</span>
                    <input
                      type="number"
                      min="100"
                      required
                      value={get("budget")}
                      onChange={set("budget")}
                      placeholder="25000"
                      className="input-dark pl-7"
                    />
                  </div>
                  <p className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>Total fixed-price budget</p>
                </div>

                <div>
                  <label className="form-label">Deadline (Optional)</label>
                  <input
                    type="date"
                    min={minDateStr}
                    value={get("deadline")}
                    onChange={set("deadline")}
                    className="input-dark"
                    style={{ colorScheme: "dark" }}
                  />
                  <p className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>When do you need this done?</p>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="form-label">Tags (Optional)</label>
                <input
                  type="text"
                  value={get("tags")}
                  onChange={set("tags")}
                  placeholder="landing-page, e-commerce, dashboard (comma separated)"
                  className="input-dark"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary py-3 flex-1 sm:flex-none sm:px-10 disabled:opacity-60"
                >
                  {loading ? (
                    <span className="flex items-center gap-2 justify-center">
                      <div className="spinner w-4 h-4" />
                      Publishing...
                    </span>
                  ) : "🚀 Publish Gig"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="btn-secondary py-3 px-6"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGig;