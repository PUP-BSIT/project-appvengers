package com.backend.appvengers.controller;

import com.backend.appvengers.dto.ChatbotMessageRequest;
import com.backend.appvengers.service.ChatbotService;
import com.backend.appvengers.service.InputValidationService;
import com.backend.appvengers.service.InputValidationService.ValidationResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ChatbotController focusing on input validation and error handling.
 * Tests cover Bean Validation, InputValidationService sanitization, and request processing.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ChatbotControllerTest {

    @Mock
    private ChatbotService chatbotService;

    @Mock
    private InputValidationService inputValidationService;

    @Mock
    private Authentication authentication;

    @Mock
    private BindingResult bindingResult;

    @InjectMocks
    private ChatbotController chatbotController;

    private static final String TEST_USER_EMAIL = "test@example.com";
    private static final String TEST_JWT_TOKEN = "Bearer test.jwt.token";
    private static final String TEST_SESSION_ID = "test-session-123";

    @BeforeEach
    void setUp() {
        when(authentication.getName()).thenReturn(TEST_USER_EMAIL);
        when(bindingResult.hasErrors()).thenReturn(false);
    }

    @Test
    void testSendMessage_ValidInput_Success() {
        // Arrange
        ChatbotMessageRequest request = new ChatbotMessageRequest("How do I add a transaction?", TEST_SESSION_ID);
        
        when(inputValidationService.validateAndSanitize("How do I add a transaction?"))
                .thenReturn(ValidationResult.success("How do I add a transaction?"));

        Map<String, String> expectedResponse = Map.of("output", "AI response");
        when(chatbotService.sendMessage(anyString(), eq(TEST_USER_EMAIL), eq(TEST_SESSION_ID), anyString()))
                .thenReturn(expectedResponse);

        // Act
        ResponseEntity<Object> response = chatbotController.sendMessage(
                request, bindingResult, authentication, TEST_JWT_TOKEN);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expectedResponse, response.getBody());
        verify(chatbotService, times(1)).sendMessage(
                eq("How do I add a transaction?"),
                eq(TEST_USER_EMAIL),
                eq(TEST_SESSION_ID),
                eq("test.jwt.token")
        );
    }

    @Test
    void testSendMessage_EmptyMessage_ReturnsBadRequest() {
        // Arrange
        ChatbotMessageRequest request = new ChatbotMessageRequest("", TEST_SESSION_ID);
        
        // Simulate Bean Validation failure for empty message
        when(bindingResult.hasErrors()).thenReturn(true);
        when(bindingResult.getFieldErrors()).thenReturn(List.of(
                new FieldError("request", "message", "Message cannot be empty")
        ));

        // Act
        ResponseEntity<Object> response = chatbotController.sendMessage(
                request, bindingResult, authentication, TEST_JWT_TOKEN);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        
        @SuppressWarnings("unchecked")
        Map<String, String> responseBody = (Map<String, String>) response.getBody();
        assertTrue(responseBody.containsKey("error"));
        assertEquals("Validation failed", responseBody.get("error"));
        assertTrue(responseBody.get("output").contains("empty"));
        
        verify(chatbotService, never()).sendMessage(anyString(), anyString(), anyString(), anyString());
    }

    @Test
    void testSendMessage_WhitespaceOnlyMessage_ReturnsBadRequest() {
        // Arrange
        ChatbotMessageRequest request = new ChatbotMessageRequest("   ", TEST_SESSION_ID);
        
        // Simulate Bean Validation failure for whitespace-only message (NotBlank triggers)
        when(bindingResult.hasErrors()).thenReturn(true);
        when(bindingResult.getFieldErrors()).thenReturn(List.of(
                new FieldError("request", "message", "Message cannot be empty")
        ));

        // Act
        ResponseEntity<Object> response = chatbotController.sendMessage(
                request, bindingResult, authentication, TEST_JWT_TOKEN);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        verify(chatbotService, never()).sendMessage(anyString(), anyString(), anyString(), anyString());
    }

    @Test
    void testSendMessage_NullMessage_ReturnsBadRequest() {
        // Arrange
        ChatbotMessageRequest request = new ChatbotMessageRequest(null, TEST_SESSION_ID);
        
        // Simulate Bean Validation failure for null message
        when(bindingResult.hasErrors()).thenReturn(true);
        when(bindingResult.getFieldErrors()).thenReturn(List.of(
                new FieldError("request", "message", "Message cannot be empty")
        ));

        // Act
        ResponseEntity<Object> response = chatbotController.sendMessage(
                request, bindingResult, authentication, TEST_JWT_TOKEN);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        verify(chatbotService, never()).sendMessage(anyString(), anyString(), anyString(), anyString());
    }

    @Test
    void testSendMessage_MessageTooLong_ReturnsBadRequest() {
        // Arrange
        String longMessage = "a".repeat(501); // 501 characters (exceeds 500 limit)
        ChatbotMessageRequest request = new ChatbotMessageRequest(longMessage, TEST_SESSION_ID);
        
        // Simulate Bean Validation failure for message too long
        when(bindingResult.hasErrors()).thenReturn(true);
        when(bindingResult.getFieldErrors()).thenReturn(List.of(
                new FieldError("request", "message", "Message must be between 1 and 500 characters")
        ));

        // Act
        ResponseEntity<Object> response = chatbotController.sendMessage(
                request, bindingResult, authentication, TEST_JWT_TOKEN);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        
        @SuppressWarnings("unchecked")
        Map<String, String> responseBody = (Map<String, String>) response.getBody();
        assertTrue(responseBody.containsKey("error"));
        assertTrue(responseBody.get("output").contains("500"));
        
        verify(chatbotService, never()).sendMessage(anyString(), anyString(), anyString(), anyString());
    }

    @Test
    void testSendMessage_ExactlyMaxLength_Success() {
        // Arrange
        String maxLengthMessage = "a".repeat(500); // Exactly 500 characters (max limit)
        ChatbotMessageRequest request = new ChatbotMessageRequest(maxLengthMessage, TEST_SESSION_ID);
        
        when(inputValidationService.validateAndSanitize(maxLengthMessage))
                .thenReturn(ValidationResult.success(maxLengthMessage));

        Map<String, String> expectedResponse = Map.of("output", "AI response");
        when(chatbotService.sendMessage(anyString(), eq(TEST_USER_EMAIL), eq(TEST_SESSION_ID), anyString()))
                .thenReturn(expectedResponse);

        // Act
        ResponseEntity<Object> response = chatbotController.sendMessage(
                request, bindingResult, authentication, TEST_JWT_TOKEN);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(chatbotService, times(1)).sendMessage(eq(maxLengthMessage), anyString(), anyString(), anyString());
    }

    @Test
    void testSendMessage_WithoutAuthHeader_ExtractsNullToken() {
        // Arrange
        ChatbotMessageRequest request = new ChatbotMessageRequest("Test message", TEST_SESSION_ID);
        
        when(inputValidationService.validateAndSanitize("Test message"))
                .thenReturn(ValidationResult.success("Test message"));

        Map<String, String> expectedResponse = Map.of("output", "AI response");
        when(chatbotService.sendMessage(anyString(), eq(TEST_USER_EMAIL), eq(TEST_SESSION_ID), isNull()))
                .thenReturn(expectedResponse);

        // Act
        ResponseEntity<Object> response = chatbotController.sendMessage(
                request, bindingResult, authentication, null);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(chatbotService, times(1)).sendMessage(
                eq("Test message"),
                eq(TEST_USER_EMAIL),
                eq(TEST_SESSION_ID),
                isNull()
        );
    }

    @Test
    void testSendMessage_WithMalformedAuthHeader_ExtractsNullToken() {
        // Arrange
        ChatbotMessageRequest request = new ChatbotMessageRequest("Test message", TEST_SESSION_ID);
        
        when(inputValidationService.validateAndSanitize("Test message"))
                .thenReturn(ValidationResult.success("Test message"));

        Map<String, String> expectedResponse = Map.of("output", "AI response");
        when(chatbotService.sendMessage(anyString(), eq(TEST_USER_EMAIL), eq(TEST_SESSION_ID), isNull()))
                .thenReturn(expectedResponse);

        // Act - Auth header without "Bearer " prefix
        ResponseEntity<Object> response = chatbotController.sendMessage(
                request, bindingResult, authentication, "InvalidHeader");

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(chatbotService, times(1)).sendMessage(
                eq("Test message"),
                eq(TEST_USER_EMAIL),
                eq(TEST_SESSION_ID),
                isNull()
        );
    }

    @Test
    void testSendMessage_WithNullSessionId_StillWorks() {
        // Arrange
        ChatbotMessageRequest request = new ChatbotMessageRequest("Test message", null);
        
        when(inputValidationService.validateAndSanitize("Test message"))
                .thenReturn(ValidationResult.success("Test message"));

        Map<String, String> expectedResponse = Map.of("output", "AI response");
        when(chatbotService.sendMessage(anyString(), eq(TEST_USER_EMAIL), isNull(), anyString()))
                .thenReturn(expectedResponse);

        // Act
        ResponseEntity<Object> response = chatbotController.sendMessage(
                request, bindingResult, authentication, TEST_JWT_TOKEN);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(chatbotService, times(1)).sendMessage(
                eq("Test message"),
                eq(TEST_USER_EMAIL),
                isNull(),
                eq("test.jwt.token")
        );
    }

    @Test
    void testSendMessage_ExtractsUserEmailFromAuthentication() {
        // Arrange
        String customEmail = "custom@example.com";
        when(authentication.getName()).thenReturn(customEmail);

        ChatbotMessageRequest request = new ChatbotMessageRequest("Test message", TEST_SESSION_ID);
        
        when(inputValidationService.validateAndSanitize("Test message"))
                .thenReturn(ValidationResult.success("Test message"));

        Map<String, String> expectedResponse = Map.of("output", "AI response");
        when(chatbotService.sendMessage(anyString(), eq(customEmail), eq(TEST_SESSION_ID), anyString()))
                .thenReturn(expectedResponse);

        // Act
        ResponseEntity<Object> response = chatbotController.sendMessage(
                request, bindingResult, authentication, TEST_JWT_TOKEN);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(chatbotService, times(1)).sendMessage(
                eq("Test message"),
                eq(customEmail),
                eq(TEST_SESSION_ID),
                anyString()
        );
    }

    @Test
    void testSendMessage_ForwardsServiceResponse() {
        // Arrange
        ChatbotMessageRequest request = new ChatbotMessageRequest("Test", TEST_SESSION_ID);
        
        when(inputValidationService.validateAndSanitize("Test"))
                .thenReturn(ValidationResult.success("Test"));

        Map<String, String> serviceResponse = Map.of(
                "output", "AI response",
                "sessionId", "confirmed-session-id"
        );
        when(chatbotService.sendMessage(anyString(), anyString(), anyString(), anyString()))
                .thenReturn(serviceResponse);

        // Act
        ResponseEntity<Object> response = chatbotController.sendMessage(
                request, bindingResult, authentication, TEST_JWT_TOKEN);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(serviceResponse, response.getBody());
    }

    @Test
    void testSendMessage_InputValidationFails_ReturnsBadRequest() {
        // Arrange
        ChatbotMessageRequest request = new ChatbotMessageRequest("<script>alert('xss')</script>", TEST_SESSION_ID);
        
        // Bean Validation passes, but InputValidationService detects malicious content
        when(inputValidationService.validateAndSanitize("<script>alert('xss')</script>"))
                .thenReturn(ValidationResult.error("Message contains potentially unsafe content"));

        // Act
        ResponseEntity<Object> response = chatbotController.sendMessage(
                request, bindingResult, authentication, TEST_JWT_TOKEN);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        
        @SuppressWarnings("unchecked")
        Map<String, String> responseBody = (Map<String, String>) response.getBody();
        assertEquals("Invalid input", responseBody.get("error"));
        assertTrue(responseBody.get("output").contains("unsafe"));
        
        verify(chatbotService, never()).sendMessage(anyString(), anyString(), anyString(), anyString());
    }

    @Test
    void testSendMessage_SanitizesInput() {
        // Arrange
        String originalMessage = "Test  <b>message</b>";
        String sanitizedMessage = "Test &lt;b&gt;message&lt;&#x2F;b&gt;";
        
        ChatbotMessageRequest request = new ChatbotMessageRequest(originalMessage, TEST_SESSION_ID);
        
        when(inputValidationService.validateAndSanitize(originalMessage))
                .thenReturn(ValidationResult.success(sanitizedMessage));

        Map<String, String> expectedResponse = Map.of("output", "AI response");
        when(chatbotService.sendMessage(eq(sanitizedMessage), eq(TEST_USER_EMAIL), eq(TEST_SESSION_ID), anyString()))
                .thenReturn(expectedResponse);

        // Act
        ResponseEntity<Object> response = chatbotController.sendMessage(
                request, bindingResult, authentication, TEST_JWT_TOKEN);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        // Verify sanitized message is passed to service
        verify(chatbotService, times(1)).sendMessage(
                eq(sanitizedMessage),
                eq(TEST_USER_EMAIL),
                eq(TEST_SESSION_ID),
                anyString()
        );
    }

    @Test
    void testSendMessage_BeanValidationErrorsNoFieldErrors_ReturnsDefaultMessage() {
        // Arrange
        ChatbotMessageRequest request = new ChatbotMessageRequest("test", TEST_SESSION_ID);
        
        // Simulate validation error with no field errors (edge case)
        when(bindingResult.hasErrors()).thenReturn(true);
        when(bindingResult.getFieldErrors()).thenReturn(Collections.emptyList());

        // Act
        ResponseEntity<Object> response = chatbotController.sendMessage(
                request, bindingResult, authentication, TEST_JWT_TOKEN);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        
        @SuppressWarnings("unchecked")
        Map<String, String> responseBody = (Map<String, String>) response.getBody();
        assertEquals("Invalid request", responseBody.get("output"));
        
        verify(chatbotService, never()).sendMessage(anyString(), anyString(), anyString(), anyString());
    }
}
