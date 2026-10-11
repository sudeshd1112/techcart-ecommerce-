import { createContext, useContext, useState, useEffect } from "react";
import { apiLogin, apiRegister, apiGetProfile } from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("techcart_token") || null);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("techcart_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Verify and sync user profile if token exists on initial load
  useEffect(() => {
    if (token && !user) {
      apiGetProfile(token)
        .then((res) => {
          if (res.user) {
            setUser(res.user);
            localStorage.setItem("techcart_user", JSON.stringify(res.user));
          }
        })
        .catch(() => {
          // Token expired or invalid
          logout();
        });
    }
  }, [token]);

  async function login(email, password) {
    const res = await apiLogin(email, password);
    if (res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem("techcart_token", res.token);
      localStorage.setItem("techcart_user", JSON.stringify(res.user));
    }
    return res;
  }

  async function register(name, email, password) {
    const res = await apiRegister(name, email, password);
    if (res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem("techcart_token", res.token);
      localStorage.setItem("techcart_user", JSON.stringify(res.user));
    }
    return res;
  }

  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem("techcart_token");
    localStorage.removeItem("techcart_user");
  }

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
