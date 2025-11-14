package com.backend.appvengers.controller;

import com.backend.appvengers.dto.ApiResponse;
import com.backend.appvengers.entity.User;
import com.backend.appvengers.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse> getProfile(Authentication auth) {
        String email = auth.getName(); // Extracted from JWT
        User user = userService.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> data = Map.of(
            "username", user.getUsername(),
            "email", user.getEmail(),
            "remainingBudget", 0
        );

        return ResponseEntity.ok(new ApiResponse(true, "Profile fetched", data));
    }
}