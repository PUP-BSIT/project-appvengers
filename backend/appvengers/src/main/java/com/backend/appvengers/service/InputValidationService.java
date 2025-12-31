package com.backend.appvengers.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.regex.Pattern;

/**
 * Service for validating and sanitizing chatbot input.
 * Provides protection against XSS, SQL injection, and malicious content.
 * 
 * Uses regex-based pattern matching for content filtering.
 * HTML sanitization is done using basic character escaping.
 */
@Slf4j
@Service
public class InputValidationService {
    
    /**
     * Maximum allowed message length (stricter than controller limit for processing).
     */
    public static final int MAX_MESSAGE_LENGTH = 500;
    
    /**
     * Minimum message length to be considered valid.
     */
    public static final int MIN_MESSAGE_LENGTH = 1;
    
    /**
     * Patterns that indicate potential malicious content.
     * Case-insensitive matching is applied.
     */
    private static final List<Pattern> MALICIOUS_PATTERNS = List.of(
        // Script injection attempts
        Pattern.compile("<script[^>]*>", Pattern.CASE_INSENSITIVE),
        Pattern.compile("</script>", Pattern.CASE_INSENSITIVE),
        Pattern.compile("javascript:", Pattern.CASE_INSENSITIVE),
        Pattern.compile("on\\w+\\s*=", Pattern.CASE_INSENSITIVE), // onclick, onerror, etc.
        Pattern.compile("data:text/html", Pattern.CASE_INSENSITIVE),
        
        // SQL injection patterns
        Pattern.compile("(--|;|'|\")(\\s)*(drop|alter|delete|update|insert|select|union)", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\\bor\\b\\s+1\\s*=\\s*1", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\\band\\b\\s+1\\s*=\\s*1", Pattern.CASE_INSENSITIVE),
        
        // Command injection patterns
        Pattern.compile("\\$\\(.*\\)", Pattern.CASE_INSENSITIVE), // $(command)
        Pattern.compile("`.*`", Pattern.CASE_INSENSITIVE), // `command`
        Pattern.compile("\\|\\s*(cat|ls|rm|wget|curl|bash|sh)", Pattern.CASE_INSENSITIVE),
        
        // Path traversal
        Pattern.compile("\\.\\./", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\\.\\.\\\\", Pattern.CASE_INSENSITIVE)
    );
    
    /**
     * Validates and sanitizes user input for the chatbot.
     * 
     * @param input The raw user input
     * @return ValidationResult containing sanitized input or error details
     */
    public ValidationResult validateAndSanitize(String input) {
        // Null/empty check
        if (input == null || input.trim().isEmpty()) {
            return ValidationResult.error("Message cannot be empty");
        }
        
        String trimmed = input.trim();
        
        // Length validation
        if (trimmed.length() < MIN_MESSAGE_LENGTH) {
            return ValidationResult.error("Message is too short");
        }
        
        if (trimmed.length() > MAX_MESSAGE_LENGTH) {
            return ValidationResult.error(String.format(
                "Message is too long. Maximum %d characters allowed, but received %d",
                MAX_MESSAGE_LENGTH, trimmed.length()));
        }
        
        // Check for malicious patterns
        for (Pattern pattern : MALICIOUS_PATTERNS) {
            if (pattern.matcher(trimmed).find()) {
                log.warn("Malicious pattern detected in input: {}", pattern.pattern());
                return ValidationResult.error("Message contains potentially unsafe content");
            }
        }
        
        // Sanitize HTML entities
        String sanitized = sanitizeHtml(trimmed);
        
        // Normalize whitespace
        sanitized = normalizeWhitespace(sanitized);
        
        log.debug("Input validated and sanitized. Original length: {}, Sanitized length: {}", 
                trimmed.length(), sanitized.length());
        
        return ValidationResult.success(sanitized);
    }
    
    /**
     * Sanitizes HTML by escaping special characters.
     * This prevents XSS attacks even if output isn't properly escaped.
     * 
     * @param input The input to sanitize
     * @return HTML-escaped string
     */
    private String sanitizeHtml(String input) {
        if (input == null) {
            return "";
        }
        
        return input
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;")
            .replace("'", "&#x27;")
            .replace("/", "&#x2F;");
    }
    
    /**
     * Normalizes whitespace by collapsing multiple spaces/newlines.
     * 
     * @param input The input to normalize
     * @return String with normalized whitespace
     */
    private String normalizeWhitespace(String input) {
        if (input == null) {
            return "";
        }
        
        // Collapse multiple spaces to single space
        String normalized = input.replaceAll("\\s+", " ");
        
        return normalized.trim();
    }
    
    /**
     * Result of input validation.
     */
    public static class ValidationResult {
        private final boolean valid;
        private final String sanitizedInput;
        private final String errorMessage;
        
        private ValidationResult(boolean valid, String sanitizedInput, String errorMessage) {
            this.valid = valid;
            this.sanitizedInput = sanitizedInput;
            this.errorMessage = errorMessage;
        }
        
        public static ValidationResult success(String sanitizedInput) {
            return new ValidationResult(true, sanitizedInput, null);
        }
        
        public static ValidationResult error(String errorMessage) {
            return new ValidationResult(false, null, errorMessage);
        }
        
        public boolean isValid() {
            return valid;
        }
        
        public String getSanitizedInput() {
            return sanitizedInput;
        }
        
        public String getErrorMessage() {
            return errorMessage;
        }
    }
}
