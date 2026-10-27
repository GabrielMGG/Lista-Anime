package com.animemood.backend.dto;

import com.animemood.backend.entity.Mood;
import com.animemood.backend.entity.WatchStatus;
import java.time.LocalDateTime;

public record AnimeResponse(
        Long id,
        String title,
        String coverUrl,
        String synopsis,
        String genres,
        Integer totalEpisodes,
        Integer episodesWatched,
        WatchStatus status,
        Mood mood,
        Integer score,
        String notes,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalizationView localization
) {
    public AnimeResponse(Long id, String title, String coverUrl, String synopsis, String genres, Integer totalEpisodes,
            Integer episodesWatched, WatchStatus status, Mood mood, Integer score, String notes,
            LocalDateTime createdAt, LocalDateTime updatedAt) {
        this(id, title, coverUrl, synopsis, genres, totalEpisodes, episodesWatched, status, mood, score, notes, createdAt, updatedAt, null);
    }
}
