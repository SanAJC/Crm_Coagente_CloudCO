"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import * as authApi from "@/api/auth.api";
import type { AuthUser } from "@/api/auth.api";
import { clearStoredTokens, getStoredTokens, setStoredTokens } from "@/api/token-storage";

const USER_KEY = "mesa-crm-user";

type AuthContextValue = {
  user: AuthUser | null;
  hydrated: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const tokens = getStoredTokens();
      const rawUser = window.localStorage.getItem(USER_KEY);
      if (tokens && rawUser) {
        // One-shot hydration of a persisted session on mount; there's no
        // external-store subscription to sync against, just a single read.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUser(JSON.parse(rawUser) as AuthUser);
      }
    } catch {
      clearStoredTokens();
      window.localStorage.removeItem(USER_KEY);
    }
    setHydrated(true);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { accessToken, refreshToken, data_user } = await authApi.login(email, password);
    setStoredTokens({ accessToken, refreshToken });
    window.localStorage.setItem(USER_KEY, JSON.stringify(data_user));
    setUser(data_user);
  }, []);

  const logout = useCallback(async () => {
    const tokens = getStoredTokens();
    try {
      await authApi.logout(tokens?.refreshToken);
    } catch {
      // best-effort: si el backend no responde igual cerramos la sesión local
    }
    clearStoredTokens();
    window.localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, hydrated, isAuthenticated: user !== null, login, logout }),
    [user, hydrated, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
