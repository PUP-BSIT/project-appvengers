package com.backend.appvengers.service;

import com.backend.appvengers.dto.SignupRequest;
import com.backend.appvengers.dto.LoginRequest;
import com.backend.appvengers.dto.ApiResponse;
import com.backend.appvengers.dto.AuthResponse;
import com.backend.appvengers.entity.User;
import com.backend.appvengers.repository.UserRepository;
import com.backend.appvengers.security.JwtService;

import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;

    @Value("${app.verification.base-url:http://localhost:8081/api/auth/verify?token=}")
    private String verificationBaseUrl;

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
        user.setEmailVerified(false); // Set email verified to false

        // Set email verification token
        String emailToken = UUID.randomUUID().toString();
        user.setEmailVerificationToken(emailToken);

        userRepository.save(user);

        // Send Verification Email Template
        String verificationLink = verificationBaseUrl + emailToken;
        try {
            emailService.sendHtmlEmail("team.appvengers12@gmail.com", user.getEmail(), "Verify your iBudget account", verificationLink, user.getUsername());
        } catch (MessagingException | IOException e) {
            throw new RuntimeException("Failed to send verification email");
        }

        UserDetails userDetails = org.springframework.security.core.userdetails.User
            .withUsername(user.getEmail())
            .password(user.getPassword())
            .authorities("ROLE_USER")
            .build();

        String token = jwtService.generateToken(userDetails);
        AuthResponse response = new AuthResponse(user.getUsername(), user.getEmail(), token);
        return new ApiResponse(true, "Signup successful, Please check your email.", response);
    }

    public ApiResponse verifyEmailToken(String token) {
        return userRepository.findByEmailVerificationToken(token)
            .map(user -> {
                user.setEmailVerified(true);
                user.setEmailVerificationToken(null);
                userRepository.save(user);
                return new ApiResponse(true, "Email verified successfully", user);
            })
            .orElseGet(() -> new ApiResponse(false, "Invalid verification token"));
    }

    @Transactional
    public ApiResponse login(LoginRequest request) {
        Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());
        User user = optionalUser.orElse(null);

        // Dummy hash to mitigate timing attacks
        String dummyHash = "$2a$10$CwTycUXWue0Thq9StjUM0uJ8fQx5QyQbYyQ5QyQ5QyQ5QyQ5QyQ5Qy";
        boolean passwordMatches = passwordEncoder.matches(
            request.getPassword(),
            user != null ? user.getPassword() : dummyHash
        );

        if (user == null || !passwordMatches) {
            if (user != null) {
                incrementFailedAttemptOrLock(user);
            }
            return new ApiResponse(false, "Invalid email or password");
        }

        if (isLocked(user)) {
            return new ApiResponse(false, "Account temporarily locked due to failed attempts. Please try again later.");
        }

        if (!user.isActive()) {
            return new ApiResponse(false, "Account is not active");
        }

        resetLockout(user);

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

    // --- Lockout helpers ---

    private boolean isLocked(User user) {
        return user.getLockedUntil() != null && LocalDateTime.now().isBefore(user.getLockedUntil());
    }

    @Transactional
    protected void incrementFailedAttemptOrLock(User user) {
        int attempts = user.getFailedAttempts() + 1;
        user.setFailedAttempts(attempts);

        // Threshold: 5 failed attempts → lock for 15 minutes
        if (attempts >= 5) {
            user.setLockedUntil(LocalDateTime.now().plusMinutes(15));
            user.setFailedAttempts(0); // reset counter when locking
        }
        userRepository.save(user);
    }

    @Transactional
    protected void resetLockout(User user) {
        user.setFailedAttempts(0);
        user.setLockedUntil(null);
        userRepository.save(user);
    }
}