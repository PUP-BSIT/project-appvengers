package com.backend.appvengers.repository;

import com.backend.appvengers.entity.Transaction;
import com.backend.appvengers.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByUser(User user);

    // Expense summary
    @Query("""
        SELECT COALESCE(t.category, 'Uncategorized'), SUM(t.amount)
        FROM Transaction t
        WHERE t.user = :user AND t.type = :type
        GROUP BY COALESCE(t.category, 'Uncategorized')
    """)
    List<Object[]> findExpenseSummaryByUserAndType(@Param("user") User user, @Param("type") String type);

    // Income summary (uniform with expense)
    @Query("""
        SELECT COALESCE(t.category, 'Uncategorized'), SUM(t.amount)
        FROM Transaction t
        WHERE t.user = :user AND t.type = :type
        GROUP BY COALESCE(t.category, 'Uncategorized')
    """)
    List<Object[]> findIncomeSummaryByUserAndType(@Param("user") User user, @Param("type") String type);
}