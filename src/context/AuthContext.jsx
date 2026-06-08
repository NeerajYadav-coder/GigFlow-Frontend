import { createContext, useState, useEffect, useContext } from "react";
import api from "../api/axios";
import { useToast } from "./ToastContext";

export const AuthContext = createContext();

// Ensure user always has both .id and ._id, and is a plain JS object
const normalizeUser = (u) => {
  if (!u) return null;
  // Mongoose docs have toObject(); plain API responses are already POJOs
  const plain = u.toObject ? u.toObject() : { ...u };
  return {
    ...plain,
    id: plain.id || plain._id?.toString(),
    _id: plain._id || plain.id
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  /* Restore login from cookie */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(normalizeUser(res.data.user));
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  /**
   * Register — creates user and logs them in directly.
   */
  const register = async (formData) => {
    const res = await api.post("/auth/register", formData);
    const u = normalizeUser(res.data.user);
    setUser(u);
    toast.success(`Welcome to GigFlow, ${u.name}! 🎉`);
    return res.data;
  };

  /**
   * Login — standard email/password login.
   */
  const login = async (formData) => {
    const res = await api.post("/auth/login", formData);
    const u = normalizeUser(res.data.user);
    setUser(u);
    toast.success(`Welcome back, ${u.name}!`);
    return res.data;
  };


  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
    toast.info("You've been logged out.");
  };

  const updateUser = (updated) => {
    setUser(prev => normalizeUser({ ...prev, ...updated }));
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      register,
      login,
      logout,
      updateUser
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
