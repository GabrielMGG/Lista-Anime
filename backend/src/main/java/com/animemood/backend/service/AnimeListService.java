package com.animemood.backend.service;

import com.animemood.backend.dto.*;
import com.animemood.backend.entity.*;
import com.animemood.backend.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;

@Service
public class AnimeListService {

    private final AnimeListRepository animeRepository;
    private final UserRepository userRepository;
    private final LocalizationService localization;

    public AnimeListService(
            AnimeListRepository animeRepository,
            UserRepository userRepository) {
        this(animeRepository, userRepository, LocalizationService.disabled());
    }

    @Autowired public AnimeListService(AnimeListRepository animeRepository, UserRepository userRepository, LocalizationService localization) {
        this.animeRepository = animeRepository;
        this.userRepository = userRepository;
        this.localization = localization;
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Usuário não encontrado"));
    }

    private AnimeListEntry getEntry(Long id, Long userId) {
        return animeRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Anime não encontrado"));
    }

    private AnimeResponse toResponse(AnimeListEntry anime) {
        return new AnimeResponse(
                anime.getId(),
                anime.getTitle(),
                anime.getCoverUrl(),
                anime.getSynopsis(),
                anime.getGenres(),
                anime.getTotalEpisodes(),
                anime.getEpisodesWatched(),
                anime.getStatus(),
                anime.getMood(),
                anime.getScore(),
                anime.getNotes(),
                anime.getCreatedAt(),
                anime.getUpdatedAt()
        );
    }

    private void applyRequest(AnimeListEntry anime, AnimeRequest request) {
        if (request.totalEpisodes() > 0
                && request.episodesWatched() > request.totalEpisodes()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Episódios assistidos não podem ultrapassar o total");
        }

        anime.setTitle(request.title());
        anime.setCoverUrl(request.coverUrl());
        anime.setSynopsis(request.synopsis());
        anime.setGenres(request.genres());
        anime.setTotalEpisodes(request.totalEpisodes());
        anime.setEpisodesWatched(request.episodesWatched());
        anime.setStatus(request.status());
        anime.setMood(request.mood());
        anime.setScore(request.score());
        anime.setNotes(request.notes());

        if (request.totalEpisodes() > 0
                && request.episodesWatched().equals(request.totalEpisodes())) {
            anime.setStatus(WatchStatus.COMPLETED);
        }
    }

    public List<AnimeResponse> list(Long userId) {
        getUser(userId);

        return animeRepository.findByUserId(userId)
                .stream()
                .map(anime -> localization.library(toResponse(anime)))
                .toList();
    }

    public AnimeResponse findById(Long id, Long userId) {
        return localization.library(toResponse(getEntry(id, userId)));
    }

    public AnimeResponse create(AnimeRequest request, Long userId) {
        AnimeListEntry anime = new AnimeListEntry();

        anime.setUser(getUser(userId));
        applyRequest(anime, request);

        return localization.library(toResponse(animeRepository.save(anime)));
    }

    public AnimeResponse update(
            Long id, AnimeRequest request, Long userId) {

        AnimeListEntry anime = getEntry(id, userId);
        applyRequest(anime, request);

        return localization.library(toResponse(animeRepository.save(anime)));
    }

    public void delete(Long id, Long userId) {
        AnimeListEntry anime = getEntry(id, userId);
        animeRepository.delete(anime);
    }
}
