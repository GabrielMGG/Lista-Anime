import { Navigate, Route, Routes, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { AuthPage } from './pages/AuthPage';
import { LibraryPage } from './pages/LibraryPage';
import { AnimeEditorPage } from './pages/AnimeEditorPage';
import { AnimeDetailsPage } from './pages/AnimeDetailsPage';
import { DrawPage } from './pages/DrawPage';
import { HistoryPage } from './pages/HistoryPage';
import { DiscoverPage } from './pages/DiscoverPage';
function ProtectedLayout() { const { session } = useAuth(); return session ? <Layout /> : <Navigate to="/entrar" replace />; }
export default function App() {
  return <Routes><Route path="/entrar" element={<AuthPage key="login" />} /><Route path="/cadastro" element={<AuthPage key="signup" signup />} /><Route element={<ProtectedLayout />}><Route index element={<LibraryPage />} /><Route path="descobrir" element={<DiscoverPage />} /><Route path="animes/novo" element={<AnimeEditorPage key="new" />} /><Route path="animes/:id" element={<AnimeDetailsPage />} /><Route path="animes/:id/editar" element={<AnimeEditorPage key="edit" />} /><Route path="sorteio" element={<DrawPage />} /><Route path="historico" element={<HistoryPage />} /><Route path="*" element={<div className="empty"><h1>Página não encontrada.</h1><Link className="button primary" to="/">Voltar para minha lista</Link></div>} /></Route></Routes>;
}
