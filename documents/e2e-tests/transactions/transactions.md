# Transactions E2E Test Matrix

## Feature Description

The Transactions module allows users to manage their financial transactions including income and expenses. Users can add, edit, delete, filter, search, and view detailed information about their transactions.

**Production URL**: https://i-budget.site/transactions  
**Route**: `/transactions` (Protected - requires authentication)

---

## Overview

The Transactions feature enables users to:
- View a paginated list of all transactions
- Add new income or expense transactions
- Edit existing transaction details
- Delete unwanted transactions
- Filter transactions by date range and category
- Search transactions by description/notes
- View individual transaction details

---

## Test Matrix

| Test ID | Test Name | Description | Preconditions | Steps | Expected Result | Priority | Type | Status | Last Tested | Notes |
|---------|-----------|-------------|---------------|-------|-----------------|----------|------|--------|-------------|-------|
| TXN-001 | Transactions Page Load | Verify transactions page loads successfully | User is logged in | 1. Navigate to `/transactions` | Transactions list displays with table headers, pagination visible | P0 | Smoke | ✅ Passed | Dec 23, 2024 | Page loads correctly |
| TXN-002 | View Transactions List | Verify all user transactions are displayed | User has existing transactions | 1. Navigate to `/transactions` | All transactions display with date, description, category, amount | P0 | E2E | ✅ Passed | Dec 23, 2024 | Transactions appear in list |
| TXN-003 | Add Income Transaction | Verify user can add income transaction | User is on transactions page | 1. Click "Add Transaction" 2. Select type "Income" 3. Fill amount, category, date, description 4. Click Save | Transaction is saved, appears in list, balance updates | P0 | E2E | ✅ Passed | Dec 23, 2024 | Added successfully |
| TXN-004 | Add Expense Transaction | Verify user can add expense transaction | User is on transactions page | 1. Click "Add Transaction" 2. Select type "Expense" 3. Fill amount, category, date, description 4. Click Save | Transaction is saved, appears in list with negative indicator | P0 | E2E | ✅ Passed | Dec 23, 2024 | Added successfully |
| TXN-005 | Edit Existing Transaction | Verify user can edit transaction details | User has existing transaction | 1. Click edit icon on transaction row 2. Modify amount and description 3. Click Save | Changes are saved, list updates with new values | P0 | E2E | ✅ Passed | Dec 23, 2024 | Edit successful |
| TXN-006 | Delete Transaction | Verify user can delete transaction | User has existing transaction | 1. Click delete icon on transaction row 2. Confirm deletion in modal | Transaction is removed from list, balance recalculates | P0 | E2E | ✅ Passed | Dec 23, 2024 | BUG: Deletes instantly without confirmation modal. |
| TXN-007 | Delete Transaction - Cancel | Verify cancel on delete modal | User has existing transaction | 1. Click delete icon 2. Click Cancel in confirmation modal | Transaction remains in list, no changes made | P1 | Negative | ❌ Failed | Dec 23, 2024 | Failed because there is no confirmation modal. |
| TXN-008 | Filter by Date Range | Verify date range filter works | User has transactions across multiple dates | 1. Set start date filter 2. Set end date filter 3. Apply filter | Only transactions within date range are displayed | P1 | E2E | ⏭️ Skipped | Dec 23, 2024 | - |
| TXN-009 | Filter by Category | Verify category filter works | User has transactions in multiple categories | 1. Select category from dropdown 2. Apply filter | Only transactions matching selected category are displayed | P1 | E2E | ✅ Passed | Dec 23, 2024 | Filtering works correctly |
| TXN-010 | Search Transactions | Verify search functionality | User has transactions with various descriptions | 1. Enter search term in search box 2. Press Enter or click search | Transactions matching search term in description/notes are displayed | P1 | E2E | ❌ Failed | Dec 23, 2024 | BUG: Search input field is missing from the UI. |
| TXN-011 | Pagination - Navigate Pages | Verify pagination controls work | User has more than 10 transactions | 1. Click page 2 in pagination 2. Click next arrow 3. Click previous arrow | Correct page of transactions displays, page indicator updates | P1 | Regression | ⏭️ Skipped | Dec 23, 2024 | Insufficient data |
| TXN-012 | Form Validation - Empty Amount | Verify amount field is required | User is adding new transaction | 1. Click Add Transaction 2. Leave amount empty 3. Click Save | Error message displays: "Amount is required" | P1 | Negative | ✅ Passed | Dec 23, 2024 | Submission prevented (implicit validation) |
| TXN-013 | Form Validation - Negative Amount | Verify negative amounts are handled | User is adding new transaction | 1. Enter negative amount (-100) 2. Click Save | Either error shown or amount converted to positive based on type | P2 | Boundary | ⏭️ Skipped | Dec 23, 2024 | - |
| TXN-014 | Form Validation - Zero Amount | Verify zero amount is rejected | User is adding new transaction | 1. Enter amount as 0 2. Click Save | Error message displays: "Amount must be greater than 0" | P2 | Boundary | ✅ Passed | Dec 23, 2024 | Submission prevented (implicit validation) |
| TXN-015 | Form Validation - Future Date | Verify future date handling | User is adding new transaction | 1. Select date in the future 2. Fill other fields 3. Click Save | Transaction saves with future date OR error if future dates not allowed | P2 | Boundary | ⏭️ Skipped | Dec 23, 2024 | - |
| TXN-016 | Empty State | Verify empty state when no transactions | New user with no transactions | 1. Navigate to `/transactions` | Empty state message displays with "Add your first transaction" CTA | P2 | Regression | ✅ Passed | Dec 23, 2024 | Empty state verified |

