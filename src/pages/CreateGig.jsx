import { useState, useContext } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { ArrowLeft, Rocket, Calendar, Tag, FileText, AlertCircle, Sparkles, DollarSign, Building, MapPin, Briefcase } from "lucide-react";

const CATEGORIES = [
  "Web Development", "Mobile Development", "UI/UX Design",
  "Graphic Design", "Content Writing", "Digital Marketing",
  "Video & Animation", "Data Science & AI", "DevOps & Cloud",
  "Cybersecurity", "Database", "Other"
];

const CreateGig = () => {
  const { user } = useContext(AuthContext);
  const [form, setForm] = useState({
    type: "gig", // gig | job | internship
    title: "",
    description: "",
    budget: "",
    category: "Web Development",
    deadline: "",
    tags: "",
    skillsRequired: "",
    companyName: "",
    jobType: "Full-time",
    locationType: "Remote",
    location: "",
    experienceLevel: "Entry-level",
    salaryType: "fixed"
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
        deadline: form.type === "gig" ? (form.deadline || null) : null,
        tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
        skillsRequired: form.skillsRequired
          ? form.skillsRequired.split(",").map(s => s.trim()).filter(Boolean)
          : [],
        type: form.type,
        jobType: form.type === "gig" ? "Contract" : form.jobType,
        experienceLevel: form.type === "gig" ? "Entry-level" : form.experienceLevel,
        salaryType: form.type === "gig" ? "fixed" : form.salaryType,
        companyName: form.type === "gig" ? "" : form.companyName,
        locationType: form.type === "gig" ? "Remote" : form.locationType,
        location: form.type === "gig" ? "" : form.location
      };

      await api.post("/gigs", payload);
      toast.success(
        form.type === "gig" 
          ? "Gig listing published successfully! 🎉" 
          : form.type === "job"
            ? "Job listing posted successfully! 💼"
            : "Internship listing posted successfully! 🎓"
      );
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post listing");
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
            <button 
              onClick={() => navigate(-1)} 
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-350 transition-colors mb-4 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight text-left">Post a New Opportunity</h1>
            <p className="mt-2 text-xs font-medium text-left" style={{ color: "var(--text-secondary)" }}>
              Create a project gig for freelancers or list jobs and internships for prospective candidates.
            </p>
          </div>

          <div className="card-dark p-6 sm:p-10 relative bg-white border-slate-200 shadow-sm text-left">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-600 to-sky-500" />
            
            <form onSubmit={submit} className="space-y-6">

              {/* Listing Type Card Selection */}
              <div>
                <label className="form-label mb-2.5">Listing Type <span className="text-rose-500 font-bold">*</span></label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { val: "gig", label: "Freelance Gig", desc: "One-off projects with fixed budgets" },
                    { val: "job", label: "Job Opening", desc: "Full-time/Part-time career roles" },
                    { val: "internship", label: "Internship Offer", desc: "Learning roles with monthly stipend" }
                  ].map(t => (
                    <button
                      key={t.val}
                      type="button"
                      onClick={() => setForm(f => ({ 
                        ...f, 
                        type: t.val,
                        jobType: t.val === "internship" ? "Internship" : (t.val === "job" ? "Full-time" : "Contract"),
                        salaryType: t.val === "gig" ? "fixed" : (t.val === "internship" ? "monthly" : "yearly")
                      }))}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        form.type === t.val 
                          ? "border-indigo-600 bg-indigo-50/10 shadow-sm ring-1 ring-indigo-500" 
                          : "border-slate-200 hover:border-slate-350 bg-slate-50/20"
                      }`}
                    >
                      <span className={`text-xs font-extrabold ${form.type === t.val ? "text-indigo-600" : "text-slate-800"}`}>
                        {t.label}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1.5 font-semibold leading-relaxed">
                        {t.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="form-label">
                  {form.type === "gig" ? "Gig Title" : form.type === "job" ? "Job Title" : "Internship Role Title"}{" "}
                  <span className="text-rose-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={get("title")}
                  onChange={set("title")}
                  placeholder={
                    form.type === "gig" 
                      ? "e.g. Build a responsive React dashboard page" 
                      : form.type === "job" 
                        ? "e.g. Senior Full-Stack React Engineer" 
                        : "e.g. Frontend Development Intern (React)"
                  }
                  className="input-dark bg-white"
                />
                <p className="text-[10px] font-semibold mt-1.5 flex items-center gap-1 text-slate-400">
                  <AlertCircle className="w-3.5 h-3.5 text-slate-400" /> Keep it clear, descriptive, and keyword-rich.
                </p>
              </div>

              {/* Company Details (Jobs & Internships Only) */}
              {form.type !== "gig" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="form-label">Company / Startup Name <span className="text-rose-500 font-bold">*</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Building className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={get("companyName")}
                        onChange={set("companyName")}
                        placeholder="e.g. Acme Inc."
                        className="input-dark pl-11 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Work Location Type <span className="text-rose-500 font-bold">*</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <select
                        value={get("locationType")}
                        onChange={set("locationType")}
                        className="input-dark pl-11 pr-10 bg-white"
                        style={{ appearance: "none", cursor: "pointer" }}
                      >
                        <option value="Remote">Remote</option>
                        <option value="On-site">On-site</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Specific Location Input */}
              {form.type !== "gig" && (
                <div>
                  <label className="form-label">
                    Office City / Region Location {get("locationType") !== "Remote" && <span className="text-rose-500 font-bold">*</span>}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required={get("locationType") !== "Remote"}
                      value={get("location")}
                      onChange={set("location")}
                      placeholder={get("locationType") === "Remote" ? "e.g. Anywhere (Remote) or specific timezones" : "e.g. Mumbai, India or San Francisco, CA"}
                      className="input-dark pl-11 bg-white"
                    />
                  </div>
                  <p className="text-[10px] font-semibold mt-1.5 text-slate-400">
                    City, state, or region where the candidate will be based.
                  </p>
                </div>
              )}

              {/* Category */}
              <div>
                <label className="form-label">Category <span className="text-rose-500 font-bold">*</span></label>
                <div className="relative">
                  <select
                    value={get("category")}
                    onChange={set("category")}
                    className="input-dark pr-10 bg-white"
                    style={{ appearance: "none", cursor: "pointer" }}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="form-label">Role Description & Requirements <span className="text-rose-500 font-bold">*</span></label>
                <textarea
                  rows={6}
                  required
                  value={get("description")}
                  onChange={set("description")}
                  placeholder={
                    form.type === "gig"
                      ? "Provide detailed requirements: technical specifications, workflow preferences, deliverable timelines..."
                      : "Describe company details, work culture, key job responsibilities, skills required, day-to-day work, and eligibility criteria..."
                  }
                  className="input-dark bg-white resize-none leading-relaxed"
                />
              </div>

              {/* Skills Required */}
              <div>
                <label className="form-label">Required Skills / Tech Stack</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Tag className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={get("skillsRequired")}
                    onChange={set("skillsRequired")}
                    placeholder="React, Node.js, Tailwind CSS, REST API (comma separated)"
                    className="input-dark pl-11 bg-white"
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-semibold mt-1.5">
                  Separate skills with commas. Candidates will see this checklist.
                </p>
              </div>

              {/* Job / Internship Settings */}
              {form.type !== "gig" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {form.type === "job" && (
                    <div>
                      <label className="form-label">Employment Type <span className="text-rose-500 font-bold">*</span></label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                          <Briefcase className="w-4 h-4" />
                        </div>
                        <select
                          value={get("jobType")}
                          onChange={set("jobType")}
                          className="input-dark pl-11 pr-10 bg-white"
                          style={{ appearance: "none", cursor: "pointer" }}
                        >
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Contract">Contract</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="form-label">Experience Level Required <span className="text-rose-500 font-bold">*</span></label>
                    <select
                      value={get("experienceLevel")}
                      onChange={set("experienceLevel")}
                      className="input-dark bg-white"
                      style={{ cursor: "pointer" }}
                    >
                      <option value="Entry-level">Entry-level / Fresher</option>
                      <option value="Mid-level">Intermediate / Mid-level</option>
                      <option value="Senior">Senior / Expert</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Compensation Details & Deadlines */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="form-label">
                    {form.type === "gig" 
                      ? "Fixed Project Budget (₹)" 
                      : form.type === "job"
                        ? "Salary Package (CTC in ₹)"
                        : "Monthly Stipend (₹)"}{" "}
                    <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-extrabold text-slate-550">₹</span>
                    <input
                      type="number"
                      min="0"
                      required
                      value={get("budget")}
                      onChange={set("budget")}
                      placeholder={form.type === "gig" ? "25000" : form.type === "job" ? "1200000" : "1500"}
                      className="input-dark pl-8 bg-white"
                    />
                  </div>
                </div>

                {form.type === "job" && (
                  <div>
                    <label className="form-label">Salary Cycle <span className="text-rose-500 font-bold">*</span></label>
                    <select
                      value={get("salaryType")}
                      onChange={set("salaryType")}
                      className="input-dark bg-white"
                      style={{ cursor: "pointer" }}
                    >
                      <option value="yearly">per Annum (CTC)</option>
                      <option value="monthly">per Month</option>
                    </select>
                  </div>
                )}

                {form.type === "gig" && (
                  <div>
                    <label className="form-label">Target Deadline (Optional)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <input
                        type="date"
                        min={minDateStr}
                        value={get("deadline")}
                        onChange={set("deadline")}
                        className="input-dark pl-11 bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="form-label">Metadata Tags (Optional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Tag className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={get("tags")}
                    onChange={set("tags")}
                    placeholder="react, sde, intern, designer (comma separated)"
                    className="input-dark pl-11 bg-white"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-100" style={{ borderColor: "var(--border)" }}>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary py-3.5 flex-1 sm:px-8 disabled:opacity-60 flex items-center justify-center gap-2 font-bold cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="spinner w-4 h-4" />
                      Publishing opportunity...
                    </>
                  ) : (
                    <>
                      <Rocket className="w-4 h-4" /> Publish Listing
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="btn-secondary py-3.5 px-6 font-bold cursor-pointer bg-white"
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