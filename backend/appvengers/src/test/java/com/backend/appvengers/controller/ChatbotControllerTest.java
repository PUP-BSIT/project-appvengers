package com.backend.appvengers.controller;

import com.backend.appvengers.service.ChatbotService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ChatbotController focusing on input validation and error handling.
 */
@ExtendWith(MockitoExtension.class)
class ChatbotControllerTest {

    @Mock
    private ChatbotService chatbotService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private ChatbotController chatbotController;

    private static final String TEST_USER_EMAIL = "test@example.com";
    private static final String TEST_JWT_TOKEN = "Bearer test.jwt.token";
    private static final String TEST_SESSION_ID = "test-session-123";

    @BeforeEach
    void setUp() {
        when(authentication.getName()).thenReturn(TEST_USER_EMAIL);
    }

    @Test
    void testSendMessage_ValidInput_Success() {
        // Arrange
        Map<String, String> payload = new HashMap<>();
        payload.put("message", "How do I add a transaction?");
        payload.put("sessionId", TEST_SESSION_ID);

        Map<String, String> expectedResponse = Map.of("output", "AI response");
        when(chatbotService.sendMessage(anyString(), eq(TEST_USER_EMAIL), eq(TEST_SESSION_ID), anyString()))
                .thenReturn(expectedResponse);

        // Act
        ResponseEntity<Object> response = chatbotController.sendMessage(payload, authentication, TEST_JWT_TOKEN);

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
        Map<String, String> payload = new HashMap<>();
        payload.put("message", "");
        payload.put("sessionId", TEST_SESSION_ID);

        // Act
        ResponseEntity<Object> response = chatbotController.sendMessage(payload, authentication, TEST_JWT_TOKEN);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        
        @SuppressWarnings("unchecked")
        Map<String, String> responseBody = (Map<String, String>) response.getBody();
        assertTrue(responseBody.containsKey("error"));
        assertTrue(responseBody.get("error").contains("empty"));
        
        verify(chatbotService, never()).sendMessage(anyString(), anyString(), anyString(), anyString());
    }

    @Test
    void testSendMessage_WhitespaceOnlyMessage_ReturnsBadRequest() {
        // Arrange
        Map<String, String> payload = new HashMap<>();
        payload.put("message", "   ");
        payload.put("sessionId", TEST_SESSION_ID);

        // Act
        ResponseEntity<Object> response = chatbotController.sendMessage(payload, authentication, TEST_JWT_TOKEN);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        verify(chatbotService, never()).sendMessage(anyString(), anyString(), anyString(), anyString());
    }

    @Test
    void testSendMessage_NullMessage_ReturnsBadRequest() {
        // Arrange
        Map<String, String> payload = new HashMap<>();
        payload.put("sessionId", TEST_SESSION_ID);
        // message is null

        // Act
        ResponseEntity<Object> response = chatbotController.sendMessage(payload, authentication, TEST_JWT_TOKEN);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        verify(chatbotService, never()).sendMessage(anyString(), anyString(), anyString(), anyString());
    }

    @Test
    void testSendMessage_MessageTooLong_ReturnsBadRequest() {
        // Arrange
        String longMessage = "a".repeat(1001); // 1001 characters (exceeds 1000 limit)
        Map<String, String> payload = new HashMap<>();
        payload.put("message", longMessage);
        payload.put("sessionId", TEST_SESSION_ID);

        // Act
        ResponseEntity<Object> response = chatbotController.sendMessage(payload, authentication, TEST_JWT_TOKEN);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        
        @SuppressWarnings("unchecked")
        Map<String, String> responseBody = (Map<String, String>) response.getBody();
        assertTrue(responseBody.containsKey("error"));
        assertTrue(responseBody.get("error").contains("too long"));
        assertTrue(responseBody.get("output").contains("1000"));
        assertTrue(responseBody.get("output").contains("1001"));
        
        verify(chatbotService, never()).sendMessage(anyString(), anyString(), anyString(), anyString());
    }

    @Test
    void testSendMessage_ExactlyMaxLength_Success() {
        // Arrange
        String maxLengthMessage = "a".repeat(1000); // Exactly 1000 characters
        Map<String, String> payload = new HashMap<>();
        payload.put("message", maxLengthMessage);
        payload.put("sessionId", TEST_SESSION_ID);

        Map<String, String> expectedResponse = Map.of("output", "AI response");
        when(chatbotService.sendMessage(anyString(), eq(TEST_USER_EMAIL), eq(TEST_SESSION_ID), anyString()))
                .thenReturn(expectedResponse);

        // Act
        ResponseEntity<Object> response = chatbotController.sendMessage(payload, authentication, TEST_JWT_TOKEN);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(chatbotService, times(1)).sendMessage(eq(maxLengthMessage), anyString(), anyString(), anyString());
    }

    @Test
    void testSendMessage_WithoutAuthHeader_ExtractsNullToken() {
        // Arrange
        Map<String, String> payload = new HashMap<>();
        payload.put("message", "Test message");
        payload.put("sessionId", TEST_SESSION_ID);

        Map<String, String> expectedResponse = Map.of("output", "AI response");
        when(chatbotService.sendMessage(anyString(), eq(TEST_USER_EMAIL), eq(TEST_SESSION_ID), isNull()))
                .thenReturn(expectedResponse);

        // Act
        ResponseEntity<Object> response = chatbotController.sendMessage(payload, authentication, null);

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
        Map<String, String> payload = new HashMap<>();
        payload.put("message", "Test message");
        payload.put("sessionId", TEST_SESSION_ID);

        Map<String, String> expectedResponse = Map.of("output", "AI response");
        when(chatbotService.sendMessage(anyString(), eq(TEST_USER_EMAIL), eq(TEST_SESSION_ID), isNull()))
                .thenReturn(expectedResponse);

        // Act - Auth header without "Bearer " prefix
        ResponseEntity<Object> response = chatbotController.sendMessage(payload, authentication, "InvalidHeader");

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
        Map<String, String> payload = new HashMap<>();
        payload.put("message", "Test message");
        // sessionId is null

        Map<String, String> expectedResponse = Map.of("output", "AI response");
        when(chatbotService.sendMessage(anyString(), eq(TEST_USER_EMAIL), isNull(), anyString()))
                .thenReturn(expectedResponse);

        // Act
        ResponseEntity<Object> response = chatbotController.sendMessage(payload, authentication, TEST_JWT_TOKEN);

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

        Map<String, String> payload = new HashMap<>();
        payload.put("message", "Test message");
        payload.put("sessionId", TEST_SESSION_ID);

        Map<String, String> expectedResponse = Map.of("output", "AI response");
        when(chatbotService.sendMessage(anyString(), eq(customEmail), eq(TEST_SESSION_ID), anyString()))
                .thenReturn(expectedResponse);

        // Act
        ResponseEntity<Object> response = chatbotController.sendMessage(payload, authentication, TEST_JWT_TOKEN);

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
        Map<String, String> payload = new HashMap<>();
        payload.put("message", "Test");
        payload.put("sessionId", TEST_SESSION_ID);

        Map<String, String> serviceResponse = Map.of(
                "output", "AI response",
                "sessionId", "confirmed-session-id"
        );
        when(chatbotService.sendMessage(anyString(), anyString(), anyString(), anyString()))
                .thenReturn(serviceResponse);

        // Act
        ResponseEntity<Object> response = chatbotController.sendMessage(payload, authentication, TEST_JWT_TOKEN);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(serviceResponse, response.getBody());
    }
}
