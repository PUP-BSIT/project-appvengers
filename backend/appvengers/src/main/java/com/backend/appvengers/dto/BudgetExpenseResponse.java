package com.backend.appvengers.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record BudgetExpenseResponse(
    Long transactionId,
    Integer budgetId,
    LocalDate transactionDate,
    String description,
    String categoryName,
    BigDecimal amount,
    String type
) {}    