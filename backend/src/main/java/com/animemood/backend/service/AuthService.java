package com.animemood.backend.service;

import com.animemood.backend.dto.RegisterRequest;
import com.animemood.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.animemood.backend.entity.User;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public void register(RegisterRequest request) {

        // Check if the email is already registered
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already registered");
        }

        // Create a new user
        User user = new User();

        user.setName(request.name());
        user.setEmail(request.email());

        // Generate a secure password hash
        String passwordHash = passwordEncoder.encode(request.password());
        user.setPasswordHash(passwordHash);

        // Save the user in MySQL
        userRepository.save(user);
    }
}