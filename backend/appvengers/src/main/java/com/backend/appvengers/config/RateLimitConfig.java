package com.backend.appvengers.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import lombok.Data;

/**
 * Configuration properties for chatbot rate limiting.
 * Configurable via application.properties or environment variables.
 * 
 * Example:
 * chatbot.ratelimit.requests-per-minute=10
 * chatbot.ratelimit.cleanup-interval-minutes=60
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "chatbot.ratelimit")
public class RateLimitConfig {
    
    /**
     * Maximum number of requests allowed per user per minute.
     * Default: 10 requests/minute
     */
    private int requestsPerMinute = 10;
    
    /**
     * Interval in minutes for cleaning up expired rate limit buckets.
     * Default: 60 minutes (1 hour)
     */
    private int cleanupIntervalMinutes = 60;
    
    /**
     * Whether rate limiting is enabled.
     * Default: true
     */
    private boolean enabled = true;
}
