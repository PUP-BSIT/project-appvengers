# Categories E2E Test Matrix

## Feature Description

The Categories module allows users to manage transaction categories for organizing their income and expenses. Users can create custom categories, edit existing ones, and assign icons/colors for visual identification.

**Production URL**: https://i-budget.site/categories  
**Route**: `/categories` (Protected - requires authentication)

---

## Overview

The Categories feature enables users to:
- View all available categories (default and custom)
- Create new custom categories
- Edit category details (name, icon, color)
- Delete custom categories
- Assign category types (income/expense)
- Use categories for transactions and budgets

---

## Test Matrix

| Test ID | Test Name | Description | Preconditions | Steps | Expected Result | Priority | Type | Status | Last Tested | Notes |
|---------|-----------|-------------|---------------|-------|-----------------|----------|------|--------|-------------|-------|
| CAT-001 | Categories Page Load | Verify categories page loads successfully | User is logged in | 1. Navigate to `/categories` | Categories page displays with list of all categories | P0 | Smoke | ⏳ Pending | - | Critical path |
| CAT-002 | View Categories List | Verify all categories display correctly | User has default and custom categories | 1. Navigate to `/categories` | All categories show name, icon, color, type (income/expense) | P0 | E2E | ⏳ Pending | - | - |
| CAT-003 | View Default Categories | Verify default/system categories display | User is on categories page | 1. View categories list | Default categories (Food, Transport, Salary, etc.) are visible | P0 | E2E | ⏳ Pending | - | System categories |
| CAT-004 | Create New Category | Verify user can create custom category | User is on categories page | 1. Click "Add Category" 2. Enter name 3. Select type (income/expense) 4. Choose icon and color 5. Save | New category appears in list with selected attributes | P0 | E2E | ⏳ Pending | - | Core feature |
| CAT-005 | Edit Category | Verify user can edit category details | User has custom category | 1. Click edit on category 2. Modify name and color 3. Save | Category updates with new values | P0 | E2E | ⏳ Pending | - | - |
| CAT-006 | Delete Category | Verify user can delete custom category | User has custom category with no usage | 1. Click delete on category 2. Confirm deletion | Category is removed from list | P0 | E2E | ⏳ Pending | - | - |
| CAT-007 | Delete Category - Cancel | Verify cancel preserves category | User has custom category | 1. Click delete 2. Cancel in modal | Category remains unchanged | P1 | Negative | ⏳ Pending | - | - |
| CAT-008 | Delete Category - In Use | Verify warning when deleting used category | Category is used by transactions/budgets | 1. Try to delete category in use 2. View warning | Warning shows usage count, asks for confirmation or blocks deletion | P1 | Negative | ⏳ Pending | - | Data integrity |
| CAT-009 | Icon Selection | Verify icon picker functionality | User is creating/editing category | 1. Open icon picker 2. Browse/search icons 3. Select icon | Selected icon displays on category | P1 | E2E | ⏳ Pending | - | - |
| CAT-010 | Color Selection | Verify color picker functionality | User is creating/editing category | 1. Open color picker 2. Select color 3. Save | Category displays with selected color | P1 | E2E | ⏳ Pending | - | - |
| CAT-011 | Category Type - Income | Verify income type category | User is creating category | 1. Create category 2. Select type "Income" 3. Save | Category marked as income, available in income transactions | P1 | E2E | ⏳ Pending | - | - |
| CAT-012 | Category Type - Expense | Verify expense type category | User is creating category | 1. Create category 2. Select type "Expense" 3. Save | Category marked as expense, available in expense transactions | P1 | E2E | ⏳ Pending | - | - |
| CAT-013 | Default Categories - Non-Editable | Verify default categories protected | User is on categories page | 1. Locate default category 2. Check for edit/delete options | Default categories have no edit/delete buttons OR show "System" badge | P1 | Negative | ⏳ Pending | - | May vary by design |
| CAT-014 | Category Name Validation - Empty | Verify name is required | User is creating category | 1. Leave name empty 2. Click Save | Error: "Category name is required" | P1 | Negative | ⏳ Pending | - | - |
| CAT-015 | Category Name Validation - Duplicate | Verify duplicate names handled | User is creating category | 1. Enter name that already exists 2. Click Save | Error: "Category name already exists" | P1 | Negative | ⏳ Pending | - | - |
| CAT-016 | Category Usage Display | Verify usage count on categories | Categories have transactions | 1. View categories list | Each category shows transaction count or usage indicator | P2 | Regression | ⏳ Pending | - | UX feature |
| CAT-017 | Filter by Type | Verify filtering categories by type | User has both income and expense categories | 1. Select "Income" filter 2. Select "Expense" filter 3. Select "All" | List filters to show only selected type categories | P2 | E2E | ⏳ Pending | - | If feature exists |
| CAT-018 | Search Categories | Verify search functionality | User has multiple categories | 1. Enter search term 2. View results | Only matching categories display | P2 | E2E | ⏳ Pending | - | If feature exists |

