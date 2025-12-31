package com.backend.appvengers.service;

import com.backend.appvengers.config.RateLimitConfig;
import io.github.bucket4j.ConsumptionProbe;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

/**
 * Unit tests for RateLimitService.
 * Tests per-user rate limiting functionality using Bucket4j.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class RateLimitServiceTest {

    @Mock
    private RateLimitConfig rateLimitConfig;

    private RateLimitService rateLimitService;

    @BeforeEach
    void setUp() {
        // Configure rate limit: 10 requests per minute
        when(rateLimitConfig.getRequestsPerMinute()).thenReturn(10);
        when(rateLimitConfig.getCleanupIntervalMinutes()).thenReturn(60);
        when(rateLimitConfig.isEnabled()).thenReturn(true);
        
        rateLimitService = new RateLimitService(rateLimitConfig);
    }

    @Test
    @DisplayName("Should allow first request from new user")
    void shouldAllowFirstRequest() {
        ConsumptionProbe probe = rateLimitService.tryConsume("user@example.com");
        
        assertThat(probe.isConsumed()).isTrue();
        assertThat(probe.getRemainingTokens()).isEqualTo(9); // 10 - 1 = 9
    }

    @Test
    @DisplayName("Should allow up to 10 requests within rate limit")
    void shouldAllowRequestsWithinLimit() {
        String userEmail = "test@example.com";
        
        // Send 10 requests (should all succeed)
        for (int i = 0; i < 10; i++) {
            ConsumptionProbe probe = rateLimitService.tryConsume(userEmail);
            assertThat(probe.isConsumed())
                    .as("Request %d should be allowed", i + 1)
                    .isTrue();
        }
    }

    @Test
    @DisplayName("Should block 11th request exceeding rate limit")
    void shouldBlockRequestsExceedingLimit() {
        String userEmail = "heavy@example.com";
        
        // Consume all 10 tokens
        for (int i = 0; i < 10; i++) {
            rateLimitService.tryConsume(userEmail);
        }
        
        // 11th request should be blocked
        ConsumptionProbe probe = rateLimitService.tryConsume(userEmail);
        
        assertThat(probe.isConsumed()).isFalse();
        assertThat(probe.getRemainingTokens()).isZero();
        assertThat(probe.getNanosToWaitForRefill()).isGreaterThan(0);
    }

    @Test
    @DisplayName("Should track separate buckets for different users")
    void shouldTrackSeparateBucketsPerUser() {
        String user1 = "user1@example.com";
        String user2 = "user2@example.com";
        
        // User1 consumes all tokens
        for (int i = 0; i < 10; i++) {
            rateLimitService.tryConsume(user1);
        }
        
        // User2 should still have full tokens
        ConsumptionProbe probeUser2 = rateLimitService.tryConsume(user2);
        assertThat(probeUser2.isConsumed()).isTrue();
        assertThat(probeUser2.getRemainingTokens()).isEqualTo(9);
        
        // User1 should be blocked
        ConsumptionProbe probeUser1 = rateLimitService.tryConsume(user1);
        assertThat(probeUser1.isConsumed()).isFalse();
    }

    @Test
    @DisplayName("Should normalize user email to lowercase")
    void shouldNormalizeUserEmail() {
        String upperCase = "USER@EXAMPLE.COM";
        String lowerCase = "user@example.com";
        
        // Both should use the same bucket
        rateLimitService.tryConsume(upperCase);
        ConsumptionProbe probe = rateLimitService.tryConsume(lowerCase);
        
        assertThat(probe.getRemainingTokens()).isEqualTo(8); // 10 - 2 = 8
    }

    @Test
    @DisplayName("Should handle null user email as anonymous")
    void shouldHandleNullUserEmail() {
        ConsumptionProbe probe = rateLimitService.tryConsume(null);
        
        assertThat(probe.isConsumed()).isTrue();
        // Anonymous bucket should work
    }

    @Test
    @DisplayName("Should handle blank user email as anonymous")
    void shouldHandleBlankUserEmail() {
        ConsumptionProbe probe = rateLimitService.tryConsume("   ");
        
        assertThat(probe.isConsumed()).isTrue();
    }

    @Test
    @DisplayName("Should return correct remaining tokens count")
    void shouldReturnCorrectRemainingTokens() {
        String userEmail = "counter@example.com";
        
        assertThat(rateLimitService.getRemainingTokens(userEmail)).isEqualTo(10);
        
        rateLimitService.tryConsume(userEmail);
        assertThat(rateLimitService.getRemainingTokens(userEmail)).isEqualTo(9);
        
        rateLimitService.tryConsume(userEmail);
        assertThat(rateLimitService.getRemainingTokens(userEmail)).isEqualTo(8);
    }

    @Test
    @DisplayName("Should track active bucket count")
    void shouldTrackActiveBucketCount() {
        assertThat(rateLimitService.getActiveBucketCount()).isZero();
        
        rateLimitService.tryConsume("user1@example.com");
        assertThat(rateLimitService.getActiveBucketCount()).isEqualTo(1);
        
        rateLimitService.tryConsume("user2@example.com");
        assertThat(rateLimitService.getActiveBucketCount()).isEqualTo(2);
        
        // Same user shouldn't create new bucket
        rateLimitService.tryConsume("user1@example.com");
        assertThat(rateLimitService.getActiveBucketCount()).isEqualTo(2);
    }

    @Test
    @DisplayName("Should clear all buckets")
    void shouldClearAllBuckets() {
        rateLimitService.tryConsume("user1@example.com");
        rateLimitService.tryConsume("user2@example.com");
        
        assertThat(rateLimitService.getActiveBucketCount()).isEqualTo(2);
        
        rateLimitService.clearAllBuckets();
        
        assertThat(rateLimitService.getActiveBucketCount()).isZero();
    }

    @Test
    @DisplayName("Should allow all requests when rate limiting is disabled")
    void shouldAllowAllRequestsWhenDisabled() {
        // Reconfigure with rate limiting disabled
        when(rateLimitConfig.isEnabled()).thenReturn(false);
        rateLimitService = new RateLimitService(rateLimitConfig);
        
        String userEmail = "disabled@example.com";
        
        // Should allow more than 10 requests
        for (int i = 0; i < 20; i++) {
            ConsumptionProbe probe = rateLimitService.tryConsume(userEmail);
            assertThat(probe.isConsumed())
                    .as("Request %d should be allowed when rate limiting is disabled", i + 1)
                    .isTrue();
        }
    }
}
