package com.animemood.backend.repository;

import com.animemood.backend.entity.DrawHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface DrawHistoryRepository
        extends JpaRepository<DrawHistory, Long> {

    List<DrawHistory> findByUserIdOrderByDrawnAtDesc(Long userId);
    Optional<DrawHistory> findFirstByUserIdOrderByDrawnAtDescIdDesc(Long userId);
}
