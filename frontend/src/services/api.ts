import type { Anime, AnimeRequest, CatalogAnime, CatalogSearch, Draw, Mood, RegisterRequest } from '../types';

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api').replace(/\/+$/, '');
export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
const messages: Record<number, string> = {
  400: 'Confira os dados enviados e tente novamente.',
  401: 'Sua autenticação não foi aceita. Entre novamente com e-mail e senha.',
  404: 'Não encontramos esse recurso.',
  409: 'Este e-mail já está cadastrado. Entre com sua conta.',
  502: 'Falha ao consultar o catálogo MyAnimeList.',
  503: 'O catálogo MyAnimeList está indisponível.',
  504: 'O catálogo MyAnimeList demorou para responder.',
};
export function basicHeader(email: string, password: string) {
  return `Basic ${btoa(Array.from(new TextEncoder().encode(`${email}:${password}`), b => String.fromCharCode(b)).join(''))}`;
}
export async function request<T>(path: string, authorization?: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options, credentials: 'omit', cache: 'no-store',
      headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(authorization ? { Authorization: authorization } : {}), ...options.headers },
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiError(0, 'Não foi possível conectar à API. Confira se o backend está ativo e se a URL e o CORS estão configurados.');
  }
  if (!response.ok) {
    let message = messages[response.status] || 'O servidor não conseguiu concluir a solicitação. Tente novamente.';
    // Authentication errors and duplicate e-mails use safe, user-facing translations.
    if ([400, 502, 503, 504].includes(response.status)) {
      const body = await response.json().catch(() => null);
      if (body?.fields) message += ' ' + Object.values(body.fields).join(' · ');
      else if (typeof body?.error === 'string') message += ` ${body.error}`;
    }
    throw new ApiError(response.status, message);
  }
  if (response.status === 204 || response.headers.get('content-length') === '0') return undefined as T;
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
export const register = (data: RegisterRequest) => request<void>('/auth/register', undefined, { method: 'POST', body: JSON.stringify(data) });
export function createApi(authorization: string, expired: () => void) {
  async function call<T>(path: string, options?: RequestInit) {
    try { return await request<T>(path, authorization, options); }
    catch (error) { if (error instanceof ApiError && error.status === 401) expired(); throw error; }
  }
  return {
    searchCatalog: (q: string, offset = 0, signal?: AbortSignal) => call<CatalogSearch>(`/catalog/anime?q=${encodeURIComponent(q)}&offset=${offset}`, { signal }),
    catalogDetails: (id: string, signal?: AbortSignal) => call<CatalogAnime>(`/catalog/anime/${encodeURIComponent(id)}`, { signal }),
    list: (signal?: AbortSignal) => call<Anime[]>('/anime-list', { signal }),
    get: (id: string, signal?: AbortSignal) => call<Anime>(`/anime-list/${encodeURIComponent(id)}`, { signal }),
    create: (data: AnimeRequest) => call<Anime>('/anime-list', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: AnimeRequest) => call<Anime>(`/anime-list/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id: number) => call<void>(`/anime-list/${id}`, { method: 'DELETE' }),
    draw: (mood?: Mood, signal?: AbortSignal) => call<Draw>(`/draws${mood ? `?mood=${mood}` : ''}`, { method: 'POST', signal }),
    history: (signal?: AbortSignal) => call<Draw[]>('/draws/history', { signal }),
  };
}
