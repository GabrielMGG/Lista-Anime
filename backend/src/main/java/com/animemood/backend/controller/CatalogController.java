package com.animemood.backend.controller;

import com.animemood.backend.dto.*;
import com.animemood.backend.service.MyAnimeListService;
import com.animemood.backend.service.LocalizationService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/catalog/anime")
public class CatalogController {
    private final MyAnimeListService service;
    private final LocalizationService localization;
    public CatalogController(MyAnimeListService service, LocalizationService localization) { this.service = service; this.localization = localization; }

    @GetMapping
    public CatalogSearchResponse search(@RequestParam String q, @RequestParam(defaultValue = "0") int offset) {
        var response = service.search(q, offset);
        return new CatalogSearchResponse(response.items().stream().map(anime -> localization.catalog(anime)).toList(),
                response.offset(), response.limit(), response.hasNext());
    }

    @GetMapping("/{malId}")
    public CatalogAnimeResponse details(@PathVariable long malId) { return localization.catalog(service.details(malId)); }
}
