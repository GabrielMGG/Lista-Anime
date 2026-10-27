import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { basicHeader, createApi, request } from '../services/api';
import type { Anime } from '../types';
type Session = { email: string; authorization: string };
type Auth = { session: Session | null; notice: string; login: (email: string, password: string) => Promise<void>; logout: () => void; api: ReturnType<typeof createApi> };
const AuthContext = createContext<Auth | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [notice, setNotice] = useState('');
  const generation = useRef(0);
  const logout = useCallback(() => { generation.current++; setSession(null); setNotice(''); }, []);
  const expire = useCallback(() => { generation.current++; setSession(null); setNotice('Sua sessão não foi aceita pela API. Entre novamente.'); }, []);
  async function login(email: string, password: string) {
    const current = ++generation.current;
    const authorization = basicHeader(email, password);
    await request<Anime[]>('/anime-list', authorization);
    if (current === generation.current) { setNotice(''); setSession({ email, authorization }); }
  }
  const api = useMemo(() => {
    const current = generation.current;
    return createApi(session?.authorization || '', () => {
      if (session && current === generation.current) expire();
    });
  }, [session, expire]);
  return <AuthContext.Provider value={{ session, notice, login, logout, api }}>{children}</AuthContext.Provider>;
}
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error('AuthProvider ausente'); return value; }
