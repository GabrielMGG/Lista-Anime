package com.animemood.backend.service;

import com.animemood.backend.dto.*;
import java.util.*;
import org.springframework.stereotype.Service;

@Service
public class LocalizationService {
    static LocalizationService disabled() { return new LocalizationService(); }

    private LocalizationView view(String synopsis, List<String> genres, String media, String status,
                                  List<String> reasons) {
        List<String> sourceGenres = genres == null ? List.of() : genres;
        List<String> localizedReasons = reasons == null ? List.of() : reasons.stream().map(reason -> {
            int colon = reason.indexOf(':');
            if (colon < 0) return reason;
            String moodText = reason.substring(colon + 1).replace("RELAXED", "Relaxar").replace("EMOTIONAL", "Emoção")
                    .replace("ACTION", "Ação").replace("DARK", "Sombrio").replace("FUN", "Diversão");
            return GenreDictionary.localize(reason.substring(0, colon)) + ":" + moodText;
        }).toList();
        return new LocalizationView("pt-BR", synopsis, synopsis == null || synopsis.isBlank() ? "EMPTY" : "ORIGINAL", sourceGenres.stream().map(GenreDictionary::localize).toList(),
                GenreDictionary.mediaType(media), GenreDictionary.airingStatus(status), localizedReasons,
                sourceGenres.stream().filter(genre -> !GenreDictionary.known(genre)).toList());
    }
    public CatalogAnimeResponse catalog(CatalogAnimeResponse anime) {
        var localized = view(anime.synopsis(), anime.genres(), anime.mediaType(), anime.airingStatus(), anime.moodReasons());
        return new CatalogAnimeResponse(anime.malId(), anime.title(), anime.coverUrl(), anime.synopsis(), anime.genres(), anime.totalEpisodes(),
                anime.publicScore(), anime.mediaType(), anime.airingStatus(), anime.suggestedMood(), anime.moodScores(), anime.moodReasons(), anime.year(), anime.studios(), localized);
    }
    public AnimeResponse library(AnimeResponse anime) {
        List<String> genres = anime.genres() == null || anime.genres().isBlank() ? List.of() : Arrays.stream(anime.genres().split(",")).map(String::strip).toList();
        var localized = view(anime.synopsis(), genres, null, null, List.of());
        return new AnimeResponse(anime.id(), anime.title(), anime.coverUrl(), anime.synopsis(), anime.genres(), anime.totalEpisodes(),
                anime.episodesWatched(), anime.status(), anime.mood(), anime.score(), anime.notes(), anime.createdAt(), anime.updatedAt(), localized);
    }
    public DrawResponse draw(DrawResponse draw) {
        var localized = view(draw.synopsis(), draw.genres(), null, null,
                List.of());
        return new DrawResponse(draw.id(), draw.animeTitle(), draw.coverUrl(), draw.mood(), draw.drawnAt(), draw.malId(), draw.synopsis(),
                draw.genres(), draw.totalEpisodes(), draw.year(), draw.publicScore(), draw.identifiedMood(), draw.source(), localized);
    }
}
