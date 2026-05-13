import { createContext, useState, useEffect, useContext } from "react";
import api from "../api/axios";
import { useToast } from "./ToastContext";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  /* Restore login from cookie */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const register = async (formData) => {
    const res = await api.post("/auth/register", formData);
    setUser(res.data.user);
    toast.success(`Welcome to GigFlow, ${res.data.user.name}! 🎉`);
  };

  const login = async (formData) => {
    const res = await api.post("/auth/login", formData);
    setUser(res.data.user);
    toast.success(`Welcome back, ${res.data.user.name}!`);
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
    toast.info("You've been logged out.");
  };

  const updateUser = (updated) => {
    setUser(prev => ({ ...prev, ...updated }));
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, updateUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
