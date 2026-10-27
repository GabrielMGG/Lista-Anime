package com.animemood.backend.dto;

import com.animemood.backend.entity.Mood;
import java.time.LocalDateTime;
import java.util.List;

public record DrawResponse(
        Long id,
        String animeTitle,
        String coverUrl,
        Mood mood,
        LocalDateTime drawnAt,
        Long malId, String synopsis, List<String> genres, Integer totalEpisodes,
        Integer year, Double publicScore, Mood identifiedMood, String source, LocalizationView localization
) {
    public DrawResponse(Long id, String animeTitle, String coverUrl, Mood mood, LocalDateTime drawnAt, Long malId,
            String synopsis, List<String> genres, Integer totalEpisodes, Integer year, Double publicScore,
            Mood identifiedMood, String source) {
        this(id, animeTitle, coverUrl, mood, drawnAt, malId, synopsis, genres, totalEpisodes, year, publicScore, identifiedMood, source, null);
    }
}
