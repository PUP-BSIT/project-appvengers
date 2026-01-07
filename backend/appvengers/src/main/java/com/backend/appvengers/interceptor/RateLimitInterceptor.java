package com.backend.appvengers.interceptor;

import com.backend.appvengers.service.RateLimitService;
import io.github.bucket4j.ConsumptionProbe;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

/**
 * HTTP interceptor for rate limiting chatbot requests.
 * Extracts user identity from JWT authentication and applies per-user rate limits.
 * 
 * Returns 429 Too Many Requests when rate limit is exceeded, with headers:
 * - X-Rate-Limit-Remaining: Number of remaining requests
 * - X-Rate-Limit-Retry-After-Seconds: Seconds until next token available
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RateLimitInterceptor implements HandlerInterceptor {
    
    private final RateLimitService rateLimitService;
    
    private static final String HEADER_RATE_LIMIT_REMAINING = "X-Rate-Limit-Remaining";
    private static final String HEADER_RATE_LIMIT_RETRY_AFTER = "X-Rate-Limit-Retry-After-Seconds";
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) 
            throws IOException {
        
        // Extract user email from security context (set by JwtAuthenticationFilter)
        String userEmail = extractUserEmail();
        
        // Try to consume a token from the user's rate limit bucket
        ConsumptionProbe probe = rateLimitService.tryConsume(userEmail);
        
        // Always add remaining tokens header
        response.setHeader(HEADER_RATE_LIMIT_REMAINING, String.valueOf(probe.getRemainingTokens()));
        
        if (probe.isConsumed()) {
            // Request allowed
            log.debug("Rate limit check passed for user: {}, remaining: {}", 
                    userEmail, probe.getRemainingTokens());
            return true;
        } else {
            // Rate limit exceeded - return 429
            long waitTimeSeconds = TimeUnit.NANOSECONDS.toSeconds(probe.getNanosToWaitForRefill());
            // Ensure at least 1 second wait time
            waitTimeSeconds = Math.max(1, waitTimeSeconds);
            
            response.setHeader(HEADER_RATE_LIMIT_RETRY_AFTER, String.valueOf(waitTimeSeconds));
            response.setStatus(429); // 429 Too Many Requests
            response.setContentType("application/json");
            response.getWriter().write(String.format(
                    "{\"error\": \"Rate limit exceeded\", \"output\": \"You're sending messages too quickly. Please wait %d seconds before trying again.\", \"retryAfterSeconds\": %d}",
                    waitTimeSeconds, waitTimeSeconds));
            
            log.warn("Rate limit exceeded for user: {}, retry after: {} seconds", 
                    userEmail, waitTimeSeconds);
            
            return false;
        }
    }
    
    /**
     * Extracts the user email from the security context.
     * Falls back to "anonymous" if not authenticated.
     * 
     * @return User email or "anonymous"
     */
    private String extractUserEmail() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated() && 
                    !"anonymousUser".equals(authentication.getPrincipal())) {
                return authentication.getName();
            }
        } catch (Exception e) {
            log.warn("Failed to extract user email from security context: {}", e.getMessage());
        }
        return "anonymous";
    }
}
