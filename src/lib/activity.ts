import { useCallback, useEffect, useState } from "react";

export type ActivityType =
  | "register"
  | "login"
  | "logout"
  | "prediction"
  | "report-scan"
  | "account-deleted"
  | "admin-login";

export type ActivityEvent = {
  id: string;
  at: string;
  username: string;
  type: ActivityType;
  detail?: string;
  /** Risk percentage when the event is a prediction. */
  score?: number;
};

const ACTIVITY_KEY = "vitalsense.activity";
const EVENT_NAME = "vitalsense:activity";
const MAX_EVENTS = 500;

export const ACTIVITY_LABEL: Record<ActivityType, string> = {
  register: "Account created",
  login: "Logged in",
  logout: "Logged out",
  prediction: "Prediction run",
  "report-scan": "Report scanned",
  "account-deleted": "Account deleted",
  "admin-login": "Admin signed in",
};

export function readActivity(): ActivityEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ACTIVITY_KEY);
    const list = raw ? (JSON.parse(raw) as ActivityEvent[]) : [];
    return list.sort((a, b) => (a.at < b.at ? 1 : -1));
  } catch {
    return [];
  }
}

function write(list: ActivityEvent[]) {
  try {
    window.localStorage.setItem(ACTIVITY_KEY, JSON.stringify(list.slice(0, MAX_EVENTS)));
    window.dispatchEvent(new Event(EVENT_NAME));
  } catch {
    /* ignore */
  }
}

export function logActivity(event: Omit<ActivityEvent, "id" | "at"> & { at?: string }) {
  if (typeof window === "undefined") return;
  const next: ActivityEvent = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    at: event.at ?? new Date().toISOString(),
    username: event.username || "guest",
    type: event.type,
    detail: event.detail,
    score: event.score,
  };
  write([next, ...readActivity()]);
}

export function clearActivity() {
  write([]);
}

export function removeActivityFor(username: string) {
  write(readActivity().filter((e) => e.username.toLowerCase() !== username.toLowerCase()));
}

/** Live view of the activity log, refreshed whenever a new event is written. */
export function useActivity() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const refresh = useCallback(() => setEvents(readActivity()), []);

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener(EVENT_NAME, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVENT_NAME, handler);
      window.removeEventListener("storage", handler);
    };
  }, [refresh]);

  return { events, refresh };
}
