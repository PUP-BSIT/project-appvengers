# Test Data Requirements

> Standardized test data for iBudget E2E testing

**Production URL**: `https://i-budget.site`  
**Last Updated**: December 2025

---

## Overview

This document defines the test data requirements for E2E testing. All test data should follow these specifications to ensure consistency and reproducibility across test runs.

---

## Test User Accounts

### Primary Test User

```yaml
Username: testuser_e2e_primary
Email: testuser.e2e.primary@example.com
Password: TestPassword123!
Status: Verified
Use Case: General feature testing
```

### Secondary Test User

```yaml
Username: testuser_e2e_secondary
Email: testuser.e2e.secondary@example.com
Password: TestPassword456!
Status: Verified
Use Case: Multi-user scenarios, sharing tests
```

### Unverified Test User

```yaml
Username: testuser_e2e_unverified
Email: testuser.e2e.unverified@example.com
Password: TestPassword789!
Status: Unverified
Use Case: Email verification flow testing
```

---

## Dynamic Test Data Generation

### Unique Identifiers

Use timestamps to generate unique test data to avoid conflicts:

```javascript
// Username generation
const username = `testuser_${Date.now()}`;
// Example: testuser_1703280000000

// Email generation
const email = `test_${Date.now()}@example.com`;
// Example: test_1703280000000@example.com

// Transaction description
const description = `Test Transaction ${new Date().toISOString()}`;
```

---

## Authentication Test Data

### Valid Registration Data

| Field | Valid Value | Constraints |
|-------|-------------|-------------|
| Username | `testuser_valid123` | 3-50 characters, alphanumeric + underscore |
| Email | `valid.email@example.com` | Valid email format |
| Password | `SecurePass123!` | Minimum 6 characters |
| Confirm Password | `SecurePass123!` | Must match password |

### Invalid Registration Data

| Scenario | Field | Invalid Value | Expected Error |
|----------|-------|---------------|----------------|
| Short username | Username | `ab` | "Username must be at least 3 characters" |
| Invalid email | Email | `not-an-email` | "Please enter a valid email" |
| Short password | Password | `12345` | "Password must be at least 6 characters" |
| Password mismatch | Confirm | `DifferentPass` | "Passwords do not match" |
| Empty username | Username | `` | "Username is required" |
| Empty email | Email | `` | "Email is required" |
| Empty password | Password | `` | "Password is required" |

### Login Test Data

| Scenario | Email | Password | Expected Result |
|----------|-------|----------|-----------------|
| Valid login | `testuser@example.com` | `ValidPass123!` | Redirect to dashboard |
| Invalid email | `wrong@example.com` | `ValidPass123!` | "Invalid email or password" |
| Invalid password | `testuser@example.com` | `WrongPass` | "Invalid email or password" |
| Unverified email | `unverified@example.com` | `ValidPass123!` | Prompt to verify email |

---

## Transaction Test Data

### Valid Transaction Data

| Field | Income Example | Expense Example | Constraints |
|-------|----------------|-----------------|-------------|
| Type | `income` | `expense` | Required |
| Amount | `5000.00` | `250.50` | Positive decimal, 2 places max |
| Category | `Salary` | `Food & Dining` | Must exist in categories |
| Date | `2024-12-22` | `2024-12-21` | YYYY-MM-DD format |
| Description | `Monthly salary` | `Grocery shopping` | Optional, max 255 chars |
| Notes | `December paycheck` | `Weekly groceries` | Optional, max 500 chars |

### Transaction Amounts for Testing

| Test Case | Amount | Purpose |
|-----------|--------|---------|
| Minimum | `0.01` | Boundary - minimum valid |
| Standard | `100.00` | Normal case |
| Large | `999999.99` | Boundary - large amount |
| Decimal | `123.45` | Decimal handling |
| Zero | `0.00` | Invalid - should fail |
| Negative | `-50.00` | Invalid - should fail |

---

## Budget Test Data

### Valid Budget Data

| Field | Example Value | Constraints |
|-------|---------------|-------------|
| Name | `Monthly Food Budget` | Required, max 100 chars |
| Amount | `500.00` | Positive decimal |
| Category | `Food & Dining` | Must exist in categories |
| Start Date | `2024-12-01` | YYYY-MM-DD format |
| End Date | `2024-12-31` | Must be after start date |
| Period | `monthly` | daily/weekly/monthly/yearly |

### Budget Test Scenarios

| Scenario | Name | Amount | Expected |
|----------|------|--------|----------|
| Valid budget | `Test Budget` | `1000.00` | Created successfully |
| Zero amount | `Zero Budget` | `0.00` | Validation error |
| Past dates | `Old Budget` | `500.00` | May warn or allow |
| Overlapping | `Overlap Budget` | `300.00` | Depends on business rules |

