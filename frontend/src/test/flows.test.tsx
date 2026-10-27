import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AnimeForm } from '../components/AnimeForm';
import { AuthProvider, useAuth } from '../context/AuthContext';
function AuthProbe() {
  const { session, login, logout } = useAuth();
  return <><span>{session ? 'Autenticado' : 'Visitante'}</span><button onClick={() => void login('teste@example.com', 'senha-local')}>Entrar</button><button onClick={logout}>Sair</button></>;
}
describe('Fluxos isolados, sem dados reais', () => {
  it('valida credenciais em GET /anime-list, não persiste a sessão e limpa no logout', async () => {
    const user = userEvent.setup();
    const fetch = vi.fn().mockResolvedValue(new Response('[]', { status: 200 })); vi.stubGlobal('fetch', fetch);
    const local = vi.spyOn(Storage.prototype, 'setItem');
    const first = render(<AuthProvider><AuthProbe /></AuthProvider>);
    await user.click(screen.getByText('Entrar')); await screen.findByText('Autenticado');
    expect(fetch.mock.calls[0][0]).toMatch(/\/anime-list$/); expect(fetch.mock.calls[0][1].headers.Authorization).toMatch(/^Basic /);
    expect(local).not.toHaveBeenCalled();
    await user.click(screen.getByText('Sair')); expect(screen.getByText('Visitante')).toBeInTheDocument();
    first.unmount(); render(<AuthProvider><AuthProbe /></AuthProvider>); expect(screen.getByText('Visitante')).toBeInTheDocument();
    local.mockRestore();
  });
  it('envia um formulário completo e COMPLETED quando assistidos iguala o total positivo', async () => {
    const save = vi.fn().mockResolvedValue(undefined); const user = userEvent.setup();
    render(<MemoryRouter><AnimeForm busy={false} error="" onSave={save} /></MemoryRouter>);
    await user.type(screen.getByLabelText(/Título/), 'História de teste');
    fireEvent.change(screen.getByLabelText(/Total de episódios/), { target: { value: '12' } });
    fireEvent.change(screen.getByLabelText(/Episódios assistidos/), { target: { value: '12' } });
    await user.click(screen.getByRole('button', { name: 'Salvar anime' }));
    await waitFor(() => expect(save).toHaveBeenCalledOnce());
    expect(save.mock.calls[0][0]).toMatchObject({ title: 'História de teste', status: 'COMPLETED', totalEpisodes: 12, episodesWatched: 12, coverUrl: null, synopsis: null, genres: null, mood: null, score: null, notes: null });
  });
  it('bloqueia assistidos acima do total antes de enviar à API', async () => {
    const save = vi.fn();
    const view = render(<MemoryRouter><AnimeForm busy={false} error="" onSave={save} /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText(/Título/), { target: { value: 'Teste' } });
    fireEvent.change(screen.getByLabelText(/Total de episódios/), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText(/Episódios assistidos/), { target: { value: '3' } });
    fireEvent.submit(view.container.querySelector('form')!);
    expect(save).not.toHaveBeenCalled(); expect(screen.getByRole('alert')).toHaveTextContent('assistidos não pode superar');
  });
});
