package com.backend.appvengers.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SavingTransactionRequest {
  @NotNull
  private BigDecimal amount;
  private String description;
  @NotNull
  private String savingsAction; // e.g., DEPOSIT or WITHDRAW
  private LocalDate transactionDate;
}
