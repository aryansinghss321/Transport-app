import { useEffect, useState } from "react";
import api from "../api";
import { AuthContext } from "./authContext";

export const AuthProvider = ({ children }) => {
  const initialToken = localStorage.getItem("token");
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(initialToken);
  const [loading, setLoading] = useState(Boolean(initialToken));

  useEffect(() => {
    if (!token) return;

    api
      .get("/auth/me")
      .then(({ data }) => setUser(data.user))
      .catch(() => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post("/auth/register", { name, email, password });
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};