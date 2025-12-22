# Page Object Model Documentation

> Shared Page Objects and Component Selectors for E2E Testing

**Framework**: Playwright MCP  
**Production URL**: `https://i-budget.site`  
**Last Updated**: December 2024

---

## Overview

This document defines the Page Object Model (POM) structure for iBudget E2E testing. Page Objects encapsulate page-specific selectors and actions, promoting reusability and maintainability across test suites.

### Benefits of POM
- **Maintainability**: Selector changes only need updates in one place
- **Reusability**: Common actions shared across tests
- **Readability**: Tests read like user stories
- **Abstraction**: Implementation details hidden from tests

---

## Common Components

### Header Component

**Component**: `app-header`  
**Location**: All authenticated pages

| Element | Selector | Description | Actions |
|---------|----------|-------------|---------|
| Header Container | `header`, `.header` | Main header element | - |
| Logo | `.logo`, `img[alt*="logo"]` | App logo/brand | Click to go home |
| User Menu | `.user-menu`, `.dropdown` | User dropdown trigger | Click to open menu |
| User Avatar | `.user-avatar`, `.avatar` | User profile image | - |
| Notification Bell | `.notification-bell`, `[data-testid="notifications"]` | Notification icon | Click to view notifications |
| Notification Badge | `.notification-badge`, `.badge` | Unread count badge | - |
| Logout Button | `.logout-btn`, `button:has-text("Logout")` | Logout action | Click to logout |

```typescript
// Page Object Example
class HeaderComponent {
  readonly container = 'header';
  readonly logo = '.logo';
  readonly userMenu = '.user-menu';
  readonly notificationBell = '.notification-bell';
  readonly notificationBadge = '.notification-badge';
  readonly logoutButton = 'button:has-text("Logout")';
  
  async clickNotifications() { /* ... */ }
  async logout() { /* ... */ }
  async getNotificationCount() { /* ... */ }
}
```

---

### Sidebar Component

**Component**: `app-toggleable-sidebar`  
**Location**: All authenticated pages

| Element | Selector | Description | Actions |
|---------|----------|-------------|---------|
| Sidebar Container | `.sidebar`, `aside` | Main sidebar element | - |
| Toggle Button | `.sidebar-toggle`, `.hamburger` | Open/close sidebar | Click to toggle |
| Navigation Links | `.nav-link`, `.sidebar-link` | Navigation items | Click to navigate |
| Dashboard Link | `a[href="/dashboard"]`, `.nav-link:has-text("Dashboard")` | Dashboard nav | Click |
| Transactions Link | `a[href="/transactions"]` | Transactions nav | Click |
| Budgets Link | `a[href="/budgets"]` | Budgets nav | Click |
| Savings Link | `a[href="/savings"]` | Savings nav | Click |
| Categories Link | `a[href="/categories"]` | Categories nav | Click |
| Reports Link | `a[href="/reports"]` | Reports nav | Click |
| Notifications Link | `a[href="/notifications"]` | Notifications nav | Click |
| Settings Link | `a[href="/settings"]` | Settings nav | Click |
| Active Link | `.nav-link.active`, `.active` | Currently active page | - |

```typescript
class SidebarComponent {
  readonly container = '.sidebar, aside';
  readonly toggleButton = '.sidebar-toggle';
  readonly navLinks = '.nav-link';
  
  async navigateTo(page: string) { /* ... */ }
  async toggle() { /* ... */ }
  async isExpanded() { /* ... */ }
}
```

---

### Settings Sub-Header Component

**Component**: `app-sub-header`  
**Location**: Settings pages (`/settings/*`)

| Element | Selector | Description | Actions |
|---------|----------|-------------|---------|
| Sub-Header Container | `.sub-header` | Settings navigation bar | - |
| Account Tab | `a[href*="/settings/account"]` | Account settings link | Click |
| Security Tab | `a[href*="/settings/security"]` | Security settings link | Click |
| Notifications Tab | `a[href*="/settings/notifications"]` | Notification prefs link | Click |
| Active Tab | `.active`, `[aria-current="page"]` | Currently active tab | - |

