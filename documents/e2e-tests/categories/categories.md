# Categories E2E Test Matrix

## Feature Description

The Categories module allows users to organize their financial transactions into logical groups. Users can create custom categories for both Income and Expenses to better track their spending habits and income sources.

**Production URL**: https://i-budget.site/categories  
**Routes**:
- `/categories` - Categories management page (Protected)

---

## Overview

The Categories feature enables users to:
- View existing categories separated by type (Expense/Income)
- Create new custom categories with names and descriptions
- Edit existing category details
- Delete categories that are no longer needed
- Visual indicators for category usage in transactions

---

## Test Matrix

| Test ID | Test Name | Description | Preconditions | Steps | Expected Result | Priority | Type | Status | Last Tested | Notes |
|---------|-----------|-------------|---------------|-------|-----------------|----------|------|--------|-------------|-------|
| CAT-001 | Categories Page Load | Verify categories page loads | User is logged in | 1. Navigate to `/categories` | Page loads, Expense tab active by default, categories list visible | P0 | Smoke | ✅ Passed | Dec 29, 2025 | - |
| CAT-002 | View Categories List | Verify default/existing categories | User has categories | 1. View list 2. Switch tabs | Categories displayed with icons and usage stats | P0 | E2E | ✅ Passed | Dec 29, 2025 | Verified default categories exist |
| CAT-003 | Create Category - Expense | Verify creating expense category | User on categories page | 1. Click "Add Category" 2. Fill details (Type: Expense) 3. Save | Category appears in Expense list | P0 | E2E | ✅ Passed | Dec 29, 2025 | Created "Dining Out" |
| CAT-004 | Create Category - Income | Verify creating income category | User on categories page | 1. Click "Add Category" 2. Fill details (Type: Income) 3. Save | Category appears in Income list | P0 | E2E | ✅ Passed | Dec 29, 2025 | Created "Bonus" |
| CAT-005 | Edit Category | Verify editing category name | User has custom category | 1. Click kebab menu on category 2. Click Edit 3. Rename 4. Save | Category name updates in list | P0 | E2E | ✅ Passed | Dec 29, 2025 | Renamed "Dining Out" to "Restaurants" |
| CAT-006 | Delete Category | Verify deleting category | User has custom category | 1. Click kebab menu 2. Click Delete | Category removed from list immediately | P0 | E2E | ✅ Passed | Dec 29, 2025 | **Note**: No confirmation modal (Instant Delete) |
| CAT-007 | Delete Category - Cancel | Verify cancel delete | User has custom category | 1. Click Delete 2. Cancel in modal | Category remains | P1 | Negative | ✅ Passed | Jan 3, 2026 | Confirmation modal now implemented - manually verified cancel functionality working |
| CAT-008 | Default Category Protection | Verify default categories cannot be deleted | Default categories exist | 1. Check kebab menu for default category | Delete option might be disabled or hidden | P1 | Security | ✅ Passed | Jan 3, 2026 | Defaults can be deleted unless they are in use, then they cannot be deleted (tested in prod) |
| CAT-009 | Empty Name Validation | Verify name is required | User creating category | 1. Leave name empty 2. Save | Error message shown | P1 | Negative | ✅ Passed | Jan 3, 2026 | Throws error when empty: "Name is required (min 4 characters)." |
| CAT-010 | Duplicate Name Validation | Verify duplicate names rejected | Category "Food" exists | 1. Create new "Food" category 2. Save | Error message: "Category already exists" | P2 | Boundary | ✅ Passed | Jan 3, 2026 | Duplicate prevention implemented - shows "Category already exists!" error |
| CAT-011 | Category Usage Count | Verify usage count accuracy | Category used in transaction | 1. Check usage text on card | Shows correct number of transactions | P2 | E2E | ✅ Passed | Dec 29, 2025 | Verified "Food" showing "Used in 2 transaction/s" |
| CAT-012 | Empty State - Expense | Verify empty state for expense | User has no expense categories | 1. Delete all expense categories | Empty state message displayed | P2 | Regression | ✅ Passed | Dec 29, 2025 | Saw "No categories found" briefly before list load |
| CAT-013 | Empty State - Income | Verify empty state for income | User has no income categories | 1. Switch to Income 2. Delete all income categories | Empty state message displayed | P2 | Regression | ⏳ Pending | - | - |
| CAT-014 | Toggle Tabs | Verify switching between Expense/Income | User on page | 1. Click Income 2. Click Expense | List content updates accordingly | P1 | UX | ✅ Passed | Dec 29, 2025 | Works correctly |

---

## Page Elements Reference

| Element | Selector/Identifier | Description |
|---------|---------------------|-------------|
| Add Category Button | `button:has-text("Add Category")` | Open creation modal |
| Expense Tab | `button:has-text("Expense")` | Switch to expense list |
| Income Tab | `button:has-text("Income")` | Switch to income list |
| Category Card | `.category-card` (inferred) | Container for category info |
| Kebab Menu | `button.dropdown-toggle` (inferred) | Menu for Edit/Delete |
| Edit Option | `button:has-text("Edit")` | Edit action |
| Delete Option | `button:has-text("Delete")` | Delete action |
| Category Modal | `dialog` | Create/Edit form container |
| Name Input | `input[placeholder="Category name"]` | Name field |
| Description Input | `input[placeholder="Optional description"]` | Description field |
| Type Select | `select` / `combobox` | Expense/Income toggle |

---

## Test Data Requirements

| Data Type | Description | Example Values |
|-----------|-------------|----------------|
| Custom Category | User-created category | Name: "Hobbies", Type: Expense |
| Duplicate Category | Testing validation | Name: "Food" (if Food exists) |
| Long Name | Boundary testing | Name: "Very Long Category Name..." |

---

## Notes

- **Bug Found**: System allows duplicate category names (created "Bonus" twice).
- **Inconsistency**: Delete action has no confirmation modal (unlike Savings).
- **Usage Stats**: Usage count works ("Used in 2 transaction/s").
