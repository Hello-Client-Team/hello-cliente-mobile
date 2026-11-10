import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { api, onSessionExpired, refreshSession, setAccessToken } from '@/services/api';
import type { User } from '@/services/types';

interface SessionValue {
  user: User | null;
  restoring: boolean;
  login: (whatsapp: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const Context = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [restoring, setRestoring] = useState(true);

  useEffect(() => {
    let active = true;
    const unsubscribe = onSessionExpired(() => setUser(null));
    (async () => {
      try {
        const me = (await refreshSession()) ? await api<User>('/users/me') : null;
        if (active) setUser(me);
      } catch {
        // Unreachable server on startup: fall through to the login screen.
      } finally {
        if (active) setRestoring(false);
      }
    })();
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  async function login(whatsapp: string, password: string) {
    const session = await api<{ accessToken: string }>('/auth/login', {
      method: 'POST',
      auth: false,
      body: { whatsapp, password },
    });
    setAccessToken(session.accessToken);
    setUser(await api<User>('/users/me'));
  }

  async function logout() {
    await api('/auth/logout', { method: 'POST', auth: false });
    setAccessToken(null);
    setUser(null);
  }

  return <Context.Provider value={{ user, restoring, login, logout }}>{children}</Context.Provider>;
}

export function useSession() {
  const context = useContext(Context);
  if (!context) throw new Error('SessionProvider ausente');
  return context;
}