---

## Page Elements Reference

| Element | Selector/Identifier | Description |
|---------|---------------------|-------------|
| Transactions Table | `.transactions-table`, `[data-testid="txn-list"]` | Main transactions list table |
| Add Transaction Button | `[data-testid="add-txn-btn"]`, `.add-transaction-btn` | Button to open add transaction form |
| Transaction Row | `.transaction-row`, `tr[data-txn-id]` | Individual transaction row |
| Edit Button | `.edit-btn`, `[data-testid="edit-txn"]` | Edit transaction action |
| Delete Button | `.delete-btn`, `[data-testid="delete-txn"]` | Delete transaction action |
| Date Filter Start | `[data-testid="date-start"]`, `#startDate` | Start date filter input |
| Date Filter End | `[data-testid="date-end"]`, `#endDate` | End date filter input |
| Category Filter | `[data-testid="category-filter"]`, `.category-select` | Category dropdown filter |
| Search Input | `[data-testid="txn-search"]`, `.search-input` | Transaction search field |
| Pagination | `.pagination`, `[data-testid="pagination"]` | Pagination controls |
| Transaction Modal | `.transaction-modal`, `[data-testid="txn-modal"]` | Add/Edit transaction form modal |
| Amount Input | `#amount`, `[data-testid="txn-amount"]` | Transaction amount field |
| Description Input | `#description`, `[data-testid="txn-description"]` | Transaction description field |
| Type Selector | `[data-testid="txn-type"]`, `.type-toggle` | Income/Expense type selector |
| Save Button | `[data-testid="save-txn"]`, `.save-btn` | Save transaction button |
| Cancel Button | `[data-testid="cancel-txn"]`, `.cancel-btn` | Cancel action button |
| Confirm Delete Modal | `.confirm-modal`, `[data-testid="confirm-delete"]` | Delete confirmation dialog |

---

## Test Data Requirements

| Data Type | Description | Example Values |
|-----------|-------------|----------------|
| Test User | Authenticated user with permissions | `testuser@example.com` / `TestPass123!` |
| Income Transaction | Sample income data | Type: Income, Amount: $3000, Category: Salary, Date: Current month |
| Expense Transaction | Sample expense data | Type: Expense, Amount: $150, Category: Groceries, Date: Current month |
| Categories | Available transaction categories | Food, Transport, Salary, Freelance, Entertainment, Utilities |
| Date Range | Transaction date range for filtering | Start: 2024-01-01, End: 2024-12-31 |
| Search Terms | Keywords for search testing | "grocery", "rent", "salary", "uber" |
| Large Dataset | 50+ transactions for pagination testing | Mix of income/expense across multiple months |

---

## Notes

- Transaction amounts should display with proper currency formatting
- Income typically shown in green, expenses in red
- Sorting by date (newest first) is common default
- Consider testing with very large amounts for boundary testing
- Category is typically required - test with/without categories