```typescript
class SettingsSubHeader {
  readonly container = '.sub-header';
  readonly accountTab = 'a[href*="/settings/account"]';
  readonly securityTab = 'a[href*="/settings/security"]';
  readonly notificationsTab = 'a[href*="/settings/notifications"]';
  
  async navigateToAccount() { /* ... */ }
  async navigateToSecurity() { /* ... */ }
  async navigateToNotifications() { /* ... */ }
}
```

---

## Authentication Page Objects

### Auth Page (Combined Login/Signup)

**Route**: `/auth-page`

| Element | Selector | Description | Actions |
|---------|----------|-------------|---------|
| Auth Container | `.auth-container`, `.auth-page` | Main container | - |
| Login Tab | `.tab:has-text("Login")`, `[data-tab="login"]` | Switch to login | Click |
| Signup Tab | `.tab:has-text("Sign Up")`, `[data-tab="signup"]` | Switch to signup | Click |
| Email Input | `input[type="email"]`, `#email` | Email field | Fill |
| Password Input | `input[type="password"]`, `#password` | Password field | Fill |
| Username Input | `#username`, `input[name="username"]` | Username (signup) | Fill |
| Submit Button | `button[type="submit"]` | Login/Signup button | Click |
| Error Message | `.error-message`, `.alert-danger` | Error display | Assert |
| Forgot Password Link | `a:has-text("Forgot")` | Password recovery | Click |

```typescript
class AuthPage {
  readonly url = '/auth-page';
  readonly emailInput = 'input[type="email"]';
  readonly passwordInput = 'input[type="password"]';
  readonly usernameInput = '#username';
  readonly submitButton = 'button[type="submit"]';
  readonly errorMessage = '.error-message, .alert-danger';
  readonly forgotPasswordLink = 'a:has-text("Forgot")';
  
  async login(email: string, password: string) { /* ... */ }
  async signup(username: string, email: string, password: string) { /* ... */ }
  async getErrorMessage() { /* ... */ }
}
```

---

### Forgot Password Page

**Route**: `/forgot-password`

| Element | Selector | Description | Actions |
|---------|----------|-------------|---------|
| Container | `.forgot-password` | Main container | - |
| Email Input | `input[type="email"]`, `#email` | Email field | Fill |
| Submit Button | `button[type="submit"]` | Send reset link | Click |
| Success Message | `.alert-success` | Confirmation message | Assert |
| Back to Login | `a:has-text("Login")` | Return to login | Click |

---

### Reset Password Page

**Route**: `/reset-password`

| Element | Selector | Description | Actions |
|---------|----------|-------------|---------|
| Container | `.reset-password` | Main container | - |
| New Password Input | `#new_password`, `input[name="newPassword"]` | New password | Fill |
| Confirm Password Input | `#confirm_password` | Confirm password | Fill |
| Submit Button | `button[type="submit"]` | Reset password | Click |
| Password Toggle | `.btn-outline-secondary` | Show/hide password | Click |

---

## Dashboard Page Object

**Route**: `/dashboard`

| Element | Selector | Description | Actions |
|---------|----------|-------------|---------|
| Dashboard Container | `.dashboard`, `main` | Main container | - |
| Welcome Message | `.welcome-message`, `h1` | User greeting | Assert |
| Balance Card | `.balance-card`, `.total-balance` | Total balance display | Assert |
| Income Card | `.income-card` | Income summary | Assert |
| Expense Card | `.expense-card` | Expense summary | Assert |
| Recent Transactions | `.recent-transactions` | Transaction list | - |
| Transaction Item | `.transaction-item` | Individual transaction | Click |
| Quick Actions | `.quick-actions` | Action buttons | - |
| Add Transaction Button | `button:has-text("Add Transaction")` | New transaction | Click |
| Charts Section | `.charts-section`, `canvas` | Visual charts | - |

