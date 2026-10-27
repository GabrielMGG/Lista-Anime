package com.animemood.backend.dto;

import java.util.List;

/** Read-only display overlay. Original fields and titles always remain untouched. */
public record LocalizationView(String language, String synopsis, String synopsisStatus,
                               List<String> genres, String mediaType, String airingStatus,
                               List<String> moodReasons, List<String> untranslatedGenres) {}
