import { useState, useContext, useEffect } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const SKILLS_SUGGESTIONS = [
    "React", "Node.js", "MongoDB", "Python", "JavaScript", "TypeScript",
    "UI/UX Design", "Figma", "Next.js", "Vue.js", "Flutter", "Swift",
    "AWS", "Docker", "GraphQL", "PostgreSQL", "Redis", "TensorFlow"
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
    });
    const [skillInput, setSkillInput] = useState("");
    const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
    const [pwLoading, setPwLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setForm({
                name: user.name || "",
                bio: user.bio || "",
                location: user.location || "",
                skills: user.skills || [],
            });
        }
    }, [user]);

    // Use user directly for stats as they are already included in AuthContext
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
        <div className="min-h-screen pb-16" style={{ background: "var(--bg-primary)" }}>
            <div className="section-container py-8">
                <div className="max-w-3xl mx-auto">

                    {/* Profile header */}
                    <div className="card-dark p-6 sm:p-8 mb-6">
                        <div className="flex flex-col sm:flex-row items-start gap-6">
                            {/* Avatar */}
                            <div
                                className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black text-white shrink-0"
                                style={{ background: "linear-gradient(135deg, #7c3aed, #c084fc)" }}
                            >
                                {avatarLetter}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4 mb-2">
                                    <div>
                                        <h1 className="text-2xl font-bold text-[#f0f0fa]">{user.name}</h1>
                                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>{user.email}</p>
                                    </div>
                                    <span className="badge badge-purple capitalize shrink-0">{user.role}</span>
                                </div>

                                {user.bio && (
                                    <p className="text-sm mt-2 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                                        {user.bio}
                                    </p>
                                )}

                                {user.location && (
                                    <div className="flex items-center gap-1.5 mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {user.location}
                                    </div>
                                )}

                                {user.skills?.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-3">
                                        {user.skills.map(skill => (
                                            <span key={skill} className="skill-tag">{skill}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats bar (if available) */}
                    {stats && (
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            {user.role === "client" ? (
                                <>
                                    <StatMini label="Gigs Posted" value={stats.totalGigsPosted || 0} icon="📋" color="text-violet-400" />
                                    <StatMini label="Freelancers Hired" value={stats.totalHires || 0} icon="✅" color="text-emerald-400" />
                                    <StatMini label="Member Since" value={new Date(stats.createdAt).getFullYear()} icon="📅" color="text-amber-400" />
                                </>
                            ) : (
                                <>
                                    <StatMini label="Bids Placed" value={stats.totalBidsPlaced || 0} icon="📊" color="text-violet-400" />
                                    <StatMini label="Jobs Completed" value={stats.totalHires || 0} icon="✅" color="text-emerald-400" />
                                    <StatMini label="Member Since" value={new Date(stats.createdAt).getFullYear()} icon="📅" color="text-amber-400" />
                                </>
                            )}
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="flex gap-1 mb-6 rounded-xl p-1 border" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
                        {[
                            { val: "profile", label: "Edit Profile" },
                            { val: "password", label: "Change Password" },
                        ].map(t => (
                            <button
                                key={t.val}
                                onClick={() => setTab(t.val)}
                                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === t.val ? "text-white" : "text-[#8888aa] hover:text-[#f0f0fa]"
                                    }`}
                                style={tab === t.val
                                    ? { background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }
                                    : {}
                                }
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Profile Tab */}
                    {tab === "profile" && (
                        <div className="card-dark p-6 sm:p-8">
                            <div className="space-y-6">

                                <div>
                                    <label className="form-label">Full Name</label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                        className="input-dark"
                                        disabled={!editing}
                                        style={!editing ? { opacity: 0.7, cursor: "not-allowed" } : {}}
                                    />
                                </div>

                                <div>
                                    <label className="form-label">Bio</label>
                                    <textarea
                                        rows={4}
                                        value={form.bio}
                                        onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                                        placeholder={editing ? "Tell clients about yourself, your experience, and what you do best..." : "No bio added yet"}
                                        className="input-dark resize-none"
                                        disabled={!editing}
                                        maxLength={500}
                                        style={!editing ? { opacity: 0.7, cursor: "not-allowed" } : {}}
                                    />
                                    {editing && (
                                        <p className="text-xs mt-1 text-right" style={{ color: "var(--text-muted)" }}>
                                            {form.bio.length}/500
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="form-label">Location</label>
                                    <input
                                        type="text"
                                        value={form.location}
                                        onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                                        placeholder={editing ? "e.g. Mumbai, India" : "No location added"}
                                        className="input-dark"
                                        disabled={!editing}
                                        style={!editing ? { opacity: 0.7, cursor: "not-allowed" } : {}}
                                    />
                                </div>

                                {/* Skills */}
                                <div>
                                    <label className="form-label">Skills</label>

                                    {/* Current skills */}
                                    <div className="flex flex-wrap gap-2 mb-3 min-h-[2rem]">
                                        {form.skills.length === 0 && !editing && (
                                            <p className="text-sm" style={{ color: "var(--text-muted)" }}>No skills added yet</p>
                                        )}
                                        {form.skills.map(skill => (
                                            <span
                                                key={skill}
                                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                                                style={{
                                                    background: "rgba(139,92,246,0.12)",
                                                    color: "#a78bfa",
                                                    border: "1px solid rgba(139,92,246,0.25)"
                                                }}
                                            >
                                                {skill}
                                                {editing && (
                                                    <button
                                                        onClick={() => removeSkill(skill)}
                                                        className="text-violet-400 hover:text-red-400 transition-colors"
                                                    >
                                                        ×
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
                                                    placeholder="Type a skill and press Enter"
                                                    className="input-dark flex-1"
                                                />
                                                <button
                                                    onClick={() => addSkill(skillInput)}
                                                    className="btn-primary px-4 py-2.5"
                                                    type="button"
                                                >
                                                    Add
                                                </button>
                                            </div>

                                            {/* Quick suggestions */}
                                            <div className="mt-3">
                                                <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>Quick add:</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {SKILLS_SUGGESTIONS
                                                        .filter(s => !form.skills.includes(s))
                                                        .slice(0, 10)
                                                        .map(s => (
                                                            <button
                                                                key={s}
                                                                onClick={() => addSkill(s)}
                                                                className="px-2.5 py-1 rounded-full text-xs transition-all border hover:border-violet-500/40"
                                                                style={{
                                                                    background: "var(--bg-secondary)",
                                                                    borderColor: "var(--border)",
                                                                    color: "var(--text-secondary)"
                                                                }}
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
                                <div className="flex gap-3 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
                                    {!editing ? (
                                        <button onClick={() => setEditing(true)} className="btn-primary py-2.5">
                                            ✏️ Edit Profile
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={saveProfile}
                                                disabled={loading}
                                                className="btn-primary py-2.5 disabled:opacity-60"
                                            >
                                                {loading ? (
                                                    <span className="flex items-center gap-2"><div className="spinner w-4 h-4" /> Saving...</span>
                                                ) : "💾 Save Changes"}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditing(false);
                                                    setForm({ name: user.name, bio: user.bio || "", location: user.location || "", skills: user.skills || [] });
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

                    {/* Password Tab */}
                    {tab === "password" && (
                        <div className="card-dark p-6 sm:p-8">
                            <form onSubmit={changePassword} className="space-y-6">
                                <div>
                                    <label className="form-label">Current Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={pwForm.currentPassword}
                                        onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
                                        placeholder="Enter current password"
                                        className="input-dark"
                                    />
                                </div>
                                <div>
                                    <label className="form-label">New Password</label>
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={pwForm.newPassword}
                                        onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
                                        placeholder="Min. 6 characters"
                                        className="input-dark"
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Confirm New Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={pwForm.confirm}
                                        onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                                        placeholder="Re-enter new password"
                                        className="input-dark"
                                    />
                                    {pwForm.confirm && pwForm.newPassword !== pwForm.confirm && (
                                        <p className="text-xs mt-1.5 text-red-400">Passwords don't match</p>
                                    )}
                                </div>
                                <div className="pt-4 border-t" style={{ borderColor: "var(--border)" }}>
                                    <button
                                        type="submit"
                                        disabled={pwLoading}
                                        className="btn-primary py-2.5 disabled:opacity-60"
                                    >
                                        {pwLoading ? (
                                            <span className="flex items-center gap-2"><div className="spinner w-4 h-4" /> Updating...</span>
                                        ) : "🔒 Update Password"}
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
        <div className="stat-card text-center">
            <div className="text-2xl mb-1">{icon}</div>
            <div className={`text-2xl font-black ${color}`}>{value}</div>
            <div className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{label}</div>
        </div>
    );
}

export default Profile;
