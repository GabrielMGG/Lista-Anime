import { useCallback, useEffect, useRef, useState } from 'react';
import type { Draw, Mood } from '../types';
import { ApiError } from '../services/api';
export type DrawPhase = 'idle' | 'requesting' | 'preparing' | 'invoking' | 'suspense' | 'revealing' | 'result' | 'error';
export const SEQUENCE = { invoking: 450, suspense: 2350, revealing: 3350, result: 5100 } as const;
export function preloadCover(url: string | null, signal: AbortSignal): Promise<void> {
  if (!url || !/^https?:\/\//i.test(url) || signal.aborted) return Promise.resolve();
  return new Promise(resolve => {
    const image = new Image();
    const done = () => { clearTimeout(timer); image.onload = null; image.onerror = null; signal.removeEventListener('abort', done); image.src = ''; resolve(); };
    const timer = setTimeout(done, 800);
    image.onload = done; image.onerror = done; image.referrerPolicy = 'no-referrer';
    signal.addEventListener('abort', done, { once: true }); image.src = url;
  });
}
export function useDrawSequence(draw: (mood?: Mood, signal?: AbortSignal) => Promise<Draw>) {
  const [phase, setPhase] = useState<DrawPhase>('idle');
  const [result, setResult] = useState<Draw>(); const [error, setError] = useState('');
  const [reduced, setReduced] = useState(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);
  const locked = useRef(false); const alive = useRef(true); const skipRequested = useRef(false);
  const pending = useRef<Draw | undefined>(undefined); const version = useRef(0);
  const controller = useRef<AbortController | null>(null); const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clear = useCallback(() => { timers.current.forEach(clearTimeout); timers.current = []; }, []);
  const finish = useCallback(() => { clear(); if (pending.current && alive.current) { setResult(pending.current); setPhase('result'); locked.current = false; } }, [clear]);
  const skip = useCallback(() => { skipRequested.current = true; finish(); }, [finish]);
  useEffect(() => {
    alive.current = true;
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const change = () => { setReduced(media?.matches ?? false); if (media?.matches) skip(); };
    media?.addEventListener('change', change);
    return () => { alive.current = false; version.current++; controller.current?.abort(); clear(); media?.removeEventListener('change', change); };
  }, [clear, skip]);
  const start = useCallback(async (mood?: Mood) => {
    if (locked.current) return;
    locked.current = true; skipRequested.current = false; pending.current = undefined;
    clear(); const current = ++version.current; controller.current?.abort(); const abort = new AbortController(); controller.current = abort;
    setError(''); setResult(undefined); setPhase('requesting');
    try {
      const actual = await draw(mood, abort.signal);
      if (!alive.current || current !== version.current || abort.signal.aborted) return;
      pending.current = actual;
      if (skipRequested.current || reduced) { finish(); return; }
      await preloadCover(actual.coverUrl, abort.signal);
      if (!alive.current || current !== version.current || abort.signal.aborted || skipRequested.current) return;
      setResult(actual); setPhase('preparing');
      for (const [next, at] of Object.entries(SEQUENCE)) timers.current.push(setTimeout(() => {
        if (!alive.current || current !== version.current) return;
        if (next === 'result') finish(); else setPhase(next as DrawPhase);
      }, at));
    } catch (error) {
      if (!alive.current || current !== version.current || abort.signal.aborted) return;
      clear(); pending.current = undefined; setResult(undefined); setError(error instanceof ApiError && error.status === 404 ? 'Nenhum candidato compatível na amostra temporária do catálogo. Tente outro mood ou aguarde sua renovação.' : error instanceof Error ? error.message : 'Não foi possível sortear.'); setPhase('error'); locked.current = false;
    }
  }, [draw, clear, finish, reduced]);
  return { phase, result, error, reduced, start, skip, busy: !['idle', 'result', 'error'].includes(phase) };
}
