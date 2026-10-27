import type { LocalizationView } from '../types';

type GenreSource = { genres?: string[] | string | null; localization?: LocalizationView };
export function formatPublicScore(value: number | null | undefined, digits = 1): string {
  return value == null ? 'Não disponível' : new Intl.NumberFormat('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
}
export function displayGenres(data: GenreSource): string[] {
  return data.localization?.genres ?? (Array.isArray(data.genres) ? data.genres : data.genres?.split(',').map(value => value.trim()).filter(Boolean) || []);
}
export function LocalizedSynopsis({ original, className = 'preserve-text' }: {
  original?: string | null; localization?: LocalizationView; className?: string;
}) {
  return <div className="localized-synopsis"><p className={className}>{original || 'Sinopse não disponível.'}</p></div>;
}
