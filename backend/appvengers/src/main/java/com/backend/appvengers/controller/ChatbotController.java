package com.backend.appvengers.controller;

import com.backend.appvengers.service.ChatbotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
public class ChatbotController {

    private final ChatbotService chatbotService;

    /**
     * Send a message to the AI chatbot.
     * The chatbot receives the user's financial context, session ID, and JWT for personalized responses.
     *
     * @param payload Request body containing the message and sessionId
     * @param auth Authentication object containing the user's email
     * @param authHeader Authorization header containing the JWT token
     * @return AI chatbot response with personalized insights
     */
    @PostMapping("/message")
    public ResponseEntity<Object> sendMessage(
            @RequestBody Map<String, String> payload,
            Authentication auth,
            @RequestHeader("Authorization") String authHeader) {
        
        String message = payload.get("message");
        if (message == null || message.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Message cannot be empty"));
        }

        // Get the authenticated user's email
        String userEmail = auth.getName();
        
        // Get the session ID for conversation continuity
        String sessionId = payload.get("sessionId");
        
        // Extract JWT token from Authorization header (remove "Bearer " prefix)
        String jwtToken = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwtToken = authHeader.substring(7);
        }

        // Send message with user context, session ID, and JWT for personalized AI responses
        Object response = chatbotService.sendMessage(message, userEmail, sessionId, jwtToken);
        return ResponseEntity.ok(response);
    }
}
