package com.backend.appvengers.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.backend.appvengers.dto.SavingTransaction;
import com.backend.appvengers.entity.Saving;

public interface SavingRepository extends JpaRepository<Saving, Integer> {
  // Additional query methods can be defined here if needed

  // JPA Query to find all active savings (not deleted)
  @Query("SELECT s FROM Saving s WHERE s.deletedAt IS NULL AND s.userId = :userId")
  List<Saving> findActiveSavingsByUserId(@Param("userId") int userId);

  // JPQL Query to fetch transactions with saving details
  @Query("SELECT new com.backend.appvengers.dto.SavingTransaction(" +
       "t.id, t.saving.savingId, t.user.id, t.transactionDate, " +
       "t.savingsAction, t.description, t.amount, " +
       "t.createdAt, t.updatedAt, t.deletedAt) " +
       "FROM Transaction t JOIN t.saving s JOIN t.user u ON t.user.id = u.id " +
       "WHERE s.deletedAt IS NULL AND u.deletedAt IS NULL AND u.id = :userId")
  List<SavingTransaction> fetchTransactionWithSavingDetails(@Param("userId") int userId);

  // JPQL Query to fetch transactions with saving details for a specific savingId
  @Query("SELECT new com.backend.appvengers.dto.SavingTransaction(" +
       "t.id, s.savingId, u.id, t.transactionDate, " +
       "t.savingsAction, t.description, t.amount, " +
       "t.createdAt, t.updatedAt, t.deletedAt) " +
       "FROM Transaction t " +
       "JOIN t.saving s " +
       "JOIN t.user u " +
       "WHERE s.savingId = :savingId " +
       "AND u.id = :userId")
  List<SavingTransaction> fetchSavingsTransactionById(@Param("savingId") int savingId,
                                                          @Param("userId") int userId);
}
