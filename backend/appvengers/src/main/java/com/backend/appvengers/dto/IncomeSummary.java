package com.backend.appvengers.dto;

import java.math.BigDecimal;
import java.util.Map;

public class IncomeSummary {
    private Map<String, BigDecimal> categoryTotals;

    public IncomeSummary(Map<String, BigDecimal> categoryTotals) {
        this.categoryTotals = categoryTotals;
    }

    public Map<String, BigDecimal> getCategoryTotals() {
        return categoryTotals;
    }

    public void setCategoryTotals(Map<String, BigDecimal> categoryTotals) {
        this.categoryTotals = categoryTotals;
    }
}