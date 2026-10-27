package com.animemood.backend.dto;

import com.animemood.backend.entity.Mood;
import java.util.List;
import java.util.Map;

public record CatalogAnimeResponse(
        long malId, String title, String coverUrl, String synopsis, List<String> genres,
        int totalEpisodes, Double publicScore, String mediaType, String airingStatus,
        Mood suggestedMood, Map<Mood, Integer> moodScores, List<String> moodReasons, Integer year,
        List<String> studios, LocalizationView localization) {
    public CatalogAnimeResponse(long malId, String title, String coverUrl, String synopsis, List<String> genres,
            int totalEpisodes, Double publicScore, String mediaType, String airingStatus, Mood suggestedMood,
            Map<Mood, Integer> moodScores, List<String> moodReasons, Integer year) {
        this(malId, title, coverUrl, synopsis, genres, totalEpisodes, publicScore, mediaType, airingStatus,
                suggestedMood, moodScores, moodReasons, year, List.of(), null);
    }
}
