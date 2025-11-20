package com.backend.appvengers.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionRequest {

    private Integer id;

    @NotNull
    private BigDecimal amount;

    @NotBlank
    private String type;

    private String category;

    private String description;

    private LocalDateTime transactionDate;
}
