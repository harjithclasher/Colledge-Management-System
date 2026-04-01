import { useEffect, useState } from "react";
import { loginUser, registerUser, fetchMe } from "../services/authService";
import { AuthContext } from "./authContextBase";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user && token) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }, [user, token]);

  const login = async (email, password) => {
    setLoading(true);
    setError("");
    try {
      const data = await loginUser({ email, password });
      setToken(data.token);
      setUser({ ...data });
      return data;
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    setError("");
    try {
      const data = await registerUser(payload);
      setToken(data.token);
      setUser({ ...data });
      return data;
    } catch (err) {
      setError(err.response?.data?.message || "Register failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken("");
    setError("");
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const data = await fetchMe();
      setUser(data);
    } catch (err) {
      console.error("Refresh profile failed", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, error, login, register, logout, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

