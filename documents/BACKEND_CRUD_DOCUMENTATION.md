# iBudget Backend - CRUD Operations Documentation

**Project:** iBudget - Personal Finance Management System  
**Technology Stack:** Spring Boot 3.5.7, Java 21, MySQL  
**Generated:** January 8, 2026  
**Version:** 1.0

---

## Table of Contents
1. [User Management](#1-user-management)
2. [Authentication](#2-authentication)
3. [Transaction Management](#3-transaction-management)
4. [Category Management](#4-category-management)
5. [Budget Management](#5-budget-management)
6. [Savings Management](#6-savings-management)
7. [Savings Transactions](#7-savings-transactions)
8. [Notification Management](#8-notification-management)

---

## 1. User Management

**Endpoint Base:** `/api/user`  
**Entity:** `User` (Table: `tbl_user`)

| CRUD Type | Spring Boot Method | Equivalent SQL Query | Description |
|-----------|-------------------|---------------------|-------------|
| **READ** | `@GetMapping("/profile")`<br>`findByEmail(email)` | `SELECT * FROM tbl_user WHERE email = ? AND is_deleted = false` | Retrieve current user's profile information including username, email, and remaining budget |
| **UPDATE** | `@PutMapping("/update")`<br>`updateAccount(email, request)` | `UPDATE tbl_user SET username = ?, email = ?, updated_at = NOW() WHERE email = ? AND is_deleted = false` | Update user account details (username, email) |
| **UPDATE** | `@PostMapping("/deactivate")`<br>`deactivateAccount(email, request)` | `UPDATE tbl_user SET is_active = false, deactivated_at = NOW(), deactivation_reason = ? WHERE email = ? AND is_deleted = false` | Deactivate user account temporarily |
| **DELETE** | `@PostMapping("/delete")`<br>`softDeleteAccount(email, request)` | `UPDATE tbl_user SET is_deleted = true, deleted_at = NOW(), deletion_reason = ? WHERE email = ? AND is_deleted = false` | Soft delete user account (mark as deleted without removing from database) |

---

## 2. Authentication

**Endpoint Base:** `/api/auth`  
**Entity:** `User` (Table: `tbl_user`)

| CRUD Type | Spring Boot Method | Equivalent SQL Query | Description |
|-----------|-------------------|---------------------|-------------|
| **CREATE** | `@PostMapping("/signup")`<br>`registerUser(signupRequest)` | `INSERT INTO tbl_user (username, email, password, email_verification_token, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())` | Register new user with email verification |
| **READ** | `@PostMapping("/login")`<br>`login(request)` | `SELECT * FROM tbl_user WHERE email = ? AND is_deleted = false AND is_active = true` | Authenticate user and generate JWT token |
| **READ** | `@GetMapping("/check-username/{username}")`<br>`existsByUsername(username)` | `SELECT CASE WHEN COUNT(*) > 0 THEN true ELSE false END FROM tbl_user WHERE username = ? AND is_deleted = false` | Check if username already exists |
| **READ** | `@GetMapping("/check-email/{email}")`<br>`existsByEmail(email)` | `SELECT CASE WHEN COUNT(*) > 0 THEN true ELSE false END FROM tbl_user WHERE email = ? AND is_deleted = false` | Check if email already exists |
| **UPDATE** | `@GetMapping("/verify-email")`<br>`verifyEmailToken(token)` | `UPDATE tbl_user SET email_verified = true, is_active = true WHERE email_verification_token = ? AND is_deleted = false` | Verify user email using token sent via email |
| **UPDATE** | `@PostMapping("/forgot-password")`<br>`requestPasswordReset(email)` | `UPDATE tbl_user SET password_reset_token = ?, password_reset_token_expiry = ?, last_password_reset_request = NOW() WHERE email = ? AND is_deleted = false` | Generate and save password reset token |
| **READ** | `@GetMapping("/validate-reset-token")`<br>`validateResetToken(token)` | `SELECT * FROM tbl_user WHERE password_reset_token = ? AND password_reset_token_expiry > NOW() AND is_deleted = false` | Validate password reset token |
| **UPDATE** | `@PostMapping("/reset-password")`<br>`resetPassword(request)` | `UPDATE tbl_user SET password = ?, password_reset_token = NULL, password_reset_token_expiry = NULL, password_changed_at = NOW() WHERE password_reset_token = ? AND is_deleted = false` | Reset user password using reset token |
| **UPDATE** | `@PostMapping("/change-password")`<br>`changePassword(username, request)` | `UPDATE tbl_user SET password = ?, password_changed_at = NOW() WHERE username = ? AND is_deleted = false` | Change user password (authenticated) |
| **UPDATE** | `@PostMapping("/reactivate")`<br>`reactivateAccount(request)` | `UPDATE tbl_user SET is_active = true, deactivated_at = NULL, deactivation_reason = NULL WHERE email = ? AND is_deleted = false` | Reactivate a deactivated user account |
| **UPDATE** | `@PostMapping("/resend-verification")`<br>`resendVerificationEmail(email)` | `UPDATE tbl_user SET email_verification_token = ?, email_verification_expiration = ?, last_verification_email_sent = NOW() WHERE email = ? AND is_deleted = false` | Resend email verification link |

---

## 3. Transaction Management

**Endpoint Base:** `/api/transactions`  
**Entity:** `Transaction` (Table: `tbl_transaction`)

### 3.1 General Transactions (Income/Expense)

| CRUD Type | Spring Boot Method | Equivalent SQL Query | Description |
|-----------|-------------------|---------------------|-------------|
| **CREATE** | `@PostMapping`<br>`create(email, req)` | `INSERT INTO tbl_transaction (user_id, category_id, type, amount, description, transaction_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())` | Create new transaction (income or expense) |
| **READ** | `@GetMapping`<br>`findAllForUser(email)` | `SELECT * FROM tbl_transaction t WHERE t.user_id = (SELECT user_id FROM tbl_user WHERE email = ?) AND t.saving_id IS NULL AND t.budget_id IS NULL AND t.category_id IS NOT NULL AND t.deleted_at IS NULL` | List all transactions for current user |
| **READ** | `@GetMapping("/with-category")`<br>`findAllWithCategory(email)` | `SELECT t.*, c.name, c.type FROM tbl_transaction t LEFT JOIN tbl_category c ON t.category_id = c.category_id WHERE t.user_id = ? AND t.saving_id IS NULL AND t.budget_id IS NULL AND t.deleted_at IS NULL` | List transactions with category details |
| **UPDATE** | `@PutMapping("/{id}")`<br>`update(email, id, req)` | `UPDATE tbl_transaction SET category_id = ?, type = ?, amount = ?, description = ?, transaction_date = ?, updated_at = NOW() WHERE transaction_id = ? AND user_id = ? AND deleted_at IS NULL` | Update existing transaction |
| **DELETE** | `@DeleteMapping("/{id}")`<br>`delete(email, id)` | `UPDATE tbl_transaction SET deleted_at = NOW() WHERE transaction_id = ? AND user_id = ? AND deleted_at IS NULL` | Soft delete transaction |

### 3.2 Transaction Summaries

| CRUD Type | Spring Boot Method | Equivalent SQL Query | Description |
|-----------|-------------------|---------------------|-------------|
| **READ** | `@GetMapping("/summary/expense")`<br>`getExpenseSummary(email)` | `SELECT COALESCE(c.name, 'Uncategorized'), SUM(t.amount) FROM tbl_transaction t LEFT JOIN tbl_category c ON t.category_id = c.category_id WHERE t.user_id = ? AND c.type = 'EXPENSE' AND t.deleted_at IS NULL AND t.category_id IS NOT NULL GROUP BY COALESCE(c.name, 'Uncategorized')` | Get expense summary grouped by category |
| **READ** | `@GetMapping("/summary/income")`<br>`getIncomeSummary(email)` | `SELECT COALESCE(c.name, 'Uncategorized'), SUM(t.amount) FROM tbl_transaction t LEFT JOIN tbl_category c ON t.category_id = c.category_id WHERE t.user_id = ? AND c.type = 'INCOME' AND t.deleted_at IS NULL AND t.category_id IS NOT NULL GROUP BY COALESCE(c.name, 'Uncategorized')` | Get income summary grouped by category |
| **READ** | `@GetMapping("/reports/monthly")`<br>`getMonthlyReports(email)` | `SELECT SUM(t.amount) FROM tbl_transaction t LEFT JOIN tbl_category c ON t.category_id = c.category_id WHERE t.user_id = ? AND c.type = 'EXPENSE' AND t.deleted_at IS NULL AND t.category_id IS NOT NULL AND t.transaction_date >= ? AND t.transaction_date < ?` | Get monthly expense reports for current and previous month |

### 3.3 Budget Transactions

| CRUD Type | Spring Boot Method | Equivalent SQL Query | Description |
|-----------|-------------------|---------------------|-------------|
| **CREATE** | `@PostMapping("/budget-transactions")`<br>`createBudgetExpense(req)` | `INSERT INTO tbl_transaction (budget_id, user_id, amount, description, transaction_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())` | Create transaction linked to a budget |
| **READ** | `@GetMapping("/budget-transactions/budget/{budgetId}")`<br>`findByBudgetId(budgetId)` | `SELECT * FROM tbl_transaction WHERE budget_id = ? AND deleted_at IS NULL` | Get all transactions for a specific budget |
| **READ** | `@GetMapping("/budget-transactions/{id}")`<br>`findById(id)` | `SELECT * FROM tbl_transaction WHERE transaction_id = ? AND deleted_at IS NULL` | Get single budget transaction by ID |
| **UPDATE** | `@PutMapping("/budget-transactions/{id}")`<br>`updateBudgetExpense(id, req)` | `UPDATE tbl_transaction SET amount = ?, description = ?, transaction_date = ?, updated_at = NOW() WHERE transaction_id = ? AND deleted_at IS NULL` | Update budget transaction |
| **DELETE** | `@DeleteMapping("/budget-transactions/{id}")`<br>`deleteBudgetExpense(id)` | `UPDATE tbl_transaction SET deleted_at = NOW() WHERE transaction_id = ? AND deleted_at IS NULL` | Soft delete budget transaction |
| **READ** | `@GetMapping("/budgets/{budgetId}/summary")`<br>`getBudgetSummary(budgetId)` | `SELECT COALESCE(SUM(t.amount), 0) FROM tbl_transaction t WHERE t.budget_id = ? AND t.deleted_at IS NULL` | Get total expenses for a budget |

---

## 4. Category Management

**Endpoint Base:** `/api/categories`  
**Entity:** `Category` (Table: `tbl_category`)

| CRUD Type | Spring Boot Method | Equivalent SQL Query | Description |
|-----------|-------------------|---------------------|-------------|
| **CREATE** | `@PostMapping`<br>`createCategory(category, auth)` | `INSERT INTO tbl_category (user_id, name, type) VALUES (?, ?, ?)` | Create new category for current user |
| **READ** | `@GetMapping`<br>`getCategories(auth)` | `SELECT c.category_id, c.user_id, c.name, c.type, (SELECT COUNT(*) FROM tbl_transaction t WHERE t.category_id = c.category_id AND t.deleted_at IS NULL) + (SELECT COUNT(*) FROM tbl_budget b WHERE b.category_id = c.category_id AND b.deleted_at IS NULL) AS referencesCount FROM tbl_category c WHERE c.user_id = ? AND c.deleted_at IS NULL` | List all categories with reference count |
| **UPDATE** | `@PutMapping("/{id}")`<br>`updateCategory(id, updatedCategory, auth)` | `UPDATE tbl_category SET name = ?, type = ? WHERE category_id = ? AND user_id = ?` | Update category (only if not referenced) |
| **DELETE** | `@DeleteMapping("/{id}")`<br>`deleteCategory(id, auth)` | `UPDATE tbl_category SET deleted_at = NOW() WHERE category_id = ? AND user_id = ?` | Soft delete category (only if not referenced) |

---

## 5. Budget Management

**Endpoint Base:** `/api/budgets`  
**Entity:** `Budget` (Table: `tbl_budget`)

| CRUD Type | Spring Boot Method | Equivalent SQL Query | Description |
|-----------|-------------------|---------------------|-------------|
| **CREATE** | `@PostMapping("/budgets")`<br>`createBudget(budget, auth)` | `INSERT INTO tbl_budget (user_id, category_id, name, limit_amount, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)` | Create new budget for current user |
| **READ** | `@GetMapping("/budgets")`<br>`getAllActiveBudgets(auth)` | `SELECT tb.budget_id, tb.user_id, tb.category_id, tb.name, tb.limit_amount, tb.start_date, tb.end_date, tc.name AS categoryName FROM tbl_budget tb LEFT JOIN tbl_category tc ON tb.category_id = tc.category_id WHERE tb.deleted_at IS NULL AND tb.user_id = ?` | List all active budgets with category name |
| **READ** | `@GetMapping("/budgets/{id}")`<br>`getBudgetById(id, auth)` | `SELECT * FROM tbl_budget WHERE budget_id = ? AND deleted_at IS NULL` | Get single budget by ID |
| **READ** | `@GetMapping("/budgets/search")`<br>`searchBudgets(query, auth)` | `SELECT tb.budget_id, tb.user_id, tb.category_id, tb.name, tb.limit_amount, tb.start_date, tb.end_date, tc.name AS categoryName FROM tbl_budget tb LEFT JOIN tbl_category tc ON tb.category_id = tc.category_id WHERE tb.deleted_at IS NULL AND tb.user_id = ? AND (LOWER(tb.name) LIKE LOWER(CONCAT('%', ?, '%')) OR LOWER(tc.name) LIKE LOWER(CONCAT('%', ?, '%')))` | Search budgets by name or category |
| **UPDATE** | `@PutMapping("/budgets/{id}")`<br>`updateBudget(id, budget, auth)` | `UPDATE tbl_budget SET category_id = ?, name = ?, limit_amount = ?, start_date = ?, end_date = ? WHERE budget_id = ? AND user_id = ? AND deleted_at IS NULL` | Update budget details |
| **DELETE** | `@DeleteMapping("/budgets/{id}")`<br>`deleteBudget(id, auth)` | `UPDATE tbl_budget SET deleted_at = NOW() WHERE budget_id = ? AND user_id = ? AND deleted_at IS NULL` | Soft delete budget |

---

## 6. Savings Management

**Endpoint Base:** `/api/savings`  
**Entity:** `Saving` (Table: `tbl_saving`)

| CRUD Type | Spring Boot Method | Equivalent SQL Query | Description |
|-----------|-------------------|---------------------|-------------|
| **CREATE** | `@PostMapping("/savings")`<br>`createSaving(saving, auth)` | `INSERT INTO tbl_saving (user_id, name, goal_date, frequency, target_amount, current_amount, description, header_color, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())` | Create new savings goal |
| **READ** | `@GetMapping("/savings")`<br>`getAllSavings(auth)` | `SELECT * FROM tbl_saving WHERE deleted_at IS NULL AND user_id = ?` | List all active savings for current user |
| **READ** | `@GetMapping("/savings/{id}")`<br>`getSavingById(id, auth)` | `SELECT * FROM tbl_saving WHERE saving_id = ? AND user_id = ?` | Get single savings goal by ID |
| **READ** | `@GetMapping("/savings/transactions")`<br>`getSavingTransactions(auth)` | `SELECT t.transaction_id, t.saving_id, t.user_id, t.transaction_date, t.savings_action, t.description, t.amount, t.created_at, t.updated_at, t.deleted_at FROM tbl_transaction t JOIN tbl_saving s ON t.saving_id = s.saving_id JOIN tbl_user u ON t.user_id = u.user_id WHERE s.deleted_at IS NULL AND u.is_deleted = false AND u.user_id = ?` | Get all saving transactions for current user |
| **READ** | `@GetMapping("/savings/{savingId}/transactions")`<br>`getSavingTransactionsBySavingId(savingId, auth)` | `SELECT t.transaction_id, s.saving_id, u.user_id, t.transaction_date, t.savings_action, t.description, t.amount, t.created_at, t.updated_at, t.deleted_at FROM tbl_transaction t JOIN tbl_saving s ON t.saving_id = s.saving_id JOIN tbl_user u ON t.user_id = u.user_id WHERE s.saving_id = ? AND u.user_id = ? AND t.deleted_at IS NULL` | Get transactions for specific saving |
| **UPDATE** | `@PutMapping("/savings/{id}")`<br>`updateSaving(id, savingDetails, auth)` | `UPDATE tbl_saving SET name = ?, goal_date = ?, frequency = ?, target_amount = ?, current_amount = ?, description = ?, header_color = ? WHERE saving_id = ? AND user_id = ?` | Update savings goal details |
| **UPDATE** | `@GetMapping("/savings/{savingId}/refresh-current-amount")`<br>`refreshCurrentAmount(savingId)` | `UPDATE tbl_saving s SET s.current_amount = (SELECT COALESCE(SUM(CASE WHEN t.savings_action = 'Deposit' THEN t.amount WHEN t.savings_action = 'Withdrawal' THEN -t.amount ELSE 0 END), 0) FROM tbl_transaction t WHERE t.saving_id = ? AND t.deleted_at IS NULL) WHERE s.saving_id = ?` | Recalculate and update current amount based on transactions |
| **DELETE** | `@DeleteMapping("/savings/{id}")`<br>`deleteSaving(id, auth)` | `UPDATE tbl_saving SET deleted_at = NOW() WHERE saving_id = ? AND user_id = ?` | Soft delete savings goal |

---

## 7. Savings Transactions

**Endpoint Base:** `/api/savings/{savingId}/transactions`  
**Entity:** `Transaction` (Table: `tbl_transaction`)

| CRUD Type | Spring Boot Method | Equivalent SQL Query | Description |
|-----------|-------------------|---------------------|-------------|
| **CREATE** | `@PostMapping("/savings/{savingId}/transactions")`<br>`addSavingTransaction(savingId, req, auth)` | `INSERT INTO tbl_transaction (saving_id, user_id, amount, description, savings_action, transaction_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())` | Add deposit or withdrawal to savings goal |
| **READ** | `@GetMapping("/savings/{savingId}/transactions/{id}")`<br>`getSavingTransactionById(savingId, id, auth)` | `SELECT * FROM tbl_transaction WHERE transaction_id = ? AND saving_id = ? AND user_id = ?` | Get single saving transaction by ID |
| **UPDATE** | `@PutMapping("/savings/{savingId}/transactions/{id}")`<br>`updateSavingTransaction(savingId, id, req, auth)` | `UPDATE tbl_transaction SET amount = ?, description = ?, savings_action = ?, transaction_date = ? WHERE transaction_id = ? AND saving_id = ? AND user_id = ?` | Update saving transaction |
| **DELETE** | `@DeleteMapping("/savings/{savingId}/transactions/{id}")`<br>`deleteSavingTransaction(savingId, id, auth)` | `UPDATE tbl_transaction SET deleted_at = NOW() WHERE transaction_id = ? AND saving_id = ? AND user_id = ?` | Soft delete saving transaction |
| **DELETE** | `@DeleteMapping("/savings/transactions")`<br>`deleteMultipleSavingTransactions(transactionIds, auth)` | `UPDATE tbl_transaction SET deleted_at = NOW() WHERE transaction_id IN (?) AND user_id = ?` | Bulk soft delete multiple saving transactions |

---

## 8. Notification Management

**Endpoint Base:** `/api/notifications`  
**Entity:** `Notification` (Table: `tbl_notification`)

| CRUD Type | Spring Boot Method | Equivalent SQL Query | Description |
|-----------|-------------------|---------------------|-------------|
| **CREATE** | `@PostMapping("/generate")`<br>`generateNotifications(userId)` | `INSERT INTO tbl_notification (user_id, type, urgency, title, message, reference_id, amount, category, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, false, NOW())` | Generate notifications for budgets and savings (auto-triggered) |
| **READ** | `@GetMapping`<br>`getNotifications(auth)` | `SELECT * FROM tbl_notification WHERE user_id = ? AND is_deleted = false ORDER BY created_at DESC` | Get all notifications for current user |
| **READ** | `@GetMapping("/unread-count")`<br>`getUnreadCount(auth)` | `SELECT COUNT(*) FROM tbl_notification WHERE user_id = ? AND is_read = false AND is_deleted = false` | Get count of unread notifications |
| **UPDATE** | `@PutMapping("/{id}/read")`<br>`markAsRead(id, userId)` | `UPDATE tbl_notification SET is_read = true, read_at = NOW() WHERE notification_id = ? AND user_id = ?` | Mark single notification as read |
| **UPDATE** | `@PutMapping("/mark-all-read")`<br>`markAllAsRead(auth)` | `UPDATE tbl_notification SET is_read = true, read_at = NOW() WHERE user_id = ? AND is_read = false` | Mark all notifications as read |
| **DELETE** | `@DeleteMapping("/{id}")`<br>`deleteNotification(id, userId)` | `UPDATE tbl_notification SET is_deleted = true, deleted_at = NOW() WHERE notification_id = ? AND user_id = ?` | Soft delete notification |

---

## Database Schema Summary

### Tables Overview

| Table Name | Primary Key | Soft Delete | Description |
|-----------|-------------|-------------|-------------|
| `tbl_user` | `user_id` | Yes (`is_deleted`, `deleted_at`) | User accounts with authentication details |
| `tbl_transaction` | `transaction_id` | Yes (`deleted_at`) | All transactions (income, expense, savings, budget) |
| `tbl_category` | `category_id` | Yes (`deleted_at`) | User-defined categories for income/expense |
| `tbl_budget` | `budget_id` | Yes (`deleted_at`) | Budget limits with time periods |
| `tbl_saving` | `saving_id` | Yes (`deleted_at`) | Savings goals with target amounts |
| `tbl_notification` | `notification_id` | Yes (`is_deleted`, `deleted_at`) | System-generated notifications |

### Key Relationships

```
tbl_user (1) ──────┬─ (many) tbl_transaction
                   ├─ (many) tbl_category
                   ├─ (many) tbl_budget
                   ├─ (many) tbl_saving
                   └─ (many) tbl_notification

tbl_category (1) ──┬─ (many) tbl_transaction
                   └─ (many) tbl_budget

tbl_budget (1) ──── (many) tbl_transaction

tbl_saving (1) ──── (many) tbl_transaction
```

---

## Notes

### Soft Delete Pattern
All entities use soft delete to preserve data integrity:
- User: `is_deleted = true`, `deleted_at = NOW()`
- Transaction, Category, Budget, Saving, Notification: `deleted_at = NOW()`

### JPA Repository Methods
Spring Data JPA automatically generates SQL queries from repository method names:
- `findByEmail(email)` → `SELECT * FROM tbl_user WHERE email = ?`
- `existsByUsername(username)` → `SELECT CASE WHEN COUNT(*) > 0 THEN true ELSE false END FROM tbl_user WHERE username = ?`
- `save(entity)` → `INSERT` or `UPDATE` based on entity state
- `delete(entity)` → Triggers `@SQLDelete` annotation query

### Custom Queries
Complex queries use `@Query` annotation with JPQL or native SQL:
- JPQL: Object-oriented query language for JPA entities
- Native SQL: Direct SQL for complex joins and aggregations

### Authentication & Authorization
All endpoints (except `/api/auth/*`) require JWT authentication. User context is extracted from the JWT token to ensure users can only access their own data.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | January 8, 2026 | Initial documentation with all CRUD operations |

---

**End of Documentation**
