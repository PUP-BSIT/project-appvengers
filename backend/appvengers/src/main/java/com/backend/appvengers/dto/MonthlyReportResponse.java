package com.backend.appvengers.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyReportResponse {
    private String monthName;
    private int month;
    private int year;
    private Double totalSpent;
    private Double totalIncome;
    private Map<String, Double> expenseByCategory;
    private Map<String, Double> incomeByCategory;
}
