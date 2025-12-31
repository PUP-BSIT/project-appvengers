package com.backend.appvengers.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for chatbot message requests.
 * Provides declarative validation using Bean Validation annotations.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatbotMessageRequest {
    
    /**
     * The user's message to the chatbot.
     * Required, non-blank, max 500 characters.
     */
    @NotBlank(message = "Message cannot be empty")
    @Size(min = 1, max = 500, message = "Message must be between 1 and 500 characters")
    private String message;
    
    /**
     * Optional session ID for conversation continuity.
     * If not provided, a new session ID will be generated.
     */
    @Size(max = 100, message = "Session ID must be less than 100 characters")
    private String sessionId;
}
