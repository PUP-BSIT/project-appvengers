package com.backend.appvengers.service;

import com.backend.appvengers.config.RateLimitConfig;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service for managing per-user rate limiting using Bucket4j token bucket algorithm.
 * Each user (identified by email) gets their own rate limit bucket.
 * 
 * Thread-safe implementation using ConcurrentHashMap.
 * Includes automatic cleanup of expired buckets to prevent memory leaks.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RateLimitService {
    
    private final RateLimitConfig rateLimitConfig;
    
    /**
     * Map of user email to their rate limit bucket.
     * Using ConcurrentHashMap for thread-safety.
     */
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();
    
    /**
     * Map to track last access time for cleanup purposes.
     */
    private final Map<String, Long> lastAccessTime = new ConcurrentHashMap<>();
    
    @PostConstruct
    public void init() {
        log.info("RateLimitService initialized with {} requests/minute, cleanup every {} minutes",
                rateLimitConfig.getRequestsPerMinute(),
                rateLimitConfig.getCleanupIntervalMinutes());
    }
    
    /**
     * Attempts to consume a token from the user's rate limit bucket.
     * 
     * @param userEmail The user's email address (identifier)
     * @return ConsumptionProbe containing whether consumption was successful and remaining tokens
     */
    public ConsumptionProbe tryConsume(String userEmail) {
        if (!rateLimitConfig.isEnabled()) {
            // Rate limiting disabled - always allow
            return createSuccessProbe();
        }
        
        String key = normalizeKey(userEmail);
        Bucket bucket = buckets.computeIfAbsent(key, this::createBucket);
        lastAccessTime.put(key, System.currentTimeMillis());
        
        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);
        
        if (!probe.isConsumed()) {
            log.warn("Rate limit exceeded for user: {}", key);
        }
        
        return probe;
    }
    
    /**
     * Gets the number of remaining tokens for a user without consuming any.
     * 
     * @param userEmail The user's email address
     * @return Number of remaining tokens, or max tokens if user has no bucket yet
     */
    public long getRemainingTokens(String userEmail) {
        if (!rateLimitConfig.isEnabled()) {
            return rateLimitConfig.getRequestsPerMinute();
        }
        
        String key = normalizeKey(userEmail);
        Bucket bucket = buckets.get(key);
        
        if (bucket == null) {
            return rateLimitConfig.getRequestsPerMinute();
        }
        
        return bucket.getAvailableTokens();
    }
    
    /**
     * Creates a new rate limit bucket for a user.
     * Uses token bucket algorithm with refill of all tokens every minute.
     * 
     * @param key The normalized user identifier
     * @return A new Bucket configured with the rate limit settings
     */
    private Bucket createBucket(String key) {
        Bandwidth limit = Bandwidth.builder()
                .capacity(rateLimitConfig.getRequestsPerMinute())
                .refillGreedy(rateLimitConfig.getRequestsPerMinute(), Duration.ofMinutes(1))
                .build();
        
        log.debug("Created rate limit bucket for user: {} with {} tokens/minute", 
                key, rateLimitConfig.getRequestsPerMinute());
        
        return Bucket.builder()
                .addLimit(limit)
                .build();
    }
    
    /**
     * Creates a success probe for when rate limiting is disabled.
     * Uses a bucket with enough capacity to always succeed.
     */
    private ConsumptionProbe createSuccessProbe() {
        // Create a temporary bucket with high capacity to get a success probe
        // Using 1 billion tokens with slow refill (1 per day) - more than enough
        Bucket tempBucket = Bucket.builder()
                .addLimit(Bandwidth.builder()
                        .capacity(1_000_000_000L)
                        .refillGreedy(1, Duration.ofDays(1))
                        .build())
                .build();
        return tempBucket.tryConsumeAndReturnRemaining(1);
    }
    
    /**
     * Normalizes the user key (lowercase, trimmed).
     * 
     * @param userEmail The user's email address
     * @return Normalized key for bucket lookup
     */
    private String normalizeKey(String userEmail) {
        if (userEmail == null || userEmail.isBlank()) {
            return "anonymous";
        }
        return userEmail.toLowerCase().trim();
    }
    
    /**
     * Scheduled cleanup of expired buckets to prevent memory leaks.
     * Runs every hour by default.
     * Removes buckets that haven't been accessed in the cleanup interval.
     */
    @Scheduled(fixedRateString = "${chatbot.ratelimit.cleanup-interval-minutes:60}000")
    public void cleanupExpiredBuckets() {
        if (buckets.isEmpty()) {
            return;
        }
        
        long expirationThreshold = System.currentTimeMillis() - 
                (rateLimitConfig.getCleanupIntervalMinutes() * 60 * 1000L);
        
        int removedCount = 0;
        var iterator = lastAccessTime.entrySet().iterator();
        
        while (iterator.hasNext()) {
            var entry = iterator.next();
            if (entry.getValue() < expirationThreshold) {
                buckets.remove(entry.getKey());
                iterator.remove();
                removedCount++;
            }
        }
        
        if (removedCount > 0) {
            log.info("Cleaned up {} expired rate limit buckets. Active buckets: {}", 
                    removedCount, buckets.size());
        }
    }
    
    /**
     * Gets the current number of active buckets (for monitoring).
     * 
     * @return Number of active rate limit buckets
     */
    public int getActiveBucketCount() {
        return buckets.size();
    }
    
    /**
     * Clears all rate limit buckets (useful for testing).
     */
    public void clearAllBuckets() {
        buckets.clear();
        lastAccessTime.clear();
        log.info("All rate limit buckets cleared");
    }
}
