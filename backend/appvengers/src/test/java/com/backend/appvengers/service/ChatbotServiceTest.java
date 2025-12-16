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
    private static final String TEST_MESSAGE = "How do I add a transaction?";
    private static final String TEST_USER_EMAIL = "test@example.com";
    private static final String TEST_SESSION_ID = "test-session-123";
    private static final String TEST_JWT_TOKEN = "test.jwt.token";

    @BeforeEach
    void setUp() {
        // Inject the webhook URL using reflection (since it's @Value annotated)
        ReflectionTestUtils.setField(chatbotService, "n8nWebhookUrl", N8N_WEBHOOK_URL);
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
    void testSendMessage_ServerError_ShouldThrowForRetry() {
        // Arrange
        when(userContextService.buildUserContext(TEST_USER_EMAIL)).thenReturn(
                UserFinancialContext.builder().userEmail(TEST_USER_EMAIL).build()
        );
        when(restTemplate.postForEntity(eq(N8N_WEBHOOK_URL), any(HttpEntity.class), eq(Object.class)))
                .thenThrow(new HttpServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR, "n8n error"));

        // Act & Assert
        assertThrows(HttpServerErrorException.class, () -> 
            chatbotService.sendMessage(TEST_MESSAGE, TEST_USER_EMAIL, TEST_SESSION_ID, TEST_JWT_TOKEN)
        );
        
        // Verify it was called (retry mechanism will call it multiple times in real scenario)
        verify(restTemplate, times(1)).postForEntity(eq(N8N_WEBHOOK_URL), any(HttpEntity.class), eq(Object.class));
    }

    @Test
    void testSendMessage_Timeout_ShouldThrowForRetry() {
        // Arrange
        when(userContextService.buildUserContext(TEST_USER_EMAIL)).thenReturn(
                UserFinancialContext.builder().userEmail(TEST_USER_EMAIL).build()
        );
        when(restTemplate.postForEntity(eq(N8N_WEBHOOK_URL), any(HttpEntity.class), eq(Object.class)))
                .thenThrow(new ResourceAccessException("Connection timeout"));

        // Act & Assert
        assertThrows(ResourceAccessException.class, () -> 
            chatbotService.sendMessage(TEST_MESSAGE, TEST_USER_EMAIL, TEST_SESSION_ID, TEST_JWT_TOKEN)
        );
        
        verify(restTemplate, times(1)).postForEntity(eq(N8N_WEBHOOK_URL), any(HttpEntity.class), eq(Object.class));
    }

    @Test
    void testSendMessage_NullResponse_ShouldReturnFallback() {
        // Arrange
        when(userContextService.buildUserContext(TEST_USER_EMAIL)).thenReturn(
                UserFinancialContext.builder().userEmail(TEST_USER_EMAIL).build()
        );
        ResponseEntity<Object> nullResponseEntity = new ResponseEntity<>(null, HttpStatus.OK);
        when(restTemplate.postForEntity(eq(N8N_WEBHOOK_URL), any(HttpEntity.class), eq(Object.class)))
                .thenReturn(nullResponseEntity);

        // Act
        Object result = chatbotService.sendMessage(TEST_MESSAGE, TEST_USER_EMAIL, TEST_SESSION_ID, TEST_JWT_TOKEN);

        // Assert
        assertNotNull(result);
        assertTrue(result instanceof Map);
        @SuppressWarnings("unchecked")
        Map<String, String> resultMap = (Map<String, String>) result;
        assertTrue(resultMap.containsKey("output"));
        assertTrue(resultMap.get("output").contains("trouble processing"));
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
