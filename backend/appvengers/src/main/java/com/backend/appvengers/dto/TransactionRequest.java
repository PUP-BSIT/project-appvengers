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
public class TransactionRequest {

    private Long id;

    @NotNull
    private BigDecimal amount;

    // New: category id to bind to Category entity
    private Integer category_id;

    private String description;

    private LocalDate transactionDate;
}
