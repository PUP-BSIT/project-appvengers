package com.backend.appvengers.service;

import com.backend.appvengers.dto.SignupRequest;
import com.backend.appvengers.dto.LoginRequest;
import com.backend.appvengers.dto.ApiResponse;
import com.backend.appvengers.dto.AuthResponse;
import com.backend.appvengers.entity.User;
import com.backend.appvengers.repository.UserRepository;
import com.backend.appvengers.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public ApiResponse registerUser(SignupRequest signupRequest) {
        if (userRepository.existsByUsername(signupRequest.getUsername())) {
            throw new IllegalArgumentException("Username is already taken!");
        }

        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            throw new IllegalArgumentException("Email is already registered!");
        }

        if (!signupRequest.getPassword().equals(signupRequest.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match!");
        }

        User user = new User();
        user.setUsername(signupRequest.getUsername());
        user.setEmail(signupRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        user.setActive(true); // No email verification for now → active immediately

        userRepository.save(user);

        UserDetails userDetails = org.springframework.security.core.userdetails.User
            .withUsername(user.getEmail())
            .password(user.getPassword())
            .authorities("ROLE_USER")
            .build();

        String token = jwtService.generateToken(userDetails);
        AuthResponse response = new AuthResponse(user.getUsername(), user.getEmail(), token);
        return new ApiResponse(true, "Signup successful", response);
    }

    @Transactional(readOnly = true)
    public ApiResponse login(LoginRequest request) {
        Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());

        // Dummy hash to mitigate timing attacks
        String dummyHash = "$2a$10$CwTycUXWue0Thq9StjUM0uJ8fQx5QyQbYyQ5QyQ5QyQ5QyQ5QyQ5Qy";
        User user = optionalUser.orElse(null);

        boolean passwordMatches = passwordEncoder.matches(
            request.getPassword(),
            user != null ? user.getPassword() : dummyHash
        );

        if (user == null || !passwordMatches) {
            return new ApiResponse(false, "Invalid email or password");
        }

        if (!user.isActive()) {
            return new ApiResponse(false, "Account is not active");
        }

        UserDetails userDetails = org.springframework.security.core.userdetails.User
            .withUsername(user.getEmail())
            .password(user.getPassword())
            .authorities("ROLE_USER")
            .build();

        String token = jwtService.generateToken(userDetails);
        AuthResponse response = new AuthResponse(user.getUsername(), user.getEmail(), token);
        return new ApiResponse(true, "Login successful", response);
    }

    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}