import { useCallback, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AnimeForm } from '../components/AnimeForm';
import { CatalogSearch } from '../components/CatalogSearch';
import { Cover, ErrorMessage, Loading } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { useResource } from '../hooks/useResource';
import { catalogToRequest, moods, type AnimeRequest, type CatalogAnime, type Draw } from '../types';
import { displayGenres, formatPublicScore } from '../components/LocalizedText';
export function AnimeEditorPage() {
  const { id } = useParams(); const [params] = useSearchParams(); const malId = params.get('malId');
  const location = useLocation(); const drawn = location.state?.draw as Draw | undefined;
  const { api } = useAuth(); const navigate = useNavigate();
  const [manual, setManual] = useState(false);
  const loader = useCallback(async (signal: AbortSignal) => {
    if (id) { const anime = await api.get(id, signal); return { initial: anime, catalog: undefined, localization: anime.localization }; }
    if (malId) { const catalog = await api.catalogDetails(malId, signal); return { initial: catalogToRequest(catalog), catalog, localization: catalog.localization }; }
    if (drawn?.malId) {
      const catalog: CatalogAnime = { malId: drawn.malId, title: drawn.animeTitle, coverUrl: drawn.coverUrl,
        synopsis: drawn.synopsis ?? null, genres: drawn.genres ?? [], totalEpisodes: drawn.totalEpisodes ?? 0,
        publicScore: drawn.publicScore ?? null, mediaType: null, airingStatus: null, year: drawn.year,
        suggestedMood: drawn.identifiedMood ?? null, moodScores: { FUN: 0, RELAXED: 0, ACTION: 0, EMOTIONAL: 0, DARK: 0 }, moodReasons: [], localization: drawn.localization };
      return { initial: catalogToRequest(catalog), catalog, localization: drawn.localization };
    }
    return { initial: undefined, catalog: undefined, localization: undefined };
  }, [id, malId, api, drawn]);
  const { data, loading, error, reload } = useResource(loader);
  const [busy, setBusy] = useState(false); const [saveError, setSaveError] = useState('');
  async function save(values: AnimeRequest) {
    if (busy) return; setBusy(true); setSaveError('');
    try { const anime = id ? await api.update(Number(id), values) : await api.create(values); navigate('/animes/' + anime.id, { replace: true }); }
    catch (error) { setSaveError(error instanceof Error ? error.message : 'Não foi possível salvar.'); }
    finally { setBusy(false); }
  }
  const catalog = data?.catalog;
  return <div className="editor-container"><Link className="text-link back-link" to={id ? '/animes/' + id : '/'}>Voltar à biblioteca</Link><div className="page-intro"><div><h1>{id ? 'Editar anime' : 'Adicionar anime'}</h1><p className="muted">{id ? 'Atualize os dados e o progresso.' : 'Pesquise no MyAnimeList para preencher os dados automaticamente.'}</p></div></div>{loading ? <Loading /> : error ? <ErrorMessage message={error} retry={reload} /> : <>{!id && !malId && !drawn?.malId && <><CatalogSearch onSelect={selected => { setManual(false); navigate('/animes/novo?malId=' + selected); }} /><button className="text-link manual-toggle" onClick={() => setManual(!manual)}>{manual ? 'Fechar cadastro manual' : 'Cadastrar manualmente'}</button></>}{catalog && <section className="catalog-preview panel"><Cover key={catalog.coverUrl} url={catalog.coverUrl} title={catalog.title} /><div><p className="source-label">Dados do MyAnimeList</p><h2>{catalog.title}</h2><p>{displayGenres(catalog).join(', ') || 'Gêneros não informados'} · {catalog.totalEpisodes || '?'} episódios</p>{catalog.localization?.airingStatus && <p>{catalog.localization.mediaType} · {catalog.localization.airingStatus}</p>}{!!catalog.studios?.length && <p>Estúdios: {catalog.studios.join(', ')}</p>}<p>Nota pública MAL: {formatPublicScore(catalog.publicScore)} — não é sua nota pessoal.</p><p><strong>Mood sugerido: {catalog.suggestedMood ? moods[catalog.suggestedMood].label : 'Indefinido'}</strong></p><p className="field-help">Você pode alterar o mood no formulário. Empates ou dados insuficientes não geram uma sugestão.</p>{catalog.moodReasons.length > 0 && <details><summary>Critérios da sugestão</summary><ul>{(catalog.localization?.moodReasons ?? catalog.moodReasons).map(reason => <li key={reason}>{reason}</li>)}</ul></details>}<Link className="text-link" to="/animes/novo">Escolher outro anime</Link></div></section>}{(id || catalog || manual) && <AnimeForm key={id || malId || drawn?.malId || 'manual'} initial={data?.initial} localization={data?.localization} onSave={save} busy={busy} error={saveError} />}</>}</div>;
}
