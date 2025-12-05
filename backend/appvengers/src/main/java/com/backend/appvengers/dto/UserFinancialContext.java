package com.backend.appvengers.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO containing user's financial context for AI chatbot.
 * This provides the chatbot with real-time user data to give personalized insights.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserFinancialContext {

    // User info
    private String username;
    
    // Financial summary
    private BigDecimal totalIncome;
    private BigDecimal totalExpenses;
    private BigDecimal remainingBudget;
    
    // Expense breakdown by category
    private List<CategorySummary> expensesByCategory;
    
    // Income breakdown by category
    private List<CategorySummary> incomeByCategory;
    
    // Active budgets
    private List<BudgetSummary> activeBudgets;
    
    // Savings goals
    private List<SavingSummary> savingsGoals;
    
    // Recent transactions (last 10)
    private List<TransactionSummary> recentTransactions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategorySummary {
        private String category;
        private BigDecimal amount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BudgetSummary {
        private String categoryName;
        private BigDecimal limitAmount;
        private BigDecimal spentAmount;
        private BigDecimal remainingAmount;
        private String startDate;
        private String endDate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SavingSummary {
        private String name;
        private BigDecimal targetAmount;
        private BigDecimal currentAmount;
        private BigDecimal remainingToGoal;
        private double progressPercent;
        private String goalDate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransactionSummary {
        private String type;
        private BigDecimal amount;
        private String category;
        private String description;
        private String date;
    }
}
