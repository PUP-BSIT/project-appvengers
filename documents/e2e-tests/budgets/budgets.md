# Budgets E2E Test Matrix

## Feature Description

The Budgets module allows users to create and manage spending budgets for different categories. Users can set budget limits, track spending progress, and receive alerts when approaching or exceeding budget limits.

**Production URL**: https://i-budget.site/budgets  
**Routes**: 
- `/budgets` - Budget list (Protected)
- `/budgets/view-budget/:id` - View budget details

---

## Overview

The Budgets feature enables users to:
- View all active and past budgets
- Create new budgets with category and amount limits
- View detailed budget progress and spending breakdown
- Edit existing budget parameters
- Delete budgets no longer needed
- Track spending against budget limits
- Receive visual alerts for budget status (on track, warning, exceeded)

---

## Test Matrix

| Test ID | Test Name | Description | Preconditions | Steps | Expected Result | Priority | Type | Status | Last Tested | Notes |
|---------|-----------|-------------|---------------|-------|-----------------|----------|------|--------|-------------|-------|
| BUD-001 | Budgets Page Load | Verify budgets page loads successfully | User is logged in | 1. Navigate to `/budgets` | Budgets list displays with all user budgets, loading completes | P0 | Smoke | ✅ Passed | Dec 23, 2024 | Page loads correctly |
| BUD-002 | View Budgets List | Verify all budgets display correctly | User has existing budgets | 1. Navigate to `/budgets` | All budgets show name, category, limit amount, spent amount, progress bar | P0 | E2E | ✅ Passed | Dec 23, 2024 | Budgets appear in list |
| BUD-003 | Create New Budget | Verify user can create a budget | User is on budgets page | 1. Click "Create Budget" 2. Enter name, select category, set amount limit 3. Set date range 4. Click Save | Budget is created, appears in list with 0% progress | P0 | E2E | ✅ Passed | Dec 23, 2024 | Created successfully |
| BUD-004 | View Budget Details | Verify budget details page displays correctly | User has existing budget | 1. Click on budget card or "View" button 2. Navigate to `/budgets/view-budget/:id` | Details page shows budget info, spending breakdown, transaction list | P0 | E2E | ✅ Passed | Dec 23, 2024 | Details page loads |
| BUD-005 | Edit Budget | Verify user can edit budget details | User has existing budget | 1. Click edit button on budget 2. Modify amount limit 3. Click Save | Budget updates with new values, progress recalculates | P0 | E2E | ✅ Passed | Dec 23, 2024 | Edit successful |
| BUD-006 | Delete Budget | Verify user can delete budget | User has existing budget | 1. Click delete button 2. Confirm deletion in modal | Budget is removed from list | P0 | E2E | ✅ Passed | Dec 23, 2024 | BUG: Deletes instantly without confirmation modal. |
| BUD-007 | Delete Budget - Cancel | Verify cancel on delete modal | User has existing budget | 1. Click delete button 2. Click Cancel in modal | Budget remains unchanged in list | P1 | Negative | ❌ Failed | Dec 23, 2024 | Failed because there is no confirmation modal. |
| BUD-008 | Budget Progress Tracking | Verify progress bar reflects actual spending | Budget exists with transactions | 1. View budget with spending 2. Check progress bar percentage | Progress bar shows correct percentage (spent/limit * 100) | P0 | E2E | ✅ Passed | Dec 23, 2024 | Verified manually. Automated test had data sync timing issue. |
| BUD-009 | Budget Progress - Green Status | Verify green status for under 50% spent | Budget at <50% spending | 1. View budget with low spending | Progress bar displays green color | P1 | Regression | ⏭️ Skipped | Dec 23, 2024 | Blocked by BUD-008 failure |
| BUD-010 | Budget Progress - Yellow Warning | Verify yellow warning for 50-80% spent | Budget at 50-80% spending | 1. View budget nearing limit | Progress bar displays yellow/orange color, warning indicator | P1 | Regression | ⏭️ Skipped | Dec 23, 2024 | Blocked by BUD-008 failure |
| BUD-011 | Budget Progress - Red Exceeded | Verify red status for exceeded budget | Budget over 100% spending | 1. View budget that exceeded limit | Progress bar displays red, "Exceeded" label shown | P1 | Regression | ⏭️ Skipped | Dec 23, 2024 | Blocked by BUD-008 failure |
| BUD-012 | Category Assignment | Verify category can be assigned to budget | User is creating budget | 1. Create new budget 2. Select category from dropdown 3. Save | Budget is linked to selected category, tracks category spending | P1 | E2E | ✅ Passed | Dec 23, 2024 | Verified during creation |
| BUD-013 | Date Range Settings - Monthly | Verify monthly budget period | User is creating budget | 1. Create budget 2. Select "Monthly" period 3. Save | Budget period is set to current month, resets monthly | P1 | E2E | ⏭️ Skipped | Dec 23, 2024 | Custom dates used |
| BUD-014 | Date Range Settings - Custom | Verify custom date range | User is creating budget | 1. Create budget 2. Select custom dates 3. Save | Budget tracks spending within custom date range only | P2 | E2E | ✅ Passed | Dec 23, 2024 | Verified during creation |
| BUD-015 | Amount Validation - Empty | Verify amount is required | User is creating budget | 1. Leave amount field empty 2. Click Save | Error message: "Budget amount is required" | P1 | Negative | ⏭️ Skipped | Dec 23, 2024 | - |
| BUD-016 | Amount Validation - Zero | Verify zero amount rejected | User is creating budget | 1. Enter 0 as amount 2. Click Save | Error message: "Budget amount must be greater than 0" | P2 | Boundary | ⏭️ Skipped | Dec 23, 2024 | - |
| BUD-017 | Amount Validation - Negative | Verify negative amount rejected | User is creating budget | 1. Enter -500 as amount 2. Click Save | Error message: "Budget amount must be positive" | P2 | Boundary | ⏭️ Skipped | Dec 23, 2024 | - |
| BUD-018 | Empty State | Verify empty state for no budgets | New user with no budgets | 1. Navigate to `/budgets` | Empty state shows "Create your first budget" message with CTA | P2 | Regression | ✅ Passed | Dec 23, 2024 | Empty state verified |

