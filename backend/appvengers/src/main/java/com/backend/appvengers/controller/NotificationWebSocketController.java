package com.backend.appvengers.controller;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.backend.appvengers.dto.NotificationResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * WebSocket controller for sending real-time notifications to users.
 * Uses STOMP messaging template to send notifications to specific users or broadcast.
 */
@Controller
@RequiredArgsConstructor
@Slf4j
public class NotificationWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Send a notification to a specific user via WebSocket.
     * The user subscribes to /user/{userId}/queue/notifications
     * We send directly to this destination since we're not using Spring Security WebSocket auth.
     * 
     * @param userId The target user's ID
     * @param notification The notification to send
     */
    public void sendNotificationToUser(int userId, NotificationResponse notification) {
        // Send directly to the destination the client is subscribed to
        // Client subscribes to: /user/{userId}/queue/notifications
        String destination = "/user/" + userId + "/queue/notifications";
        log.info("📬 Sending WebSocket notification to {}: {}", destination, notification.getTitle());
        
        messagingTemplate.convertAndSend(destination, notification);
    }

    /**
     * Broadcast a notification to all connected users.
     * Users subscribe to /topic/notifications to receive broadcasts.
     * 
     * @param notification The notification to broadcast
     */
    public void broadcastNotification(NotificationResponse notification) {
        log.info("📢 Broadcasting notification to all users: {}", notification.getTitle());
        messagingTemplate.convertAndSend("/topic/notifications", notification);
    }

    /**
     * Send unread count update to a specific user.
     * Useful for updating notification badges in real-time.
     * 
     * @param userId The target user's ID
     * @param count The new unread notification count
     */
    public void sendUnreadCountToUser(int userId, long count) {
        String destination = "/user/" + userId + "/queue/notifications/count";
        log.debug("🔢 Sending unread count {} to {}", count, destination);
        messagingTemplate.convertAndSend(destination, count);
    }
}
