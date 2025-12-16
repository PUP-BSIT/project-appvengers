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
     * 
     * @param userId The target user's ID
     * @param notification The notification to send
     */
    public void sendNotificationToUser(int userId, NotificationResponse notification) {
        String destination = "/queue/notifications";
        log.info("📬 Sending WebSocket notification to user {}: {}", userId, notification.getTitle());
        
        // convertAndSendToUser automatically prepends /user/{userId} to the destination
        messagingTemplate.convertAndSendToUser(
            String.valueOf(userId),
            destination,
            notification
        );
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
        log.debug("🔢 Sending unread count {} to user {}", count, userId);
        messagingTemplate.convertAndSendToUser(
            String.valueOf(userId),
            "/queue/notifications/count",
            count
        );
    }
}
