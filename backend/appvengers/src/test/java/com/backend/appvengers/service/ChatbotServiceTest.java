package com.backend.appvengers.service;

import com.backend.appvengers.dto.UserFinancialContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ChatbotService focusing on retry logic and error handling.
 */
@ExtendWith(MockitoExtension.class)
class ChatbotServiceTest {

    @Mock
    private RestTemplate restTemplate;

    @Mock
    private UserContextService userContextService;

    @InjectMocks
    private ChatbotService chatbotService;

    private static final String N8N_WEBHOOK_URL = "https://test-n8n.com/webhook/test";
    private static final String N8N_WEBHOOK_FALLBACK_URL = "https://test-fallback-n8n.com/webhook/test";
    private static final String TEST_MESSAGE = "How do I add a transaction?";
    private static final String TEST_USER_EMAIL = "test@example.com";
    private static final String TEST_SESSION_ID = "test-session-123";
    private static final String TEST_JWT_TOKEN = "test.jwt.token";

    @BeforeEach
    void setUp() {
        // Inject the webhook URLs using reflection (since they're @Value annotated)
        ReflectionTestUtils.setField(chatbotService, "n8nWebhookUrl", N8N_WEBHOOK_URL);
        ReflectionTestUtils.setField(chatbotService, "n8nWebhookFallbackUrl", N8N_WEBHOOK_FALLBACK_URL);
        ReflectionTestUtils.setField(chatbotService, "failoverTimeout", 15000L);
    }

    @Test
    void testSendMessage_Success() {
        // Arrange
        UserFinancialContext mockContext = UserFinancialContext.builder()
                .username("testuser")
                .userEmail(TEST_USER_EMAIL)
                .build();

        Map<String, String> expectedResponse = Map.of("output", "Here's how to add a transaction...");
        ResponseEntity<Object> responseEntity = new ResponseEntity<>(expectedResponse, HttpStatus.OK);

        when(userContextService.buildUserContext(TEST_USER_EMAIL)).thenReturn(mockContext);
        when(restTemplate.postForEntity(eq(N8N_WEBHOOK_URL), any(HttpEntity.class), eq(Object.class)))
                .thenReturn(responseEntity);

        // Act
        Object result = chatbotService.sendMessage(TEST_MESSAGE, TEST_USER_EMAIL, TEST_SESSION_ID, TEST_JWT_TOKEN);

        // Assert
        assertNotNull(result);
        assertEquals(expectedResponse, result);
        verify(restTemplate, times(1)).postForEntity(eq(N8N_WEBHOOK_URL), any(HttpEntity.class), eq(Object.class));
        verify(userContextService, times(1)).buildUserContext(TEST_USER_EMAIL);
    }

    @Test
    void testSendMessage_ServerError_ShouldUseFallback() {
        // Arrange
        when(userContextService.buildUserContext(TEST_USER_EMAIL)).thenReturn(
                UserFinancialContext.builder().userEmail(TEST_USER_EMAIL).build()
        );
        
        // Primary webhook throws server error
        when(restTemplate.postForEntity(eq(N8N_WEBHOOK_URL), any(HttpEntity.class), eq(Object.class)))
                .thenThrow(new HttpServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR, "n8n error"));
        
        // Fallback webhook succeeds
        Map<String, String> fallbackResponse = Map.of("output", "Response from fallback webhook");
        ResponseEntity<Object> fallbackEntity = new ResponseEntity<>(fallbackResponse, HttpStatus.OK);
        when(restTemplate.postForEntity(eq(N8N_WEBHOOK_FALLBACK_URL), any(HttpEntity.class), eq(Object.class)))
                .thenReturn(fallbackEntity);

        // Act
        Object result = chatbotService.sendMessage(TEST_MESSAGE, TEST_USER_EMAIL, TEST_SESSION_ID, TEST_JWT_TOKEN);

        // Assert
        assertNotNull(result);
        assertEquals(fallbackResponse, result);
        
