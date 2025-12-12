package com.backend.appvengers.controller;

import com.backend.appvengers.dto.ApiResponse;
import com.backend.appvengers.dto.SavingTransaction;
import com.backend.appvengers.dto.SavingTransactionRequest;
import com.backend.appvengers.entity.Saving;
import com.backend.appvengers.entity.Transaction;
import com.backend.appvengers.entity.User;
import com.backend.appvengers.repository.SavingRepository;
import com.backend.appvengers.repository.TransactionRepository;
import com.backend.appvengers.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SavingTransactionController {

  private final SavingRepository savingRepository;
  private final TransactionRepository transactionRepository;
  private final UserRepository userRepository;

  private int currentUserId(Authentication auth) {
    String email = auth.getName();
    User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new RuntimeException("User not found"));
    return user.getId();
  }

  // DONE: Add saving transaction
  @PostMapping("/savings/{savingId}/transactions")
  public SavingTransaction addSavingTransaction(@PathVariable Integer savingId,
                                                @RequestBody SavingTransactionRequest req,
                                                Authentication auth) {
    int userId = currentUserId(auth);
    Saving saving = savingRepository.findById(savingId)
        .orElseThrow(() -> new RuntimeException("Saving not found"));
    if (saving.getUserId() != userId) {
      throw new RuntimeException("Unauthorized access to saving");
    }

    User user = userRepository.findById((long) userId)
        .orElseThrow(() -> new RuntimeException("User not found"));

    Transaction t = new Transaction();
    t.setSaving(saving);
    t.setUser(user);
    t.setAmount(req.getAmount());
    t.setDescription(req.getDescription());
    t.setSavingsAction(req.getSavingsAction());
    t.setTransactionDate(req.getTransactionDate());
    // Map category and type for general Transaction entity
    
    Transaction saved = transactionRepository.save(t);

    return new SavingTransaction(
        saved.getId(),
        saving.getSavingId(),
        user.getId(),
        saved.getTransactionDate(),
        saved.getSavingsAction(),
        saved.getDescription(),
        saved.getAmount(),
        saved.getCreatedAt(),
        saved.getUpdatedAt(),
        saved.getDeletedAt()
    );
  }

  // DONE: Get saving transaction by ID
  @GetMapping("savings/{savingId}/transactions/{id}")
  public ResponseEntity<?> getSavingTransactionById(@PathVariable Integer savingId,
                                                    @PathVariable Long id,
                                                    Authentication auth) {
    int userId = currentUserId(auth);

    Transaction transaction = transactionRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Transaction not found"));

    if (transaction.getUser().getId() != userId) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(new ApiResponse(false, "Unauthorized access to transaction"));
    }

    if (transaction.getSaving().getSavingId() != savingId) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(new ApiResponse(false, "Transaction does not belong to the specified saving"));
    }

    Saving saving = transaction.getSaving();
    SavingTransaction dto = new SavingTransaction(
        transaction.getId(),
        saving.getSavingId(),
        transaction.getUser().getId(),
        transaction.getTransactionDate(),
        transaction.getSavingsAction(),
        transaction.getDescription(),
        transaction.getAmount(),
        transaction.getCreatedAt(),
        transaction.getUpdatedAt(),
        transaction.getDeletedAt()
    );

    return ResponseEntity.ok(dto);
  }

  // Update Saving Transaction
  @PutMapping("/savings/{savingId}/transactions/{id}")
  public ResponseEntity<?> updateSavingTransaction(@PathVariable Integer savingId,
                                                  @PathVariable Long id,
                                                  @RequestBody SavingTransactionRequest req,
                                                  Authentication auth) {
    int userId = currentUserId(auth);

    Transaction transaction = transactionRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Transaction not found"));

    if (transaction.getUser().getId() != userId) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(new ApiResponse(false, "Unauthorized access to transaction")); 
    }

    if (transaction.getSaving().getSavingId() != savingId) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(new ApiResponse(false, "Transaction does not belong to the specified saving"));
    }

    // Update fields
    transaction.setAmount(req.getAmount());
    transaction.setDescription(req.getDescription());
    transaction.setSavingsAction(req.getSavingsAction());
    transaction.setTransactionDate(req.getTransactionDate());
    Transaction updated = transactionRepository.save(transaction);

    Saving saving = transaction.getSaving();
    SavingTransaction dto = new SavingTransaction(
        updated.getId(),
        saving.getSavingId(),
        updated.getUser().getId(),
        updated.getTransactionDate(),
        updated.getSavingsAction(),
        updated.getDescription(),
        updated.getAmount(),
        updated.getCreatedAt(),
        updated.getUpdatedAt(),
        updated.getDeletedAt()
    );

    return ResponseEntity.ok(dto);
  }

  // DONE: Soft Delete Saving Transaction
  @DeleteMapping("/savings/{savingId}/transactions/{id}")
  public ResponseEntity<?> deleteSavingTransaction(@PathVariable Integer savingId,
                                                   @PathVariable Long id,
                                                   Authentication auth) {
    int userId = currentUserId(auth);

    Transaction transaction = transactionRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Transaction not found"));

    if (transaction.getUser().getId() != userId) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(new ApiResponse(false, "Unauthorized access to transaction"));
    }

    if (transaction.getSaving().getSavingId() != savingId) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(new ApiResponse(false, "Transaction does not belong to the specified saving"));
    }

    // Soft delete by setting deletedAt
    transaction.setDeletedAt(java.time.LocalDate.now());
    transactionRepository.save(transaction);
    return ResponseEntity.noContent().build();
  }
}
