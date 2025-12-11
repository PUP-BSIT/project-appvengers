package com.backend.appvengers.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.backend.appvengers.entity.Notification;
import com.backend.appvengers.entity.Notification.NotificationType;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Get all notifications for a user, ordered by most recent first
    List<Notification> findByUserIdOrderByCreatedAtDesc(int userId);

    // Get unread count for a user
    long countByUserIdAndIsReadFalse(int userId);

    // Mark all notifications as read for a user
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = CURRENT_TIMESTAMP WHERE n.userId = :userId AND n.isRead = false")
    void markAllAsReadByUserId(@Param("userId") int userId);

    // Check if a notification already exists (read or unread) to avoid duplicates
    @Query("SELECT COUNT(n) > 0 FROM Notification n WHERE n.userId = :userId AND n.type = :type AND n.referenceId = :referenceId")
    boolean existsNotification(
            @Param("userId") int userId,
            @Param("type") NotificationType type,
            @Param("referenceId") Integer referenceId);

    // Delete old read notifications (cleanup - optional)
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.userId = :userId AND n.isRead = true AND n.readAt < :olderThan")
    void deleteOldReadNotifications(@Param("userId") int userId, @Param("olderThan") java.time.LocalDateTime olderThan);
}
