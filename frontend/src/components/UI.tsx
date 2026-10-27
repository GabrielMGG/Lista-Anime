import { useState } from 'react';
import { Link } from 'react-router-dom';
export function Logo() { return <Link to="/" className="logo" aria-label="Anime Mood, início">Anime <span>Mood</span></Link>; }
export function Cover({ url, title, className = '' }: { url: string | null; title: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  const safe = url && /^https?:\/\//i.test(url);
  return <div className={`cover ${className}`}>{safe && !failed ? <img src={url} alt={`Capa de ${title}`} loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} /> : <div className="cover-fallback"><span>{title}</span><small>Capa indisponível</small></div>}</div>;
}
export function Loading() { return <div className="loading" role="status">Carregando…</div>; }
export function ErrorMessage({ message, retry }: { message: string; retry?: () => void }) { return <div role="alert" className="error"><span>{message}</span>{retry && <button type="button" onClick={retry}>Tentar novamente</button>}</div>; }
export function Empty({ title, description, action }: { title: string; description: string; action?: boolean }) { return <div className="empty"><h3>{title}</h3><p>{description}</p>{action && <Link className="button primary" to="/animes/novo">Pesquisar anime</Link>}</div>; }
export function formatDate(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? 'Data indisponível' : new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(date); }
