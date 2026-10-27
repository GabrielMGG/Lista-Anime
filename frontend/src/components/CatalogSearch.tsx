import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { CatalogSearch as SearchResult } from '../types';
import { Cover, ErrorMessage, Loading } from './UI';
import { displayGenres, formatPublicScore } from './LocalizedText';

export function CatalogSearch({ onSelect }: { onSelect: (malId: number) => void }) {
  const { api } = useAuth();
  const [query, setQuery] = useState(''); const [searched, setSearched] = useState('');
  const [result, setResult] = useState<SearchResult>(); const [busy, setBusy] = useState(false);
  const [error, setError] = useState(''); const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), [api]);
  async function search(q: string, offset = 0) {
    controller.current?.abort(); const current = new AbortController(); controller.current = current;
    if (q.trim().length < 2) { setError('Digite pelo menos 2 caracteres para pesquisar.'); return; }
    setBusy(true); setError(''); setResult(undefined); setSearched(q.trim());
    try { const response = await api.searchCatalog(q.trim(), offset, current.signal); if (!current.signal.aborted) setResult(response); }
    catch (error) { if (!current.signal.aborted) setError(error instanceof Error ? error.message : 'Falha na pesquisa.'); }
    finally { if (!current.signal.aborted) setBusy(false); }
  }
  function submit(event: FormEvent) { event.preventDefault(); void search(query); }
  return <section className="catalog-section" aria-labelledby="catalog-heading"><div className="section-heading"><h2 id="catalog-heading">Pesquisar no MyAnimeList</h2><span className="source-label">Catálogo oficial</span></div><form className="catalog-search" onSubmit={submit} role="search"><input aria-label="Nome do anime no MyAnimeList" value={query} onChange={e => setQuery(e.target.value)} minLength={2} maxLength={100} required placeholder="Pesquisar anime pelo nome" /><button className="button primary" disabled={busy}><Search size={16} />{busy ? 'Pesquisando…' : 'Pesquisar'}</button></form><p className="field-help">Selecione um resultado para importar capa, sinopse, gêneros e episódios.</p>{error && <ErrorMessage message={error} retry={() => void search(searched || query)} />}{busy && <Loading />}{result && <><p className="result-count">{result.items.length} resultados nesta página para “{searched}”</p>{result.items.length ? <div className="catalog-grid">{result.items.map(anime => <article className="catalog-card" key={anime.malId}><button className="catalog-select" onClick={() => onSelect(anime.malId)} aria-label={`Selecionar ${anime.title}`}><Cover key={anime.coverUrl} url={anime.coverUrl} title={anime.title} /><strong>{anime.title}</strong></button><p>{anime.localization?.mediaType || anime.mediaType?.toUpperCase() || 'Formato não informado'} · {anime.totalEpisodes || '?'} ep.</p><p>{displayGenres(anime).join(', ') || 'Gêneros não informados'}</p>{anime.publicScore !== null && <p>Nota MAL: {formatPublicScore(anime.publicScore)}</p>}<button className="button secondary full" onClick={() => onSelect(anime.malId)}>Selecionar</button></article>)}</div> : <p className="inline-empty">Nenhum anime encontrado. Tente outro nome.</p>}<div className="pagination"><button className="button secondary" disabled={!result.offset} onClick={() => void search(searched, Math.max(0, result.offset - result.limit))}>Anterior</button><span>Página {Math.floor(result.offset / result.limit) + 1}</span><button className="button secondary" disabled={!result.hasNext || result.offset >= 10000} onClick={() => void search(searched, result.offset + result.limit)}>Próxima</button></div></>}</section>;
}
