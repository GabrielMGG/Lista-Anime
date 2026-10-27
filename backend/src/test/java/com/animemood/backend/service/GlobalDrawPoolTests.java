package com.animemood.backend.service;

import com.animemood.backend.dto.CatalogAnimeResponse;
import com.animemood.backend.entity.Mood;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.time.*;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;

class GlobalDrawPoolTests {
    final MyAnimeListService catalog = mock(MyAnimeListService.class);
    final MutableClock clock = new MutableClock();
    final GlobalDrawPool pool = new GlobalDrawPool(catalog, clock, new Random(3));
    static CatalogAnimeResponse anime(long id, Mood mood) {
        return new CatalogAnimeResponse(id, "Fixture " + id, null, "Sinopse", List.of("Action"), 12, 8.0,
                "tv", "finished_airing", mood, Map.of(), List.of(), 2020);
    }
    void pages() {
        when(catalog.ranking(eq("all"), anyInt())).thenReturn(List.of(anime(1, Mood.ACTION), anime(2, Mood.FUN)));
        when(catalog.ranking(eq("bypopularity"), anyInt())).thenReturn(List.of(anime(1, Mood.ACTION), anime(3, null)));
        when(catalog.season(anyInt(), anyString())).thenReturn(List.of(anime(4, Mood.DARK)));
    }
    @Test void mixesSourcesDeduplicatesAndCachesAcrossMoods() {
        pages(); assertEquals(4, pool.candidates(null).size());
        assertEquals(List.of(1L), pool.candidates(Mood.ACTION).stream().map(CatalogAnimeResponse::malId).toList());
        pool.candidates(Mood.FUN);
        verify(catalog, times(2)).ranking(anyString(), anyInt()); verify(catalog).season(anyInt(), anyString());
    }
    @Test void unclassifiedAnimeOnlyParticipatesWithoutFilter() {
        pages(); assertTrue(pool.candidates(null).stream().anyMatch(a -> a.malId() == 3));
        assertTrue(pool.candidates(Mood.RELAXED).isEmpty());
        assertEquals(404, assertThrows(ResponseStatusException.class, () -> pool.select(List.of(), null)).getStatusCode().value());
    }
    @Test void excludesPreviousWhenAlternativesExist() {
        var choices = List.of(anime(1, Mood.ACTION), anime(2, Mood.ACTION));
        for (int i = 0; i < 30; i++) assertEquals(2, pool.select(choices, 1L).malId());
        assertEquals(1, pool.select(List.of(choices.getFirst()), 1L).malId());
    }
    @Test void usesRandomIndexRatherThanAlwaysSelectingFirst() {
        var random = mock(java.util.random.RandomGenerator.class);
        when(random.nextInt(3)).thenReturn(2, 0, 1);
        var sampler = new GlobalDrawPool(catalog, clock, random);
        var choices = List.of(anime(1, null), anime(2, null), anime(3, null));
        assertEquals(3, sampler.select(choices, null).malId()); assertEquals(1, sampler.select(choices, null).malId());
        assertEquals(2, sampler.select(choices, null).malId());
    }
    @Test void refreshesAfterTtl() {
        pages(); pool.candidates(null); clock.advance(901); pool.candidates(null);
        verify(catalog, times(4)).ranking(anyString(), anyInt()); verify(catalog, times(2)).season(anyInt(), anyString());
    }
    @Test void errorsDoNotInventCandidatesAndBackOff() {
        when(catalog.ranking(eq("all"), anyInt())).thenThrow(new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE));
        assertEquals(503, assertThrows(ResponseStatusException.class, () -> pool.candidates(null)).getStatusCode().value());
        assertThrows(ResponseStatusException.class, () -> pool.candidates(null));
        verify(catalog).ranking(anyString(), anyInt()); verifyNoMoreInteractions(catalog);
    }
    @Test void preservesRealStaleCacheBrieflyButNotIndefinitely() {
        pages(); pool.candidates(null); clock.advance(901);
        when(catalog.ranking(eq("all"), anyInt())).thenThrow(new ResponseStatusException(HttpStatus.GATEWAY_TIMEOUT));
        assertEquals(4, pool.candidates(null).size());
        clock.advance(2800);
        assertEquals(504, assertThrows(ResponseStatusException.class, () -> pool.candidates(null)).getStatusCode().value());
    }
    @Test void emptySuccessfulPoolIsCachedWithoutRepeatedRequests() {
        when(catalog.ranking(anyString(), anyInt())).thenReturn(List.of()); when(catalog.season(anyInt(), anyString())).thenReturn(List.of());
        assertTrue(pool.candidates(null).isEmpty()); assertTrue(pool.candidates(Mood.FUN).isEmpty());
        verify(catalog,times(2)).ranking(anyString(),anyInt()); verify(catalog).season(anyInt(),anyString());
    }
    static class MutableClock extends Clock {
        Instant now = Instant.parse("2026-10-26T15:00:00Z");
        void advance(int seconds) { now = now.plusSeconds(seconds); }
        public ZoneId getZone() { return ZoneOffset.UTC; }
        public Clock withZone(ZoneId zone) { return this; }
        public Instant instant() { return now; }
    }
}
