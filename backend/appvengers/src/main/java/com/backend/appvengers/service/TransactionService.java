package com.backend.appvengers.service;

import com.backend.appvengers.dto.BudgetExpenseRequest;
import com.backend.appvengers.dto.BudgetExpenseResponse;
import com.backend.appvengers.dto.BudgetSummaryResponse;
import com.backend.appvengers.dto.BudgetListSummaryResponse;
import com.backend.appvengers.dto.ExpenseSummary;
import com.backend.appvengers.dto.IncomeSummary;
import com.backend.appvengers.dto.MonthlyReportResponse;
import com.backend.appvengers.dto.TransactionRequest;
import com.backend.appvengers.dto.TransactionResponse;
import com.backend.appvengers.dto.TransactionWithCategoryResponse;
import com.backend.appvengers.entity.Budget;
import com.backend.appvengers.entity.Transaction;
import com.backend.appvengers.entity.User;
import com.backend.appvengers.entity.Category;
import com.backend.appvengers.repository.BudgetRepository;
import com.backend.appvengers.repository.TransactionRepository;
import com.backend.appvengers.repository.UserRepository;
import com.backend.appvengers.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
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
@Slf4j
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    @Lazy
    private final NotificationService notificationService;

    public List<TransactionResponse> findAllForUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return transactionRepository.findByUserAndDeletedAtIsNull(user).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<TransactionWithCategoryResponse> findAllWithCategory(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Match native query constraints: category join present, saving_id NULL, budget_id NULL, category_id NOT NULL
        List<Transaction> txs = transactionRepository.findByUserAndDeletedAtIsNull(user);
        return txs.stream().map(t -> new TransactionWithCategoryResponse(
                t.getId(),
                t.getAmount(),
                t.getDescription(),
                t.getTransactionDate(),
                t.getCategoryRef() != null ? t.getCategoryRef().getId() : null,
                t.getCategoryRef() != null ? t.getCategoryRef().getName() : null,
                t.getCategoryRef() != null ? t.getCategoryRef().getType() : null,
                t.getCategoryRef() != null ? t.getCategoryRef().getUserId() : null
        )).toList();
    }

    @Transactional
    public TransactionResponse create(String email, TransactionRequest req) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Transaction t = new Transaction();
        t.setUser(user);
        t.setAmount(req.getAmount());
        if (req.getCategory_id() != null) {
            Category cat = categoryRepository.findById(req.getCategory_id())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            t.setCategoryRef(cat);
        } else {
            t.setCategoryRef(null);
        }
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
        if (req.getCategory_id() != null) {
            Category cat = categoryRepository.findById(req.getCategory_id())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            t.setCategoryRef(cat);
        } else {
            t.setCategoryRef(null);
        }
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
        t.setDeletedAt(LocalDate.now());
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
                t.getCategoryRef() != null ? t.getCategoryRef().getId() : null,
                t.getCategoryRef() != null ? t.getCategoryRef().getName() : null,
                t.getCategoryRef() != null ? t.getCategoryRef().getType() : null,
                t.getDescription(),
                t.getTransactionDate()
        );
    }

    public BudgetExpenseResponse toBudgetExpenseResponse(Transaction t) {
        return new BudgetExpenseResponse(
            t.getId(),
            t.getBudget() != null ? t.getBudget().getBudgetId() : null,
            t.getTransactionDate(),
            t.getDescription(),
            t.getCategoryRef() != null ? t.getCategoryRef().getId() : null,
            t.getAmount()
        );
    }

    //Budget Transaction [List Budget Expense Method]
    public List<BudgetExpenseResponse> findByBudgetId(Integer budgetId) {
    return transactionRepository
            .findByBudget_BudgetIdAndDeletedAtIsNull(budgetId)
            .stream()
            .map(this::toBudgetExpenseResponse)
            .toList();
    }
    
    //Budget Transaction [Create Budget Expense Method]
    @Transactional
    public Transaction createBudgetExpense(BudgetExpenseRequest req) {

        Budget budget = budgetRepository.findById(req.budget_id())
            .orElseThrow(() -> new RuntimeException(
                "Budget not found"
            ));

        User user = userRepository.findById((long) budget.getUserId())
            .orElseThrow(() -> new RuntimeException(
                "User not found"
            ));

        Category category = categoryRepository.findById(req.category_id())
            .orElseThrow(() -> new RuntimeException(
                "Category not found"
            ));

        Transaction tx = new Transaction();
        tx.setBudget(budget);
        tx.setUser(user);
        tx.setCategoryRef(category);  
        tx.setTransactionDate(req.transaction_date());
        tx.setDescription(req.description());
        tx.setAmount(req.amount());

        Transaction saved = transactionRepository.save(tx);
        
        // Trigger immediate notification check for budget warnings/exceeded
        // This sends WebSocket notifications in real-time
        try {
            notificationService.generateNotifications(user.getId());
            log.info("Budget notifications checked for user {} after expense", user.getId());
        } catch (Exception e) {
            log.error("Failed to generate notifications for user {}: {}", user.getId(), e.getMessage());
        }
        
        return saved;
    }

    //Budget Transaction [Update Budget Expense Method]
    @Transactional
    public Transaction updateBudgetExpense(Long id, BudgetExpenseRequest req) {

        Transaction tx = transactionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException(
                "Budget transaction not found"
            ));

        Category category = categoryRepository.findById(req.category_id())
            .orElseThrow(() -> new RuntimeException(
                "Category not found"
            ));

        tx.setTransactionDate(req.transaction_date());
        tx.setDescription(req.description());
        tx.setCategoryRef(category);  
        tx.setAmount(req.amount());

        Transaction saved = transactionRepository.save(tx);
        
        // Trigger immediate notification check for budget warnings/exceeded
        // This sends WebSocket notifications in real-time
        try {
            int userId = tx.getUser().getId();
            notificationService.generateNotifications(userId);
            log.info("Budget notifications checked for user {} after expense update", userId);
        } catch (Exception e) {
            log.error("Failed to generate notifications after expense update: {}", e.getMessage());
        }
        
        return saved;
    }

    //Budget Transaction [Delete Budget Expense Method]
    @Transactional
    public void deleteBudgetExpense(Long id) {
        Transaction tx = transactionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException(
                "Budget transaction not found"
            ));

        tx.setDeletedAt(LocalDate.now());
        transactionRepository.save(tx);
        
        // Trigger notification check after delete (budget may no longer be exceeded)
        try {
            int userId = tx.getUser().getId();
            notificationService.generateNotifications(userId);
            log.info("Budget notifications checked for user {} after expense delete", userId);
        } catch (Exception e) {
            log.error("Failed to generate notifications after expense delete: {}", e.getMessage());
        }
    }

    //Budget Transaction [Get Total]
    public Double getTotalExpensesForBudget(Integer budgetId) {
        return transactionRepository.sumByBudgetId(budgetId);
    }

    //Budget Transaction [Get Budget Summary]
    public BudgetSummaryResponse getBudgetSummary(Integer budgetId) {

        Budget budget = budgetRepository.findById(budgetId)
            .orElseThrow(() -> 
                new RuntimeException("Budget not found"
            ));

        Double totalExpenses = getTotalExpensesForBudget(budgetId);
        Double remaining = budget.getLimitAmount() - totalExpenses;

        String categoryName = categoryRepository.findById(budget.getCategoryId())
            .map(Category::getName)
            .orElse("Unknown");

        return new BudgetSummaryResponse(
            budget.getBudgetId(),
            budget.getCategoryId(),
            categoryName,
            budget.getLimitAmount(),
            totalExpenses,
            remaining
        );
    }

    // Budget Transaction [Get All Budgets Summary]
    public List<BudgetListSummaryResponse> getAllBudgetsSummary(User user) {
        List<Budget> budgets = budgetRepository.findByUser(user);

        return budgets.stream().map(budget -> {
            Double totalExpenses = getTotalExpensesForBudget(budget.getBudgetId());
            Double remaining = budget.getLimitAmount() - totalExpenses;

            String categoryName = categoryRepository.findById(budget.getCategoryId())
                .map(Category::getName)
                .orElse("Unknown");

            return new BudgetListSummaryResponse(
                budget.getBudgetId(),
                budget.getCategoryId(),
                categoryName,
                budget.getLimitAmount(),
                budget.getStartDate(),
                budget.getEndDate(),
                totalExpenses // currentAmount for this budget
            );
        }).toList();
    }
}