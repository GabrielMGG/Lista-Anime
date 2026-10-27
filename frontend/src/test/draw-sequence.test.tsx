import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { preloadCover, SEQUENCE, useDrawSequence } from '../hooks/useDrawSequence';
import { ApiError } from '../services/api';
import type { Draw } from '../types';
const actual: Draw = { id: 91, animeTitle: 'Resultado real da fixture de teste', coverUrl: null, mood: 'ACTION', drawnAt: '', malId: 42, genres: ['Action'], totalEpisodes: 12, identifiedMood: 'ACTION', publicScore: 8.2, year: 2020, source: 'MYANIMELIST' };
afterEach(() => vi.useRealTimers());
describe('Sequência de invocação — resultado sempre definido pela API', () => {
  it('sincroniza as cinco fases e conclui em 5100ms após resposta/preload', async () => {
    vi.useFakeTimers(); const draw = vi.fn().mockResolvedValue(actual);
    const { result } = renderHook(() => useDrawSequence(draw));
    await act(async () => { await result.current.start('ACTION'); });
    expect(result.current.phase).toBe('preparing'); expect(result.current.result).toEqual(actual);
    act(() => vi.advanceTimersByTime(SEQUENCE.invoking)); expect(result.current.phase).toBe('invoking');
    act(() => vi.advanceTimersByTime(SEQUENCE.suspense - SEQUENCE.invoking)); expect(result.current.phase).toBe('suspense');
    act(() => vi.advanceTimersByTime(SEQUENCE.revealing - SEQUENCE.suspense)); expect(result.current.phase).toBe('revealing');
    act(() => vi.advanceTimersByTime(SEQUENCE.result - SEQUENCE.revealing)); expect(result.current.phase).toBe('result');
    expect(result.current.busy).toBe(false); expect(draw).toHaveBeenCalledTimes(1);
  });
  it('pular enquanto aguarda não inventa resultado nem faz outra requisição', async () => {
    let resolve!: (draw: Draw) => void;
    const draw = vi.fn(() => new Promise<Draw>(done => { resolve = done; }));
    const { result } = renderHook(() => useDrawSequence(draw));
    let pending!: Promise<void>;
    act(() => { pending = result.current.start(); result.current.skip(); });
    expect(result.current.phase).toBe('requesting'); expect(result.current.result).toBeUndefined();
    await act(async () => { resolve(actual); await pending; });
    expect(result.current.phase).toBe('result'); expect(result.current.result?.malId).toBe(42); expect(draw).toHaveBeenCalledOnce();
  });
  it('bloqueia solicitações simultâneas e libera após pular', async () => {
    const draw = vi.fn().mockResolvedValue(actual); const { result } = renderHook(() => useDrawSequence(draw));
    await act(async () => { const first = result.current.start(); const second = result.current.start(); await Promise.all([first, second]); });
    expect(draw).toHaveBeenCalledOnce(); act(() => result.current.skip()); expect(result.current.busy).toBe(false);
  });
  it('falha ou conjunto vazio não produz revelação falsa', async () => {
    const draw = vi.fn().mockRejectedValue(new ApiError(404, 'Sem candidatos'));
    const { result } = renderHook(() => useDrawSequence(draw));
    await act(async () => { await result.current.start('RELAXED'); });
    expect(result.current.phase).toBe('error'); expect(result.current.result).toBeUndefined(); expect(result.current.error).toContain('Nenhum candidato'); expect(result.current.busy).toBe(false);
  });
  it('respeita movimento reduzido sem iniciar timers cinematográficos', async () => {
    vi.useFakeTimers(); vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
    const draw = vi.fn().mockResolvedValue(actual); const { result } = renderHook(() => useDrawSequence(draw));
    await act(async () => { await result.current.start(); });
    expect(result.current.phase).toBe('result'); expect(result.current.reduced).toBe(true); expect(vi.getTimerCount()).toBe(0);
  });
  it('limpa os timers e aborta recursos ao sair da página', async () => {
    vi.useFakeTimers(); const draw = vi.fn().mockResolvedValue(actual);
    const { result, unmount } = renderHook(() => useDrawSequence(draw));
    await act(async () => { await result.current.start(); });
    const signal = draw.mock.calls[0][1] as AbortSignal;
    expect(vi.getTimerCount()).toBe(4); unmount(); expect(vi.getTimerCount()).toBe(0); expect(signal.aborted).toBe(true);
  });
  it('encerra preload em falha/timeout sem substituir capa por um resultado inventado', async () => {
    vi.useFakeTimers(); const controller = new AbortController();
    const ready = preloadCover('https://example.com/inexistente.jpg', controller.signal);
    vi.advanceTimersByTime(800); await expect(ready).resolves.toBeUndefined(); expect(vi.getTimerCount()).toBe(0);
  });
});
