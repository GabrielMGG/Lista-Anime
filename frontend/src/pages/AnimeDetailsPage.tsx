import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useResource } from '../hooks/useResource';
import { moods, statuses, toRequest } from '../types';
import { Cover, ErrorMessage, Loading, formatDate } from '../components/UI';
import { Progress } from '../components/AnimeCard';
import { displayGenres, LocalizedSynopsis } from '../components/LocalizedText';
export function AnimeDetailsPage() {
  const { id = '' } = useParams(); const { api } = useAuth(); const navigate = useNavigate();
  const loader = useCallback((signal: AbortSignal) => api.get(id, signal), [id, api]);
  const { data: anime, setData, error, loading, reload } = useResource(loader);
  const [busy, setBusy] = useState(false); const [actionError, setActionError] = useState('');
  const [notice, setNotice] = useState(''); const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { setActionError(''); setNotice(''); }, [id]);
  async function increment() {
    if (!anime || busy || anime.episodesWatched >= 2147483647 || (anime.totalEpisodes > 0 && anime.episodesWatched >= anime.totalEpisodes)) return;
    setBusy(true); setActionError('');
    try { setData(await api.update(anime.id, { ...toRequest(anime), episodesWatched: anime.episodesWatched + 1 })); setNotice('Progresso atualizado.'); }
    catch (error) { setActionError(error instanceof Error ? error.message : 'Não foi possível atualizar.'); }
    finally { setBusy(false); }
  }
  async function remove() {
    if (!anime || busy) return; setBusy(true); setActionError('');
    try { await api.remove(anime.id); dialog.current?.close(); navigate('/', { replace: true }); }
    catch (error) { dialog.current?.close(); setActionError(error instanceof Error ? error.message : 'Não foi possível excluir.'); }
    finally { setBusy(false); }
  }
  if (loading) return <Loading />;
  if (error || !anime) return <><Link className="text-link" to="/">Voltar à lista</Link><ErrorMessage message={error || 'Anime não encontrado.'} retry={reload} /></>;
  return <><Link className="text-link back-link" to="/"><ArrowLeft size={17} />Minha lista</Link><section className="detail-layout"><Cover key={anime.coverUrl} className="detail-cover" url={anime.coverUrl} title={anime.title} /><div className="detail-copy"><div className="detail-badges"><span className={`badge status-${anime.status}`}>{statuses[anime.status]}</span>{anime.mood && <span className={`mood-text mood-${anime.mood}`}>{moods[anime.mood].label}</span>}{anime.score !== null && <span className="rating">Minha nota: {anime.score}<small>/10</small></span>}</div><h1>{anime.title}</h1><p className="muted">{displayGenres(anime).join(', ') || 'Gêneros não informados'}</p><div className="detail-progress panel"><Progress anime={anime} /><button className="button primary" onClick={increment} disabled={busy || anime.episodesWatched >= 2147483647 || (anime.totalEpisodes > 0 && anime.episodesWatched >= anime.totalEpisodes)}><Plus size={17} />{busy ? 'Salvando…' : 'Mais um episódio'}</button><small>Ao atingir o total positivo, seu anime fica Concluído.</small></div><p className="success-text" role="status">{notice}</p>{actionError && <ErrorMessage message={actionError} />}<div className="detail-actions"><Link className="button secondary" to={`/animes/${anime.id}/editar`}><Pencil size={17} />Editar anime</Link><button className="button danger-quiet" onClick={() => dialog.current?.showModal()} disabled={busy}><Trash2 size={17} />Excluir</button></div></div></section><section className="detail-text-grid"><div className="panel"><h2>Sobre o anime</h2><LocalizedSynopsis original={anime.synopsis} localization={anime.localization} /></div><div className="panel"><h2>Minhas anotações</h2><p className="preserve-text">{anime.notes || 'Nenhuma anotação.'}</p></div></section><p className="timestamps">Adicionado em {formatDate(anime.createdAt)} · Atualizado em {formatDate(anime.updatedAt)}</p><dialog ref={dialog} className="confirm-dialog" aria-labelledby="delete-title" onCancel={event => { if (busy) event.preventDefault(); }}><button className="dialog-close icon-button" aria-label="Fechar confirmação" disabled={busy} onClick={() => dialog.current?.close()}><X size={20} /></button><h2 id="delete-title">Remover da sua lista?</h2><p>“{anime.title}” e seu progresso serão excluídos. Essa ação não pode ser desfeita.</p><div className="form-actions"><button className="button secondary" disabled={busy} onClick={() => dialog.current?.close()}>Manter anime</button><button className="button danger" disabled={busy} onClick={remove}>{busy ? 'Excluindo…' : 'Sim, excluir'}</button></div></dialog></>;
}
