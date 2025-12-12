package com.backend.appvengers.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record BudgetExpenseRequest(
    Integer budget_id,
    Integer category_id,
    LocalDate transaction_date,
    String description,
    BigDecimal amount
) {}