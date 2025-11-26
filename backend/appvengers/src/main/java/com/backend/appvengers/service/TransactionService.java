package com.backend.appvengers.service;

import com.backend.appvengers.dto.ExpenseSummary;
import com.backend.appvengers.dto.TransactionRequest;
import com.backend.appvengers.dto.TransactionResponse;
import com.backend.appvengers.entity.Transaction;
import com.backend.appvengers.entity.User;
import com.backend.appvengers.repository.TransactionRepository;
import com.backend.appvengers.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public List<TransactionResponse> findAllForUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return transactionRepository.findByUser(user).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public TransactionResponse create(String email, TransactionRequest req) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Transaction t = new Transaction();
        t.setUser(user);
        t.setAmount(req.getAmount());
        t.setType(req.getType());
        t.setCategory(req.getCategory());
        t.setDescription(req.getDescription());
        t.setTransactionDate(req.getTransactionDate());

        Transaction saved = transactionRepository.save(t);
        return toResponse(saved);
    }

    @Transactional
    public TransactionResponse update(String email, Long id, TransactionRequest req) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Transaction t = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (!t.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Not authorized");
        }

        t.setAmount(req.getAmount());
        t.setType(req.getType());
        t.setCategory(req.getCategory());
        t.setDescription(req.getDescription());
        t.setTransactionDate(req.getTransactionDate());

        Transaction saved = transactionRepository.save(t);
        return toResponse(saved);
    }

    @Transactional
    public void delete(String email, Long id) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Transaction t = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (!t.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Not authorized");
        }

        transactionRepository.delete(t);
    }

    public ExpenseSummary getExpenseSummary(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Object[]> rows = transactionRepository.findExpenseSummaryByUser(user);
        List<String> labels = new ArrayList<>();
        List<Double> values = new ArrayList<>();

        for (Object[] r : rows) {
            labels.add((String) r[0]);
            values.add(((Number) r[1]).doubleValue());
        }

        return new ExpenseSummary(labels, values);
    }

    private TransactionResponse toResponse(Transaction t) {
        return new TransactionResponse(
                t.getId(),
                t.getAmount(),
                t.getType(),
                t.getCategory(),
                t.getDescription(),
                t.getTransactionDate()
        );
    }
}