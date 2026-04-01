import { useState } from "react";
import type { AppRole } from "../types";

const SESSION_KEY = "schoolreq_session";

export interface SessionData {
  sessionId: string;
  name: string;
  role: AppRole;
}

export function loadSession(): SessionData | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionData;
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
