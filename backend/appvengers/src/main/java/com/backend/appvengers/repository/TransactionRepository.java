package com.backend.appvengers.repository;
import java.util.List;
import com.backend.appvengers.entity.Transaction;
import com.backend.appvengers.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByUserIdAndTypeAndDeletedFalse(Long userId, String type);
    List<Transaction> findByUser(User user);

    // Expense summary
    @Query("""
        SELECT COALESCE(t.category, 'Uncategorized'), SUM(t.amount)
        FROM Transaction t
        WHERE t.user = :user AND t.type = 'EXPENSE' AND t.deleted = false
        GROUP BY COALESCE(t.category, 'Uncategorized')
    """)
    List<Object[]> findExpenseSummaryByUser(@Param("user") User user);

    // Income summary
    @Query("""
        SELECT COALESCE(t.category, 'Uncategorized'), SUM(t.amount)
        FROM Transaction t
        WHERE t.user = :user AND t.type = 'INCOME' AND t.deleted = false
        GROUP BY COALESCE(t.category, 'Uncategorized')
    """)
    List<Object[]> findIncomeSummaryByUser(@Param("user") User user);
}