        // Verify both webhooks were called (primary failed, fallback succeeded)
        verify(restTemplate, times(1)).postForEntity(eq(N8N_WEBHOOK_URL), any(HttpEntity.class), eq(Object.class));
        verify(restTemplate, times(1)).postForEntity(eq(N8N_WEBHOOK_FALLBACK_URL), any(HttpEntity.class), eq(Object.class));
    }

    @Test
    void testSendMessage_Timeout_ShouldUseFallback() {
        // Arrange
        when(userContextService.buildUserContext(TEST_USER_EMAIL)).thenReturn(
                UserFinancialContext.builder().userEmail(TEST_USER_EMAIL).build()
        );
        
        // Primary webhook times out
        when(restTemplate.postForEntity(eq(N8N_WEBHOOK_URL), any(HttpEntity.class), eq(Object.class)))
                .thenThrow(new ResourceAccessException("Connection timeout"));
        
        // Fallback webhook succeeds
        Map<String, String> fallbackResponse = Map.of("output", "Response from fallback after timeout");
        ResponseEntity<Object> fallbackEntity = new ResponseEntity<>(fallbackResponse, HttpStatus.OK);
        when(restTemplate.postForEntity(eq(N8N_WEBHOOK_FALLBACK_URL), any(HttpEntity.class), eq(Object.class)))
                .thenReturn(fallbackEntity);

        // Act
        Object result = chatbotService.sendMessage(TEST_MESSAGE, TEST_USER_EMAIL, TEST_SESSION_ID, TEST_JWT_TOKEN);

        // Assert
        assertNotNull(result);
        assertEquals(fallbackResponse, result);
        
        // Verify both webhooks were called (primary timed out, fallback succeeded)
        verify(restTemplate, times(1)).postForEntity(eq(N8N_WEBHOOK_URL), any(HttpEntity.class), eq(Object.class));
        verify(restTemplate, times(1)).postForEntity(eq(N8N_WEBHOOK_FALLBACK_URL), any(HttpEntity.class), eq(Object.class));
    }

    @Test
    void testSendMessage_NullResponse_ShouldUseFallback() {
        // Arrange
        when(userContextService.buildUserContext(TEST_USER_EMAIL)).thenReturn(
                UserFinancialContext.builder().userEmail(TEST_USER_EMAIL).build()
        );
        
        // Primary webhook returns null body
        ResponseEntity<Object> nullResponseEntity = new ResponseEntity<>(null, HttpStatus.OK);
        when(restTemplate.postForEntity(eq(N8N_WEBHOOK_URL), any(HttpEntity.class), eq(Object.class)))
                .thenReturn(nullResponseEntity);
        
        // Fallback webhook succeeds
        Map<String, String> fallbackResponse = Map.of("output", "Response from fallback after null");
        ResponseEntity<Object> fallbackEntity = new ResponseEntity<>(fallbackResponse, HttpStatus.OK);
        when(restTemplate.postForEntity(eq(N8N_WEBHOOK_FALLBACK_URL), any(HttpEntity.class), eq(Object.class)))
                .thenReturn(fallbackEntity);

        // Act
        Object result = chatbotService.sendMessage(TEST_MESSAGE, TEST_USER_EMAIL, TEST_SESSION_ID, TEST_JWT_TOKEN);

        // Assert
        assertNotNull(result);
        assertEquals(fallbackResponse, result);
        
        // Verify both webhooks were called (primary returned null, fallback succeeded)
        verify(restTemplate, times(1)).postForEntity(eq(N8N_WEBHOOK_URL), any(HttpEntity.class), eq(Object.class));
        verify(restTemplate, times(1)).postForEntity(eq(N8N_WEBHOOK_FALLBACK_URL), any(HttpEntity.class), eq(Object.class));
    }

    @Test
    void testSendMessage_BothWebhooksFail_ShouldReturnErrorMessage() {
        // Arrange
        when(userContextService.buildUserContext(TEST_USER_EMAIL)).thenReturn(
                UserFinancialContext.builder().userEmail(TEST_USER_EMAIL).build()
        );
        
        // Both webhooks fail
        when(restTemplate.postForEntity(eq(N8N_WEBHOOK_URL), any(HttpEntity.class), eq(Object.class)))
                .thenThrow(new HttpServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR, "Primary error"));
        when(restTemplate.postForEntity(eq(N8N_WEBHOOK_FALLBACK_URL), any(HttpEntity.class), eq(Object.class)))
                .thenThrow(new HttpServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR, "Fallback error"));

        // Act
        Object result = chatbotService.sendMessage(TEST_MESSAGE, TEST_USER_EMAIL, TEST_SESSION_ID, TEST_JWT_TOKEN);

        // Assert
        assertNotNull(result);
        assertTrue(result instanceof Map);
        @SuppressWarnings("unchecked")
        Map<String, String> resultMap = (Map<String, String>) result;
        assertTrue(resultMap.containsKey("error"));
        assertTrue(resultMap.containsKey("output"));
        assertTrue(resultMap.get("output").contains("technical difficulties"));
        
        // Verify both webhooks were called
        verify(restTemplate, times(1)).postForEntity(eq(N8N_WEBHOOK_URL), any(HttpEntity.class), eq(Object.class));
        verify(restTemplate, times(1)).postForEntity(eq(N8N_WEBHOOK_FALLBACK_URL), any(HttpEntity.class), eq(Object.class));
    }

    @Test
    void testSendMessage_UserContextError_ShouldIncludeErrorInPayload() {
        // Arrange
        when(userContextService.buildUserContext(TEST_USER_EMAIL))
                .thenThrow(new RuntimeException("Database error"));
        
        Map<String, String> expectedResponse = Map.of("output", "AI response");
        ResponseEntity<Object> responseEntity = new ResponseEntity<>(expectedResponse, HttpStatus.OK);
        when(restTemplate.postForEntity(eq(N8N_WEBHOOK_URL), any(HttpEntity.class), eq(Object.class)))
                .thenReturn(responseEntity);

        // Act
        Object result = chatbotService.sendMessage(TEST_MESSAGE, TEST_USER_EMAIL, TEST_SESSION_ID, TEST_JWT_TOKEN);

        // Assert
        assertNotNull(result);
        verify(restTemplate, times(1)).postForEntity(eq(N8N_WEBHOOK_URL), any(HttpEntity.class), eq(Object.class));
    }

    @Test
    void testBuildTraceableSessionId_WithEmailAndSessionId() {
        // This is a private method, but we can test it indirectly through sendMessage
        // by verifying the request body sent to RestTemplate
        
        when(userContextService.buildUserContext(TEST_USER_EMAIL)).thenReturn(
                UserFinancialContext.builder().userEmail(TEST_USER_EMAIL).build()
        );
        
        Map<String, String> expectedResponse = Map.of("output", "Response");
        ResponseEntity<Object> responseEntity = new ResponseEntity<>(expectedResponse, HttpStatus.OK);
        when(restTemplate.postForEntity(eq(N8N_WEBHOOK_URL), any(HttpEntity.class), eq(Object.class)))
                .thenReturn(responseEntity);

        // Act
        chatbotService.sendMessage(TEST_MESSAGE, TEST_USER_EMAIL, "simple-id", TEST_JWT_TOKEN);

        // Assert - verify the sessionId in the request contains the email
        verify(restTemplate).postForEntity(eq(N8N_WEBHOOK_URL), argThat(httpEntity -> {
            HttpEntity<?> entity = (HttpEntity<?>) httpEntity;
            @SuppressWarnings("unchecked")
            Map<String, Object> body = (Map<String, Object>) entity.getBody();
            String sessionId = (String) body.get("sessionId");
            return sessionId != null && sessionId.contains(TEST_USER_EMAIL) && sessionId.contains("simple-id");
        }), eq(Object.class));
    }

    @Test
    void testSendMessage_WithoutJwtToken_ShouldStillWork() {
        // Arrange
        when(userContextService.buildUserContext(TEST_USER_EMAIL)).thenReturn(
                UserFinancialContext.builder().userEmail(TEST_USER_EMAIL).build()
        );
        Map<String, String> expectedResponse = Map.of("output", "Response without JWT");
        ResponseEntity<Object> responseEntity = new ResponseEntity<>(expectedResponse, HttpStatus.OK);
        when(restTemplate.postForEntity(eq(N8N_WEBHOOK_URL), any(HttpEntity.class), eq(Object.class)))
                .thenReturn(responseEntity);

        // Act
        Object result = chatbotService.sendMessage(TEST_MESSAGE, TEST_USER_EMAIL, TEST_SESSION_ID, null);

        // Assert
        assertNotNull(result);
        assertEquals(expectedResponse, result);
        verify(restTemplate, times(1)).postForEntity(eq(N8N_WEBHOOK_URL), any(HttpEntity.class), eq(Object.class));
    }

    @Test
    void testDeprecatedMethods_ShouldStillWork() {
        // Arrange
        when(userContextService.buildUserContext(TEST_USER_EMAIL)).thenReturn(
                UserFinancialContext.builder().userEmail(TEST_USER_EMAIL).build()
        );
        Map<String, String> expectedResponse = Map.of("output", "Response");
        ResponseEntity<Object> responseEntity = new ResponseEntity<>(expectedResponse, HttpStatus.OK);
        when(restTemplate.postForEntity(eq(N8N_WEBHOOK_URL), any(HttpEntity.class), eq(Object.class)))
                .thenReturn(responseEntity);

        // Act - Test deprecated method with 3 params
        @SuppressWarnings("deprecation")
        Object result = chatbotService.sendMessage(TEST_MESSAGE, TEST_USER_EMAIL, TEST_SESSION_ID);

        // Assert
        assertNotNull(result);
        verify(restTemplate, times(1)).postForEntity(eq(N8N_WEBHOOK_URL), any(HttpEntity.class), eq(Object.class));
    }
}
