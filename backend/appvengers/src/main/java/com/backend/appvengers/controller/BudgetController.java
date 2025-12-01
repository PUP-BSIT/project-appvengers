package com.backend.appvengers.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.appvengers.entity.Budget;
import com.backend.appvengers.repository.BudgetRepository;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:4200")
public class BudgetController {
  // Controller methods for Budget entity can be defined here

  @Autowired
  private BudgetRepository budgetRepository;

  // WORKING: Endpoint to get all active budgets
  @GetMapping("/budgets")
  public List<Budget> getAllActiveBudgets() {
    return budgetRepository.findAllActiveBudgets();
  }

  // WORKING: Add a new budget
  @PostMapping("/budgets")
  public Budget createBudget(@RequestBody Budget budget) {
    return budgetRepository.save(budget);
  }

  // Get Budget by ID, Update Budget, Delete Budget methods can be added here

  // WORKING: Get Budget By ID
  @GetMapping("/budgets/{id}")
  public ResponseEntity<Budget> getBudgetById(@PathVariable Integer id) {
    Budget budget = budgetRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Budget not found with id " + id));
    return ResponseEntity.ok(budget);
  }

  // WORKING: Update Budget by ID
  @PutMapping("/budgets/{id}")
  public ResponseEntity<Budget> updateBudget(@PathVariable Integer id, @RequestBody Budget budget) {
    Budget existingBudget = budgetRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Budget not found with id " + id));

    // Update the fields of the existing budget
    existingBudget.setUserId(budget.getUserId());
    existingBudget.setCategoryId(budget.getCategoryId());
    existingBudget.setLimitAmount(budget.getLimitAmount());
    existingBudget.setStartDate(budget.getStartDate());
    existingBudget.setEndDate(budget.getEndDate()); 

    // Save the updated budget
    Budget updatedBudget = budgetRepository.save(existingBudget);
    return ResponseEntity.ok(updatedBudget);
  }

  // Soft Delete Budget by ID
  @DeleteMapping("/budgets/{id}")
  public ResponseEntity<Void> deleteBudget(@PathVariable Integer id) {
    Budget existingBudget = budgetRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Budget not found with id " + id)); 
      
    // Uses @SQLDelete annotation to perform soft delete
    budgetRepository.delete(existingBudget);
    return ResponseEntity.noContent().build();
  }
}
