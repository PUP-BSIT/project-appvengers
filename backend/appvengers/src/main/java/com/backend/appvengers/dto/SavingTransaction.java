package com.backend.appvengers.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data 
@NoArgsConstructor
@AllArgsConstructor
public class SavingTransaction {
  public Long id;
  public int savingId;
  public Integer userId; 
  public LocalDate transactionDate;
  public String savingAction;
  public String description;
  public BigDecimal amount;
  public LocalDate createdAt;
  public LocalDate updatedAt;
  public LocalDate deletedAt;
}
