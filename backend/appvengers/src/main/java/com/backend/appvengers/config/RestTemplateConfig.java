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
     * Timeouts are configured for n8n webhook which can have cold start delays.
     * - Connect timeout: 10 seconds (initial connection)
     * - Read timeout: 30 seconds (waiting for response)
     */
    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        
        // Connection timeout: max time to establish connection
        requestFactory.setConnectTimeout(10000); // 10 seconds
        
        // Read timeout: max time to wait for response after connection
        requestFactory.setReadTimeout(30000); // 30 seconds
        
        return builder
                .setConnectTimeout(Duration.ofSeconds(10))
                .setReadTimeout(Duration.ofSeconds(30))
                .requestFactory(() -> requestFactory)
                .build();
    }
}
