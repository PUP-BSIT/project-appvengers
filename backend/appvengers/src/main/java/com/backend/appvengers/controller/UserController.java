package com.backend.appvengers.controller;

import com.backend.appvengers.dto.ApiResponse;
import com.backend.appvengers.dto.DeactivateAccountRequest;
import com.backend.appvengers.dto.DeleteAccountRequest;
import com.backend.appvengers.entity.User;
import com.backend.appvengers.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.BindingResult;
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
            "id", user.getId(),
            "username", user.getUsername(),
            "email", user.getEmail(),
            "remainingBudget", 0
        );

        return ResponseEntity.ok(new ApiResponse(true, "Profile fetched", data));
    }

    @PostMapping("/deactivate")
    public ResponseEntity<ApiResponse> deactivateAccount(
            Authentication auth,
            @Valid @RequestBody DeactivateAccountRequest request,
            BindingResult bindingResult) {
        
        if (bindingResult.hasErrors()) {
            String errorMessage = bindingResult.getFieldErrors().stream()
                    .map(error -> error.getField() + ": " + error.getDefaultMessage())
                    .reduce((a, b) -> a + ", " + b)
                    .orElse("Validation failed");
            return ResponseEntity.badRequest().body(new ApiResponse(false, errorMessage));
        }

        try {
            String email = auth.getName();
            ApiResponse response = userService.deactivateAccount(email, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/delete")
    public ResponseEntity<ApiResponse> deleteAccount(
            Authentication auth,
            @Valid @RequestBody DeleteAccountRequest request,
            BindingResult bindingResult) {
        
        if (bindingResult.hasErrors()) {
            String errorMessage = bindingResult.getFieldErrors().stream()
                    .map(error -> error.getField() + ": " + error.getDefaultMessage())
                    .reduce((a, b) -> a + ", " + b)
                    .orElse("Validation failed");
            return ResponseEntity.badRequest().body(new ApiResponse(false, errorMessage));
        }

        try {
            String email = auth.getName();
            ApiResponse response = userService.softDeleteAccount(email, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }
}