```typescript
class DashboardPage {
  readonly url = '/dashboard';
  readonly container = '.dashboard, main';
  readonly balanceCard = '.balance-card, .total-balance';
  readonly incomeCard = '.income-card';
  readonly expenseCard = '.expense-card';
  readonly recentTransactions = '.recent-transactions';
  readonly addTransactionButton = 'button:has-text("Add Transaction")';
  
  async getTotalBalance() { /* ... */ }
  async getIncomeTotal() { /* ... */ }
  async getExpenseTotal() { /* ... */ }
  async clickAddTransaction() { /* ... */ }
}
```

---

## Form Components

### Text Input

| Element | Selector Pattern | Description |
|---------|------------------|-------------|
| Input Field | `input#fieldId`, `input[formControlName="field"]` | Text input |
| Label | `label[for="fieldId"]` | Field label |
| Error Message | `.text-danger.small`, `.invalid-feedback` | Validation error |
| Input Group | `.input-group` | Input with addons |

### Password Input (with Toggle)

| Element | Selector Pattern | Description |
|---------|------------------|-------------|
| Password Field | `input[type="password"]`, `input#password` | Password input |
| Toggle Button | `.input-group .btn-outline-secondary` | Eye icon button |
| Eye Icon (hidden) | `.bi-eye-slash` | Password hidden state |
| Eye Icon (visible) | `.bi-eye` | Password visible state |

### Select Dropdown

| Element | Selector Pattern | Description |
|---------|------------------|-------------|
| Select Element | `select.form-select`, `select#fieldId` | Dropdown |
| Options | `select option` | Dropdown options |
| Selected Option | `select option:checked` | Current selection |

### Toggle Switch

| Element | Selector Pattern | Description |
|---------|------------------|-------------|
| Switch Container | `.form-check.form-switch` | Toggle wrapper |
| Switch Input | `.form-check-input[type="checkbox"]` | Checkbox input |
| Switch Label | `.form-check-label` | Toggle label |

### Form Submit

| Element | Selector Pattern | Description |
|---------|------------------|-------------|
| Submit Button | `button[type="submit"]` | Form submit |
| Loading Spinner | `.spinner-border` | Loading indicator |
| Disabled State | `button[disabled]` | Disabled button |

```typescript
class FormHelpers {
  async fillInput(selector: string, value: string) { /* ... */ }
  async togglePasswordVisibility(inputGroup: string) { /* ... */ }
  async selectOption(selector: string, value: string) { /* ... */ }
  async toggleSwitch(selector: string) { /* ... */ }
  async submitForm() { /* ... */ }
  async waitForLoading() { /* ... */ }
}
```

---

## Modal/Dialog Components

### Bootstrap Modal

| Element | Selector | Description | Actions |
|---------|----------|-------------|---------|
| Modal Backdrop | `.modal-backdrop` | Dark overlay | - |
| Modal Container | `.modal` | Modal wrapper | - |
| Modal Dialog | `.modal-dialog` | Modal content area | - |
| Modal Header | `.modal-header` | Title section | - |
| Modal Title | `.modal-title` | Dialog title | Assert |
| Close Button (X) | `.btn-close`, `.modal-header button` | Close icon | Click |
| Modal Body | `.modal-body` | Content area | - |
| Modal Footer | `.modal-footer` | Action buttons | - |
| Cancel Button | `.modal-footer .btn-secondary` | Cancel action | Click |
| Confirm Button | `.modal-footer .btn-primary` | Primary action | Click |
| Danger Button | `.modal-footer .btn-danger` | Destructive action | Click |

```typescript
class ModalComponent {
  readonly backdrop = '.modal-backdrop';
  readonly container = '.modal';
  readonly title = '.modal-title';
  readonly closeButton = '.btn-close';
  readonly cancelButton = '.modal-footer .btn-secondary';
  readonly confirmButton = '.modal-footer .btn-primary';
  
  async isOpen() { /* ... */ }
  async close() { /* ... */ }
  async confirm() { /* ... */ }
  async cancel() { /* ... */ }
  async getTitle() { /* ... */ }
}
```

