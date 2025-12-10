package com.backend.appvengers.controller;

import com.backend.appvengers.dto.SavingTransaction;
import com.backend.appvengers.dto.SavingTransactionRequest;
import com.backend.appvengers.entity.Saving;
import com.backend.appvengers.entity.Transaction;
import com.backend.appvengers.entity.User;
import com.backend.appvengers.repository.SavingRepository;
import com.backend.appvengers.repository.TransactionRepository;
import com.backend.appvengers.repository.UserRepository;
import lombok.RequiredArgsConstructor;
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
}
