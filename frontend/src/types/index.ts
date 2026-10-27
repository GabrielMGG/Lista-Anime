export const statuses = {
  PLAN_TO_WATCH: 'Quero assistir', WATCHING: 'Assistindo', COMPLETED: 'Concluído',
  ON_HOLD: 'Em pausa', DROPPED: 'Abandonado',
} as const;
export const moods = {
  FUN: { label: 'Diversão', description: 'Comédia e humor' },
  RELAXED: { label: 'Relaxar', description: 'Cotidiano e tranquilidade' },
  ACTION: { label: 'Ação', description: 'Ação e aventura' },
  EMOTIONAL: { label: 'Emoção', description: 'Drama e romance' },
  DARK: { label: 'Sombrio', description: 'Terror e suspense' },
} as const;
export type Mood = keyof typeof moods;
export type WatchStatus = keyof typeof statuses;
export interface LocalizationView {
  language: 'pt-BR'; synopsis: string | null;
  synopsisStatus: 'ORIGINAL' | 'EMPTY';
  genres: string[]; mediaType: string | null; airingStatus: string | null;
  moodReasons: string[]; untranslatedGenres: string[];
}
export interface AnimeRequest {
  title: string; coverUrl: string | null; synopsis: string | null; genres: string | null;
  totalEpisodes: number; episodesWatched: number; status: WatchStatus; mood: Mood | null;
  score: number | null; notes: string | null;
}
export interface Anime extends AnimeRequest { id: number; createdAt: string; updatedAt: string; localization?: LocalizationView }
export interface Draw {
  id: number; animeTitle: string; coverUrl: string | null; mood: Mood | null; drawnAt: string;
  malId?: number | null; synopsis?: string | null; genres?: string[]; totalEpisodes?: number | null;
  year?: number | null; publicScore?: number | null; identifiedMood?: Mood | null;
  source?: 'MYANIMELIST' | 'PERSONAL_LEGACY';
  localization?: LocalizationView;
}
export interface RegisterRequest { name: string; email: string; password: string }
export interface CatalogAnime {
  malId: number; title: string; coverUrl: string | null; synopsis: string | null; genres: string[];
  totalEpisodes: number; publicScore: number | null; mediaType: string | null; airingStatus: string | null;
  suggestedMood: Mood | null; moodScores: Record<Mood, number>; moodReasons: string[];
  year?: number | null;
  studios?: string[]; localization?: LocalizationView;
}
export interface CatalogSearch { items: CatalogAnime[]; offset: number; limit: number; hasNext: boolean }
export function catalogToRequest(anime: CatalogAnime): AnimeRequest {
  return { title: anime.title, coverUrl: anime.coverUrl, synopsis: anime.synopsis, genres: anime.genres.join(', ') || null,
    totalEpisodes: anime.totalEpisodes, episodesWatched: 0, status: 'PLAN_TO_WATCH', mood: anime.suggestedMood,
    score: null, notes: null };
}
export function toRequest(anime: Anime): AnimeRequest {
  const { title, coverUrl, synopsis, genres, totalEpisodes, episodesWatched, status, mood, score, notes } = anime;
  return { title, coverUrl, synopsis, genres, totalEpisodes, episodesWatched, status, mood, score, notes };
}
