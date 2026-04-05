import { useState } from "react";
import type { AppRole } from "../types";

const SESSION_KEY = "schoolreq_session";

export interface SessionData {
  sessionId: string;
  name: string;
  role: AppRole;
  email: string;
}

export function loadSession(): SessionData | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SessionData;
    // Backward compat: if email is missing from stored session, clear it
    if (!parsed.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveSession(data: SessionData): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(data));
}

export function clearStoredSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function useSession() {
  const [session, setSessionState] = useState<SessionData | null>(loadSession);

  function setSession(data: SessionData) {
    saveSession(data);
    setSessionState(data);
  }

  function clearSession() {
    clearStoredSession();
    setSessionState(null);
  }

  return { session, setSession, clearSession };
}
