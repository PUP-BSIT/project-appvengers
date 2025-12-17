package com.backend.appvengers.config;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.retry.annotation.EnableRetry;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

/**
 * Configuration for RestTemplate with timeout and retry settings.
 * Used for external API calls (e.g., n8n webhook).
 */
@Configuration
@EnableRetry
public class RestTemplateConfig {

    /**
     * Creates a RestTemplate bean with custom timeout settings.
     * 
     * Timeouts are configured for n8n webhook on Render free tier which can have
     * cold start delays of 30-50 seconds when the service has been idle.
     * 
     * - Connect timeout: 45 seconds (allows Render to wake up from cold start)
     * - Read timeout: 60 seconds (AI processing can take time for complex queries)
     */
    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        
        // Connection timeout: max time to establish connection
        // Set to 45s to handle Render cold starts (30-50s typical)
        requestFactory.setConnectTimeout(45000); // 45 seconds
        
        // Read timeout: max time to wait for response after connection
        // Set to 60s to allow AI processing time
        requestFactory.setReadTimeout(60000); // 60 seconds
        
        return builder
                .setConnectTimeout(Duration.ofSeconds(45))
                .setReadTimeout(Duration.ofSeconds(60))
                .requestFactory(() -> requestFactory)
                .build();
    }
}
