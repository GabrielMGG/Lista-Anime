import { useCallback, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useResource } from '../hooks/useResource';
import { type Anime, moods, statuses, toRequest } from '../types';
import { AnimeCard } from '../components/AnimeCard';

import { Empty, ErrorMessage, Loading } from '../components/UI';
export function LibraryPage() {
  const { api } = useAuth();
  const loader = useCallback((signal: AbortSignal) => api.list(signal), [api]);
  const { data, setData, error, loading, reload } = useResource(loader);
  const [params, setParams] = useSearchParams(); const q = params.get('q') || '';
  const [status, setStatus] = useState(''); const [mood, setMood] = useState('');
  const [saving, setSaving] = useState<number | null>(null); const [saveError, setSaveError] = useState('');
  async function progress(anime: Anime) {
    if (saving !== null || anime.episodesWatched >= 2147483647 || (anime.totalEpisodes > 0 && anime.episodesWatched >= anime.totalEpisodes)) return;
    setSaving(anime.id); setSaveError('');
    try { const updated = await api.update(anime.id, { ...toRequest(anime), episodesWatched: anime.episodesWatched + 1 }); setData(items => items?.map(item => item.id === updated.id ? updated : item)); }
    catch (error) { setSaveError(error instanceof Error ? error.message : 'Não foi possível salvar o progresso.'); }
    finally { setSaving(null); }
  }
  const watching = data?.filter(anime => anime.status === 'WATCHING') || [];
  const filtered = data?.filter(anime => anime.title.toLocaleLowerCase('pt-BR').includes(q.toLocaleLowerCase('pt-BR')) && (!status || anime.status === status) && (!mood || anime.mood === mood)) || [];
  const renderCard = (anime: Anime) => <AnimeCard key={anime.id} anime={anime} onProgress={progress} busy={saving !== null} />;
  return <><div className="page-intro"><div><h1>Minha biblioteca</h1><p className="muted">Animes, episódios e avaliações pessoais.</p></div><Link className="button primary" to="/animes/novo">Adicionar anime</Link></div>{loading ? <Loading /> : error ? <ErrorMessage message={error} retry={reload} /> : <>{saveError && <ErrorMessage message={saveError} />}<section className="section"><div className="section-heading"><h2>Assistindo <span className="count">{watching.length}</span></h2><a className="text-link" href="#minha-lista">Ver biblioteca</a></div>{watching.length ? <div className="continue-grid">{watching.map(renderCard)}</div> : <p className="inline-empty">Nenhum anime em andamento. Altere o status de um item para Assistindo.</p>}</section><section id="minha-lista" className="section"><div className="section-heading"><h2>Todos os animes <span className="count">{data?.length || 0}</span></h2><Link className="text-link" to="/historico">Histórico de sorteios</Link></div><div className="filter-bar"><input aria-label="Pesquisar por título na biblioteca" placeholder="Filtrar minha biblioteca por título" value={q} onChange={event => setParams(event.target.value ? { q: event.target.value } : {}, { replace: true })} /><select aria-label="Filtrar por status" value={status} onChange={event => setStatus(event.target.value)}><option value="">Todos os status</option>{Object.entries(statuses).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select><select aria-label="Filtrar por humor" value={mood} onChange={event => setMood(event.target.value)}><option value="">Todos os moods</option>{Object.entries(moods).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}</select>{(q || mood || status) && <button className="text-link" onClick={() => { setParams({}); setMood(''); setStatus(''); }}>Limpar</button>}</div>{!data?.length ? <Empty title="Sua biblioteca está vazia" description="Use Descobrir para pesquisar e adicionar animes." action /> : filtered.length ? <><p className="result-count">{filtered.length} {filtered.length === 1 ? 'anime' : 'animes'}</p><div className="anime-grid">{filtered.map(renderCard)}</div></> : <Empty title="Nenhum anime encontrado" description="Altere a pesquisa ou limpe os filtros." />}</section></>}<section className="draw-banner"><div><h2>Sorteio por mood</h2><p>Descubra um anime do catálogo público do MyAnimeList.</p></div><Link className="button secondary" to="/sorteio">Abrir sorteio</Link></section></>;
}
