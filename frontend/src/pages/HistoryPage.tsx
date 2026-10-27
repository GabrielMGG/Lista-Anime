import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useResource } from '../hooks/useResource';
import { moods } from '../types';
import { displayGenres, LocalizedSynopsis } from '../components/LocalizedText';
import { Cover, Empty, ErrorMessage, Loading, formatDate } from '../components/UI';
export function HistoryPage() {
  const { api } = useAuth(); const loader = useCallback((signal: AbortSignal) => api.history(signal), [api]);
  const { data, loading, error, reload } = useResource(loader);
  return <><div className="page-intro"><div><h1>Histórico de sorteios</h1><p className="muted">Resultados globais e registros antigos preservados.</p></div><Link className="button primary" to="/sorteio">Novo sorteio</Link></div>{loading ? <Loading /> : error ? <ErrorMessage message={error} retry={reload} /> : !data?.length ? <Empty title="Nenhum sorteio registrado" description="Os resultados do catálogo global aparecerão aqui, mesmo sem adicionar os animes à biblioteca." /> : <><p className="result-count">{data.length} resultados · Dados registrados no momento do sorteio</p><div className="history-grid">{data.map(item => <article className="history-card panel" key={item.id}><Cover key={item.coverUrl} url={item.coverUrl} title={item.animeTitle} /><div><p className="source-label">{item.malId ? 'MyAnimeList · Catálogo global' : 'Biblioteca · Registro antigo'}</p><h2>{item.animeTitle}</h2><p>{displayGenres(item).join(', ')}</p>{item.synopsis && <details className="history-synopsis"><summary>Sinopse</summary><LocalizedSynopsis original={item.synopsis} localization={item.localization} /></details>}<p>{item.mood ? 'Filtro: ' + moods[item.mood].label : 'Sem filtro de mood'}</p>{item.malId && <><p>Mood identificado: {item.identifiedMood ? moods[item.identifiedMood].label : 'Indefinido'} · {item.year || 'Ano não informado'}</p><a className="text-link" href={'https://myanimelist.net/anime/' + item.malId} target="_blank" rel="noopener noreferrer">Ver no MyAnimeList</a></>}<p><time dateTime={item.drawnAt}>{formatDate(item.drawnAt)}</time></p></div></article>)}</div><p className="field-help">Filtro solicitado e mood identificado são informações distintas. Registros antigos não recebem metadados inventados.</p></>}</>;
}
