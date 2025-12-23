package com.backend.appvengers.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.annotations.UpdateTimestamp;

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
@Table(name = "tbl_saving")
@SQLDelete(sql = "UPDATE tbl_saving SET deleted_at = NOW() WHERE saving_id = ?")
@SQLRestriction("deleted_at IS NULL")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Saving {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "saving_id")
  private int savingId;

  @Column(name = "user_id", nullable = false)
  private int userId;

  @Column(name = "name", nullable = false)
  private String name;

  @Column(name = "goal_date")
  private LocalDate goalDate;

  @Column(name = "frequency")
  private String frequency;

  @Column(name = "target_amount")
  private int targetAmount;

  @Column(name = "current_amount")
  private int currentAmount;

  @Column(name = "description")
  private String description;

  @Column(name = "header_color", columnDefinition = "varchar(45) default 'bg-dark'")
  private String headerColor;

  @CreationTimestamp
  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @UpdateTimestamp
  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @Column(name = "deleted_at")
  private LocalDateTime deletedAt;
}
