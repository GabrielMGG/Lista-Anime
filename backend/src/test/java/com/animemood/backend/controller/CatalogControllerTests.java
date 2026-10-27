package com.animemood.backend.controller;

import com.animemood.backend.config.SecurityConfig;
import com.animemood.backend.dto.CatalogSearchResponse;
import com.animemood.backend.service.MyAnimeListService;
import com.animemood.backend.service.LocalizationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CatalogController.class)
@Import(SecurityConfig.class)
class CatalogControllerTests {
    @Autowired MockMvc mvc;
    @MockitoBean MyAnimeListService service;
    @MockitoBean LocalizationService localization;

    @Test void catalogRequiresExistingAuthentication() throws Exception {
        mvc.perform(get("/api/catalog/anime").param("q", "anime")).andExpect(status().isUnauthorized());
        verifyNoInteractions(service);
    }
    @Test void authenticatedSearchUsesOwnContract() throws Exception {
        when(service.search("anime", 20)).thenReturn(new CatalogSearchResponse(List.of(), 20, 20, false));
        mvc.perform(get("/api/catalog/anime").param("q", "anime").param("offset", "20").with(user("test@example.com")))
                .andExpect(status().isOk()).andExpect(jsonPath("$.items").isEmpty())
                .andExpect(jsonPath("$.offset").value(20));
    }
    @Test void unconfiguredCatalogReturns503WithoutExpiringApplicationLogin() throws Exception {
        when(service.details(42)).thenThrow(new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Catálogo MyAnimeList não configurado."));
        mvc.perform(get("/api/catalog/anime/42").with(user("test@example.com")))
                .andExpect(status().isServiceUnavailable()).andExpect(jsonPath("$.status").value(503));
    }
    @Test void preservesExistingCorsOriginsAndPreflight() throws Exception {
        mvc.perform(options("/api/catalog/anime").header("Origin", "http://localhost:5173")
                        .header("Access-Control-Request-Method", "GET").header("Access-Control-Request-Headers", "Authorization"))
                .andExpect(status().isOk()).andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"));
    }
}
