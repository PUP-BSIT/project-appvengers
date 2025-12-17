package com.backend.appvengers.dto;

public record BudgetSummaryResponse(
    Integer budgetId,
    Integer categoryId,
    String categoryName,
    Integer limitAmount,
    Double totalExpenses,
    Double remainingBudget
) {}
