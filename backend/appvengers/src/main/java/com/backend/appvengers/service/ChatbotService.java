package com.backend.appvengers.service;

import com.backend.appvengers.dto.UserFinancialContext;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ChatbotService {

    @Value("${n8n.webhook.url}")
    private String n8nWebhookUrl;

    @Value("${n8n.webhook.secret}")
    private String n8nWebhookSecret;

    private final UserContextService userContextService;
    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Sends a message to the AI chatbot with user's financial context.
     * The context allows the AI to provide personalized insights and recommendations.
     *
     * @param message User's message/question
     * @param userEmail Authenticated user's email for fetching their data
     * @return AI chatbot response
     */
    public Object sendMessage(String message, String userEmail) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-N8N-Secret", n8nWebhookSecret);

        // Build the request body with user context
        Map<String, Object> body = new HashMap<>();
        body.put("message", message);

        // Fetch and include user's financial context
        try {
            UserFinancialContext userContext = userContextService.buildUserContext(userEmail);
            body.put("userContext", userContext);
        } catch (Exception e) {
            // If we can't fetch user context, still send the message
            // but log the error and include a flag
            e.printStackTrace();
            body.put("userContextError", "Could not fetch user financial data");
        }

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Object> response = restTemplate.postForEntity(n8nWebhookUrl, request, Object.class);
            return response.getBody();
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to communicate with chatbot service.");
            return errorResponse;
        }
    }

    /**
     * @deprecated Use {@link #sendMessage(String, String)} instead for context-aware responses.
     * This method is kept for backward compatibility.
     */
    @Deprecated
    public Object sendMessage(String message) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-N8N-Secret", n8nWebhookSecret);

        Map<String, String> body = new HashMap<>();
        body.put("message", message);

        HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Object> response = restTemplate.postForEntity(n8nWebhookUrl, request, Object.class);
            return response.getBody();
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to communicate with chatbot service.");
            return errorResponse;
        }
    }
}
