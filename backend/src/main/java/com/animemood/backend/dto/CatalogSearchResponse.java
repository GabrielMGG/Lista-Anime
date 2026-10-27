package com.animemood.backend.dto;

import java.util.List;
public record CatalogSearchResponse(List<CatalogAnimeResponse> items, int offset, int limit, boolean hasNext) {}
