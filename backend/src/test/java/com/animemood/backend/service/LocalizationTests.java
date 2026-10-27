package com.animemood.backend.service;

import com.animemood.backend.dto.*;
import com.animemood.backend.entity.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;

class LocalizationTests {

    final LocalizationService localization = new LocalizationService();

    @ParameterizedTest @CsvSource({"Action,Ação", "Adventure,Aventura", "Comedy,Comédia", "Fantasy,Fantasia",
        "Psychological,Psicológico", "Martial Arts,Artes marciais", "Slice of Life,Cotidiano",
        "Iyashikei,Relaxante", "Gag Humor,Humor absurdo", "School,Escolar", "Supernatural,Sobrenatural",
        "Sci-Fi,Ficção científica", "Time Travel,Viagem no tempo", "Award Winning,Premiado"})
    void mapsRealGenreAndThemeLabels(String source, String translated) { assertEquals(translated, GenreDictionary.localize(source)); }

    @Test void unknownLabelsAndProperNamesAreNotInvented() {
        assertEquals("New MAL Theme", GenreDictionary.localize("New MAL Theme"));
        assertEquals("ufotable", GenreDictionary.localize("ufotable"));
        assertEquals("Ação", GenreDictionary.localize(" action "));
        assertEquals("Ação", GenreDictionary.localize("Ação"));
    }

    @ParameterizedTest @CsvSource({"20,Naruto", "52991,Sousou no Frieren", "21,One Piece"})
    void localizesDescriptionButNeverTitleOrRawClassificationInputs(long id, String title) {
        var genres = List.of("Adventure", "Fantasy");
        var classification = new MoodClassifier().classify(genres);
        var raw = new CatalogAnimeResponse(id, title, null, "An English synopsis.", genres, 12, 8.2, "tv", "finished_airing",
                classification.principal(), classification.scores(), classification.reasons(), 2023, List.of("ufotable"), null);
        var result = localization.catalog(raw);
        assertEquals(title, result.title()); assertEquals(raw.synopsis(), result.synopsis()); assertEquals(genres, result.genres());
        assertEquals(List.of("Aventura", "Fantasia"), result.localization().genres());
        assertEquals(raw.synopsis(), result.localization().synopsis());
        assertEquals("TV", result.localization().mediaType()); assertEquals("Exibição concluída", result.localization().airingStatus());
        assertEquals(raw.suggestedMood(), result.suggestedMood()); assertEquals(raw.moodScores(), result.moodScores());
        assertEquals(List.of("ufotable"), result.studios());
    }

    @Test void searchPreservesSynopsisAndLocalizesMetadata() {
        var raw = GlobalDrawPoolTests.anime(42, Mood.ACTION);
        var result = localization.catalog(raw);
        assertEquals(List.of("Ação"), result.localization().genres());
        assertEquals("ORIGINAL", result.localization().synopsisStatus());
    }

    @Test void libraryOverlayDoesNotOverwritePersonalDataOrTitles() {
        var raw = new AnimeResponse(1L, "Título já salvo", null, "Original synopsis", "Action, Fantasy", 12, 3,
                WatchStatus.WATCHING, Mood.ACTION, 9, "Minha anotação privada", null, null);
        var result = localization.library(raw);
        assertEquals(raw.title(), result.title()); assertEquals(raw.synopsis(), result.synopsis());
        assertEquals(raw.notes(), result.notes()); assertEquals(9, result.score()); assertEquals(3, result.episodesWatched());
        assertEquals(raw.synopsis(), result.localization().synopsis()); assertEquals(List.of("Ação", "Fantasia"), result.localization().genres());
    }

    @Test void historyKeepsItsOriginalSynopsisAndSnapshot() {
        var raw = new DrawResponse(7L, "Sousou no Frieren", null, null, null, 52991L, "Original synopsis", List.of("Adventure", "Drama"),
                28, 2023, 9.0, Mood.EMOTIONAL, "MYANIMELIST");
        var result = localization.draw(raw);
        assertEquals(raw.animeTitle(), result.animeTitle()); assertEquals(raw.synopsis(), result.synopsis());
        assertEquals(raw.genres(), result.genres()); assertEquals(List.of("Aventura", "Drama"), result.localization().genres());
        assertEquals("ORIGINAL", result.localization().synopsisStatus());
    }
    @Test void originalSynopsisPreservesWhitespaceAndEmptyValues() {
        var raw = new CatalogAnimeResponse(20L, "Naruto", null, "  An English synopsis.\nSecond paragraph.  ",
                List.of("Action"), 12, null, null, null, null, Map.of(), List.of(), null, List.of(), null);
        assertEquals(raw.synopsis(), localization.catalog(raw).localization().synopsis());
        assertEquals("ORIGINAL", localization.catalog(raw).localization().synopsisStatus());
        var empty = new AnimeResponse(1L, "Naruto", null, null, null, 12, 0,
                WatchStatus.PLAN_TO_WATCH, null, null, null, null, null);
        assertNull(localization.library(empty).localization().synopsis());
        assertEquals("EMPTY", localization.library(empty).localization().synopsisStatus());
    }
}