---

## Toast/Alert Components

### Alert Messages

| Element | Selector | Description | Actions |
|---------|----------|-------------|---------|
| Success Alert | `.alert.alert-success` | Success message | Assert |
| Error Alert | `.alert.alert-danger` | Error message | Assert |
| Warning Alert | `.alert.alert-warning` | Warning message | Assert |
| Info Alert | `.alert.alert-info` | Info message | Assert |
| Dismissible Alert | `.alert-dismissible` | Closeable alert | - |
| Close Button | `.alert .btn-close` | Dismiss alert | Click |
| Alert Icon | `.alert i.fas`, `.alert i.bi` | Alert icon | - |

### Toast Notifications

| Element | Selector | Description | Actions |
|---------|----------|-------------|---------|
| Toast Container | `.toast-container` | Toast wrapper | - |
| Toast | `.toast` | Individual toast | - |
| Toast Header | `.toast-header` | Toast title area | - |
| Toast Body | `.toast-body` | Toast message | Assert |
| Toast Close | `.toast .btn-close` | Dismiss toast | Click |

```typescript
class AlertComponent {
  readonly successAlert = '.alert.alert-success';
  readonly errorAlert = '.alert.alert-danger';
  readonly warningAlert = '.alert.alert-warning';
  readonly closeButton = '.alert .btn-close';
  
  async getSuccessMessage() { /* ... */ }
  async getErrorMessage() { /* ... */ }
  async dismissAlert() { /* ... */ }
  async waitForAlert(type: 'success' | 'error') { /* ... */ }
}
```

---

## Navigation Elements

### Pagination

| Element | Selector | Description | Actions |
|---------|----------|-------------|---------|
| Pagination Container | `.pagination` | Pagination wrapper | - |
| Previous Button | `.pagination-btn:has-text("Previous")` | Previous page | Click |
| Next Button | `.pagination-btn:has-text("Next")` | Next page | Click |
| Page Numbers | `.pagination-number` | Page number buttons | Click |
| Active Page | `.pagination-number.active` | Current page | Assert |
| Disabled Button | `.pagination-btn[disabled]` | Disabled state | - |
| Ellipsis | `.pagination-ellipsis` | Page gap indicator | - |

### Tab Navigation

| Element | Selector | Description | Actions |
|---------|----------|-------------|---------|
| Tab Container | `.nav.nav-tabs` | Tab wrapper | - |
| Tab Item | `.nav-item` | Tab button wrapper | - |
| Tab Link | `.nav-link` | Tab button | Click |
| Active Tab | `.nav-link.active` | Selected tab | Assert |
| Tab Content | `.tab-content` | Content area | - |
| Tab Pane | `.tab-pane` | Individual content | - |
| Active Pane | `.tab-pane.active` | Visible content | - |

### Filter Tabs

| Element | Selector | Description | Actions |
|---------|----------|-------------|---------|
| Filter Container | `.filter-tabs` | Filter wrapper | - |
| Filter Tab | `.filter-tab` | Individual filter | Click |
| Active Filter | `.filter-tab.active` | Selected filter | Assert |
| Filter Count | `.tab-count` | Item count badge | Assert |

```typescript
class NavigationHelpers {
  async goToPage(pageNumber: number) { /* ... */ }
  async nextPage() { /* ... */ }
  async previousPage() { /* ... */ }
  async getCurrentPage() { /* ... */ }
  async selectTab(tabName: string) { /* ... */ }
  async selectFilter(filterName: string) { /* ... */ }
}
```

---

## Utility Selectors

### Loading States

| State | Selector | Description |
|-------|----------|-------------|
| Spinner | `.spinner-border` | Bootstrap spinner |
| Loading Container | `.loading-container` | Loading wrapper |
| Skeleton | `.skeleton`, `.placeholder` | Skeleton loader |
| Disabled During Load | `button[disabled]` | Disabled buttons |