---

## Savings Goal Test Data

### Valid Savings Data

| Field | Example Value | Constraints |
|-------|---------------|-------------|
| Name | `Emergency Fund` | Required, max 100 chars |
| Target Amount | `10000.00` | Positive decimal |
| Current Amount | `2500.00` | 0 to target amount |
| Target Date | `2025-12-31` | Future date |
| Description | `6-month expenses` | Optional |
| Icon | `piggy-bank` | From icon set |
| Color | `#4CAF50` | Hex color code |

### Savings Contribution Data

| Contribution Type | Amount | Expected Result |
|-------------------|--------|-----------------|
| Normal | `500.00` | Added to current |
| Exceeds target | `999999.00` | May cap at target |
| Zero | `0.00` | Validation error |
| Negative | `-100.00` | Validation error (withdrawal?) |

---

## Category Test Data

### Default Categories (Pre-existing)

| Category Name | Type | Icon |
|---------------|------|------|
| Salary | Income | `briefcase` |
| Freelance | Income | `laptop` |
| Investment | Income | `trending-up` |
| Food & Dining | Expense | `utensils` |
| Transportation | Expense | `car` |
| Shopping | Expense | `shopping-bag` |
| Utilities | Expense | `home` |
| Entertainment | Expense | `film` |
| Healthcare | Expense | `heart` |

### Custom Category Data

| Field | Example Value | Constraints |
|-------|---------------|-------------|
| Name | `Pet Expenses` | Required, unique, max 50 chars |
| Type | `expense` | `income` or `expense` |
| Icon | `paw` | From available icons |
| Color | `#FF5722` | Hex color code |

---

## Report Test Data

### Date Range Filters

| Filter Name | Start Date | End Date |
|-------------|------------|----------|
| This Month | First of current month | Today |
| Last Month | First of last month | Last of last month |
| Last 7 Days | 7 days ago | Today |
| Last 30 Days | 30 days ago | Today |
| This Year | Jan 1 of current year | Today |
| Custom | User selected | User selected |

### Expected Report Data

For a test user with known transactions:

```yaml
Test Period: December 2024
Total Income: $5,000.00
Total Expenses: $2,150.00
Net Balance: $2,850.00
Top Category: Food & Dining ($650.00)
Transaction Count: 15
```

---

## Settings Test Data

### Account Update Data

| Field | Current | Updated | Constraints |
|-------|---------|---------|-------------|
| Username | `oldusername` | `newusername` | 3-50 chars, unique |
| Email | `old@example.com` | `new@example.com` | Valid format, unique |

### Password Change Data

| Field | Value | Constraints |
|-------|-------|-------------|
| Current Password | `OldPass123!` | Must match current |
| New Password | `NewPass456!` | Min 6 chars, different from current |
| Confirm New | `NewPass456!` | Must match new password |

### Notification Preferences

| Preference | Default | Test Value |
|------------|---------|------------|
| Email Notifications | `true` | `false` |
| Budget Alerts | `true` | `false` |
| Savings Reminders | `true` | `false` |
| Weekly Summary | `false` | `true` |

---

## API Response Data

### Success Response Format

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Resource data
  }
}
```

### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "data": {
    "field": "Specific field error"
  }
}
```

---

## Test Data Cleanup

### After Each Test Run

1. Delete test transactions created during tests
2. Reset test user budgets to initial state
3. Clear test savings goals
4. Remove custom test categories
5. Reset notification preferences

### Data Isolation

- Use unique identifiers (timestamps) to prevent collisions
- Each test should be independent
- Clean up after test completion
- Avoid modifying shared test accounts

---

## Environment-Specific Data

### Production Test Data

```yaml
Base URL: https://i-budget.site
Test Accounts: Use designated test accounts only
Data: Read-only testing preferred
Cleanup: Manual cleanup after test sessions
```

### Local Development Data

```yaml
Base URL: http://localhost:4200
Test Accounts: Can create/delete freely
Data: Fresh database for each run
Cleanup: Automated via test teardown
```

---

## Quick Reference

### Timestamps

```javascript
// Current timestamp
Date.now() // 1703280000000

// ISO Date string
new Date().toISOString() // "2024-12-22T12:00:00.000Z"

// Date only
new Date().toISOString().split('T')[0] // "2024-12-22"
```

### Random Data Helpers

```javascript
// Random amount (0.01 - 9999.99)
const amount = (Math.random() * 9999 + 0.01).toFixed(2);

// Random string
const randomStr = Math.random().toString(36).substring(7);
```

---

**Maintained by**: Appvengers Team  
**Version**: 1.0.0
