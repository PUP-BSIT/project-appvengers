package com.backend.appvengers.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.backend.appvengers.entity.Saving;

public interface SavingRepository extends JpaRepository<Saving, Integer> {
  // Additional query methods can be defined here if needed

  // JPA Query to find all active savings (not deleted)
  @Query("SELECT s FROM Saving s WHERE s.deletedAt IS NULL AND s.userId = :userId")
  List<Saving> findActiveSavingsByUserId(@Param("userId") int userId);
}
