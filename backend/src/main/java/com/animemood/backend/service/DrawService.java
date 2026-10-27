package com.animemood.backend.service;

import com.animemood.backend.dto.*;
import com.animemood.backend.entity.*;
import com.animemood.backend.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;

@Service
public class DrawService {
    private final GlobalDrawPool pool;
    private final DrawHistoryRepository historyRepository;
    private final UserRepository userRepository;
    private final TransactionTemplate transactions;
    private final LocalizationService localization;
    private final Object[] locks = new Object[64];

    public DrawService(GlobalDrawPool pool, DrawHistoryRepository historyRepository,
                       UserRepository userRepository, PlatformTransactionManager manager) {
        this(pool, historyRepository, userRepository, manager, LocalizationService.disabled());
    }

    @Autowired public DrawService(GlobalDrawPool pool, DrawHistoryRepository historyRepository,
                       UserRepository userRepository, PlatformTransactionManager manager, LocalizationService localization) {
        this.pool = pool; this.historyRepository = historyRepository;
        this.userRepository = userRepository; this.transactions = new TransactionTemplate(manager);
        this.localization = localization;
        Arrays.setAll(locks, i -> new Object());
    }

    static DrawResponse toResponse(DrawHistory draw) {
        return new DrawResponse(draw.getId(), draw.getAnimeTitle(), draw.getCoverUrl(),
                draw.getMood(), draw.getDrawnAt(), draw.getMalId(), draw.getSynopsis(),
                draw.getCatalogGenres() == null || draw.getCatalogGenres().isBlank() ? List.of() : Arrays.asList(draw.getCatalogGenres().split(", ")),
                draw.getTotalEpisodes(), draw.getReleaseYear(), draw.getPublicScore(),
                draw.getIdentifiedMood(), draw.getMalId() == null ? "PERSONAL_LEGACY" : "MYANIMELIST");
    }

    public DrawResponse draw(Long userId, Mood mood) {
        synchronized (locks[Math.floorMod(userId.hashCode(), locks.length)]) {
            // Network/cache refresh happens outside the database transaction.
            List<CatalogAnimeResponse> candidates = pool.candidates(mood);
            DrawResponse result = transactions.execute(transaction -> {
                User user = userRepository.findById(userId).orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));
                Long previousId = historyRepository.findFirstByUserIdOrderByDrawnAtDescIdDesc(userId)
                        .map(DrawHistory::getMalId).orElse(null);
                CatalogAnimeResponse selected = pool.select(candidates, previousId);
                DrawHistory history = new DrawHistory();
                history.setUser(user); history.setAnimeTitle(selected.title()); history.setCoverUrl(selected.coverUrl());
                history.setMood(mood); history.setMalId(selected.malId()); history.setSynopsis(selected.synopsis());
                history.setCatalogGenres(String.join(", ", selected.genres())); history.setTotalEpisodes(selected.totalEpisodes());
                history.setReleaseYear(selected.year()); history.setPublicScore(selected.publicScore());
                history.setIdentifiedMood(selected.suggestedMood());
                return toResponse(historyRepository.save(history));
            });
            return localization.draw(Objects.requireNonNull(result));
        }
    }

    public List<DrawResponse> history(Long userId) {
        return historyRepository.findByUserIdOrderByDrawnAtDesc(userId).stream().map(DrawService::toResponse)
                .map(draw -> localization.draw(draw)).toList();
    }
}