---

## Page Elements Reference

| Element | Selector/Identifier | Description |
|---------|---------------------|-------------|
| Categories List | `.categories-list`, `[data-testid="category-list"]` | Container for all categories |
| Category Card/Row | `.category-item`, `[data-testid="category-item"]` | Individual category display |
| Add Category Button | `[data-testid="add-category-btn"]`, `.add-category-btn` | Create new category button |
| Category Name | `.category-name`, `[data-testid="category-name"]` | Category name display |
| Category Icon | `.category-icon`, `[data-testid="category-icon"]` | Category icon display |
| Category Color | `.category-color`, `[data-testid="category-color"]` | Category color indicator |
| Category Type Badge | `.category-type`, `[data-testid="category-type"]` | Income/Expense badge |
| Edit Button | `[data-testid="edit-category"]`, `.edit-btn` | Edit category action |
| Delete Button | `[data-testid="delete-category"]`, `.delete-btn` | Delete category action |
| Category Form | `.category-form`, `[data-testid="category-form"]` | Create/Edit category form |
| Name Input | `#categoryName`, `[data-testid="category-name-input"]` | Category name field |
| Type Selector | `[data-testid="category-type-select"]`, `.type-select` | Income/Expense selector |
| Icon Picker | `.icon-picker`, `[data-testid="icon-picker"]` | Icon selection component |
| Color Picker | `.color-picker`, `[data-testid="color-picker"]` | Color selection component |
| Save Button | `[data-testid="save-category"]`, `.save-btn` | Save category button |
| Cancel Button | `[data-testid="cancel-category"]`, `.cancel-btn` | Cancel action button |
| Confirm Modal | `.confirm-modal`, `[data-testid="confirm-delete"]` | Delete confirmation |
| Type Filter | `[data-testid="type-filter"]`, `.type-filter` | Filter dropdown |
| Search Input | `[data-testid="category-search"]`, `.search-input` | Category search field |
| System Badge | `.system-badge`, `[data-testid="system-category"]` | Default category indicator |

---

## Test Data Requirements

| Data Type | Description | Example Values |
|-----------|-------------|----------------|
| Test User | Authenticated user | `testuser@example.com` / `TestPass123!` |
| Default Categories | System-provided categories | Food, Transport, Salary, Utilities, Entertainment, Shopping |
| Custom Category - Income | User-created income category | Name: "Freelance", Type: Income, Icon: 💼, Color: #4CAF50 |
| Custom Category - Expense | User-created expense category | Name: "Subscriptions", Type: Expense, Icon: 📱, Color: #FF5722 |
| Used Category | Category with transactions | Any category with 5+ transactions linked |
| Unused Category | Category with no transactions | Newly created category |
| Icon Options | Available icons for selection | 🏠, 🚗, 🍔, 💰, 🎮, 📚, ✈️, 💊, 🎁 |
| Color Options | Available colors | #FF5722, #4CAF50, #2196F3, #9C27B0, #FFC107 |

---

## Notes

- Default categories should always be present for new users
- Category icons may be emojis or icon library (Font Awesome, Material Icons)
- Color picker may be preset colors or full color spectrum
- Categories may be shared between income and expense in some designs
- Test category availability in transaction and budget creation flows
- Consider testing maximum category name length
- Category deletion may require reassigning transactions first
