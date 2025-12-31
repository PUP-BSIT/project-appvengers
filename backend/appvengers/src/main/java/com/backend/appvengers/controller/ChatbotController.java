package com.backend.appvengers.controller;

import com.backend.appvengers.dto.ChatbotMessageRequest;
import com.backend.appvengers.service.ChatbotService;
import com.backend.appvengers.service.InputValidationService;
import com.backend.appvengers.service.InputValidationService.ValidationResult;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller for chatbot API endpoints.
 * Handles message sending with input validation, sanitization, and rate limiting.
 * 
 * Rate limiting is applied via RateLimitInterceptor (10 requests/minute per user).
 * Input validation is applied via Bean Validation and InputValidationService.
 */
@Slf4j
@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
public class ChatbotController {

    private final ChatbotService chatbotService;
    private final InputValidationService inputValidationService;

    /**
     * Send a message to the AI chatbot.
     * The chatbot receives the user's financial context, session ID, and JWT for personalized responses.
     * 
     * Security features:
     * - Rate limiting: 10 requests/minute per user (enforced by interceptor)
     * - Input validation: Bean Validation + custom sanitization
     * - XSS protection: HTML entity escaping
     * - Malicious pattern detection: SQL injection, script injection, etc.
     *
     * @param request Request body containing the message and optional sessionId
     * @param bindingResult Validation result from Bean Validation
     * @param auth Authentication object containing the user's email
     * @param authHeader Authorization header containing the JWT token
     * @return AI chatbot response with personalized insights
     */
    @PostMapping("/message")
    public ResponseEntity<Object> sendMessage(
            @Valid @RequestBody ChatbotMessageRequest request,
            BindingResult bindingResult,
            Authentication auth,
            @RequestHeader("Authorization") String authHeader) {
        
        // Handle Bean Validation errors
        if (bindingResult.hasErrors()) {
            String errorMessage = bindingResult.getFieldErrors().stream()
                    .map(error -> error.getField() + ": " + error.getDefaultMessage())
                    .findFirst()
                    .orElse("Invalid request");
            
            log.warn("Validation error for user {}: {}", auth.getName(), errorMessage);
            
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Validation failed",
                "output", errorMessage
            ));
        }
        
        // Apply additional input validation and sanitization
        ValidationResult validationResult = inputValidationService.validateAndSanitize(request.getMessage());
        
        if (!validationResult.isValid()) {
            log.warn("Input validation failed for user {}: {}", auth.getName(), validationResult.getErrorMessage());
            
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Invalid input",
                "output", validationResult.getErrorMessage()
            ));
        }
        
        // Use the sanitized message
        String sanitizedMessage = validationResult.getSanitizedInput();

        // Get the authenticated user's email
        String userEmail = auth.getName();
        
        // Get the session ID for conversation continuity
        String sessionId = request.getSessionId();
        
        // Extract JWT token from Authorization header
        String jwtToken = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwtToken = authHeader.substring(7);
        }

        log.debug("Processing chatbot request for user: {}, message length: {}", 
                userEmail, sanitizedMessage.length());

        // Send message with user context, session ID, and JWT for personalized AI responses
        Object response = chatbotService.sendMessage(sanitizedMessage, userEmail, sessionId, jwtToken);
        return ResponseEntity.ok(response);
    }
}