### Empty States

| State | Selector | Description |
|-------|----------|-------------|
| Empty State Container | `.empty-state` | No data display |
| Empty State Icon | `.empty-state i`, `.empty-state-illustration` | Illustration |
| Empty State Title | `.empty-state-title` | Title text |
| Empty State Message | `.empty-state-message` | Description |
| Empty State Action | `.empty-state button` | CTA button |

### Currency Display

| Element | Selector | Description |
|---------|----------|-------------|
| Amount | `.amount` | Currency display |
| Positive Amount | `.amount.positive`, `.amount.income` | Positive value |
| Negative Amount | `.amount.negative`, `.amount.expense` | Negative value |
| Currency Symbol | Currency prefix (PHP) | Usually inline |

---

## Test Helpers

### Wait Utilities

```typescript
const waitHelpers = {
  forPageLoad: async () => { /* Wait for navigation complete */ },
  forNetworkIdle: async () => { /* Wait for network quiet */ },
  forElement: async (selector: string) => { /* Wait for visible */ },
  forElementHidden: async (selector: string) => { /* Wait for hidden */ },
  forAlert: async (type: string) => { /* Wait for alert */ },
  forModalOpen: async () => { /* Wait for modal visible */ },
  forModalClose: async () => { /* Wait for modal hidden */ },
  forLoading: async () => { /* Wait for spinner gone */ },
};
```

### Assertion Helpers

```typescript
const assertHelpers = {
  isVisible: async (selector: string) => { /* Assert visible */ },
  isHidden: async (selector: string) => { /* Assert hidden */ },
  hasText: async (selector: string, text: string) => { /* Assert text */ },
  hasValue: async (selector: string, value: string) => { /* Assert value */ },
  isDisabled: async (selector: string) => { /* Assert disabled */ },
  isEnabled: async (selector: string) => { /* Assert enabled */ },
  hasClass: async (selector: string, className: string) => { /* Assert class */ },
  urlContains: async (path: string) => { /* Assert URL */ },
};
```

---

## Page Object Registry

| Page | Class Name | Route | Description |
|------|------------|-------|-------------|
| Auth | `AuthPage` | `/auth-page` | Login/Signup |
| Dashboard | `DashboardPage` | `/dashboard` | Main dashboard |
| Transactions | `TransactionsPage` | `/transactions` | Transaction management |
| Budgets | `BudgetsPage` | `/budgets` | Budget management |
| Savings | `SavingsPage` | `/savings` | Savings goals |
| Categories | `CategoriesPage` | `/categories` | Category management |
| Reports | `ReportsPage` | `/reports` | Financial reports |
| Notifications | `NotificationsPage` | `/notifications` | Notification list |
| Settings | `SettingsPage` | `/settings` | Settings main |
| Account Settings | `AccountSettingsPage` | `/settings/account/:id` | Account settings |
| Security Settings | `SecuritySettingsPage` | `/settings/security/:id` | Security settings |
| Notification Prefs | `NotificationPrefsPage` | `/settings/notifications` | Notification preferences |

---

## Best Practices

### Selector Priority

1. **Test IDs**: `[data-testid="element-name"]` (most stable)
2. **ARIA labels**: `[aria-label="description"]`
3. **Role + Text**: `button:has-text("Save")`
4. **ID**: `#elementId`
5. **Class**: `.specific-class` (avoid generic classes)
6. **Form attributes**: `input[formControlName="field"]`

### Naming Conventions

- Page Objects: `{PageName}Page` (e.g., `DashboardPage`)
- Components: `{ComponentName}Component` (e.g., `HeaderComponent`)
- Helpers: `{Purpose}Helpers` (e.g., `FormHelpers`)
- Selectors: camelCase (e.g., `submitButton`)

### Maintenance

- Update selectors when UI changes
- Keep page objects focused on single pages
- Extract shared components
- Document selector changes
- Version control page objects

---

**Maintained by**: Appvengers Team  
**Version**: 1.0.0
