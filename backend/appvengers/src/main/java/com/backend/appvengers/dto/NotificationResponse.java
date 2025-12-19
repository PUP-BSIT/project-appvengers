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
    private String type; // NotificationType enum value (e.g., 'SAVINGS_MILESTONE_50', 'BUDGET_WARNING')
    private String urgency; // Urgency level: LOW, MEDIUM, HIGH (for deadline-based coloring)
    private boolean read;
    private String category;
    private String savingName; // Optional for savings notifications
    private Integer referenceId; // Reference to related entity (budget/saving ID)

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
        response.setReferenceId(notification.getReferenceId());

        // Format date for frontend
        LocalDateTime createdAt = notification.getCreatedAt();
        if (createdAt != null) {
            response.setDate(createdAt.toLocalDate().toString());
        }

        // Use the actual NotificationType enum value for frontend
        // Frontend will map these to colors/icons/behaviors
        if (notification.getType() != null) {
            response.setType(notification.getType().name());
        } else {
            response.setType("info"); // Fallback
        }

        // Set urgency level for deadline-based coloring (HIGH=red, MEDIUM=orange, LOW=blue)
        if (notification.getUrgency() != null) {
            response.setUrgency(notification.getUrgency().name());
        }

        return response;
    }
}
