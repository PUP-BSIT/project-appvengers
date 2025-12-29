# Notifications - E2E Test Matrix

> Notification System Testing

**Route**: `/notifications`  
**Protection**: Authenticated users only (authGuard)  
**Production URL**: `https://i-budget.site/notifications`  
**Last Updated**: December 29, 2024

---

## Overview

The Notifications page provides users with a comprehensive notification management system:
- Filter tabs: All, Budgets, Savings, Unread
- Grouped display: Today, Yesterday, This Week, Older
- Mark as read (individual and all)
- Delete notifications
- Navigation to related resources (savings/budgets)
- Confetti celebrations for milestones
- Pagination support

### Key Components
- `Notifications` component with filter tabs
- `NotificationService` for state management
- `ConfettiService` for celebrations
- WebSocket integration for real-time updates

### Notification Types
- `BUDGET_WARNING` - Budget at 50% threshold
- `BUDGET_EXCEEDED` - Budget limit exceeded
- `BUDGET_NEAR_END` - Budget period ending soon
- `SAVINGS_DEADLINE` - Savings goal deadline approaching
- `SAVINGS_MILESTONE_50` - 50% of savings goal reached
- `SAVINGS_MILESTONE_75` - 75% of savings goal reached
- `SAVINGS_COMPLETED` - Savings goal achieved

---

## Test Matrix

| Test ID | Test Name | Description | Preconditions | Steps | Expected Result | Priority | Type | Status | Last Tested | Notes |
|---------|-----------|-------------|---------------|-------|-----------------|----------|------|--------|-------------|-------|
| NOTIF-VIEW-001 | View Notifications Page | Verify notifications page loads | User logged in | 1. Navigate to `/notifications` 2. Wait for page load | Page displays header, filter tabs, notification list | P0 | Smoke | ✅ Passed | Dec 29, 2024 | Verified manually |
| NOTIF-LIST-001 | Display Notification List | Verify notifications display grouped | User with notifications | 1. View notifications list | Notifications grouped by Today/Yesterday/This Week/Older | P1 | E2E | ✅ Passed | Dec 29, 2024 | Verified manually |
| NOTIF-FILT-001 | Filter by All | Verify All filter shows all notifications | User with mixed notifications | 1. Click "All" filter tab | All notifications displayed, count matches total | P1 | Regression | ✅ Passed | Dec 29, 2024 | Verified manually |
| NOTIF-FILT-002 | Filter by Budgets | Verify Budgets filter works | User with budget notifications | 1. Click "Budgets" filter tab | Only BUDGET_WARNING, BUDGET_EXCEEDED, BUDGET_NEAR_END shown | P1 | Regression | ✅ Passed | Dec 29, 2024 | Verified live trigger (50% threshold) |
| NOTIF-FILT-003 | Filter by Savings | Verify Savings filter works | User with savings notifications | 1. Click "Savings" filter tab | Only SAVINGS_* type notifications shown | P1 | Regression | ✅ Passed | Dec 29, 2024 | Verified manually |
| NOTIF-FILT-004 | Filter by Unread | Verify Unread filter works | User with unread notifications | 1. Click "Unread" filter tab | Only unread notifications displayed | P1 | Regression | ✅ Passed | Dec 29, 2024 | Verified manually |
| NOTIF-READ-001 | Mark Single as Read | Verify marking single notification read | User with unread notification | 1. Find unread notification 2. Click check mark button | Notification marked as read, styling updates | P0 | E2E | ✅ Passed | Dec 29, 2024 | Verified manually |
| NOTIF-READ-002 | Mark All as Read | Verify marking all notifications read | User with multiple unread | 1. Click "Mark all as read" button | All notifications marked read, button disabled | P0 | E2E | ✅ Passed | Dec 29, 2024 | Verified manually |
| NOTIF-DEL-001 | Delete Single Notification | Verify deleting notification | User with notifications | 1. Click delete (X) button on notification | Notification removed from list, count updates | P1 | E2E | ✅ Passed | Dec 29, 2024 | Verified manually |
| NOTIF-NAV-001 | Navigate to Savings Detail | Verify savings notification navigation | User with savings notification | 1. Click eye icon on savings notification | Navigates to `/savings/view-saving/:id` | P1 | E2E | ✅ Passed | Dec 29, 2024 | Verified manually |
| NOTIF-NAV-002 | Navigate to Budget Detail | Verify budget notification navigation | User with budget notification | 1. Click eye icon on budget notification | Navigates to `/budgets/view-budget/:id` | P1 | E2E | ✅ Passed | Dec 29, 2024 | Verified manually |
| NOTIF-EMPTY-001 | Empty State No Notifications | Verify behavior when no transactions exist | New user with no notifications | 1. Navigate to `/notifications` | Empty state shows "You're all caught up!" message | P2 | Negative | ✅ Passed | Dec 29, 2024 | Verified via snapshot |
| NOTIF-EMPTY-002 | Empty State Filtered | Verify empty filtered state | User with notifications, none matching filter | 1. Apply filter with no matches | Shows "No matching notifications" with clear filter button | P2 | Negative | ✅ Passed | Dec 29, 2024 | Verified manually with 'Show all notifications' button |
| NOTIF-PAGE-001 | Pagination Display | Verify pagination appears | User with >10 notifications | 1. View notifications page | Pagination controls appear below list | P2 | E2E | ✅ Passed | Dec 29, 2024 | Verified manually during development |
| NOTIF-PAGE-002 | Navigate Pages | Verify page navigation works | User with >10 notifications | 1. Click "Next" 2. Click page number 3. Click "Previous" | Correct notifications displayed for each page | P2 | E2E | ✅ Passed | Dec 29, 2024 | Verified manually during development |
| NOTIF-GUARD-001 | Auth Guard Redirect | Verify unauthenticated redirect | User not logged in | 1. Navigate directly to `/notifications` | Redirected to login/auth page | P0 | Smoke | ✅ Passed | Dec 29, 2024 | Implicitly passed |

