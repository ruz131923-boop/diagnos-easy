import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { logActivity, removeActivityFor } from "@/lib/activity";

export type StoredUser = {
  fullName: string;
  nameWithInitials: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  contactNumber: string;
  heightCm: string;
  weightKg: string;
  bloodGroup: string;
  username: string;
  /** Demo-only: front-end prototype has no backend, nothing is transmitted. */
  password: string;
};

type AuthState = {
  ready: boolean;
  user: StoredUser | null;
  /** True while an administrator is signed in on this browser. */
  isAdmin: boolean;
  adminUsername: string | null;
  /** All accounts stored on this device — used by the administrator dashboard. */
  accounts: StoredUser[];
  /** True when this browser already has a registered account (one account per person). */
  hasAccount: boolean;
  register: (user: StoredUser) => { ok: boolean; error?: string };
  login: (username: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  accountExists: (username: string) => boolean;
  resetPassword: (username: string, password: string) => { ok: boolean; error?: string };
  /** Removes the stored account from this browser so a fresh registration is possible. */
  deleteAccount: () => void;
  adminLogin: (username: string, password: string) => { ok: boolean; error?: string };
  adminLogout: () => void;
  /** Administrator privilege: remove any fake or unauthorised account. */
  adminDeleteAccount: (username: string) => void;
  refreshAccounts: () => void;
};

const ACCOUNTS_KEY = "vitalsense.accounts";
const SESSION_KEY = "vitalsense.session";
const ADMIN_SESSION_KEY = "vitalsense.adminSession";

/**
 * Front-end prototype administrator credentials. When the back end is
 * connected these move to the server and are checked there.
 */
export const ADMIN_CREDENTIALS = { username: "admin", password: "Vital@Admin1" };

const AuthContext = createContext<AuthState | null>(null);

function readAccounts(): StoredUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_KEY);
    return raw ? (JSON.parse(raw) as StoredUser[]) : [];
  } catch {
    return [];
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [accounts, setAccounts] = useState<StoredUser[]>([]);
  const [user, setUser] = useState<StoredUser | null>(null);
  const [adminUsername, setAdminUsername] = useState<string | null>(null);

  useEffect(() => {
    const loaded = readAccounts();
    setAccounts(loaded);
    try {
      const session = window.localStorage.getItem(SESSION_KEY);
      if (session) {
        const found = loaded.find((a) => a.username === session);
        if (found) setUser(found);
      }
      const admin = window.localStorage.getItem(ADMIN_SESSION_KEY);
      if (admin) setAdminUsername(admin);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const persist = useCallback((next: StoredUser[]) => {
    setAccounts(next);
    try {
      window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  const register = useCallback<AuthState["register"]>(
    (newUser) => {
      const existing = readAccounts();
      if (existing.length > 0) {
        return {
          ok: false,
          error:
            "An account has already been created on this device. Our terms allow only one account per person — please log in instead.",
        };
      }
      if (existing.some((a) => a.username.toLowerCase() === newUser.username.toLowerCase())) {
        return { ok: false, error: "That username is already taken." };
      }
      if (existing.some((a) => a.email.toLowerCase() === newUser.email.toLowerCase())) {
        return { ok: false, error: "An account already uses that email address." };
      }
      const next = [...existing, newUser];
      persist(next);
      setUser(newUser);
      try {
        window.localStorage.setItem(SESSION_KEY, newUser.username);
      } catch {
        /* ignore */
      }
      logActivity({ username: newUser.username, type: "register", detail: newUser.email });
      return { ok: true };
    },
    [persist],
  );

  const login = useCallback<AuthState["login"]>((username, password) => {
    const found = readAccounts().find(
      (a) => a.username.toLowerCase() === username.toLowerCase().trim(),
    );
    if (!found || found.password !== password) {
      return { ok: false, error: "Incorrect username or password." };
    }
    setUser(found);
    try {
      window.localStorage.setItem(SESSION_KEY, found.username);
    } catch {
      /* ignore */
    }
    logActivity({ username: found.username, type: "login" });
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    if (user) logActivity({ username: user.username, type: "logout" });
    setUser(null);
    try {
      window.localStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
  }, [user]);

  const deleteAccount = useCallback(() => {
    if (user) logActivity({ username: user.username, type: "account-deleted" });
    setUser(null);
    setAccounts([]);
    try {
      window.localStorage.removeItem(SESSION_KEY);
      window.localStorage.removeItem(ACCOUNTS_KEY);
    } catch {
      /* ignore */
    }
  }, [user]);

  const adminLogin = useCallback<AuthState["adminLogin"]>((username, password) => {
    const name = username.trim();
    if (
      name.toLowerCase() !== ADMIN_CREDENTIALS.username ||
      password !== ADMIN_CREDENTIALS.password
    ) {
      return { ok: false, error: "Incorrect administrator username or password." };
    }
    setAdminUsername(ADMIN_CREDENTIALS.username);
    setAccounts(readAccounts());
    try {
      window.localStorage.setItem(ADMIN_SESSION_KEY, ADMIN_CREDENTIALS.username);
    } catch {
      /* ignore */
    }
    logActivity({ username: ADMIN_CREDENTIALS.username, type: "admin-login" });
    return { ok: true };
  }, []);

  const adminLogout = useCallback(() => {
    setAdminUsername(null);
    try {
      window.localStorage.removeItem(ADMIN_SESSION_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const adminDeleteAccount = useCallback<AuthState["adminDeleteAccount"]>(
    (username) => {
      const next = readAccounts().filter(
        (a) => a.username.toLowerCase() !== username.toLowerCase(),
      );
      persist(next);
      removeActivityFor(username);
      logActivity({
        username: ADMIN_CREDENTIALS.username,
        type: "account-deleted",
        detail: `Removed account “${username}”`,
      });
      try {
        if (window.localStorage.getItem(SESSION_KEY)?.toLowerCase() === username.toLowerCase()) {
          window.localStorage.removeItem(SESSION_KEY);
          setUser(null);
        }
      } catch {
        /* ignore */
      }
    },
    [persist],
  );

  const refreshAccounts = useCallback(() => setAccounts(readAccounts()), []);

  const accountExists = useCallback<AuthState["accountExists"]>(
    (username) =>
      readAccounts().some((a) => a.username.toLowerCase() === username.toLowerCase().trim()),
    [],
  );

  const resetPassword = useCallback<AuthState["resetPassword"]>(
    (username, password) => {
      const existing = readAccounts();
      const index = existing.findIndex(
        (a) => a.username.toLowerCase() === username.toLowerCase().trim(),
      );
      if (index < 0) return { ok: false, error: "No account matches that username." };
      const next = [...existing];
      next[index] = { ...next[index], password };
      persist(next);
      return { ok: true };
    },
    [persist],
  );

  const value = useMemo<AuthState>(
    () => ({
      ready,
      user,
      isAdmin: adminUsername !== null,
      adminUsername,
      accounts,
      hasAccount: accounts.length > 0,
      register,
      login,
      logout,
      accountExists,
      resetPassword,
      deleteAccount,
      adminLogin,
      adminLogout,
      adminDeleteAccount,
      refreshAccounts,
    }),
    [
      ready,
      user,
      adminUsername,
      accounts,
      register,
      login,
      logout,
      accountExists,
      resetPassword,
      deleteAccount,
      adminLogin,
      adminLogout,
      adminDeleteAccount,
      refreshAccounts,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}