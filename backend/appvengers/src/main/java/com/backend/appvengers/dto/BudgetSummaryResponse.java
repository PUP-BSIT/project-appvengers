package com.backend.appvengers.dto;

public record BudgetSummaryResponse(
    Integer budgetId,
    Integer categoryId,
    String categoryName,
    String name,
    Integer limitAmount,
    Double totalExpenses,
    Double remainingBudget
) {}
