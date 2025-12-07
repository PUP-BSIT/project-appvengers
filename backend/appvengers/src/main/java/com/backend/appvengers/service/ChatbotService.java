package com.backend.appvengers.service;

import com.backend.appvengers.dto.UserFinancialContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatbotService {

    @Value("${n8n.webhook.url}")
    private String n8nWebhookUrl;

    private final UserContextService userContextService;
    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Sends a message to the AI chatbot with user's financial context, session ID, and JWT authentication.
     * The context allows the AI to provide personalized insights and recommendations.
     * The session ID enables conversation continuity in the n8n AI agent.
     * The JWT token is forwarded to n8n for webhook authentication.
     *
     * @param message User's message/question
     * @param userEmail Authenticated user's email for fetching their data
     * @param sessionId Unique session identifier for conversation continuity
     * @param jwtToken JWT token for n8n webhook authentication
     * @return AI chatbot response
     */
    public Object sendMessage(String message, String userEmail, String sessionId, String jwtToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        // Use JWT for webhook authentication
        if (jwtToken != null && !jwtToken.isEmpty()) {
            headers.set("Authorization", "Bearer " + jwtToken);
            log.debug("JWT token present, length: {}", jwtToken.length());
        } else {
            log.warn("No JWT token provided for n8n webhook call");
        }

        // Build the request body with user context and session ID
        Map<String, Object> body = new HashMap<>();
        body.put("message", message);
        
        // Build traceable session ID with user email prefix
        String traceableSessionId = buildTraceableSessionId(sessionId, userEmail);
        body.put("sessionId", traceableSessionId);
        log.debug("Using traceable session ID: {}", traceableSessionId);

        // Fetch and include user's financial context
        try {
            UserFinancialContext userContext = userContextService.buildUserContext(userEmail);
            body.put("userContext", userContext);
        } catch (Exception e) {
            log.error("Failed to fetch user context for {}: {}", userEmail, e.getMessage());
            body.put("userContextError", "Could not fetch user financial data");
        }

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        
        log.info("Sending request to n8n webhook: {}", n8nWebhookUrl);

        try {
            ResponseEntity<Object> response = restTemplate.postForEntity(n8nWebhookUrl, request, Object.class);
            log.info("n8n response status: {}", response.getStatusCode());
            Object responseBody = response.getBody();
            
            // Handle null response from n8n
            if (responseBody == null) {
                log.warn("n8n returned null response body");
                Map<String, String> fallbackResponse = new HashMap<>();
                fallbackResponse.put("output", "I'm having trouble processing your request. Please try again.");
                return fallbackResponse;
            }
            
            return responseBody;
        } catch (HttpClientErrorException e) {
            log.error("n8n client error ({}): {}", e.getStatusCode(), e.getResponseBodyAsString());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Authentication failed with chatbot service.");
            errorResponse.put("output", "Sorry, I couldn't authenticate with the AI service. Status: " + e.getStatusCode());
            return errorResponse;
        } catch (HttpServerErrorException e) {
            log.error("n8n server error ({}): {}", e.getStatusCode(), e.getResponseBodyAsString());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Chatbot service error.");
            errorResponse.put("output", "Sorry, the AI service encountered an error. Please try again later.");
            return errorResponse;
        } catch (Exception e) {
            log.error("Failed to communicate with n8n: {}", e.getMessage(), e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to communicate with chatbot service.");
            errorResponse.put("output", "Sorry, I couldn't reach the AI service. Please try again later.");
            return errorResponse;
        }
    }

    /**
     * @deprecated Use {@link #sendMessage(String, String, String, String)} instead for JWT-authenticated responses.
     * This method is kept for backward compatibility.
     */
    @Deprecated
    public Object sendMessage(String message, String userEmail, String sessionId) {
        return sendMessage(message, userEmail, sessionId, null);
    }

    /**
     * @deprecated Use {@link #sendMessage(String, String, String, String)} instead for JWT-authenticated responses.
     * This method is kept for backward compatibility.
     */
    @Deprecated
    public Object sendMessage(String message, String userEmail) {
        return sendMessage(message, userEmail, null, null);
    }

    /**
     * @deprecated Use {@link #sendMessage(String, String, String, String)} instead for JWT-authenticated responses.
     * This method is kept for backward compatibility.
     */
    @Deprecated
    public Object sendMessage(String message) {
        return sendMessage(message, null, null, null);
    }

    /**
     * Builds a traceable session ID by prefixing with user email.
     * Format: chat-{email}-{sessionId}
     * Example: chat-user@example.com-m5x7k2a1
     * 
     * This allows easy tracing of sessions in the database by user.
     *
     * @param sessionId Original session ID
     * @param userEmail User's email address
     * @return Traceable session ID with email prefix
     */
    private String buildTraceableSessionId(String sessionId, String userEmail) {
        if (sessionId == null || sessionId.isEmpty()) {
            sessionId = generateRandomSessionId();
        }
        
        // Strip existing "chat-" prefix if present to avoid duplication
        if (sessionId.startsWith("chat-")) {
            sessionId = sessionId.substring(5);
        }
        
        if (userEmail == null || userEmail.isEmpty()) {
            return "chat-anonymous-" + sessionId;
        }
        
        // Sanitize email for use in session ID
        String sanitizedEmail = userEmail.toLowerCase().trim();
        
        return "chat-" + sanitizedEmail + "-" + sessionId;
    }

    /**
     * Generates a random session ID (8 alphanumeric characters).
     */
    private String generateRandomSessionId() {
        String chars = "abcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder sb = new StringBuilder();
        java.util.Random random = new java.util.Random();
        for (int i = 0; i < 8; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }
}
