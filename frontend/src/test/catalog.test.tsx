import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { CatalogSearch } from '../components/CatalogSearch';
import { AnimeEditorPage } from '../pages/AnimeEditorPage';
import { catalogToRequest, type CatalogAnime } from '../types';
import { ApiError } from '../services/api';

const api = vi.hoisted(() => ({ searchCatalog: vi.fn(), catalogDetails: vi.fn(), create: vi.fn() }));
vi.mock('../context/AuthContext', () => ({ useAuth: () => ({ api }) }));
const fixture: CatalogAnime = {
  malId: 42, title: 'Fixture de catálogo', coverUrl: 'https://example.com/cover.jpg', synopsis: 'Sinopse de teste',
  genres: ['Action', 'Adventure'], totalEpisodes: 12, publicScore: 8.75, mediaType: 'tv', airingStatus: 'finished_airing',
  suggestedMood: 'ACTION', moodScores: { FUN: 0, RELAXED: 0, ACTION: 6, EMOTIONAL: 0, DARK: 0 },
  moodReasons: ['Action: ACTION +4', 'Adventure: ACTION +2'],
};
describe('Catálogo oficial — fixtures apenas em testes', () => {
  it('importa metadados e sugestão, mas nunca copia a nota pública para a nota pessoal', () => {
    expect(catalogToRequest(fixture)).toEqual({ title: fixture.title, coverUrl: fixture.coverUrl,
      synopsis: fixture.synopsis, genres: 'Action, Adventure', totalEpisodes: 12, episodesWatched: 0,
      status: 'PLAN_TO_WATCH', mood: 'ACTION', score: null, notes: null });
    expect(catalogToRequest({ ...fixture, suggestedMood: null }).mood).toBeNull();
  });
  it('pesquisa pelo backend, exibe resultados e seleciona o ID MAL', async () => {
    api.searchCatalog.mockResolvedValue({ items: [fixture], offset: 0, limit: 20, hasNext: false });
    const selected = vi.fn(); const user = userEvent.setup();
    render(<CatalogSearch onSelect={selected} />);
    await user.type(screen.getByLabelText('Nome do anime no MyAnimeList'), 'Fixture');
    await user.click(screen.getByRole('button', { name: 'Pesquisar' }));
    await screen.findByText('Fixture de catálogo');
    expect(api.searchCatalog).toHaveBeenCalledWith('Fixture', 0, expect.any(AbortSignal));
    await user.click(screen.getByRole('button', { name: /^Selecionar$/ }));
    expect(selected).toHaveBeenCalledWith(42);
    expect(screen.getByText('Nota MAL: 8,8')).toBeInTheDocument();
  });
  it('exibe indisponibilidade sem preencher resultados de demonstração', async () => {
    api.searchCatalog.mockRejectedValue(new ApiError(503, 'Catálogo MyAnimeList não configurado.'));
    const user = userEvent.setup(); render(<CatalogSearch onSelect={vi.fn()} />);
    await user.type(screen.getByLabelText('Nome do anime no MyAnimeList'), 'Anime');
    await user.click(screen.getByRole('button', { name: 'Pesquisar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('não configurado');
    expect(screen.queryByRole('button', { name: /^Selecionar$/ })).not.toBeInTheDocument();
  });
  it('consulta detalhes, preenche o formulário e permite sobrescrever o mood antes do POST existente', async () => {
    api.catalogDetails.mockResolvedValue(fixture); api.create.mockResolvedValue({ id: 77 });
    const user = userEvent.setup();
    render(<MemoryRouter initialEntries={['/animes/novo?malId=42']}><Routes><Route path="/animes/novo" element={<AnimeEditorPage />} /><Route path="/animes/77" element={<p>Anime salvo</p>} /></Routes></MemoryRouter>);
    await screen.findByText('Mood sugerido: Ação');
    expect(api.catalogDetails).toHaveBeenCalledWith('42', expect.any(AbortSignal));
    expect(screen.getByLabelText(/Título/)).toHaveValue(fixture.title);
    expect(screen.getByLabelText('Minha nota')).toHaveValue(null);
    await user.selectOptions(screen.getByLabelText('Humor'), 'DARK');
    await user.click(screen.getByRole('button', { name: 'Salvar anime' }));
    await waitFor(() => expect(api.create).toHaveBeenCalled());
    expect(api.create.mock.calls.at(-1)?.[0]).toEqual({ ...catalogToRequest(fixture), mood: 'DARK' });
    expect(await screen.findByText('Anime salvo')).toBeInTheDocument();
  });
  it('bloqueia metadados incompatíveis com os limites existentes do banco', async () => {
    api.catalogDetails.mockResolvedValue({ ...fixture, title: 'x'.repeat(201) });
    const view = render(<MemoryRouter initialEntries={['/animes/novo?malId=42']}><Routes><Route path="/animes/novo" element={<AnimeEditorPage />} /></Routes></MemoryRouter>);
    await screen.findByText('Mood sugerido: Ação');
    const before = api.create.mock.calls.length;
    fireEvent.submit(view.container.querySelector('form')!);
    expect(screen.getByRole('alert')).toHaveTextContent('limites');
    expect(api.create.mock.calls.length).toBe(before);
  });
  it('adiciona o resultado global pelo snapshot sem depender de outra consulta ao MAL', async () => {
    const callsBefore = api.catalogDetails.mock.calls.length;
    const draw = { id: 91, malId: 42, animeTitle: fixture.title, coverUrl: fixture.coverUrl,
      synopsis: fixture.synopsis, genres: fixture.genres, totalEpisodes: 12, publicScore: 8.75,
      identifiedMood: 'ACTION', mood: null, drawnAt: '', year: 2020 };
    render(<MemoryRouter initialEntries={[{ pathname: '/animes/novo', state: { draw } }]}><Routes><Route path="/animes/novo" element={<AnimeEditorPage />} /></Routes></MemoryRouter>);
    await screen.findByText('Mood sugerido: Ação');
    expect(screen.getByLabelText(/Título/)).toHaveValue(fixture.title);
    expect(screen.getByLabelText('Minha nota')).toHaveValue(null);
    expect(api.catalogDetails.mock.calls.length).toBe(callsBefore);
  });
});
