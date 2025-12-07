package com.backend.appvengers.service;

import com.backend.appvengers.dto.BudgetWithCategoryResponse;
import com.backend.appvengers.dto.TransactionResponse;
import com.backend.appvengers.dto.UserFinancialContext;
import com.backend.appvengers.dto.UserFinancialContext.*;
import com.backend.appvengers.entity.Saving;
import com.backend.appvengers.entity.User;
import com.backend.appvengers.repository.BudgetRepository;
import com.backend.appvengers.repository.SavingRepository;
import com.backend.appvengers.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service to gather user's financial context for AI chatbot.
 * Aggregates data from transactions, budgets, and savings.
 */
@Service
@RequiredArgsConstructor
public class UserContextService {

    private final UserRepository userRepository;
    private final TransactionService transactionService;
    private final BudgetRepository budgetRepository;
    private final SavingRepository savingRepository;

    /**
     * Builds a comprehensive financial context for the authenticated user.
     * This context is sent to the AI chatbot for personalized responses.
     */
    public UserFinancialContext buildUserContext(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Get all transactions
        List<TransactionResponse> allTransactions = transactionService.findAllForUser(email);

        // Calculate totals
        BigDecimal totalIncome = allTransactions.stream()
                .filter(t -> "INCOME".equalsIgnoreCase(t.getType()))
                .map(TransactionResponse::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpenses = allTransactions.stream()
                .filter(t -> "EXPENSE".equalsIgnoreCase(t.getType()))
                .map(TransactionResponse::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal remainingBudget = totalIncome.subtract(totalExpenses);

        // Get expense breakdown by category
        List<CategorySummary> expensesByCategory = allTransactions.stream()
                .filter(t -> "EXPENSE".equalsIgnoreCase(t.getType()))
                .collect(Collectors.groupingBy(
                        TransactionResponse::getCategory,
                        Collectors.reducing(BigDecimal.ZERO, TransactionResponse::getAmount, BigDecimal::add)
                ))
                .entrySet().stream()
                .map(e -> CategorySummary.builder()
                        .category(e.getKey())
                        .amount(e.getValue())
                        .build())
                .collect(Collectors.toList());

        // Get income breakdown by category
        List<CategorySummary> incomeByCategory = allTransactions.stream()
                .filter(t -> "INCOME".equalsIgnoreCase(t.getType()))
                .collect(Collectors.groupingBy(
                        TransactionResponse::getCategory,
                        Collectors.reducing(BigDecimal.ZERO, TransactionResponse::getAmount, BigDecimal::add)
                ))
                .entrySet().stream()
                .map(e -> CategorySummary.builder()
                        .category(e.getKey())
                        .amount(e.getValue())
                        .build())
                .collect(Collectors.toList());

        // Get active budgets with spent amounts
        List<BudgetSummary> activeBudgets = buildBudgetSummaries(user.getId(), allTransactions);

        // Get savings goals
        List<SavingSummary> savingsGoals = buildSavingsSummaries(user.getId());

        // Get recent transactions (last 10)
        List<TransactionSummary> recentTransactions = allTransactions.stream()
                .sorted((a, b) -> b.getTransactionDate().compareTo(a.getTransactionDate()))
                .limit(10)
                .map(t -> TransactionSummary.builder()
                        .type(t.getType())
                        .amount(t.getAmount())
                        .category(t.getCategory())
                        .description(t.getDescription())
                        .date(t.getTransactionDate().toString())
                        .build())
                .collect(Collectors.toList());

        return UserFinancialContext.builder()
                .username(user.getUsername())
                .userEmail(user.getEmail())
                .totalIncome(totalIncome)
                .totalExpenses(totalExpenses)
                .remainingBudget(remainingBudget)
                .expensesByCategory(expensesByCategory)
                .incomeByCategory(incomeByCategory)
                .activeBudgets(activeBudgets)
                .savingsGoals(savingsGoals)
                .recentTransactions(recentTransactions)
                .build();
    }

    private List<BudgetSummary> buildBudgetSummaries(Integer userId, List<TransactionResponse> transactions) {
        List<BudgetWithCategoryResponse> budgets = budgetRepository.findBudgetsWithCategoryByUserId(userId);

        return budgets.stream().map(budget -> {
            // Calculate spent amount for this budget's category
            BigDecimal spentAmount = transactions.stream()
                    .filter(t -> "EXPENSE".equalsIgnoreCase(t.getType()))
                    .filter(t -> t.getCategory().equalsIgnoreCase(budget.getCategoryName()))
                    .map(TransactionResponse::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal limitAmount = BigDecimal.valueOf(budget.getLimitAmount());
            BigDecimal remainingAmount = limitAmount.subtract(spentAmount);

            return BudgetSummary.builder()
                    .categoryName(budget.getCategoryName())
                    .limitAmount(limitAmount)
                    .spentAmount(spentAmount)
                    .remainingAmount(remainingAmount)
                    .startDate(budget.getStartDate())
                    .endDate(budget.getEndDate())
                    .build();
        }).collect(Collectors.toList());
    }

    private List<SavingSummary> buildSavingsSummaries(Integer userId) {
        List<Saving> savings = savingRepository.findActiveSavingsByUserId(userId);

        return savings.stream().map(saving -> {
            BigDecimal target = BigDecimal.valueOf(saving.getTargetAmount());
            BigDecimal current = BigDecimal.valueOf(saving.getCurrentAmount());
            BigDecimal remaining = target.subtract(current);
            
            double progressPercent = 0.0;
            if (target.compareTo(BigDecimal.ZERO) > 0) {
                progressPercent = current.divide(target, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                        .doubleValue();
            }

            return SavingSummary.builder()
                    .name(saving.getName())
                    .targetAmount(target)
                    .currentAmount(current)
                    .remainingToGoal(remaining)
                    .progressPercent(progressPercent)
                    .goalDate(saving.getGoalDate() != null ? saving.getGoalDate().toString() : null)
                    .build();
        }).collect(Collectors.toList());
    }
}
