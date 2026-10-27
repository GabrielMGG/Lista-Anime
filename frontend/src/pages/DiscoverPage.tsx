import { useNavigate } from 'react-router-dom';
import { CatalogSearch } from '../components/CatalogSearch';
export function DiscoverPage() {
  const navigate = useNavigate();
  return <><div className="page-intro"><div><h1>Descobrir animes</h1><p className="muted">Pesquise no catálogo oficial e selecione um anime para ver seus dados.</p></div></div><CatalogSearch onSelect={id => navigate('/animes/novo?malId=' + id)} /></>;
}
