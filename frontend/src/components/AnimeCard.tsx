import { Link } from 'react-router-dom';
import { type Anime, moods, statuses } from '../types';
import { Cover } from './UI';
import { displayGenres } from './LocalizedText';
export function Progress({ anime }: { anime: Anime }) {
  const percent = anime.totalEpisodes > 0 ? Math.min(100, anime.episodesWatched / anime.totalEpisodes * 100) : 0;
  return <div className="progress-block"><div className="progress-caption"><span>Episódios</span><strong>{anime.episodesWatched} <span>/ {anime.totalEpisodes || '?'}</span></strong></div><div role="progressbar" aria-label={'Progresso de ' + anime.title} aria-valuemin={0} aria-valuemax={anime.totalEpisodes || undefined} aria-valuenow={anime.episodesWatched} aria-valuetext={anime.episodesWatched + ' de ' + (anime.totalEpisodes || 'total desconhecido') + ' episódios'} className={'progress-track ' + (anime.status === 'COMPLETED' ? 'complete' : '')}><span style={{ width: percent + '%' }} /></div></div>;
}
export function AnimeCard({ anime, onProgress, busy }: { anime: Anime; onProgress: (anime: Anime) => void; busy: boolean }) {
  const finished = anime.totalEpisodes > 0 && anime.episodesWatched >= anime.totalEpisodes;
  return <article className="anime-card"><Link className="poster-link" to={'/animes/' + anime.id}><Cover key={anime.coverUrl} url={anime.coverUrl} title={anime.title} /><span className={'badge status-' + anime.status}>{statuses[anime.status]}</span>{anime.score !== null && <span className="score">Minha nota: {anime.score}</span>}</Link><div className="card-info"><Link to={'/animes/' + anime.id} className="card-title">{anime.title}</Link><p className="card-genres" title={displayGenres(anime).join(', ')}>{displayGenres(anime).join(', ') || 'Gêneros não informados'}</p><span className="mood-text">{anime.mood ? moods[anime.mood].label : 'Mood indefinido'}</span><Progress anime={anime} /><button className="episode-button" disabled={busy || finished || anime.episodesWatched >= 2147483647} onClick={() => onProgress(anime)} aria-label={'Adicionar um episódio assistido a ' + anime.title}>{busy ? 'Aguarde…' : finished ? 'Concluído' : '+1 episódio'}</button></div></article>;
}
