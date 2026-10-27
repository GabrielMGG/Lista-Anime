import { describe, expect, it, vi } from 'vitest';
import { ApiError, basicHeader, createApi, register, request } from '../services/api';
import { toRequest, type Anime } from '../types';
describe('Contratos HTTP do cliente (fetch isolado, sem servidor)', () => {
  it('codifica e-mail e senha Unicode em UTF-8 para Basic', () => {
    const header = basicHeader('pessoa@example.com', 'ação-秘密');
    const decoded = new TextDecoder().decode(Uint8Array.from(atob(header.slice(6)), char => char.charCodeAt(0)));
    expect(decoded).toBe('pessoa@example.com:ação-秘密');
  });
  it('faz cadastro público, aceita 201 vazio e não envia cookies', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(null, { status: 201 })); vi.stubGlobal('fetch', fetch);
    await expect(register({ name: 'Teste', email: 'teste@example.com', password: 'teste-local' })).resolves.toBeUndefined();
    expect(fetch.mock.calls[0][0]).toMatch(/\/auth\/register$/);
    expect(fetch.mock.calls[0][1].headers.Authorization).toBeUndefined();
    expect(fetch.mock.calls[0][1].credentials).toBe('omit');
  });
  it('mantém todos os campos no PUT de progresso e descarta metadados da resposta', async () => {
    const anime: Anime = { id: 7, title: 'Fixture de teste', coverUrl: null, synopsis: 'Preservar', genres: 'Drama', totalEpisodes: 12, episodesWatched: 11, status: 'WATCHING', mood: 'EMOTIONAL', score: 9, notes: 'Preservar nota', createdAt: '', updatedAt: '' };
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ...anime, status: 'COMPLETED', episodesWatched: 12 }), { status: 200 })); vi.stubGlobal('fetch', fetch);
    const result = await createApi('Basic exemplo', vi.fn()).update(7, { ...toRequest(anime), episodesWatched: 12 });
    const options = fetch.mock.calls[0][1];
    expect(options.method).toBe('PUT'); expect(options.headers.Authorization).toBe('Basic exemplo');
    expect(JSON.parse(options.body)).toEqual({ ...toRequest(anime), episodesWatched: 12 });
    expect(JSON.parse(options.body)).not.toHaveProperty('id'); expect(result.status).toBe('COMPLETED');
  });
  it('aceita DELETE 204 sem tentar interpretar JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })));
    await expect(createApi('Basic exemplo', vi.fn()).remove(7)).resolves.toBeUndefined();
  });
  it.each([400, 401, 404, 409])('preserva o status HTTP %s e apresenta um erro', async status => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status })));
    await expect(request('/anime-list', 'Basic exemplo')).rejects.toMatchObject({ status, message: expect.any(String) });
  });
  it('propaga erros de validação por campo', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ fields: { title: 'Título obrigatório' } }), { status: 400 })));
    await expect(request('/anime-list')).rejects.toThrow('Título obrigatório');
  });
  it('invalida a sessão após 401 em uma rota protegida', async () => {
    const expired = vi.fn(); vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 401 })));
    await expect(createApi('Basic exemplo', expired).list()).rejects.toBeInstanceOf(ApiError); expect(expired).toHaveBeenCalledOnce();
  });
  it('sorteia com query opcional e sem inventar corpo', async () => {
    const fetch = vi.fn().mockImplementation(() => Promise.resolve(new Response(JSON.stringify({ id: 1 }), { status: 201 }))); vi.stubGlobal('fetch', fetch);
    const api = createApi('Basic exemplo', vi.fn()); await api.draw(); await api.draw('DARK');
    expect(fetch.mock.calls[0][0]).toMatch(/\/draws$/); expect(fetch.mock.calls[1][0]).toMatch(/\/draws\?mood=DARK$/);
    expect(fetch.mock.calls[1][1].body).toBeUndefined();
  });
  it('não transforma falha de rede em sucesso', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    await expect(request('/anime-list')).rejects.toMatchObject({ status: 0 });
  });
});
