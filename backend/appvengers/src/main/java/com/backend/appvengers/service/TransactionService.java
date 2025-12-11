package com.backend.appvengers.service;

import com.backend.appvengers.dto.BudgetExpenseRequest;
import com.backend.appvengers.dto.BudgetExpenseResponse;
import com.backend.appvengers.dto.ExpenseSummary;
import com.backend.appvengers.dto.IncomeSummary;
import com.backend.appvengers.dto.MonthlyReportResponse;
import com.backend.appvengers.dto.TransactionRequest;
import com.backend.appvengers.dto.TransactionResponse;
import com.backend.appvengers.entity.Budget;
import com.backend.appvengers.entity.Transaction;
import com.backend.appvengers.entity.User;
import com.backend.appvengers.repository.BudgetRepository;
import com.backend.appvengers.repository.TransactionRepository;
import com.backend.appvengers.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final BudgetRepository budgetRepository;

    public List<TransactionResponse> findAllForUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return transactionRepository.findByUserAndDeletedFalse(user).stream()
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

        // Soft delete: set deleted flag to true instead of removing from database
        t.setDeleted(true);
        transactionRepository.save(t);
    }

    // Expense summary
    public ExpenseSummary getExpenseSummary(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Object[]> rows = transactionRepository.findExpenseSummaryByUserAndType(user, "EXPENSE");
        List<String> labels = new ArrayList<>();
        List<Double> values = new ArrayList<>();

        for (Object[] r : rows) {
            labels.add((String) r[0]);
            values.add(((Number) r[1]).doubleValue());
        }

        return new ExpenseSummary(labels, values);
    }

    // Income summary 
    public IncomeSummary getIncomeSummary(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Object[]> rows = transactionRepository.findIncomeSummaryByUserAndType(user, "INCOME");
        List<String> labels = new ArrayList<>();
        List<Double> values = new ArrayList<>();

        for (Object[] r : rows) {
            labels.add((String) r[0]);
            values.add(((Number) r[1]).doubleValue());
        }

        return new IncomeSummary(labels, values);
    }

    // Monthly reports - get last month and this month spending
    public List<MonthlyReportResponse> getMonthlyReports(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<MonthlyReportResponse> reports = new ArrayList<>();
        
        // Current month
        YearMonth currentMonth = YearMonth.now();
        LocalDate currentStart = currentMonth.atDay(1);
        LocalDate currentEnd = currentMonth.atEndOfMonth().plusDays(1);
        
        Double currentTotalExpense = transactionRepository.findMonthlyTotalByUserAndDateRange(
            user, currentStart, currentEnd
        );
        
        Double currentTotalIncome = transactionRepository.findMonthlyIncomeByUserAndDateRange(
            user, currentStart, currentEnd
        );

        List<Object[]> currentExpenseByCategory = transactionRepository.findMonthlyExpenseByCategoryAndDateRange(
            user, currentStart, currentEnd
        );

        List<Object[]> currentIncomeByCategory = transactionRepository.findMonthlyIncomeByCategoryAndDateRange(
            user, currentStart, currentEnd
        );
        
        reports.add(new MonthlyReportResponse(
            currentMonth.getMonth().getDisplayName(TextStyle.FULL, Locale.ENGLISH) + " " + currentMonth.getYear(),
            currentMonth.getMonthValue(),
            currentMonth.getYear(),
            currentTotalExpense != null ? currentTotalExpense : 0.0,
            currentTotalIncome != null ? currentTotalIncome : 0.0,
            convertToMap(currentExpenseByCategory),
            convertToMap(currentIncomeByCategory)
        ));
        
        // Last month
        YearMonth lastMonth = currentMonth.minusMonths(1);
        LocalDate lastStart = lastMonth.atDay(1);
        LocalDate lastEnd = lastMonth.atEndOfMonth().plusDays(1);
        
        Double lastTotalExpense = transactionRepository.findMonthlyTotalByUserAndDateRange(
            user, lastStart, lastEnd
        );

        Double lastTotalIncome = transactionRepository.findMonthlyIncomeByUserAndDateRange(
            user, lastStart, lastEnd
        );

        List<Object[]> lastExpenseByCategory = transactionRepository.findMonthlyExpenseByCategoryAndDateRange(
            user, lastStart, lastEnd
        );

        List<Object[]> lastIncomeByCategory = transactionRepository.findMonthlyIncomeByCategoryAndDateRange(
            user, lastStart, lastEnd
        );
        
        reports.add(new MonthlyReportResponse(
            lastMonth.getMonth().getDisplayName(TextStyle.FULL, Locale.ENGLISH) + " " + lastMonth.getYear(),
            lastMonth.getMonthValue(),
            lastMonth.getYear(),
            lastTotalExpense != null ? lastTotalExpense : 0.0,
            lastTotalIncome != null ? lastTotalIncome : 0.0,
            convertToMap(lastExpenseByCategory),
            convertToMap(lastIncomeByCategory)
        ));
        
        return reports;
    }

    private Map<String, Double> convertToMap(List<Object[]> rows) {
        Map<String, Double> result = new java.util.HashMap<>();
        for (Object[] row : rows) {
            String category = (String) row[0];
            Double amount = ((Number) row[1]).doubleValue();
            result.put(category, amount);
        }
        return result;
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

    public BudgetExpenseResponse toBudgetExpenseResponse(Transaction t) {
        return new BudgetExpenseResponse(
            t.getId(),
            t.getBudget().getBudgetId(),
            t.getTransactionDate(),
            t.getDescription(),
            t.getAmount(),
            t.getType()
        );
    }

    @Transactional
    public Transaction createBudgetExpense(BudgetExpenseRequest req) {

        Budget budget = budgetRepository.findById(req.budget_id())
            .orElseThrow(() -> new RuntimeException("Budget not found"));

        User user = userRepository.findById((long)budget.getUserId())
            .orElseThrow(() -> new RuntimeException("User not found"));

        Transaction tx = new Transaction();
        tx.setBudget(budget);
        tx.setUser(user);
        tx.setTransactionDate(req.transaction_date());
        tx.setDescription(req.description());
        tx.setAmount(req.amount());
        tx.setType("expense");

        return transactionRepository.save(tx);
    }

    public List<BudgetExpenseResponse> findByBudgetId(Integer budgetId) {
    return transactionRepository.findByBudget_BudgetId(budgetId)
            .stream()
            .map(this::toBudgetExpenseResponse)
            .toList();
    }
}