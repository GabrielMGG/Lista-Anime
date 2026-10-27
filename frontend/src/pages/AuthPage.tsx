import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { register } from '../services/api';
import { ErrorMessage, Logo } from '../components/UI';
export function AuthPage({ signup = false }: { signup?: boolean }) {
  const { session, login, notice } = useAuth(); const navigate = useNavigate();
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [show, setShow] = useState(false);
  const [registered, setRegistered] = useState(false);
  if (session) return <Navigate to="/" replace />;
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget; const values = new FormData(form);
    const email = String(values.get('email')).trim(); const password = String(values.get('password'));
    const name = String(values.get('name') || '').trim();
    if (email.includes(':') || (signup && !name) || !password.trim()) { setError('Preencha os campos corretamente. O e-mail não pode conter dois-pontos.'); return; }
    setBusy(true); setError('');
    try {
      if (signup) { await register({ name, email, password }); setRegistered(true); form.reset(); }
      else { await login(email, password); form.reset(); navigate('/', { replace: true }); }
    } catch (error) { setError(error instanceof Error ? error.message : 'Não foi possível continuar.'); }
    finally { setBusy(false); }
  }
  return <main className="auth-page"><div className="auth-form-wrap panel"><Logo /><h1>{signup ? 'Criar conta' : 'Entrar'}</h1><p className="muted">{signup ? 'Cadastre-se para organizar sua biblioteca.' : 'Acesse sua biblioteca de animes.'}</p>{notice && <ErrorMessage message={notice} />}{registered ? <div className="success" role="status"><h2>Conta criada</h2><p>Entre com seu e-mail e senha.</p><Link className="button primary" to="/entrar">Entrar</Link></div> : <form onSubmit={submit} className="form-stack"><fieldset disabled={busy}>{signup && <label>Nome<input name="name" required maxLength={100} autoComplete="name" placeholder="Seu nome" /></label>}<label>E-mail<input name="email" type="email" required maxLength={150} autoComplete="username" placeholder="voce@exemplo.com" /></label><label>Senha<div className="password-field"><input name="password" type={show ? 'text' : 'password'} required minLength={signup ? 8 : 1} autoComplete={signup ? 'new-password' : 'current-password'} placeholder={signup ? 'Pelo menos 8 caracteres' : 'Sua senha'} /><button type="button" aria-label={show ? 'Ocultar senha' : 'Mostrar senha'} onClick={() => setShow(!show)}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label></fieldset>{error && <ErrorMessage message={error} />}<button className="button primary full" disabled={busy}>{busy ? 'Aguarde…' : signup ? 'Criar conta' : 'Entrar'}</button></form>}<p className="auth-switch">{signup ? 'Já tem conta?' : 'Não tem conta?'} <Link to={signup ? '/entrar' : '/cadastro'}>{signup ? 'Entrar' : 'Criar conta'}</Link></p><p className="security-note">A sessão fica apenas nesta aba e termina ao recarregar. HTTP Basic exige HTTPS em ambiente publicado.</p></div></main>;
}
