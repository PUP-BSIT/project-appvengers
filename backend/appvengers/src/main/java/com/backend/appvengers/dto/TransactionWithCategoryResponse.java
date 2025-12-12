package com.backend.appvengers.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionWithCategoryResponse {
    private Long id;
    private BigDecimal amount;
    private String description;
    private LocalDate transactionDate;
    private Integer categoryId;
    private String name;
    private String type;
    private Integer categoryUserId;
}
