package com.animemood.backend.controller;

import com.animemood.backend.dto.AnimeRequest;
import com.animemood.backend.dto.AnimeResponse;
import com.animemood.backend.entity.User;
import com.animemood.backend.repository.UserRepository;
import com.animemood.backend.service.AnimeListService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/anime-list")
public class AnimeListController {

    private final AnimeListService service;
    private final UserRepository userRepository;

    public AnimeListController(
            AnimeListService service,
            UserRepository userRepository) {
        this.service = service;
        this.userRepository = userRepository;
    }

    private Long getAuthenticatedUserId(Authentication authentication) {
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException(
                        "Usuário autenticado não encontrado"
                ));

        return user.getId();
    }

    @GetMapping
    public List<AnimeResponse> list(Authentication authentication) {
        return service.list(getAuthenticatedUserId(authentication));
    }

    @GetMapping("/{id}")
    public AnimeResponse findById(
            @PathVariable Long id,
            Authentication authentication) {

        return service.findById(
                id,
                getAuthenticatedUserId(authentication)
        );
    }

    @PostMapping
    public ResponseEntity<AnimeResponse> create(
            @Valid @RequestBody AnimeRequest request,
            Authentication authentication) {

        AnimeResponse response = service.create(
                request,
                getAuthenticatedUserId(authentication)
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PutMapping("/{id}")
    public AnimeResponse update(
            @PathVariable Long id,
            @Valid @RequestBody AnimeRequest request,
            Authentication authentication) {

        return service.update(
                id,
                request,
                getAuthenticatedUserId(authentication)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            Authentication authentication) {

        service.delete(
                id,
                getAuthenticatedUserId(authentication)
        );

        return ResponseEntity.noContent().build();
    }
}