package com.backend.appvengers.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tbl_budget")
@SQLDelete(sql = "UPDATE tbl_budget SET deleted_at = NOW() WHERE budget_id = ?")
@SQLRestriction("deleted_at IS NULL")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Budget {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "budget_id")
  private int budgetId;

  @Column(name = "user_id", nullable = false)
  private int userId;

  @Column(name= "name", nullable = false)
  private String name;

  @Column(name = "category_id", nullable = false)
  private int categoryId;

  @Column(name = "limit_amount", nullable = false)
  private int limitAmount;

  @Column(name = "start_date", nullable = false)
  private LocalDate startDate;

  @Column(name = "end_date", nullable = false)
  private LocalDate endDate;

  @Column(name = "deleted_at")
  private LocalDateTime deletedAt;
}
