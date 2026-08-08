import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { 
  AuthAccount, 
  UserRole, 
  getCurrentSession, 
  registerOrLoginAccount, 
  clearSession 
} from "@/services/storageService";

export type { UserRole, AuthAccount };

export function useAuth() {
  const [, navigate] = useLocation();

  const [user, setUser] = useState<AuthAccount | null>(() => {
    return getCurrentSession();
  });

  // Sync state if session changes across tabs/windows
  useEffect(() => {
    const handleStorageChange = () => {
      setUser(getCurrentSession());
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const loginAs = useCallback((email: string, role: UserRole, name?: string) => {
    const account = registerOrLoginAccount(email, role, name);
    setUser(account);

    if (role === "admin") {
      navigate("/admin");
    } else {
      navigate("/dashboard");
    }
  }, [navigate]);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    navigate("/");
  }, [navigate]);

  return {
    user,
    isAuthenticated: Boolean(user),
    loading: false,
    error: null,
    loginAs,
    logout,
  };
}
