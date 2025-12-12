package com.backend.appvengers.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data 
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponse {
    private Long id;
    private BigDecimal amount;
    private Integer category_id; // optional: present when linked
    private String category; // category name from Category entity
    private String type; // type from Category entity (INCOME/EXPENSE)
    private String description;
    private LocalDate transactionDate;
}
