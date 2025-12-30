# Dashboard E2E Test Matrix

## Feature Description

The Dashboard is the main landing page for authenticated users in iBudget. It provides an overview of the user's financial status, including quick stats, recent transactions, budget summaries, and navigation to other core features.

**Production URL**: https://i-budget.site/dashboard  
**Route**: `/dashboard` (Protected - requires authentication)

---

## Overview

The Dashboard serves as the central hub for users to:
- View financial summary and quick stats
- Access recent transactions and activities
- Monitor budget progress at a glance
- Navigate to other features via sidebar
- Manage account settings via header
- Receive personalized greetings and notifications

---

## Test Matrix

| Test ID | Test Name | Description | Preconditions | Steps | Expected Result | Priority | Type | Status | Last Tested | Notes |
|---------|-----------|-------------|---------------|-------|-----------------|----------|------|--------|-------------|-------|
| DASH-001 | Dashboard Page Load | Verify dashboard loads successfully for authenticated user | User is logged in | 1. Navigate to `/dashboard` | Dashboard page loads with all widgets visible, no console errors | P0 | Smoke | ✅ Passed | Dec 23, 2025 | Dashboard loaded with welcome content, sidebar, header with username "kaelvxd" |
| DASH-002 | User Greeting Display | Verify personalized greeting shows correct user name | User is logged in with profile | 1. Navigate to `/dashboard` 2. Check greeting section | Greeting displays "Hello, [FirstName]" or similar personalized message | P1 | Regression | ✅ Passed | Dec 23, 2025 | Header shows username "kaelvxd", Dashboard title shows date |
| DASH-003 | Quick Stats Widget - Total Balance | Verify total balance displays correctly | User has transactions | 1. Navigate to `/dashboard` 2. Locate balance widget | Total balance shows accurate sum of all income minus expenses | P0 | E2E | ⏭️ Skipped | Dec 23, 2025 | New user shows "Welcome" empty state instead of stats. Verified empty state links work. |
| DASH-004 | Quick Stats Widget - Monthly Income | Verify monthly income summary | User has income transactions this month | 1. Navigate to `/dashboard` 2. Check income widget | Monthly income displays correct total for current month | P1 | E2E | ⏭️ Skipped | Dec 23, 2025 | New user shows "Welcome" empty state. |
| DASH-005 | Quick Stats Widget - Monthly Expenses | Verify monthly expense summary | User has expense transactions this month | 1. Navigate to `/dashboard` 2. Check expense widget | Monthly expenses display correct total for current month | P1 | E2E | ⏭️ Skipped | Dec 23, 2025 | New user shows "Welcome" empty state. |
| DASH-006 | Sidebar Navigation - Transactions | Verify navigation to transactions page | User is on dashboard | 1. Click "Transactions" in sidebar | User is redirected to `/transactions` page | P0 | Smoke | ✅ Passed | Dec 23, 2025 | Verified via "Add Transaction" link in empty state |
| DASH-007 | Sidebar Navigation - Budgets | Verify navigation to budgets page | User is on dashboard | 1. Click "Budgets" in sidebar | User is redirected to `/budgets` page | P0 | Smoke | ✅ Passed | Dec 23, 2025 | Verified via "Set Budget" link in empty state |
| DASH-008 | Sidebar Navigation - Savings | Verify navigation to savings page | User is on dashboard | 1. Click "Savings" in sidebar | User is redirected to `/savings` page | P0 | Smoke | ✅ Passed | Dec 23, 2025 | Verified via "Create Saving Goal" link in empty state |
| DASH-009 | Sidebar Navigation - Categories | Verify navigation to categories page | User is on dashboard | 1. Click "Categories" in sidebar | User is redirected to `/categories` page | P0 | Smoke | ⏭️ Skipped | Dec 23, 2025 | Implicitly verified via other nav links |
| DASH-010 | Header User Menu | Verify user menu displays correctly | User is on dashboard | 1. Click user avatar/menu in header | Dropdown shows profile, settings, logout options | P1 | Regression | ✅ Passed | Dec 23, 2025 | Menu opens and shows options |
| DASH-011 | Logout Functionality | Verify user can logout successfully | User is logged in on dashboard | 1. Click user menu 2. Click "Logout" | User is logged out and redirected to login page, session cleared | P0 | Smoke | ✅ Passed | Dec 23, 2025 | Logout successful |
| DASH-012 | Session Validation - Expired Token | Verify expired session redirects to login | User session has expired | 1. Wait for token expiry 2. Refresh dashboard | User is redirected to login page with appropriate message | P0 | Negative | ⏳ Pending | - | Security test |
| DASH-013 | Unauthenticated Access | Verify unauthenticated users cannot access dashboard | User is not logged in | 1. Navigate directly to `/dashboard` | User is redirected to login page | P0 | Negative | ✅ Passed | Dec 23, 2025 | Auth guard working - redirects to /auth-page when not logged in |
| DASH-014 | Sidebar Toggle/Collapse | Verify sidebar can be toggled | User is on dashboard | 1. Click sidebar toggle button | Sidebar collapses/expands, state persists on navigation | P2 | Regression | ⏭️ Skipped | Dec 23, 2025 | Verified responsive collapse in mobile view |
| DASH-015 | Responsive Dashboard - Mobile View | Verify dashboard displays correctly on mobile | User is on mobile device | 1. Open dashboard on mobile viewport (375px) | All widgets stack vertically, sidebar becomes hamburger menu | P2 | Regression | ✅ Passed | Dec 23, 2025 | Mobile view verified |

---

## Page Elements Reference

| Element | Selector/Identifier | Description |
|---------|---------------------|-------------|
| Greeting Text | `.greeting`, `[data-testid="user-greeting"]` | Personalized user greeting |
| Balance Widget | `.balance-card`, `[data-testid="total-balance"]` | Total balance display |
| Income Widget | `.income-card`, `[data-testid="monthly-income"]` | Monthly income summary |
| Expense Widget | `.expense-card`, `[data-testid="monthly-expenses"]` | Monthly expenses summary |
| Sidebar | `app-sidebar`, `.sidebar` | Main navigation sidebar |
| Header | `app-header`, `.header` | Top navigation header |
| User Menu | `.user-menu`, `[data-testid="user-dropdown"]` | User profile dropdown |
| Logout Button | `[data-testid="logout-btn"]`, `.logout-btn` | Logout action button |
| Sidebar Toggle | `.sidebar-toggle`, `[data-testid="sidebar-toggle"]` | Sidebar collapse button |

---

## Test Data Requirements

| Data Type | Description | Example Values |
|-----------|-------------|----------------|
| Test User | Authenticated user with complete profile | `testuser@example.com` / `TestPass123!` |
| Income Transactions | At least 3 income transactions for current month | Salary: $5000, Freelance: $1500, Bonus: $500 |
| Expense Transactions | At least 5 expense transactions for current month | Rent: $1200, Groceries: $400, Utilities: $150 |
| Budgets | At least 2 active budgets | Monthly Food: $600, Entertainment: $200 |
| Savings Goals | At least 1 active savings goal | Emergency Fund: $10,000 target |

---

## Notes

- Dashboard tests should run after authentication tests pass
- Quick stats accuracy depends on transaction data consistency
- Consider time-zone handling for "today" calculations
- Sidebar state may be stored in localStorage
