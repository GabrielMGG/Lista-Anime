package com.animemood.backend.dto;

import com.animemood.backend.entity.Mood;
import com.animemood.backend.entity.WatchStatus;
import jakarta.validation.constraints.*;

public record AnimeRequest(

        @NotBlank(message = "O título é obrigatório")
        String title,

        String coverUrl,

        String synopsis,

        String genres,

        @NotNull
        @Min(0)
        Integer totalEpisodes,

        @NotNull
        @Min(0)
        Integer episodesWatched,

        @NotNull
        WatchStatus status,

        Mood mood,

        @Min(0)
        @Max(10)
        Integer score,

        String notes
) {}