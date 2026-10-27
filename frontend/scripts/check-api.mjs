// Real API smoke test. Only this run's newly created anime may be deleted.
// No passwords or Authorization headers are written to disk or output.
import { randomUUID } from 'node:crypto';
const base = (process.env.VITE_API_BASE_URL || 'http://localhost:8080/api').replace(/\/+$/, '');
const origin = 'http://127.0.0.1:5173';
const email = `qa.frontend.${randomUUID()}@example.com`;
const password = randomUUID();
const authorization = `Basic ${Buffer.from(`${email}:${password}`).toString('base64')}`;
let createdId;
let ownTitle;
let cleaned = false;
const passed = [];
async function call(path, expected, { method = 'GET', body, authenticated = true } = {}) {
  const response = await fetch(`${base}${path}`, { method, headers: { Origin: origin,
    ...(authenticated ? { Authorization: authorization } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(10000) });
  if (response.status !== expected) throw new Error(`${method} ${path}: esperado ${expected}, recebido ${response.status}`);
  if (response.headers.get('access-control-allow-origin') !== origin) throw new Error(`CORS ausente: ${method} ${path}`);
  passed.push(`${method} ${path}: ${response.status}`);
  const text = await response.text(); return text ? JSON.parse(text) : undefined;
}
try {
  await call('/anime-list', 401, { authenticated: false });
  await call('/auth/register', 201, { authenticated: false, method: 'POST', body: { name: 'QA Frontend — avaliação isolada', email, password } });
  const initial = await call('/anime-list', 200);
  if (initial.length) throw new Error('A conta nova deveria ter biblioteca vazia.');
  await call('/auth/register', 409, { authenticated: false, method: 'POST', body: { name: 'QA', email, password } });
  ownTitle = `QA Frontend ${randomUUID()}`;
  const body = { title: ownTitle, coverUrl: null, synopsis: 'Registro temporário criado pelo smoke test do frontend.', genres: 'Teste de integração', totalEpisodes: 2, episodesWatched: 0, status: 'WATCHING', mood: 'FUN', score: 8, notes: 'Fixture exclusiva desta execução.' };
  const created = await call('/anime-list', 201, { method: 'POST', body }); createdId = created.id;
  await call(`/anime-list/${createdId}`, 200);
  const history = await call('/draws/history', 200);
  const updated = await call(`/anime-list/${createdId}`, 200, { method: 'PUT', body: { ...body, episodesWatched: 2 } });
  if (updated.status !== 'COMPLETED' || updated.notes !== body.notes || updated.synopsis !== body.synopsis) throw new Error('PUT não preservou os campos ou a regra COMPLETED.');
  await call('/anime-list', 400, { method: 'POST', body: { ...body, episodesWatched: 3 } });
  // Ownership is established by a fresh account + the ID returned by this run.
  const beforeDelete = await call(`/anime-list/${createdId}`, 200);
  if (beforeDelete.title !== ownTitle) throw new Error('Identidade da fixture mudou; exclusão cancelada.');
  await call(`/anime-list/${createdId}`, 204, { method: 'DELETE' }); cleaned = true;
  await call(`/anime-list/${createdId}`, 404);
  console.log(passed.join('\n'));
  console.log('Integração real aprovada. Somente o anime criado nesta execução foi removido. A conta QA permanece (a API não oferece exclusão desses recursos).');
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Falha na integração.'); process.exitCode = 1;
} finally {
  if (createdId && !cleaned) console.log('A fixture de anime pode ter permanecido no banco; nenhuma limpeza adicional foi executada.');
}
