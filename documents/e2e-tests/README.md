# iBudget E2E Test Documentation

> Comprehensive End-to-End Test Suite for iBudget Personal Finance Application

**Production URL**: `https://i-budget.site`  
**Testing Framework**: Playwright MCP  
**Last Updated**: December 2024

---

## Table of Contents

- [Overview](#overview)
- [Test Environment](#test-environment)
- [Test Categories](#test-categories)
- [Test Matrix Summary](#test-matrix-summary)
- [How to Run Tests](#how-to-run-tests)
- [Test Data Requirements](#test-data-requirements)
- [Status Legend](#status-legend)
- [Contributing](#contributing)

---

## Overview

This documentation contains the comprehensive E2E test suite for the iBudget application. Tests are organized by feature area and follow industry-standard test matrix formats for traceability and coverage analysis.

### Application Features Tested

| Feature Area | Description | Test Count | Coverage |
|--------------|-------------|------------|----------|
| [Authentication](./authentication/) | User registration, login, password recovery | 56 | 100% |
| [Dashboard](./dashboard/) | Main dashboard functionality | - | - |
| [Transactions](./transactions/) | Transaction CRUD operations | - | - |
| [Budgets](./budgets/) | Budget management | - | - |
| [Savings](./savings/) | Savings goals tracking | - | - |
| [Categories](./categories/) | Category management | - | - |
| [Reports](./reports/) | Financial reports | - | - |
| [Notifications](./notifications/) | Notification system | - | - |
| [Settings](./settings/) | User settings and preferences | - | - |

---

## Test Environment

### Production Environment

```yaml
URL: https://i-budget.site
Browser Support:
  - Chromium (Primary)
  - Firefox
  - WebKit (Safari)
Viewport: 1280x720 (Desktop), 375x667 (Mobile)
```

### Prerequisites

1. **Playwright MCP** configured and running
2. **Test user accounts** created (see [Test Data](./shared/test-data.md))
3. **Network access** to production URL

### Browser Configuration

```javascript
// playwright.config.ts recommended settings
{
  baseURL: 'https://i-budget.site',
  timeout: 30000,
  retries: 2,
  use: {
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  }
}
```

---

## Test Categories

### Authentication (`/authentication/`)

| File | Description |
|------|-------------|
| [registration.md](./authentication/registration.md) | User sign-up flow tests |
| [login.md](./authentication/login.md) | User login flow tests |
| [password-recovery.md](./authentication/password-recovery.md) | Forgot/reset password tests |
| [email-verification.md](./authentication/email-verification.md) | Email verification flow tests |

### Core Features

| File | Description |
|------|-------------|
| [dashboard.md](./dashboard/dashboard.md) | Dashboard overview and navigation |
| [transactions.md](./transactions/transactions.md) | Transaction management (CRUD) |
| [budgets.md](./budgets/budgets.md) | Budget management (CRUD) |
| [savings.md](./savings/savings.md) | Savings goals management |
| [categories.md](./categories/categories.md) | Category management |
| [reports.md](./reports/reports.md) | Financial reports and analytics |

### System Features

| File | Description |
|------|-------------|
| [notifications.md](./notifications/notifications.md) | Notification system tests |
| [account.md](./settings/account.md) | Account settings |
| [security.md](./settings/security.md) | Security settings (password change) |
| [preferences.md](./settings/preferences.md) | Notification preferences |

### Shared Resources

| File | Description |
|------|-------------|
| [page-objects.md](./shared/page-objects.md) | Page Object Model documentation |
| [test-data.md](./shared/test-data.md) | Test data requirements |

---

## Test Matrix Summary

### Priority Levels

| Priority | Description | Example |
|----------|-------------|---------|
| **P0** | Critical - Core functionality, must pass | Login, Registration |
| **P1** | High - Important features | Dashboard load, Transaction CRUD |
| **P2** | Medium - Secondary features | Reports, Notifications |
| **P3** | Low - Edge cases, cosmetic | Tooltips, animations |

### Test Types

| Type | Description |
|------|-------------|
| **Smoke** | Quick sanity check of critical paths |
| **Regression** | Full feature verification |
| **E2E** | Complete user journey |
| **Negative** | Error handling and validation |
| **Boundary** | Edge cases and limits |

### Overall Coverage Matrix

| Category | P0 | P1 | P2 | P3 | Total |
|----------|----|----|----|----|-------|
| Authentication | 14 | 23 | 18 | 0 | 56 |
| Dashboard | - | - | - | - | - |
| Transactions | - | - | - | - | - |
| Budgets | - | - | - | - | - |
| Savings | - | - | - | - | - |
| Categories | - | - | - | - | - |
| Reports | - | - | - | - | - |
| Notifications | - | - | - | - | - |
| Settings | - | - | - | - | - |
| **Total** | **14** | **23** | **18** | **0** | **56** |

---

## How to Run Tests

### Using Playwright MCP

Tests are executed using Playwright MCP (Model Context Protocol) for browser automation.

#### Running All Tests

```bash
# Navigate to production site
# Execute tests via Playwright MCP browser automation
```

#### Running Specific Categories

```bash
# Authentication tests
# Dashboard tests
# Transaction tests
# etc.
```

### Test Execution Workflow

1. **Navigate** to `https://i-budget.site`
2. **Execute** test cases as documented in each test matrix
3. **Document** results in the respective markdown files
4. **Update** status column with execution results

---

## Test Data Requirements

See [Test Data Documentation](./shared/test-data.md) for complete test data specifications.

### Quick Reference

| Data Type | Format | Example |
|-----------|--------|---------|
| Email | `test_<timestamp>@example.com` | `test_1703123456@example.com` |
| Username | `testuser_<timestamp>` | `testuser_1703123456` |
| Password | 6+ chars, mixed case | `TestPass123!` |
| Amount | Decimal (2 places) | `1500.00` |
| Date | `YYYY-MM-DD` | `2024-12-22` |

---

## Status Legend

| Status | Icon | Description |
|--------|------|-------------|
| Passed | ✅ | Test executed successfully |
| Failed | ❌ | Test failed - see notes |
| Blocked | 🚫 | Cannot execute - dependency issue |
| Skipped | ⏭️ | Intentionally not executed |
| In Progress | 🔄 | Currently being executed |
| Pending | ⏳ | Not yet executed |

### Automation Status

| Status | Icon | Description |
|--------|------|-------------|
| Automated | 🤖 | Fully automated with Playwright |
| Manual | 👤 | Requires manual execution |
| Partial | ⚡ | Partially automated |
| Planned | 📋 | Automation planned |

---

## Contributing

### Adding New Tests

1. Identify the appropriate category folder
2. Follow the test matrix format in existing files
3. Use consistent Test ID naming: `{CATEGORY}-{FEATURE}-{NUMBER}`
4. Include all required columns
5. Update the summary counts in this README

### Test ID Convention

```
{CATEGORY}-{FEATURE}-{NUMBER}

Examples:
- AUTH-REG-001: Authentication > Registration > Test 1
- TRANS-ADD-003: Transactions > Add > Test 3
- BUDG-DEL-002: Budgets > Delete > Test 2
```

### Updating Test Results

After executing tests via Playwright MCP:

1. Navigate to the appropriate test matrix file
2. Update the `Status` column with the result
3. Add execution date in the `Last Tested` column
4. Document any failures in the `Notes` column
5. Update summary counts if needed

---

## Quick Links

- [Application Routes Reference](../../frontend/ibudget/src/app/app.routes.ts)
- [API Documentation](../../backend/appvengers/API_DOCUMENTATION.md)
- [Backend Summary](../../backend/appvengers/BACKEND_SUMMARY.md)
- [Existing Test Cases](../testcases/TEST_CASES.md)

---

**Maintained by**: Appvengers Team  
**Version**: 1.0.0
