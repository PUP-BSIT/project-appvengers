package com.backend.appvengers.service;

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
public class ChatbotService {

    @Value("${n8n.webhook.url}")
    private String n8nWebhookUrl;

    @Value("${n8n.webhook.secret}")
    private String n8nWebhookSecret;

    private final RestTemplate restTemplate;

    public ChatbotService() {
        this.restTemplate = new RestTemplate();
    }

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
