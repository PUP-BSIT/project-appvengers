package com.backend.appvengers.config;

import com.backend.appvengers.interceptor.RateLimitInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web MVC configuration for registering interceptors.
 * Enables scheduling for rate limit bucket cleanup.
 */
@Configuration
@EnableScheduling
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {
    
    private final RateLimitInterceptor rateLimitInterceptor;
    
    @SuppressWarnings("null")
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // Apply rate limiting only to chatbot message endpoint
        registry.addInterceptor(rateLimitInterceptor)
                .addPathPatterns("/api/chatbot/message");
    }
}
