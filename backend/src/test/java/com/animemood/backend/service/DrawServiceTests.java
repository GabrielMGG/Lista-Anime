package com.animemood.backend.service;

import com.animemood.backend.entity.*;
import com.animemood.backend.repository.*;
import org.junit.jupiter.api.Test;
import org.springframework.transaction.*;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;

class DrawServiceTests {
    @Test void savesGlobalSnapshotWithoutDependingOnPersonalLibrary() {
        var pool = mock(GlobalDrawPool.class); var history = mock(DrawHistoryRepository.class); var users = mock(UserRepository.class);
        var transactions = mock(PlatformTransactionManager.class);
        when(transactions.getTransaction(any())).thenReturn(mock(TransactionStatus.class));
        var candidate = GlobalDrawPoolTests.anime(42, Mood.ACTION);
        when(pool.candidates(Mood.ACTION)).thenReturn(List.of(candidate));
        when(pool.select(anyList(), isNull())).thenReturn(candidate);
        when(users.findById(1L)).thenReturn(Optional.of(new User()));
        when(history.findFirstByUserIdOrderByDrawnAtDescIdDesc(1L)).thenReturn(Optional.empty());
        when(history.save(any())).thenAnswer(invocation -> { DrawHistory item = invocation.getArgument(0); item.onCreate(); return item; });
        var response = new DrawService(pool, history, users, transactions).draw(1L, Mood.ACTION);
        assertEquals(42L, response.malId()); assertEquals("MYANIMELIST", response.source());
        assertEquals(Mood.ACTION, response.identifiedMood()); assertEquals(8.0, response.publicScore());
        assertEquals("Sinopse", response.synopsis()); assertEquals(12, response.totalEpisodes()); verify(transactions).commit(any());
    }
    @Test void legacyHistoryRemainsReadableWithoutInventedMetadata() {
        DrawHistory legacy = new DrawHistory(); legacy.setAnimeTitle("Registro antigo"); legacy.setMood(Mood.FUN);
        var response = DrawService.toResponse(legacy);
        assertEquals("Registro antigo", response.animeTitle()); assertEquals("PERSONAL_LEGACY", response.source());
        assertNull(response.malId()); assertNull(response.identifiedMood()); assertTrue(response.genres().isEmpty());
    }
}
