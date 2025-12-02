package com.backend.appvengers.dto;

// Use a projection interface so Spring can map native query aliases directly
public interface BudgetWithCategoryResponse {
  Integer getBudgetId();
  Integer getUserId();
  Integer getCategoryId();
  Integer getLimitAmount();
  String getStartDate();
  String getEndDate();
  String getCategoryName();
}
