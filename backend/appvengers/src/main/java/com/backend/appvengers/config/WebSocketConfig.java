package com.backend.appvengers.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;

/**
 * WebSocket configuration for real-time notifications.
 * Uses STOMP protocol over WebSocket with SockJS fallback.
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable simple in-memory message broker for broadcasting to subscribers
        // /topic - for broadcast messages (including user-specific via /topic/user/{id}/...)
        // /queue - for queue-based messages
        config.enableSimpleBroker("/topic", "/queue");
        
        // Prefix for messages FROM clients TO server
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // WebSocket endpoint that clients connect to
        registry.addEndpoint("/ws-notifications")
                .setAllowedOriginPatterns(
                    "http://localhost:4200",      // Development
                    "https://i-budget.site",      // Production
                    "https://www.i-budget.site"   // Production (www)
                )
                .withSockJS(); // Enable SockJS fallback for browsers that don't support WebSocket
    }

    @Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registration) {
        // Configure message size limits and timeouts
        registration.setMessageSizeLimit(128 * 1024)      // 128KB max message size
                    .setSendBufferSizeLimit(512 * 1024)   // 512KB send buffer
                    .setSendTimeLimit(20 * 1000);         // 20 seconds send timeout
    }
}
