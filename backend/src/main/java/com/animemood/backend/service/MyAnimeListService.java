package com.animemood.backend.service;

import com.animemood.backend.dto.*;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;

@Service
public class MyAnimeListService {
    private static final String FIELDS = "id,title,main_picture,synopsis,genres,num_episodes,mean,media_type,status,start_season,start_date,studios";
    private final RestClient client;
    private final String clientId;
    private final MoodClassifier classifier;

    public MyAnimeListService(@Qualifier("myAnimeListRestClient") RestClient client,
                             @Value("${myanimelist.client-id:}") String clientId, MoodClassifier classifier) {
        this.client = client;
        this.clientId = clientId.strip();
        this.classifier = classifier;
    }

    public CatalogSearchResponse search(String query, int offset) {
        String q = query == null ? "" : query.strip();
        if (q.length() < 2 || q.length() > 100 || offset < 0 || offset > 10000)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pesquise entre 2 e 100 caracteres; offset deve estar entre 0 e 10000.");
        Map<String, Object> body = get("/anime?q={q}&limit=20&offset={offset}&fields={fields}", q, offset, FIELDS);
        Object raw = body.get("data");
        if (!(raw instanceof List<?> data)) throw invalidResponse();
        List<CatalogAnimeResponse> items = data.stream().map(MyAnimeListService::object)
                .map(item -> convert(object(item.get("node")))).toList();
        return new CatalogSearchResponse(items, offset, 20, object(body.get("paging")).get("next") instanceof String);
    }

    public CatalogAnimeResponse details(long malId) {
        if (malId <= 0) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ID do catálogo inválido.");
        return convert(get("/anime/{id}?fields={fields}", malId, FIELDS));
    }

    public List<CatalogAnimeResponse> ranking(String type, int offset) {
        if (!Set.of("all", "bypopularity").contains(type) || offset < 0) throw new IllegalArgumentException("Ranking inválido");
        return nodes(get("/anime/ranking?ranking_type={type}&limit=100&offset={offset}&fields={fields}", type, offset, FIELDS));
    }

    public List<CatalogAnimeResponse> season(int year, String season) {
        if (year < 1917 || !Set.of("winter", "spring", "summer", "fall").contains(season)) throw new IllegalArgumentException("Temporada inválida");
        return nodes(get("/anime/season/{year}/{season}?limit=100&fields={fields}", year, season, FIELDS));
    }

    private List<CatalogAnimeResponse> nodes(Map<String, Object> body) {
        if (!(body.get("data") instanceof List<?> data)) throw invalidResponse();
        return data.stream().map(MyAnimeListService::object).map(item -> convert(object(item.get("node")))).toList();
    }

    private Map<String, Object> get(String uri, Object... variables) {
        if (clientId.isBlank()) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                "Catálogo MyAnimeList não configurado. Defina MAL_CLIENT_ID no backend.");
        try {
            Map<String, Object> body = client.get().uri(uri, variables)
                    .header("X-MAL-CLIENT-ID", clientId)
                    .retrieve().body(new ParameterizedTypeReference<Map<String, Object>>() {});
            if (body == null) throw invalidResponse();
            return body;
        } catch (RestClientResponseException ex) {
            int status = ex.getStatusCode().value();
            if (status == 404) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Anime não encontrado no MyAnimeList.");
            if (status == 429) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Limite do MyAnimeList atingido. Tente mais tarde.");
            // Never forward upstream bodies, headers or exception details (may contain credentials).
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Não foi possível consultar o MyAnimeList. Verifique a configuração do serviço.");
        } catch (ResourceAccessException ex) {
            throw new ResponseStatusException(HttpStatus.GATEWAY_TIMEOUT, "O MyAnimeList não respondeu a tempo. Tente novamente.");
        } catch (RestClientException ex) {
            throw invalidResponse();
        }
    }

    private CatalogAnimeResponse convert(Map<String, Object> anime) {
        if (!(anime.get("id") instanceof Number id) || id.longValue() <= 0 || !(anime.get("title") instanceof String title) || title.isBlank())
            throw invalidResponse();
        Map<String, Object> picture = object(anime.get("main_picture"));
        String cover = string(picture.get("large"));
        if (cover == null) cover = string(picture.get("medium"));
        // MAL exposes genre/theme tags through genres; do not invent a separate themes field.
        List<String> genres = anime.get("genres") instanceof List<?> list ? list.stream()
                .map(MyAnimeListService::object).map(item -> string(item.get("name")))
                .filter(Objects::nonNull).distinct().toList() : List.of();
        MoodClassifier.Classification mood = classifier.classify(genres);
        int episodes = anime.get("num_episodes") instanceof Number n ? Math.max(0, n.intValue()) : 0;
        Double mean = anime.get("mean") instanceof Number n ? n.doubleValue() : null;
        return new CatalogAnimeResponse(id.longValue(), title, cover, string(anime.get("synopsis")), genres,
                episodes, mean, string(anime.get("media_type")), string(anime.get("status")),
                mood.principal(), mood.scores(), mood.reasons(), year(anime), names(anime.get("studios")), null);
    }

    private static Integer year(Map<String, Object> anime) {
        Object year = object(anime.get("start_season")).get("year");
        if (year instanceof Number n) return n.intValue();
        String date = string(anime.get("start_date"));
        if (date != null && date.matches("\\d{4}.*")) return Integer.valueOf(date.substring(0, 4));
        return null;
    }
    private static List<String> names(Object value) {
        return value instanceof List<?> list ? list.stream().map(MyAnimeListService::object)
                .map(entry -> string(entry.get("name"))).filter(Objects::nonNull).toList() : List.of();
    }

    private static ResponseStatusException invalidResponse() {
        return new ResponseStatusException(HttpStatus.BAD_GATEWAY, "O MyAnimeList retornou uma resposta inválida.");
    }
    private static String string(Object value) { return value instanceof String s && !s.isBlank() ? s : null; }
    private static Map<String, Object> object(Object value) {
        if (!(value instanceof Map<?, ?> map)) return Map.of();
        Map<String, Object> result = new LinkedHashMap<>();
        map.forEach((key, entry) -> { if (key instanceof String s) result.put(s, entry); });
        return result;
    }
}
