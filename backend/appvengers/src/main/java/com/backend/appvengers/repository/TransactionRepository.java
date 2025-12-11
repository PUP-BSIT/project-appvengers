package com.backend.appvengers.repository;

import com.backend.appvengers.entity.Transaction;
import com.backend.appvengers.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByUser(User user);

    //Finds transactions linked to a budget (only non-deleted)
    List<Transaction> findByBudget_BudgetIdAndDeletedAtIsNull(Integer budgetId);

    // Fetch transactions without a linked saving (saving_id is NULL), only non-deleted for a user
    @Query("""
        SELECT t
        FROM Transaction t
        WHERE t.user = :user AND t.deletedAt IS NULL AND t.saving IS NULL AND t.budget IS NULL
    """)
    List<Transaction> findByUserAndDeletedAtIsNullAndSavingIsNull(@Param("user") User user);

    // Expense summary - only non-deleted transactions
    @Query("""
        SELECT COALESCE(t.category, 'Uncategorized'), SUM(t.amount)
        FROM Transaction t
        WHERE t.user = :user AND t.type = :type AND t.deletedAt IS NULL
        GROUP BY COALESCE(t.category, 'Uncategorized')
    """)
    List<Object[]> findExpenseSummaryByUserAndType(@Param("user") User user, @Param("type") String type);

    // Income summary - only non-deleted transactions
    @Query("""
        SELECT COALESCE(t.category, 'Uncategorized'), SUM(t.amount)
        FROM Transaction t
        WHERE t.user = :user AND t.type = :type AND t.deletedAt IS NULL
        GROUP BY COALESCE(t.category, 'Uncategorized')
    """)
    List<Object[]> findIncomeSummaryByUserAndType(@Param("user") User user, @Param("type") String type);

    // Monthly total spending - only expenses, non-deleted
    @Query("""
        SELECT SUM(t.amount)
        FROM Transaction t
        WHERE t.user = :user 
        AND t.type = 'EXPENSE' 
        AND t.deletedAt IS NULL
        AND t.transactionDate >= :startDate 
        AND t.transactionDate < :endDate
    """)
    Double findMonthlyTotalByUserAndDateRange(
            @Param("user") User user,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    // Monthly total income - only income, non-deleted
    @Query("""
        SELECT SUM(t.amount)
        FROM Transaction t
        WHERE t.user = :user 
        AND t.type = 'INCOME' 
        AND t.deletedAt IS NULL
        AND t.transactionDate >= :startDate 
        AND t.transactionDate < :endDate
    """)
    Double findMonthlyIncomeByUserAndDateRange(
            @Param("user") User user,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    // Monthly expense by category
    @Query("""
        SELECT COALESCE(t.category, 'Uncategorized'), SUM(t.amount)
        FROM Transaction t
        WHERE t.user = :user 
        AND t.type = 'EXPENSE' 
        AND t.deletedAt IS NULL
        AND t.transactionDate >= :startDate 
        AND t.transactionDate < :endDate
        GROUP BY COALESCE(t.category, 'Uncategorized')
    """)
    List<Object[]> findMonthlyExpenseByCategoryAndDateRange(
            @Param("user") User user,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    // Monthly income by category
    @Query("""
        SELECT COALESCE(t.category, 'Uncategorized'), SUM(t.amount)
        FROM Transaction t
        WHERE t.user = :user 
        AND t.type = 'INCOME' 
        AND t.deletedAt IS NULL
        AND t.transactionDate >= :startDate 
        AND t.transactionDate < :endDate
        GROUP BY COALESCE(t.category, 'Uncategorized')
    """)
    List<Object[]> findMonthlyIncomeByCategoryAndDateRange(
            @Param("user") User user,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    // Get total expenses for a specific category within date range (for budget
    // notifications)
    @Query("""
                SELECT COALESCE(SUM(t.amount), 0)
                FROM Transaction t
                WHERE t.user = :user
                AND t.type = 'EXPENSE'
                AND t.deletedAt IS NULL
                AND LOWER(COALESCE(t.category, '')) = LOWER(:categoryName)
                AND t.transactionDate >= :startDate
                AND t.transactionDate <= :endDate
            """)
    Double findMonthlyExpenseByCategoryForBudget(
            @Param("user") User user,
            @Param("categoryName") String categoryName,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}