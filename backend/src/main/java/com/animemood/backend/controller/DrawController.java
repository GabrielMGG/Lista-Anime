package com.animemood.backend.controller;

import com.animemood.backend.dto.DrawResponse;
import com.animemood.backend.entity.Mood;
import com.animemood.backend.entity.User;
import com.animemood.backend.repository.UserRepository;
import com.animemood.backend.service.DrawService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/draws")
public class DrawController {

    private final DrawService service;
    private final UserRepository userRepository;

    public DrawController(
            DrawService service,
            UserRepository userRepository) {
        this.service = service;
        this.userRepository = userRepository;
    }

    private Long currentUserId(Authentication authentication) {
        User user = userRepository
                .findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalStateException(
                        "Usuário autenticado não encontrado"));

        return user.getId();
    }

    @PostMapping
    public ResponseEntity<DrawResponse> draw(
            @RequestParam(required = false) Mood mood,
            Authentication authentication) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(service.draw(
                        currentUserId(authentication), mood));
    }

    @GetMapping("/history")
    public List<DrawResponse> history(
            Authentication authentication) {

        return service.history(currentUserId(authentication));
    }
}