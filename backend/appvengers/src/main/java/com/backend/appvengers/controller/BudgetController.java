package com.backend.appvengers.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.appvengers.dto.BudgetWithCategoryResponse;
import com.backend.appvengers.entity.Budget;
import com.backend.appvengers.entity.User;
import com.backend.appvengers.repository.BudgetRepository;
import com.backend.appvengers.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class BudgetController {
  
  private final BudgetRepository budgetRepository;
  private final UserRepository userRepository;

  private int currentUserId(Authentication auth) {
    String email = auth.getName();
    User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new RuntimeException("User not found"));
    return user.getId();
  }

  // Get all active budgets for current user
  @GetMapping("/budgets")
  public List<BudgetWithCategoryResponse> getAllActiveBudgets(Authentication auth) {
    int userId = currentUserId(auth);
    return budgetRepository.findBudgetsWithCategoryByUserId(userId);
  }

  // Add a new budget for current user
  @PostMapping("/budgets")
  public Budget createBudget(@RequestBody Budget budget, Authentication auth) {
    int userId = currentUserId(auth);
    budget.setUserId(userId);
    return budgetRepository.save(budget);
  }

  // Get Budget By ID (must belong to current user)
  @GetMapping("/budgets/{id}")
  public ResponseEntity<Budget> getBudgetById(@PathVariable Integer id, Authentication auth) {
    int userId = currentUserId(auth);
    Budget budget = budgetRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Budget not found with id " + id));
    if (budget.getUserId() != userId) {
      throw new RuntimeException("Unauthorized to access this resource");
    }
    return ResponseEntity.ok(budget);
  }

  // Update Budget by ID (must belong to current user)
  @PutMapping("/budgets/{id}")
  public ResponseEntity<Budget> updateBudget(@PathVariable Integer id, @RequestBody Budget budget, Authentication auth) {
    int userId = currentUserId(auth);
    Budget existingBudget = budgetRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Budget not found with id " + id));
    if (existingBudget.getUserId() != userId) {
      throw new RuntimeException("Unauthorized to modify this resource");
    }

    // Update the fields of the existing budget (userId remains the same)
    existingBudget.setCategoryId(budget.getCategoryId());
    existingBudget.setLimitAmount(budget.getLimitAmount());
    existingBudget.setStartDate(budget.getStartDate());
    existingBudget.setEndDate(budget.getEndDate()); 

    Budget updatedBudget = budgetRepository.save(existingBudget);
    return ResponseEntity.ok(updatedBudget);
  }

  // Soft Delete Budget by ID (must belong to current user)
  @DeleteMapping("/budgets/{id}")
  public ResponseEntity<Void> deleteBudget(@PathVariable Integer id, Authentication auth) {
    int userId = currentUserId(auth);
    Budget existingBudget = budgetRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Budget not found with id " + id)); 
    if (existingBudget.getUserId() != userId) {
      throw new RuntimeException("Unauthorized to delete this resource");
    }

    budgetRepository.delete(existingBudget);
    return ResponseEntity.noContent().build();
  }
}
