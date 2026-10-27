import { useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from './UI';
export function Layout() {
  const { session, logout } = useAuth(); const navigate = useNavigate(); const location = useLocation();
  useEffect(() => { window.scrollTo({ top: 0 }); document.getElementById('main-content')?.focus(); }, [location.pathname]);
  return <><a className="skip-link" href="#main-content">Pular para o conteúdo</a><header className="site-header"><div className="header-inner"><Logo /><nav aria-label="Navegação principal"><NavLink end to="/">Biblioteca</NavLink><NavLink to="/descobrir">Descobrir</NavLink><NavLink to="/sorteio">Sorteio</NavLink><NavLink to="/historico">Histórico</NavLink></nav><div className="account"><span title={session?.email}>{session?.email}</span><button className="button secondary" onClick={() => { logout(); navigate('/entrar', { replace: true }); }}>Sair</button></div></div></header><main id="main-content" tabIndex={-1} className="main-container"><Outlet /></main><footer className="site-footer"><span>Anime Mood · Projeto acadêmico</span><Link to="/historico">Histórico de sorteios</Link></footer></>;
}
