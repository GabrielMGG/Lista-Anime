package com.animemood.backend.repository;

import com.animemood.backend.entity.AnimeListEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AnimeListRepository extends JpaRepository<AnimeListEntry, Long> {

    List<AnimeListEntry> findByUserId(Long userId);

    Optional<AnimeListEntry> findByIdAndUserId(Long id, Long userId);
}