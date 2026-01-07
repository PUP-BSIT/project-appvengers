package com.backend.appvengers.service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.backend.appvengers.dto.NotificationResponse;
import com.backend.appvengers.entity.Budget;
import com.backend.appvengers.entity.Notification;
import com.backend.appvengers.entity.Notification.NotificationType;
import com.backend.appvengers.entity.Notification.Urgency;
import com.backend.appvengers.entity.Category;
import com.backend.appvengers.entity.Saving;
import com.backend.appvengers.entity.User;
import com.backend.appvengers.repository.BudgetRepository;
import com.backend.appvengers.repository.CategoryRepository;
import com.backend.appvengers.repository.NotificationRepository;
import com.backend.appvengers.repository.SavingRepository;
import com.backend.appvengers.repository.TransactionRepository;
import com.backend.appvengers.repository.UserRepository;
import com.backend.appvengers.controller.NotificationWebSocketController;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final BudgetRepository budgetRepository;
    private final SavingRepository savingRepository;
    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final NotificationWebSocketController webSocketController;

/**
     * Scheduled task to generate notifications for all users.
     * Runs every 60 seconds (1 minute).
     */
    @org.springframework.scheduling.annotation.Scheduled(fixedRate = 60000)
    public void generateAllNotifications() {
        List<User> users = userRepository.findAll();
        for (User user : users) {
            try {
                generateNotifications(user.getId());
            } catch (Exception e) {
                // Log error but continue for other users
                System.err.println("Error generating notifications for user " + user.getId() + ": " + e.getMessage());
            }
        }
    }

    /**
     * Generate new notifications based on current user data.
     * This checks budgets and savings and creates notifications as needed.
     */
    @Transactional
    public void generateNotifications(int userId) {
        User user = userRepository.findById((long) userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Generate budget-related notifications
        generateBudgetNotifications(userId, user);

        // Generate budget near end notifications
        generateBudgetNearEndNotifications(userId);

        // Generate savings deadline notifications
        generateSavingsDeadlineNotifications(userId);

        // Generate savings milestone notifications
        generateSavingsMilestoneNotifications(userId);
    }

    /**
     * Check all active budgets for the user and generate warnings/alerts.
     * Uses budget_id to sum transactions, so ALL transactions linked to a budget
     * are counted regardless of their category.
     */
    private void generateBudgetNotifications(int userId, User user) {
        List<Budget> budgets = budgetRepository.findActiveBudgetsByUserId(userId);
        LocalDate today = LocalDate.now();

        for (Budget budget : budgets) {
            // Skip budgets outside their date range
            if (today.isBefore(budget.getStartDate()) || today.isAfter(budget.getEndDate())) {
                continue;
            }

            // Get category name for this budget (for display purposes)
            String categoryName = getCategoryName(budget.getCategoryId());

            // Get total spent using budget_id - counts ALL transactions linked to this budget
            Double totalSpent = transactionRepository.sumByBudgetId(budget.getBudgetId());
            if (totalSpent == null) {
                totalSpent = 0.0;
            }

            double limitAmount = budget.getLimitAmount();

            // Guard against division by zero
            if (limitAmount <= 0) {
                continue;
            }

            double remainingPercent = ((limitAmount - totalSpent) / limitAmount) * 100;

            // Check if budget is exceeded
            if (totalSpent >= limitAmount) {
                createBudgetExceededNotification(userId, budget, categoryName, totalSpent);
            }
            // Check if budget is running low (50% or more spent but not exceeded)
            else if (remainingPercent <= 50) {
                double spentPercent = 100 - remainingPercent;
                createBudgetWarningNotification(userId, budget, categoryName, totalSpent, remainingPercent, spentPercent);
            }
        }
    }

    /**
     * Check all active budgets for periods ending in 3 days.
     * Notifies users to review their spending before the budget period ends.
     * Uses budget_id to sum transactions for accurate spending totals.
     */
    private void generateBudgetNearEndNotifications(int userId) {
        LocalDate today = LocalDate.now();
        LocalDate threeDaysFromNow = today.plusDays(3);

        // Find budgets ending in exactly 3 days
        List<Budget> endingBudgets = budgetRepository.findByEndDate(threeDaysFromNow);

        for (Budget budget : endingBudgets) {
            // Only process budgets belonging to this user
            if (budget.getUserId() != userId) {
                continue;
            }

            // Check if notification already exists for this budget
            if (notificationRepository.existsNotification(userId, NotificationType.BUDGET_NEAR_END, budget.getBudgetId())) {
                continue;
            }

            // Get category name (for display purposes)
            String categoryName = getCategoryName(budget.getCategoryId());

            // Get total spent using budget_id - counts ALL transactions linked to this budget
            Double totalSpent = transactionRepository.sumByBudgetId(budget.getBudgetId());
            if (totalSpent == null) {
                totalSpent = 0.0;
            }

            createBudgetNearEndNotification(userId, budget, categoryName, totalSpent);
        }
    }

    /**
     * Create a notification for budget period ending soon.
     */
    private void createBudgetNearEndNotification(int userId, Budget budget, String categoryName, double totalSpent) {
        double remaining = budget.getLimitAmount() - totalSpent;
        double usedPercent = (totalSpent / budget.getLimitAmount()) * 100;

        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setType(NotificationType.BUDGET_NEAR_END);
        notification.setUrgency(Urgency.MEDIUM);
        notification.setTitle("Budget Period Ending Soon");
        notification.setMessage(String.format(
                "Your '%s' budget ends in 3 days. You've used ₱%.2f of ₱%d (%.0f%%). Remaining: ₱%.2f",
                categoryName, totalSpent, budget.getLimitAmount(), usedPercent, remaining));
        notification.setReferenceId(budget.getBudgetId());
        notification.setAmount(remaining);
        notification.setCategory(categoryName);
        notification.setRead(false);

        Notification savedNotification = notificationRepository.save(notification);

        // Send via WebSocket for real-time notification
        sendWebSocketNotification(userId, savedNotification, categoryName);
        
        log.info("Created BUDGET_NEAR_END notification for budget {} (user {})", budget.getBudgetId(), userId);
    }

    /**
     * Check all active savings for approaching deadlines.
     */
    private void generateSavingsDeadlineNotifications(int userId) {
        List<Saving> savings = savingRepository.findActiveSavingsByUserId(userId);
        LocalDate today = LocalDate.now();

        for (Saving saving : savings) {
            if (saving.getGoalDate() == null) {
                continue;
            }

            long daysRemaining = ChronoUnit.DAYS.between(today, saving.getGoalDate());

            // Notify based on ranges
            if (daysRemaining <= 7 && daysRemaining > 3) {
                createSavingsDeadlineNotification(userId, saving, daysRemaining, Urgency.LOW);
            } else if (daysRemaining <= 3 && daysRemaining > 1) {
                createSavingsDeadlineNotification(userId, saving, daysRemaining, Urgency.MEDIUM);
            } else if (daysRemaining <= 1 && daysRemaining >= 0) {
                createSavingsDeadlineNotification(userId, saving, daysRemaining, Urgency.HIGH);
            }
        }
    }

    /**
     * Create a notification for exceeded budget.
     */
    private void createBudgetExceededNotification(int userId, Budget budget, String categoryName, double totalSpent) {
        // Check if notification already exists
        if (notificationRepository.existsNotification(userId, NotificationType.BUDGET_EXCEEDED,
                budget.getBudgetId())) {
            return;
        }

        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setType(NotificationType.BUDGET_EXCEEDED);
        notification.setUrgency(Urgency.HIGH); // Exceeded = high urgency
        notification.setTitle("Budget Exceeded");
        notification.setMessage(String.format(
                "You've exceeded your %s budget. Spent ₱%.2f of ₱%d limit.",
                categoryName, totalSpent, budget.getLimitAmount()));
        notification.setReferenceId(budget.getBudgetId());
        notification.setAmount(totalSpent);
        notification.setCategory(categoryName);
        notification.setRead(false);

        Notification savedNotification = notificationRepository.save(notification);
        
        // Send via WebSocket for real-time notification
        sendWebSocketNotification(userId, savedNotification, categoryName);
    }

/**
     * Create a notification for budget running low.
     */
    private void createBudgetWarningNotification(int userId, Budget budget, String categoryName, double totalSpent,
            double remainingPercent, double spentPercent) {
        // Check if notification already exists
        if (notificationRepository.existsNotification(userId, NotificationType.BUDGET_WARNING,
                budget.getBudgetId())) {
            return;
        }

        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setType(NotificationType.BUDGET_WARNING);
        notification.setUrgency(Urgency.MEDIUM); // Warning = medium urgency
        notification.setTitle("Budget Warning");
        notification.setMessage(String.format(
                "You've spent %.0f%% of your %s budget. Only %.0f%% remaining (₱%.2f of ₱%d).",
                spentPercent, categoryName, remainingPercent, budget.getLimitAmount() - totalSpent, budget.getLimitAmount()));
        notification.setReferenceId(budget.getBudgetId());
        notification.setAmount(budget.getLimitAmount() - totalSpent);
        notification.setCategory(categoryName);
        notification.setRead(false);

        Notification savedNotification = notificationRepository.save(notification);
        
        // Send via WebSocket for real-time notification
        sendWebSocketNotification(userId, savedNotification, categoryName);
    }

    /**
     * Create a notification for approaching savings deadline.
     */
    private void createSavingsDeadlineNotification(int userId, Saving saving, long daysRemaining, Urgency urgencyLevel) {
        // Check if notification of THIS urgency level already exists
        if (notificationRepository.existsByUserIdAndTypeAndReferenceIdAndUrgencyAndIsDeletedFalse(
                userId, NotificationType.SAVINGS_DEADLINE, saving.getSavingId(), urgencyLevel)) {
            return;
        }

        String timeLabel = daysRemaining <= 1 ? "Tomorrow" : daysRemaining + " days";
        if (daysRemaining == 0) timeLabel = "Today";
        
        double progress = saving.getTargetAmount() > 0
                ? ((double) saving.getCurrentAmount() / saving.getTargetAmount()) * 100
                : 0;

        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setType(NotificationType.SAVINGS_DEADLINE);
        notification.setUrgency(urgencyLevel);
        notification.setTitle("Savings Goal Reminder");
        notification.setMessage(String.format(
                "Your \"%s\" savings goal is due in %s! Currently at %.0f%% (₱%d of ₱%d).",
                saving.getName(), timeLabel, progress, saving.getCurrentAmount(), saving.getTargetAmount()));
        notification.setReferenceId(saving.getSavingId());
        notification.setAmount((double) saving.getTargetAmount() - saving.getCurrentAmount());
        notification.setCategory(saving.getName());
        notification.setRead(false);

        Notification savedNotification = notificationRepository.save(notification);
        
        // Send via WebSocket for real-time notification
        sendWebSocketNotification(userId, savedNotification, saving.getName());
    }

    /**
     * Check all active savings for milestone completion (50%, 75%, 100%).
     */
    private void generateSavingsMilestoneNotifications(int userId) {
        List<Saving> savings = savingRepository.findActiveSavingsByUserId(userId);

        for (Saving saving : savings) {
            if (saving.getTargetAmount() <= 0) {
                continue;
            }

            double progress = ((double) saving.getCurrentAmount() / saving.getTargetAmount()) * 100;

            // Check 100% completion (Goal Completed)
            if (progress >= 100) {
                createSavingsCompletedNotification(userId, saving, progress);
            }
            // Check 75% milestone
            else if (progress >= 75 && progress < 100) {
                createSavingsMilestoneNotification(userId, saving, 75, progress, Urgency.MEDIUM);
            }
            // Check 50% milestone
            else if (progress >= 50 && progress < 75) {
                createSavingsMilestoneNotification(userId, saving, 50, progress, Urgency.LOW);
            }
        }
    }

    /**
     * Create a notification for savings goal completion.
     */
    private void createSavingsCompletedNotification(int userId, Saving saving, double progress) {
        // Check if notification already exists
        if (notificationRepository.existsByUserIdAndTypeAndReferenceIdAndIsDeletedFalse(
                userId, NotificationType.SAVINGS_COMPLETED, saving.getSavingId())) {
            return;
        }

        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setType(NotificationType.SAVINGS_COMPLETED);
        notification.setUrgency(Urgency.LOW); // Positive notification
        notification.setTitle("🎉 Goal Completed!");
        notification.setMessage(String.format(
                "Congratulations! You've reached your \"%s\" goal of ₱%d! Time to celebrate!",
                saving.getName(), saving.getTargetAmount()));
        notification.setReferenceId(saving.getSavingId());
        notification.setAmount((double) saving.getCurrentAmount());
        notification.setCategory(saving.getName());
        notification.setRead(false);

        Notification savedNotification = notificationRepository.save(notification);
        
        // Send via WebSocket for real-time notification
        sendWebSocketNotification(userId, savedNotification, saving.getName());
    }

    /**
     * Create a notification for savings milestone (50% or 75%).
     */
    private void createSavingsMilestoneNotification(int userId, Saving saving, int milestone, double progress, Urgency urgency) {
        NotificationType milestoneType = milestone == 50 
            ? NotificationType.SAVINGS_MILESTONE_50 
            : NotificationType.SAVINGS_MILESTONE_75;

        // Check if this specific milestone notification already exists
        if (notificationRepository.existsByUserIdAndTypeAndReferenceIdAndIsDeletedFalse(
                userId, milestoneType, saving.getSavingId())) {
            return;
        }

        String milestoneEmoji = milestone == 50 ? "🎯" : "⭐";
        String milestoneMessage = milestone == 50 
            ? "You're halfway there!" 
            : "You're almost there!";

        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setType(milestoneType);
        notification.setUrgency(urgency);
        notification.setTitle(String.format("%s Milestone Reached!", milestoneEmoji));
        notification.setMessage(String.format(
                "%s Your \"%s\" fund is at %d%% (₱%d of ₱%d). Keep it up! 💪",
                milestoneMessage, saving.getName(), milestone, 
                saving.getCurrentAmount(), saving.getTargetAmount()));
        notification.setReferenceId(saving.getSavingId());
        notification.setAmount((double) saving.getTargetAmount() - saving.getCurrentAmount());
        notification.setCategory(saving.getName());
        notification.setRead(false);

        Notification savedNotification = notificationRepository.save(notification);
        
        // Send via WebSocket for real-time notification
        sendWebSocketNotification(userId, savedNotification, saving.getName());
    }

    /**
     * Get category name by ID.
     */
    private String getCategoryName(int categoryId) {
        return categoryRepository.findById(categoryId)
                .map(Category::getName)
                .orElse("Unknown Category");
    }

    /**
     * Get all notifications for a user.
     */
    public List<NotificationResponse> getNotifications(int userId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);

        return notifications.stream()
                .map(n -> NotificationResponse.fromEntity(n, n.getCategory()))
                .collect(Collectors.toList());
    }

    /**
     * Get unread notification count.
     */
    public long getUnreadCount(int userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    /**
     * Mark a single notification as read.
     */
    @Transactional
    public void markAsRead(@NonNull Long notificationId, int userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));

        if (notification.getUserId() != userId) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Unauthorized to access this notification");
        }

        notification.setRead(true);
        notification.setReadAt(java.time.LocalDateTime.now());
        notificationRepository.save(notification);
    }

    /**
     * Mark all notifications as read for a user.
     */
    @Transactional
    public void markAllAsRead(int userId) {
        notificationRepository.markAllAsReadByUserId(userId);
    }

    /**
     * Delete a notification (soft delete).
     */
    @Transactional
    public void deleteNotification(@NonNull Long notificationId, int userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));

        if (notification.getUserId() != userId) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Unauthorized to delete this notification");
        }

        // Soft delete: mark as deleted instead of removing from database
        notification.setDeleted(true);
        notification.setDeletedAt(java.time.LocalDateTime.now());
        notificationRepository.save(notification);
    }

    /**
     * Helper method to send notification via WebSocket.
     * Converts the notification entity to response DTO and sends to user.
     */
    private void sendWebSocketNotification(int userId, Notification notification, String categoryOrSavingName) {
        try {
            NotificationResponse response = NotificationResponse.fromEntity(notification, categoryOrSavingName);
            webSocketController.sendNotificationToUser(userId, response);
            log.info("📤 WebSocket notification sent to user {}: {}", userId, notification.getTitle());
        } catch (Exception e) {
            // Log error but don't fail the notification creation
            log.error("❌ Failed to send WebSocket notification to user {}: {}", userId, e.getMessage());
        }
    }
}
