package com.backend.appvengers.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.backend.appvengers.entity.Budget;
import com.backend.appvengers.dto.BudgetWithCategoryResponse;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Integer> {
  @Query(value = "SELECT * FROM tbl_budget WHERE deleted_at IS NULL", nativeQuery = true)
  List<Budget> findAllActiveBudgets();

  @Query(value = "SELECT * FROM tbl_budget WHERE deleted_at IS NULL AND user_id = :userId", nativeQuery = true)
  List<Budget> findActiveBudgetsByUserId(@org.springframework.data.repository.query.Param("userId") int userId);

  @Query(value = 
    "SELECT tb.budget_id AS budgetId, tb.user_id AS userId, tb.category_id " +
    "AS categoryId, tb.name As name, tb.limit_amount AS limitAmount, tb.start_date AS startDate, " + 
    "tb.end_date AS endDate, tc.name AS categoryName FROM tbl_budget tb LEFT " + 
    "JOIN tbl_category tc ON tb.category_id = tc.category_id WHERE tb.deleted_at " + 
    "IS NULL AND tb.user_id = :userId", nativeQuery = true)
  List<BudgetWithCategoryResponse> findBudgetsWithCategoryByUserId(@Param("userId") int userId);

  // Find budgets ending on a specific date
  @Query(value = "SELECT * FROM tbl_budget WHERE deleted_at IS NULL AND end_date = :endDate", nativeQuery = true)
  List<Budget> findByEndDate(@Param("endDate") LocalDate endDate);
  
  // Find active budget (non soft-deleted) by ID
  @Query("SELECT b FROM Budget b WHERE b.budgetId = :id AND b.deletedAt IS NULL")
  Optional<Budget> findActiveById(@Param("id") Integer id);

  // Search budgets by name or category for a given user
  @Query(value =
    "SELECT tb.budget_id AS budgetId, tb.user_id AS userId, tb.category_id AS categoryId, " +
    "tb.name AS name, tb.limit_amount AS limitAmount, tb.start_date AS startDate, " +
    "tb.end_date AS endDate, tc.name AS categoryName " +
    "FROM tbl_budget tb " +
    "LEFT JOIN tbl_category tc ON tb.category_id = tc.category_id " +
    "WHERE tb.deleted_at IS NULL AND tb.user_id = :userId " +
    "AND (LOWER(tb.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
    "OR LOWER(tc.name) LIKE LOWER(CONCAT('%', :query, '%')))",
    nativeQuery = true)
  List<BudgetWithCategoryResponse> searchBudgetsByUserIdAndQuery(@Param("userId") int userId, @Param("query") String query);
}
