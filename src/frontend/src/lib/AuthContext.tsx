import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api, type User, type UserRole } from "./api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, role?: UserRole) => Promise<void>;
  registerUser: (name: string, email: string, password: string) => Promise<void>;
  registerExpert: (name: string, email: string, password: string, specialization: string, professionalDetails: string) => Promise<void>;
  logout: () => void;
  hasRole: (allowedRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = api.getToken();
    if (token) {
      api
        .getMe()
        .then((data) => setUser(data.user))
        .catch(() => {
          api.clearAuth();
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string, role?: UserRole) => {
    const res = role === "EXPERT" ? await api.loginExpert(email, password) : await api.loginUser(email, password);
    api.setAuth(res.token);
    setUser(res.user);
  };

  const registerUser = async (name: string, email: string, password: string) => {
    const res = await api.registerUser(name, email, password);
    api.setAuth(res.token);
    setUser(res.user);
  };

  const registerExpert = async (name: string, email: string, password: string, specialization: string, professionalDetails: string) => {
    await api.registerExpert(name, email, password, specialization, professionalDetails);
  };

  const logout = () => {
    api.clearAuth();
    setUser(null);
  };

  const hasRole = (allowedRoles: UserRole[]): boolean => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, registerUser, registerExpert, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
