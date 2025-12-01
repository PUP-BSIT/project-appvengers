package com.backend.appvengers.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.backend.appvengers.entity.Budget;

public interface BudgetRepository extends JpaRepository<Budget, Integer> {
  // Additional query methods can be defined here if needed

  @Query(value = "SELECT * FROM tbl_budget WHERE deleted_at IS NULL", nativeQuery = true)
  List<Budget> findAllActiveBudgets();
}
