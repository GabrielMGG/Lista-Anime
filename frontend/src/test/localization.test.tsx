import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { displayGenres, formatPublicScore, LocalizedSynopsis } from '../components/LocalizedText';
import { AnimeForm } from '../components/AnimeForm';
import { AnimeCard } from '../components/AnimeCard';
import { catalogToRequest, toRequest, type Anime, type CatalogAnime, type LocalizationView } from '../types';
const view: LocalizationView = { language: 'pt-BR', synopsis: 'Naruto Uzumaki treina em Konoha.', synopsisStatus: 'ORIGINAL',
  genres: ['Ação', 'Aventura'], mediaType: 'TV', airingStatus: 'Exibição concluída', moodReasons: ['Ação: Ação +4'], untranslatedGenres: [] };
const anime: Anime = { id: 20, title: 'Naruto', synopsis: 'Naruto Uzumaki trains in Konoha.', coverUrl: null,
  genres: 'Action, Adventure', totalEpisodes: 220, episodesWatched: 3, status: 'WATCHING', mood: 'ACTION', score: 9,
  notes: 'Minha anotação privada', createdAt: '', updatedAt: '', localization: view };
describe('Localização pt-BR de exibição', () => {
  it('exibe a sinopse inglesa original e ignora texto alternativo nos metadados', () => {
    render(<LocalizedSynopsis original={anime.synopsis} localization={view} />);
    expect(screen.getByText(anime.synopsis!, { selector: 'p' })).toBeInTheDocument();
    expect(screen.queryByText(view.synopsis!)).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByText(/tradução/i)).not.toBeInTheDocument();
  });
  it.each([null, undefined, ''])('mostra ausência de sinopse para %s sem usar metadados alternativos', original => {
    render(<LocalizedSynopsis original={original} localization={view} />);
    expect(screen.getByText('Sinopse não disponível.')).toBeInTheDocument();
    expect(screen.queryByText(view.synopsis!)).not.toBeInTheDocument();
  });
  it('mostra gêneros em português e preserva título e conteúdo bruto para PUT de progresso', () => {
    render(<MemoryRouter><AnimeCard anime={anime} busy={false} onProgress={vi.fn()} /></MemoryRouter>);
    expect(screen.getByRole('link', { name: /^Naruto$/ })).toBeInTheDocument();
    expect(screen.getByText('Ação, Aventura')).toBeInTheDocument();
    const request = toRequest(anime); expect(request.title).toBe('Naruto'); expect(request.synopsis).toBe(anime.synopsis);
    expect(request.genres).toBe('Action, Adventure'); expect(request.notes).toBe(anime.notes); expect(request).not.toHaveProperty('localization');
  });
  it('formulário mostra sinopse original sem alterar dados pessoais ou metadados', async () => {
    const save = vi.fn().mockResolvedValue(undefined); const user = userEvent.setup();
    render(<MemoryRouter><AnimeForm initial={anime} localization={view} busy={false} error="" onSave={save} /></MemoryRouter>);
    expect(screen.getByText(anime.synopsis!, { selector: 'p' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Salvar anime' }));
    expect(save).toHaveBeenCalledWith(toRequest(anime));
  });
  it('importação preserva title principal e originais, mesmo com camada localizada', () => {
    const catalog: CatalogAnime = { malId: 52991, title: 'Sousou no Frieren', coverUrl: null, synopsis: 'Frieren travels with Himmel.',
      genres: ['Adventure', 'Drama'], totalEpisodes: 28, publicScore: 9.1, mediaType: 'tv', airingStatus: 'finished_airing',
      suggestedMood: 'EMOTIONAL', moodScores: { FUN: 0, RELAXED: 0, ACTION: 2, EMOTIONAL: 4, DARK: 0 }, moodReasons: [], localization: view };
    expect(catalogToRequest(catalog)).toMatchObject({ title: 'Sousou no Frieren', synopsis: catalog.synopsis, genres: 'Adventure, Drama', score: null });
  });
  it('formata nota pública em pt-BR, sem modificar o valor numérico', () => {
    expect(formatPublicScore(8.75, 2)).toBe('8,75'); expect(formatPublicScore(null)).toBe('Não disponível');
    expect(displayGenres({ genres: 'Custom genre' })).toEqual(['Custom genre']);
  });
});