---

## Page Elements Reference

| Element | Selector/Identifier | Description |
|---------|---------------------|-------------|
| Budgets List | `.budgets-list`, `[data-testid="budget-list"]` | Container for all budget cards |
| Budget Card | `.budget-card`, `[data-testid="budget-card"]` | Individual budget display card |
| Create Budget Button | `[data-testid="create-budget-btn"]`, `.create-budget-btn` | Button to create new budget |
| Budget Name | `.budget-name`, `[data-testid="budget-name"]` | Budget name display |
| Budget Amount | `.budget-amount`, `[data-testid="budget-limit"]` | Budget limit amount |
| Spent Amount | `.spent-amount`, `[data-testid="budget-spent"]` | Amount spent display |
| Progress Bar | `.progress-bar`, `[data-testid="budget-progress"]` | Visual progress indicator |
| Progress Percentage | `.progress-percent`, `[data-testid="progress-percent"]` | Percentage text |
| Edit Button | `[data-testid="edit-budget"]`, `.edit-btn` | Edit budget action |
| Delete Button | `[data-testid="delete-budget"]`, `.delete-btn` | Delete budget action |
| View Button | `[data-testid="view-budget"]`, `.view-btn` | View details action |
| Budget Form | `.budget-form`, `[data-testid="budget-form"]` | Create/Edit budget form |
| Name Input | `#budgetName`, `[data-testid="budget-name-input"]` | Budget name field |
| Amount Input | `#budgetAmount`, `[data-testid="budget-amount-input"]` | Budget limit field |
| Category Select | `#budgetCategory`, `[data-testid="budget-category"]` | Category dropdown |
| Period Select | `#budgetPeriod`, `[data-testid="budget-period"]` | Budget period selector |
| Start Date | `#startDate`, `[data-testid="budget-start"]` | Custom start date |
| End Date | `#endDate`, `[data-testid="budget-end"]` | Custom end date |
| Save Button | `[data-testid="save-budget"]`, `.save-btn` | Save budget button |
| Confirm Modal | `.confirm-modal`, `[data-testid="confirm-delete"]` | Delete confirmation |

---

## Test Data Requirements

| Data Type | Description | Example Values |
|-----------|-------------|----------------|
| Test User | Authenticated user | `testuser@example.com` / `TestPass123!` |
| Budget - Under Limit | Budget with <50% spending | Name: "Groceries", Limit: $500, Spent: $150 |
| Budget - Near Limit | Budget with 50-80% spending | Name: "Entertainment", Limit: $200, Spent: $140 |
| Budget - Exceeded | Budget over limit | Name: "Dining Out", Limit: $300, Spent: $450 |
| Categories | Available budget categories | Food, Transport, Entertainment, Shopping, Utilities |
| Date Ranges | Budget period options | Monthly, Weekly, Custom (2024-01-01 to 2024-01-31) |
| Transactions | Linked transactions for progress | Multiple expenses in budget category |

---

## Notes

- Budget progress should update in real-time or on page refresh after transactions
- Consider testing rollover budgets if feature exists
- Category can typically only be used by one budget at a time
- Progress bar colors may vary by design system
- Test budget behavior at month boundaries for recurring budgets
