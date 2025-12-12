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

    // Fetch transactions joined with category for a user, with saving 
    // and budget NULL, category present, and not soft-deleted
    @Query("""
        SELECT t FROM Transaction t
        LEFT JOIN FETCH t.categoryRef c
        WHERE t.user = :user
          AND t.saving IS NULL
          AND t.budget IS NULL
          AND t.categoryRef IS NOT NULL
          AND t.deletedAt IS NULL
    """)
    List<Transaction> findByUserAndDeletedAtIsNull(@Param("user") User user);

    // Expense summary - only non-deleted transactions, using Category relation
    @Query("""
        SELECT COALESCE(c.name, 'Uncategorized'), SUM(t.amount)
        FROM Transaction t LEFT JOIN t.categoryRef c
        WHERE t.user = :user AND c.type = :type AND t.deletedAt IS NULL AND t.categoryRef IS NOT NULL
        GROUP BY COALESCE(c.name, 'Uncategorized')
    """)
    List<Object[]> findExpenseSummaryByUserAndType(@Param("user") User user, @Param("type") String type);

    // Income summary - only non-deleted transactions, using Category relation
    @Query("""
        SELECT COALESCE(c.name, 'Uncategorized'), SUM(t.amount)
        FROM Transaction t LEFT JOIN t.categoryRef c
        WHERE t.user = :user AND c.type = :type AND t.deletedAt IS NULL AND t.categoryRef IS NOT NULL
        GROUP BY COALESCE(c.name, 'Uncategorized')
    """)
    List<Object[]> findIncomeSummaryByUserAndType(@Param("user") User user, @Param("type") String type);

    // Monthly total spending - only expenses, non-deleted, using Category.type
    @Query("""
        SELECT SUM(t.amount)
        FROM Transaction t LEFT JOIN t.categoryRef c
        WHERE t.user = :user 
        AND c.type = 'EXPENSE'
        AND t.deletedAt IS NULL
        AND t.categoryRef IS NOT NULL
        AND t.transactionDate >= :startDate 
        AND t.transactionDate < :endDate
    """)
    Double findMonthlyTotalByUserAndDateRange(
            @Param("user") User user,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    // Monthly total income - only income, non-deleted, using Category.type
    @Query("""
        SELECT SUM(t.amount)
        FROM Transaction t LEFT JOIN t.categoryRef c
        WHERE t.user = :user 
        AND c.type = 'INCOME'
        AND t.deletedAt IS NULL
        AND t.categoryRef IS NOT NULL
        AND t.transactionDate >= :startDate 
        AND t.transactionDate < :endDate
    """)
    Double findMonthlyIncomeByUserAndDateRange(
            @Param("user") User user,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    // Monthly expense by category
    @Query("""
        SELECT COALESCE(c.name, 'Uncategorized'), SUM(t.amount)
        FROM Transaction t LEFT JOIN t.categoryRef c
        WHERE t.user = :user 
        AND c.type = 'EXPENSE' 
        AND t.deletedAt IS NULL
        AND t.categoryRef IS NOT NULL
        AND t.transactionDate >= :startDate 
        AND t.transactionDate < :endDate
        GROUP BY COALESCE(c.name, 'Uncategorized')
    """)
    List<Object[]> findMonthlyExpenseByCategoryAndDateRange(
            @Param("user") User user,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    // Monthly income by category
    @Query("""
        SELECT COALESCE(c.name, 'Uncategorized'), SUM(t.amount)
        FROM Transaction t LEFT JOIN t.categoryRef c
        WHERE t.user = :user 
        AND c.type = 'INCOME' 
        AND t.deletedAt IS NULL
        AND t.categoryRef IS NOT NULL
        AND t.transactionDate >= :startDate 
        AND t.transactionDate < :endDate
        GROUP BY COALESCE(c.name, 'Uncategorized')
    """)
    List<Object[]> findMonthlyIncomeByCategoryAndDateRange(
            @Param("user") User user,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    // Get total expenses for a specific category within date range (for budget
    // notifications)
    @Query("""
                SELECT COALESCE(SUM(t.amount), 0)
                FROM Transaction t LEFT JOIN t.categoryRef c
                WHERE t.user = :user
                AND c.type = 'EXPENSE'
                AND t.deletedAt IS NULL
                AND LOWER(COALESCE(c.name, '')) = LOWER(:categoryName)
                AND t.transactionDate >= :startDate
                AND t.transactionDate <= :endDate
            """)
    Double findMonthlyExpenseByCategoryForBudget(
            @Param("user") User user,
            @Param("categoryName") String categoryName,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}