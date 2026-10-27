package com.animemood.backend.service;

import com.animemood.backend.dto.CatalogAnimeResponse;
import com.animemood.backend.entity.Mood;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.time.*;
import java.util.*;
import java.util.random.RandomGenerator;

/** A bounded, shared sample of real MAL pages; not a uniform sample of all MAL. */
@Service
public class GlobalDrawPool {
    private final MyAnimeListService catalog;
    private final Clock clock;
    private final RandomGenerator random;
    private List<CatalogAnimeResponse> cache = List.of();
    private Instant loadedAt = Instant.MIN;
    private Instant retryAt = Instant.MIN;
    private ResponseStatusException lastFailure;

    @Autowired
    public GlobalDrawPool(MyAnimeListService catalog) { this(catalog, Clock.systemUTC(), new java.security.SecureRandom()); }
    GlobalDrawPool(MyAnimeListService catalog, Clock clock, RandomGenerator random) {
        this.catalog = catalog; this.clock = clock; this.random = random;
    }

    public synchronized List<CatalogAnimeResponse> candidates(Mood mood) {
        Instant now = clock.instant();
        if (!now.isBefore(loadedAt.plusSeconds(900))) {
            if (now.isBefore(retryAt)) {
                if (cache.isEmpty() || !now.isBefore(loadedAt.plusSeconds(3600))) throw lastFailure;
            } else {
                try {
                    Map<Long, CatalogAnimeResponse> unique = new LinkedHashMap<>();
                    // Mix ranking depth and a random historical season. Exactly three requests per refresh.
                    add(unique, catalog.ranking("all", random.nextInt(20) * 50));
                    add(unique, catalog.ranking("bypopularity", (4 + random.nextInt(76)) * 50));
                    int currentYear = Year.now(clock).getValue();
                    int year = 2000 + random.nextInt(Math.max(1, currentYear - 1999));
                    String[] seasons = {"winter", "spring", "summer", "fall"};
                    int seasonLimit = year == currentYear ? (LocalDate.now(clock).getMonthValue() - 1) / 3 + 1 : 4;
                    add(unique, catalog.season(year, seasons[random.nextInt(seasonLimit)]));
                    cache = List.copyOf(unique.values()); loadedAt = now; lastFailure = null;
                } catch (ResponseStatusException error) {
                    lastFailure = error; retryAt = now.plusSeconds(60);
                    if (cache.isEmpty() || !now.isBefore(loadedAt.plusSeconds(3600))) throw error;
                }
            }
        }
        return cache.stream().filter(anime -> mood == null || anime.suggestedMood() == mood).toList();
    }

    public synchronized CatalogAnimeResponse select(List<CatalogAnimeResponse> candidates, Long previousId) {
        if (candidates.isEmpty()) throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                "Nenhum candidato compatível no conjunto temporário do MyAnimeList. Tente outro mood ou aguarde sua renovação.");
        List<CatalogAnimeResponse> alternatives = candidates.stream().filter(a -> !Objects.equals(a.malId(), previousId)).toList();
        List<CatalogAnimeResponse> eligible = alternatives.isEmpty() ? candidates : alternatives;
        return eligible.get(random.nextInt(eligible.size()));
    }

    private static void add(Map<Long, CatalogAnimeResponse> unique, List<CatalogAnimeResponse> page) {
        page.forEach(anime -> unique.putIfAbsent(anime.malId(), anime));
    }
}
