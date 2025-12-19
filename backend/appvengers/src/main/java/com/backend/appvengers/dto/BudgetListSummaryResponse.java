package com.backend.appvengers.dto;

import java.time.LocalDate;

public record BudgetListSummaryResponse(
    Integer budgetId,
    Integer categoryId,
    String categoryName,
    Integer limitAmount,
    LocalDate startDate,
    LocalDate endDate,
    Double currentAmount 
) {}