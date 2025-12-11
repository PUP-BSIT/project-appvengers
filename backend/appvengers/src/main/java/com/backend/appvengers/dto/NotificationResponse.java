package com.backend.appvengers.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private String title;
    private String message;
    private String date;
    private Double amount;
    private String type; // 'warning', 'info', 'alert' for frontend
    private boolean read;
    private String category;
    private String savingName; // Optional for savings notifications

    // Convert from entity to response DTO
    public static NotificationResponse fromEntity(
            com.backend.appvengers.entity.Notification notification,
            String savingName) {

        NotificationResponse response = new NotificationResponse();
        response.setId(notification.getNotificationId());
        response.setTitle(notification.getTitle());
        response.setMessage(notification.getMessage());
        response.setAmount(notification.getAmount());
        response.setRead(notification.isRead());
        response.setCategory(notification.getCategory());
        response.setSavingName(savingName);

        // Format date for frontend
        LocalDateTime createdAt = notification.getCreatedAt();
        if (createdAt != null) {
            response.setDate(createdAt.toLocalDate().toString());
        }

        // Map notification urgency to frontend type (color)
        // LOW = info (blue), MEDIUM = warning (yellow), HIGH = alert (red)
        if (notification.getUrgency() != null) {
            switch (notification.getUrgency()) {
                case LOW:
                    response.setType("info");
                    break;
                case MEDIUM:
                    response.setType("warning");
                    break;
                case HIGH:
                    response.setType("alert");
                    break;
                default:
                    response.setType("info");
            }
        } else {
            // Fallback based on notification type if urgency not set
            switch (notification.getType()) {
                case BUDGET_EXCEEDED:
                    response.setType("warning");
                    break;
                case BUDGET_WARNING:
                case SAVINGS_DEADLINE:
                default:
                    response.setType("info");
            }
        }

        return response;
    }
}
