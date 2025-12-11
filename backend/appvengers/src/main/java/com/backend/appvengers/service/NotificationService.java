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

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final BudgetRepository budgetRepository;
    private final SavingRepository savingRepository;
    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

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

        // Generate savings deadline notifications
        generateSavingsDeadlineNotifications(userId);
    }

    /**
     * Check all active budgets for the user and generate warnings/alerts.
     */
    private void generateBudgetNotifications(int userId, User user) {
        List<Budget> budgets = budgetRepository.findActiveBudgetsByUserId(userId);
        LocalDate today = LocalDate.now();

        for (Budget budget : budgets) {
            // Skip budgets outside their date range
            if (today.isBefore(budget.getStartDate()) || today.isAfter(budget.getEndDate())) {
                continue;
            }

            // Get category name for this budget
            String categoryName = getCategoryName(budget.getCategoryId());

            // Calculate total spent in this category within budget date range
            Double totalSpent = transactionRepository.findMonthlyExpenseByCategoryForBudget(
                    user, categoryName, budget.getStartDate(), budget.getEndDate());

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
            // Check if budget is running low (10-20% remaining)
            else if (remainingPercent >= 10 && remainingPercent <= 20) {
                createBudgetWarningNotification(userId, budget, categoryName, totalSpent, remainingPercent);
            }
        }
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

            // Only notify for 7, 3, or 1 days remaining
            if (daysRemaining == 7 || daysRemaining == 3 || daysRemaining == 1) {
                createSavingsDeadlineNotification(userId, saving, daysRemaining);
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

        notificationRepository.save(notification);
    }

    /**
     * Create a notification for budget running low.
     */
    private void createBudgetWarningNotification(int userId, Budget budget, String categoryName, double totalSpent,
            double remainingPercent) {
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
                "You're close to exceeding your %s budget. Only %.0f%% remaining (₱%.2f of ₱%d).",
                categoryName, remainingPercent, budget.getLimitAmount() - totalSpent, budget.getLimitAmount()));
        notification.setReferenceId(budget.getBudgetId());
        notification.setAmount(budget.getLimitAmount() - totalSpent);
        notification.setCategory(categoryName);
        notification.setRead(false);

        notificationRepository.save(notification);
    }

    /**
     * Create a notification for approaching savings deadline.
     */
    private void createSavingsDeadlineNotification(int userId, Saving saving, long daysRemaining) {
        // Determine urgency based on days remaining
        // 7 days = LOW (blue/info)
        // 3 days = MEDIUM (yellow/warning)
        // 1 day = HIGH (red/alert)
        Urgency urgencyLevel;
        if (daysRemaining == 7) {
            urgencyLevel = Urgency.LOW;
        } else if (daysRemaining == 3) {
            urgencyLevel = Urgency.MEDIUM;
        } else {
            urgencyLevel = Urgency.HIGH;
        }

        // Check if notification already exists (read or unread)
        if (notificationRepository.existsNotification(userId, NotificationType.SAVINGS_DEADLINE,
                saving.getSavingId())) {
            return;
        }

        String timeLabel = daysRemaining == 1 ? "Tomorrow" : daysRemaining + " days";
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

        notificationRepository.save(notification);
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
        // Generate fresh notifications first
        generateNotifications(userId);

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
    public void markAsRead(Long notificationId, int userId) {
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
     * Delete a notification.
     */
    @Transactional
    public void deleteNotification(Long notificationId, int userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));

        if (notification.getUserId() != userId) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Unauthorized to delete this notification");
        }

        notificationRepository.delete(notification);
    }
}
