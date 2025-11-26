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

    @Query("""
        SELECT COALESCE(c.name, 'Uncategorized'), SUM(t.amount)
        FROM Transaction t
        LEFT JOIN t.category c
        WHERE t.isDeleted = false AND t.user = :user
        GROUP BY COALESCE(c.name, 'Uncategorized')
    """)
    List<Object[]> findExpenseSummaryByUser(@Param("user") User user);
}