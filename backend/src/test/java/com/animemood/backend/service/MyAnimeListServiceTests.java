package com.animemood.backend.service;

import com.animemood.backend.entity.Mood;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.http.*;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;
import java.net.SocketTimeoutException;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

class MyAnimeListServiceTests {
    private final RestClient.Builder builder = RestClient.builder().baseUrl("https://api.myanimelist.net/v2");
    private final MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
    private final MyAnimeListService service = new MyAnimeListService(builder.build(), "test-client-not-a-credential", new MoodClassifier());
    private static final String ANIME = """
            {"id":42,"title":"Test fixture","main_picture":{"medium":"https://example.com/cover.jpg"},
            "synopsis":"Fixture only","genres":[{"id":1,"name":"Action"},{"id":2,"name":"Adventure"}],
            "num_episodes":12,"mean":8.75,"media_type":"tv","status":"finished_airing"}
            """;

    @Test void missingClientIdDoesNotCallUpstream() {
        var disabled = new MyAnimeListService(builder.build(), " ", new MoodClassifier());
        assertEquals(503, assertThrows(ResponseStatusException.class, () -> disabled.search("anime", 0)).getStatusCode().value());
        server.verify();
    }
    @Test void mapsDetailsAndKeepsPublicScoreSeparate() {
        server.expect(req -> {
            assertEquals("/v2/anime/42", req.getURI().getPath());
            assertEquals("test-client-not-a-credential", req.getHeaders().getFirst("X-MAL-CLIENT-ID"));
            assertNull(req.getHeaders().getFirst("Authorization"));
        }).andRespond(withSuccess(ANIME, MediaType.APPLICATION_JSON));
        var anime = service.details(42);
        assertEquals(42, anime.malId()); assertEquals(12, anime.totalEpisodes());
        assertEquals(8.75, anime.publicScore()); assertEquals(Mood.ACTION, anime.suggestedMood());
        assertEquals("https://example.com/cover.jpg", anime.coverUrl()); server.verify();
    }
    @Test void mapsSearchAndPaginationWithoutForwardingUpstreamLinks() {
        server.expect(req -> {
            assertEquals("/v2/anime", req.getURI().getPath());
            assertTrue(req.getURI().getRawQuery().contains("q=a%26b"));
            assertTrue(req.getURI().getQuery().contains("offset=20"));
        }).andRespond(withSuccess("{\"data\":[{\"node\":" + ANIME + "}],\"paging\":{\"next\":\"https://api.myanimelist.net/v2/anime?offset=40\"}}", MediaType.APPLICATION_JSON));
        var result = service.search("a&b", 20);
        assertEquals(1, result.items().size()); assertTrue(result.hasNext()); assertEquals(20, result.offset()); server.verify();
    }
    @Test void acceptsEmptySearchAndMissingOptionalMetadata() {
        server.expect(req -> {}).andRespond(withSuccess("{\"data\":[]}", MediaType.APPLICATION_JSON));
        assertTrue(service.search("anime", 0).items().isEmpty()); server.verify();
    }
    @Test void doesNotInventClassificationOrScoreWhenMetadataIsMissing() {
        server.expect(req -> {}).andRespond(withSuccess("{\"id\":42,\"title\":\"Fixture\"}", MediaType.APPLICATION_JSON));
        var anime = service.details(42);
        assertNull(anime.suggestedMood()); assertNull(anime.publicScore()); assertNull(anime.coverUrl());
        assertTrue(anime.genres().isEmpty()); assertEquals(0, anime.totalEpisodes()); server.verify();
    }
    @ParameterizedTest @ValueSource(ints = {401, 403, 500})
    void sanitizesUpstreamErrors(int status) {
        server.expect(req -> {}).andRespond(withStatus(HttpStatusCode.valueOf(status)).body("private-upstream-value"));
        var error = assertThrows(ResponseStatusException.class, () -> service.details(42));
        assertEquals(502, error.getStatusCode().value()); assertFalse(error.getReason().contains("private-upstream-value")); server.verify();
    }
    @Test void mapsNotFoundAndRateLimit() {
        server.expect(req -> {}).andRespond(withStatus(HttpStatus.NOT_FOUND));
        server.expect(req -> {}).andRespond(withStatus(HttpStatus.TOO_MANY_REQUESTS));
        assertEquals(404, assertThrows(ResponseStatusException.class, () -> service.details(42)).getStatusCode().value());
        assertEquals(503, assertThrows(ResponseStatusException.class, () -> service.details(42)).getStatusCode().value()); server.verify();
    }
    @Test void mapsTimeout() {
        server.expect(req -> {}).andRespond(withException(new SocketTimeoutException()));
        assertEquals(504, assertThrows(ResponseStatusException.class, () -> service.details(42)).getStatusCode().value()); server.verify();
    }
    @Test void rejectsMalformedPayload() {
        server.expect(req -> {}).andRespond(withSuccess("{\"unexpected\":true}", MediaType.APPLICATION_JSON));
        assertEquals(502, assertThrows(ResponseStatusException.class, () -> service.search("anime", 0)).getStatusCode().value()); server.verify();
    }
    @Test void validatesParametersBeforeCallingUpstream() {
        assertEquals(400, assertThrows(ResponseStatusException.class, () -> service.search("a", 0)).getStatusCode().value());
        assertEquals(400, assertThrows(ResponseStatusException.class, () -> service.search("anime", -1)).getStatusCode().value());
        assertEquals(400, assertThrows(ResponseStatusException.class, () -> service.details(0)).getStatusCode().value()); server.verify();
    }

    @Test void rankingAndSeasonReturnRealMetadataAndYear() {
        String entry = ANIME.replace("\"num_episodes\":12", "\"start_season\":{\"year\":2020,\"season\":\"spring\"},\"num_episodes\":12");
        String page = "{\"data\":[{\"node\":" + entry + "}]}";
        server.expect(req -> {
            assertEquals("/v2/anime/ranking", req.getURI().getPath());
            assertTrue(req.getURI().getQuery().contains("ranking_type=bypopularity"));
            assertTrue(req.getURI().getQuery().contains("limit=100"));
        }).andRespond(withSuccess(page, MediaType.APPLICATION_JSON));
        server.expect(req -> assertEquals("/v2/anime/season/2020/spring", req.getURI().getPath()))
                .andRespond(withSuccess(page, MediaType.APPLICATION_JSON));
        assertEquals(2020, service.ranking("bypopularity", 200).getFirst().year());
        assertEquals(Mood.ACTION, service.season(2020, "spring").getFirst().suggestedMood()); server.verify();
    }
    @ParameterizedTest
    @org.junit.jupiter.params.provider.CsvSource({"20,Naruto", "52991,Sousou no Frieren", "21,One Piece"})
    void alwaysKeepsMainMalTitleEvenWhenPortugueseAlternativeExists(long id, String title) {
        String payload = "{\"id\":" + id + ",\"title\":\"" + title + "\",\"alternative_titles\":{\"pt\":\"Título alternativo brasileiro\"},\"genres\":[{\"name\":\"Action\"}]}";
        server.expect(request -> {}).andRespond(withSuccess(payload, MediaType.APPLICATION_JSON));
        assertEquals(title, service.details(id).title()); server.verify();
    }
}
