import { useState, useContext, useEffect } from "react";
import api, { BACKEND_URL } from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { 
  User, MapPin, Calendar, Edit3, Save, Lock, Briefcase, FileText, 
  CheckCircle, Plus, X, Award, ChevronRight, Settings, Key, ExternalLink, Trash2
} from "lucide-react";

const SKILLS_SUGGESTIONS = [
    "React", "Node.js", "MongoDB", "Python", "JavaScript", "TypeScript",
    "UI/UX Design", "Figma", "Next.js", "Vue.js", "Flutter", "Swift",
    "AWS", "Docker", "GraphQL", "PostgreSQL", "Redis", "TensorFlow"
];

const CATEGORIES = [
  "Web Development", "Mobile Development", "UI/UX Design",
  "Graphic Design", "Content Writing", "Digital Marketing",
  "Video & Animation", "Data Science & AI", "DevOps & Cloud",
  "Cybersecurity", "Database", "Other"
];

const Profile = () => {
    const { user, updateUser } = useContext(AuthContext);
    const toast = useToast();

    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [tab, setTab] = useState("profile"); // profile | password
    const [form, setForm] = useState({
        name: user?.name || "",
        bio: user?.bio || "",
        location: user?.location || "",
        skills: user?.skills || [],
        preferredCategory: user?.preferredCategory || "Other",
        preferredMinBudget: user?.preferredMinBudget || 0,
    });
    const [skillInput, setSkillInput] = useState("");
    const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
    const [pwLoading, setPwLoading] = useState(false);
    const [uploadingResume, setUploadingResume] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    const uploadResumeFile = async (file) => {
        if (!file) return;
        const allowedExtensions = [".pdf", ".doc", ".docx"];
        const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
        if (!allowedExtensions.includes(ext)) {
            toast.warning("Only PDF, DOC, and DOCX files are allowed!");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.warning("File size exceeds 5MB limit");
            return;
        }

        setUploadingResume(true);
        const formData = new FormData();
        formData.append("resume", file);

        try {
            const res = await api.post("/profile/me/resume", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            updateUser(res.data.user);
            toast.success("Resume uploaded successfully!");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to upload resume");
        } finally {
            setUploadingResume(false);
        }
    };

    const deleteResumeFile = async () => {
        if (!window.confirm("Are you sure you want to remove your resume?")) return;
        setUploadingResume(true);
        try {
            const res = await api.delete("/profile/me/resume");
            updateUser(res.data.user);
            toast.success("Resume removed successfully");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to remove resume");
        } finally {
            setUploadingResume(false);
        }
    };

    useEffect(() => {
        if (user) {
            setForm({
                name: user.name || "",
                bio: user.bio || "",
                location: user.location || "",
                skills: user.skills || [],
                preferredCategory: user.preferredCategory || "Other",
                preferredMinBudget: user.preferredMinBudget || 0,
            });
        }
    }, [user]);

    const stats = user;

    const saveProfile = async () => {
        setLoading(true);
        try {
            const res = await api.put("/profile/me", form);
            updateUser(res.data.user);
            toast.success("Profile updated successfully!");
            setEditing(false);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const changePassword = async (e) => {
        e.preventDefault();
        if (pwForm.newPassword !== pwForm.confirm) {
            toast.warning("New passwords don't match");
            return;
        }
        if (pwForm.newPassword.length < 6) {
            toast.warning("Password must be at least 6 characters");
            return;
        }
        setPwLoading(true);
        try {
            await api.patch("/profile/me/password", {
                currentPassword: pwForm.currentPassword,
                newPassword: pwForm.newPassword,
            });
            toast.success("Password changed successfully!");
            setPwForm({ currentPassword: "", newPassword: "", confirm: "" });
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to change password");
        } finally {
            setPwLoading(false);
        }
    };

    const addSkill = (skill) => {
        const s = skill.trim();
        if (s && !form.skills.includes(s) && form.skills.length < 15) {
            setForm(prev => ({ ...prev, skills: [...prev.skills, s] }));
            setSkillInput("");
        }
    };

    const removeSkill = (skill) => {
        setForm(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
    };

    if (!user) return null;

    const avatarLetter = user.name?.charAt(0)?.toUpperCase() || "?";

    return (
        <div className="min-h-screen pb-16" style={{ background: "var(--bg-secondary)" }}>
            <div className="section-container py-8">
                <div className="max-w-3xl mx-auto">

                    {/* Profile Header */}
                    <div className="card-dark p-6 sm:p-8 mb-6 relative bg-white border-slate-200 shadow-sm">
                        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-600 to-sky-500" />
                        
                        <div className="flex flex-col sm:flex-row items-start gap-6 relative z-10">
                            {/* Avatar */}
                            <div
                                className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-extrabold text-white shrink-0 shadow-md"
                                style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-secondary))" }}
                            >
                                {avatarLetter}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4 mb-2">
                                    <div>
                                        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">{user.name}</h1>
                                        <p className="text-xs font-semibold mt-1 text-slate-400">{user.email}</p>
                                    </div>
                                    <span className="badge badge-purple text-[10px] uppercase tracking-wider capitalize shrink-0">{user.role}</span>
                                </div>

                                {user.bio && (
                                    <p className="text-xs mt-3 leading-relaxed text-slate-550">
                                        {user.bio}
                                    </p>
                                )}

                                <div className="flex flex-wrap gap-4 mt-3 items-center">
                                    {user.location && (
                                        <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                                            <MapPin className="w-3.5 h-3.5" />
                                            {user.location}
                                        </div>
                                    )}
                                    {user.resume && (
                                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-650 bg-indigo-50/50 px-2.5 py-1 rounded-lg border border-indigo-100">
                                            <FileText className="w-3.5 h-3.5 text-indigo-500" />
                                            <a href={`${BACKEND_URL}${user.resume}`} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                                                {user.resumeOriginalName || "Resume"}
                                                <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {user.skills?.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-4">
                                        {user.skills.map(skill => (
                                            <span key={skill} className="skill-tag">{skill}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats bar */}
                    {stats && (
                        <div className="grid grid-cols-3 gap-4 mb-8">
                            {user.role === "client" ? (
                                <>
                                    <StatMini label="Gigs Posted" value={stats.totalGigsPosted || 0} icon={<FileText className="w-4 h-4 text-indigo-600" />} color="text-indigo-650" />
                                    <StatMini label="Hires Made" value={stats.totalHires || 0} icon={<CheckCircle className="w-4 h-4 text-emerald-650" />} color="text-emerald-600" />
                                    <StatMini label="Joined Year" value={new Date(stats.createdAt).getFullYear()} icon={<Calendar className="w-4 h-4 text-amber-600" />} color="text-amber-600" />
                                </>
                            ) : (
                                <>
                                    <StatMini label="Bids Placed" value={stats.totalBidsPlaced || 0} icon={<Award className="w-4 h-4 text-indigo-600" />} color="text-indigo-650" />
                                    <StatMini label="Gigs Completed" value={stats.totalHires || 0} icon={<CheckCircle className="w-4 h-4 text-emerald-650" />} color="text-emerald-600" />
                                    <StatMini label="Joined Year" value={new Date(stats.createdAt).getFullYear()} icon={<Calendar className="w-4 h-4 text-amber-600" />} color="text-amber-600" />
                                </>
                            )}
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="flex gap-1.5 mb-6 rounded-2xl p-1.5 border bg-white border-slate-200 shadow-sm">
                        {[
                            { val: "profile", label: "Edit Profile", icon: <Settings className="w-4 h-4" /> },
                            ...(user.role === "freelancer" ? [{ val: "resume", label: "My Resume", icon: <FileText className="w-4 h-4" /> }] : []),
                            { val: "password", label: "Security & Password", icon: <Key className="w-4 h-4" /> },
                        ].map(t => (
                            <button
                                key={t.val}
                                onClick={() => setTab(t.val)}
                                className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${tab === t.val ? "text-white shadow-sm" : "text-slate-500 hover:text-indigo-600"
                                    }`}
                                style={tab === t.val
                                    ? { background: "linear-gradient(135deg, var(--accent), var(--accent-secondary))" }
                                    : {}
                                }
                            >
                                {t.icon}
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Profile Tab */}
                    {tab === "profile" && (
                        <div className="card-dark p-6 sm:p-10 relative bg-white border-slate-200 shadow-sm">
                            <div className="space-y-6">

                                <div>
                                    <label className="form-label">Full Name</label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                        className="input-dark bg-white"
                                        disabled={!editing}
                                        style={!editing ? { opacity: 0.6, cursor: "not-allowed" } : {}}
                                    />
                                </div>

                                <div>
                                    <label className="form-label">Bio Description</label>
                                    <textarea
                                        rows={4}
                                        value={form.bio}
                                        onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                                        placeholder={editing ? "Tell clients about your professional experience, key skills, and project approach..." : "No profile description provided"}
                                        className="input-dark resize-none leading-relaxed bg-white"
                                        disabled={!editing}
                                        maxLength={500}
                                        style={!editing ? { opacity: 0.6, cursor: "not-allowed" } : {}}
                                    />
                                    {editing && (
                                        <p className="text-[10px] font-bold mt-1 text-right text-slate-400">
                                            {form.bio.length} / 500 characters
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="form-label">City, Country</label>
                                    <input
                                        type="text"
                                        value={form.location}
                                        onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                                        placeholder={editing ? "e.g. Mumbai, India" : "No location listed"}
                                        className="input-dark bg-white"
                                        disabled={!editing}
                                        style={!editing ? { opacity: 0.6, cursor: "not-allowed" } : {}}
                                    />
                                </div>

                                {user.role === "freelancer" && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="form-label">Preferred Gig Category</label>
                                            <select
                                                value={form.preferredCategory}
                                                onChange={e => setForm(f => ({ ...f, preferredCategory: e.target.value }))}
                                                className="input-dark bg-white"
                                                disabled={!editing}
                                                style={!editing ? { opacity: 0.6, cursor: "not-allowed" } : { cursor: "pointer" }}
                                            >
                                                {CATEGORIES.map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="form-label">Minimum Target Budget (₹)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={form.preferredMinBudget}
                                                onChange={e => setForm(f => ({ ...f, preferredMinBudget: Number(e.target.value) || 0 }))}
                                                className="input-dark bg-white"
                                                disabled={!editing}
                                                style={!editing ? { opacity: 0.6, cursor: "not-allowed" } : {}}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Skills */}
                                <div>
                                    <label className="form-label">Skills & Expertise</label>

                                    {/* Current skills */}
                                    <div className="flex flex-wrap gap-2 mb-4 min-h-[1.5rem]">
                                        {form.skills.length === 0 && !editing && (
                                            <p className="text-xs font-semibold text-slate-400">No skills added yet</p>
                                        )}
                                        {form.skills.map(skill => (
                                            <span
                                                key={skill}
                                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border"
                                                style={{
                                                    background: "rgba(79, 70, 229, 0.05)",
                                                    color: "#4f46e5",
                                                    borderColor: "rgba(79, 70, 229, 0.15)"
                                                }}
                                            >
                                                {skill}
                                                {editing && (
                                                    <button
                                                        onClick={() => removeSkill(skill)}
                                                        className="text-indigo-600 hover:text-rose-500 transition-colors cursor-pointer text-sm font-bold ml-0.5"
                                                    >
                                                        <X className="w-3 h-3 inline" />
                                                    </button>
                                                )}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Skill input */}
                                    {editing && (
                                        <>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={skillInput}
                                                    onChange={e => setSkillInput(e.target.value)}
                                                    onKeyDown={e => {
                                                        if (e.key === "Enter") { e.preventDefault(); addSkill(skillInput); }
                                                    }}
                                                    placeholder="Type key skill (e.g. Next.js) and press Enter"
                                                    className="input-dark flex-1 bg-white"
                                                />
                                                <button
                                                    onClick={() => addSkill(skillInput)}
                                                    className="btn-primary px-5"
                                                    type="button"
                                                >
                                                    Add
                                                </button>
                                            </div>

                                            {/* Quick suggestions */}
                                            <div className="mt-4">
                                                <p className="text-[10px] font-bold uppercase tracking-wider mb-2.5 text-slate-400">Suggested Skills</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {SKILLS_SUGGESTIONS
                                                        .filter(s => !form.skills.includes(s))
                                                        .slice(0, 8)
                                                        .map(s => (
                                                            <button
                                                                key={s}
                                                                onClick={() => addSkill(s)}
                                                                className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all border border-slate-200 bg-white text-slate-655 hover:text-indigo-600 hover:border-indigo-100 cursor-pointer shadow-sm"
                                                                type="button"
                                                            >
                                                                + {s}
                                                            </button>
                                                        ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-6 border-t border-slate-100" style={{ borderColor: "var(--border)" }}>
                                    {!editing ? (
                                        <button onClick={() => setEditing(true)} className="btn-primary py-2.5 flex items-center gap-1.5">
                                            <Edit3 className="w-4 h-4" /> Edit Profile Details
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={saveProfile}
                                                disabled={loading}
                                                className="btn-primary py-2.5 disabled:opacity-60 flex items-center gap-1.5"
                                            >
                                                {loading ? (
                                                    <><div className="spinner w-4 h-4" /> Saving...</>
                                                ) : (
                                                    <><Save className="w-4 h-4" /> Save Profile</>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditing(false);
                                                    setForm({ 
                                                        name: user.name, 
                                                        bio: user.bio || "", 
                                                        location: user.location || "", 
                                                        skills: user.skills || [],
                                                        preferredCategory: user.preferredCategory || "Other",
                                                        preferredMinBudget: user.preferredMinBudget || 0
                                                    });
                                                }}
                                                className="btn-secondary py-2.5"
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Resume Tab (Freelancers Only) */}
                    {tab === "resume" && user.role === "freelancer" && (
                        <div className="card-dark p-6 sm:p-10 relative bg-white border-slate-200 shadow-sm">
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800 tracking-tight text-left">Professional Resume</h2>
                                    <p className="text-xs text-slate-400 mt-1 font-semibold text-left">
                                        Upload your professional resume (PDF, DOC, or DOCX up to 5MB) so clients can review it when you place bids.
                                    </p>
                                </div>

                                {user.resume ? (
                                    /* Resume Uploaded View */
                                    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/10 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div className="flex items-center gap-4 text-left">
                                            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                                                <FileText className="w-6 h-6" />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-extrabold text-slate-800 text-sm truncate">{user.resumeOriginalName || "resume.pdf"}</h3>
                                                <p className="text-[10px] text-slate-400 font-semibold mt-1">Uploaded and linked to your profile</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 w-full sm:w-auto justify-end">
                                            <a
                                                href={`${BACKEND_URL}${user.resume}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn-secondary py-2 px-4 text-xs flex items-center gap-1.5 hover:text-indigo-600 font-bold"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" /> View Resume
                                            </a>
                                            <button
                                                onClick={deleteResumeFile}
                                                disabled={uploadingResume}
                                                className="btn-danger py-2 px-4 text-xs flex items-center gap-1.5 font-bold"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" /> Remove
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    /* File Upload Form / Dropzone */
                                    <div
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            setDragOver(true);
                                        }}
                                        onDragLeave={() => setDragOver(false)}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            setDragOver(false);
                                            const file = e.dataTransfer.files[0];
                                            if (file) {
                                                uploadResumeFile(file);
                                            }
                                        }}
                                        className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all cursor-pointer ${
                                            dragOver ? "border-indigo-500 bg-indigo-50/10 scale-[0.99]" : "border-slate-200 hover:border-indigo-400 bg-slate-50/20"
                                        }`}
                                        onClick={() => document.getElementById("resume-file-input").click()}
                                    >
                                        <input
                                            id="resume-file-input"
                                            type="file"
                                            accept=".pdf,.doc,.docx"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    uploadResumeFile(file);
                                                }
                                            }}
                                        />
                                        <div className="w-12 h-12 rounded-full mx-auto mb-4 bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                                            <FileText className="w-6 h-6 text-slate-500" />
                                        </div>
                                        <p className="text-xs font-bold text-slate-750">
                                            {uploadingResume ? "Uploading your file..." : "Drag & drop your resume file here or click to browse"}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-semibold mt-2.5">
                                            Supports PDF, DOC, DOCX formats (Max. 5MB)
                                        </p>

                                        {uploadingResume && (
                                            <div className="mt-4 flex items-center justify-center gap-2">
                                                <div className="spinner w-4 h-4" />
                                                <span className="text-[10px] text-indigo-650 font-bold uppercase tracking-wider">Uploading to server...</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Password Tab */}
                    {tab === "password" && (
                        <div className="card-dark p-6 sm:p-10 relative bg-white border-slate-200 shadow-sm">
                            <form onSubmit={changePassword} className="space-y-6">
                                <div>
                                    <label className="form-label">Current Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={pwForm.currentPassword}
                                        onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
                                        placeholder="Enter account password"
                                        className="input-dark bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="form-label">New Secure Password</label>
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={pwForm.newPassword}
                                        onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
                                        placeholder="Min. 6 characters"
                                        className="input-dark bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Confirm New Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={pwForm.confirm}
                                        onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                                        placeholder="Re-enter secure password"
                                        className="input-dark bg-white"
                                    />
                                    {pwForm.confirm && pwForm.newPassword !== pwForm.confirm && (
                                        <p className="text-xs mt-2 text-rose-500 font-semibold">Passwords do not match</p>
                                    )}
                                </div>
                                <div className="pt-6 border-t border-slate-100" style={{ borderColor: "var(--border)" }}>
                                    <button
                                        type="submit"
                                        disabled={pwLoading}
                                        className="btn-primary py-3 px-6 disabled:opacity-60 flex items-center gap-1.5"
                                    >
                                        {pwLoading ? (
                                            <><div className="spinner w-4 h-4" /> Saving Password...</>
                                        ) : (
                                            <><Lock className="w-4 h-4" /> Update Password</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

function StatMini({ label, value, icon, color }) {
    return (
        <div className="stat-card text-center flex flex-col items-center bg-white shadow-sm border-slate-200">
            <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center mb-2 shadow-inner">
                {icon}
            </div>
            <div className={`text-xl font-black ${color}`}>{value}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider mt-1 text-slate-400">{label}</div>
        </div>
    );
}

export default Profile;