---

## Page Elements Reference

### Selectors

| Element | Selector | Description |
|---------|----------|-------------|
| Notifications Container | `.notifications-container` | Main container |
| Stats Display | `.notifications-stats` | Showing X-Y of Z |
| Filter Tabs | `.filter-tabs` | Filter tab container |
| All Tab | `.filter-tab` (contains "All") | All notifications filter |
| Budgets Tab | `.filter-tab` (contains "Budgets") | Budget notifications filter |
| Savings Tab | `.filter-tab` (contains "Savings") | Savings notifications filter |
| Unread Tab | `.filter-tab` (contains "Unread") | Unread notifications filter |
| Mark All Read Button | `.mark-all-read` | Mark all as read button |
| Tab Count Badge | `.tab-count` | Count badge on filter tabs |
| Notification Group | `.notification-group` | Date group container |
| Group Label | `.group-label` | Today/Yesterday/This Week/Older |
| Notification Item | `.notification-item` | Individual notification |
| Unread Notification | `.notification-item.unread` | Unread notification styling |
| Notification Icon | `.notification-icon` | Type-based icon |
| Notification Title | `.notification-title` | Notification title text |
| Notification Date | `.notification-date` | Timestamp display |
| Notification Message | `.notification-message` | Full message text |
| Category Tag | `.category-tag` | Category label |
| Amount Display | `.notification-amount` | Currency amount |
| Mark Read Button | `.btn-mark-read` | Check mark button |
| View Details Button | `.btn-view-details` | Eye icon button |
| Delete Button | `.btn-delete` | X delete button |
| Empty State | `.empty-state` | No notifications display |
| Pagination | `.pagination` | Pagination controls |
| Page Number | `.pagination-number` | Page number button |
| Previous Button | `.pagination-btn` (Previous) | Previous page button |
| Next Button | `.pagination-btn` (Next) | Next page button |

### Component Structure

```
Notifications Page
├── ToggleableSidebar
├── Header
├── Notifications Header
│   └── Stats (Showing X-Y of Z)
├── Filter Tabs
│   ├── All Tab (with count)
│   ├── Budgets Tab (with count)
│   ├── Savings Tab (with count)
│   ├── Unread Tab (with count)
│   └── Mark All as Read Button
├── Notifications Content
│   ├── Notification Groups
│   │   ├── Group Label (Today/Yesterday/etc)
│   │   └── Notification Items[]
│   │       ├── Icon
│   │       ├── Content (title, date, meta, message)
│   │       └── Actions (mark read, view, delete)
│   └── Empty State (when applicable)
└── Pagination (when >10 items)
    ├── Previous Button
    ├── Page Numbers
    └── Next Button
```

---

## Test Data Requirements

### User Accounts

| Account Type | Email | Password | Purpose |
|--------------|-------|----------|---------|
| User with Notifications | `notif_test@example.com` | `TestPass123!` | Has various notifications |
| User No Notifications | `notif_empty@example.com` | `TestPass123!` | Empty state testing |
| User 20+ Notifications | `notif_pagination@example.com` | `TestPass123!` | Pagination testing |

### Sample Notifications

| Title | Type | Category | Amount | Read | Date |
|-------|------|----------|--------|------|------|
| Budget Warning: Food | BUDGET_WARNING | Food | ₱4,000.00 | false | Today |
| Budget Exceeded: Shopping | BUDGET_EXCEEDED | Shopping | ₱5,500.00 | false | Today |
| Savings 50% Milestone | SAVINGS_MILESTONE_50 | - | ₱25,000.00 | true | Yesterday |
| Savings Goal Completed! | SAVINGS_COMPLETED | - | ₱50,000.00 | false | This Week |
| Deadline Approaching | SAVINGS_DEADLINE | - | ₱10,000.00 | true | Older |

### Filter Count Expectations

| Filter | Expected Types | Test Count |
|--------|---------------|------------|
| All | All types | 5 |
| Budgets | BUDGET_WARNING, BUDGET_EXCEEDED, BUDGET_NEAR_END | 2 |
| Savings | SAVINGS_DEADLINE, SAVINGS_MILESTONE_50, SAVINGS_MILESTONE_75, SAVINGS_COMPLETED | 3 |
| Unread | All types where read=false | 3 |

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/notifications` | GET | Fetch all notifications |
| `/api/notifications/:id/read` | PATCH | Mark notification as read |
| `/api/notifications/read-all` | PATCH | Mark all notifications as read |
| `/api/notifications/:id` | DELETE | Delete notification |

### WebSocket Events

| Event | Description |
|-------|-------------|
| `notification` | New notification received |

---

**Test Coverage Summary**

| Priority | Count | Description |
|----------|-------|-------------|
| P0 | 4 | Critical path, must pass |
| P1 | 7 | Important features |
| P2 | 5 | Secondary features |
| P3 | 0 | Edge cases |
| **Total** | **16** | |
