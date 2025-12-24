# iBudget Backend API Specification

**Version:** 3.3
**Last Updated:** December 24, 2025
**Server URL:** `https://i-budget.site` (Production) / `http://localhost:8080` (Local)

---

## 1. Authentication (`/api/auth`)

### 1.1 User Signup
**Endpoint:** `POST /api/auth/signup`
**Description:** Registers a new user account.

**Request Parameters:**
| Parameter | Type | In | Description |
|---|---|---|---|
| `username` | string | Body | Unique username (3-50 chars). |
| `email` | string | Body | Valid email address. |
| `password` | string | Body | User password (min 6 chars). |
| `confirmPassword` | string | Body | Must match the password field. |

**Success Response:**
- **Status Code:** 201 Created
- **Response Type:** JSON
- **Response Data:** Success message and User ID
- **Sample Response:**
```json
{
  "message": "User registered successfully",
  "userId": 101
}
```

**Fail Response:**
- **Status Code:** 400 Bad Request
- **Response Type:** JSON
- **Response Data:** Error message (Validation errors or Email already exists)
- **Sample Response:**
```json
{
  "error": "Email is already in use"
}
```

### 1.2 User Login
**Endpoint:** `POST /api/auth/login`
**Description:** Authenticates a user and returns a JWT token.

**Request Parameters:**
| Parameter | Type | In | Description |
|---|---|---|---|
| `email` | string | Body | Registered email address. |
| `password` | string | Body | User's password. |

**Success Response:**
- **Status Code:** 200 OK
- **Response Type:** JSON
- **Response Data:** JWT Token, User Details
- **Sample Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR...",
  "user": {
    "id": 101,
    "username": "budgetHero",
    "email": "hero@example.com"
  }
}
```

**Fail Response:**
- **Status Code:** 401 Unauthorized
- **Response Type:** JSON
- **Response Data:** Error message
- **Sample Response:**
```json
{
  "error": "Invalid email or password"
}
```

### 1.3 Check Username
**Endpoint:** `GET /api/auth/check-username/{username}`
**Description:** Checks if a username is already taken.

**Request Parameters:**
| Parameter | Type | In | Description |
|---|---|---|---|
| `username` | string | Path | The username to check. |

**Success Response:**
- **Status Code:** 200 OK
- **Response Type:** JSON
- **Response Data:** Availability status
- **Sample Response:**
```json
{
  "available": true,
  "username": "budgetHero"
}
```

**Fail Response:**
- **Status Code:** 400 Bad Request
- **Response Type:** JSON
- **Response Data:** Error message (e.g., Invalid format)
- **Sample Response:**
```json
{
  "error": "Username must be between 3 and 50 characters"
}
```

### 1.4 Check Email
**Endpoint:** `GET /api/auth/check-email/{email}`
**Description:** Checks if an email is already registered.

**Request Parameters:**
| Parameter | Type | In | Description |
|---|---|---|---|
| `email` | string | Path | The email to check. |

**Success Response:**
- **Status Code:** 200 OK
- **Response Type:** JSON
- **Response Data:** Availability status
- **Sample Response:**
```json
{
  "available": false,
  "email": "hero@example.com"
}
```

**Fail Response:**
- **Status Code:** 400 Bad Request
- **Response Type:** JSON
- **Response Data:** Error message
- **Sample Response:**
```json
{
  "error": "Invalid email format"
}
```

### 1.5 Verify Email
**Endpoint:** `GET /api/auth/verify-email`
**Description:** Verifies user's email using a token.

**Request Parameters:**
| Parameter | Type | In | Description |
|---|---|---|---|
| `token` | string | Query | The verification token. |

**Success Response:**
- **Status Code:** 200 OK
- **Response Type:** JSON
- **Response Data:** Success message
- **Sample Response:**
```json
{
  "message": "Email verified successfully"
}
```

**Fail Response:**
- **Status Code:** 400 Bad Request
- **Response Type:** JSON
- **Response Data:** Error message
- **Sample Response:**
```json
{
  "error": "Invalid or expired verification token"
}
```

### 1.6 Forgot Password
**Endpoint:** `POST /api/auth/forgot-password`
**Description:** Initiates password recovery process.

**Request Parameters:**
| Parameter | Type | In | Description |
|---|---|---|---|
| `email` | string | Body | User's registered email. |

**Success Response:**
- **Status Code:** 200 OK
- **Response Type:** JSON
- **Response Data:** Success message
- **Sample Response:**
```json
{
  "message": "If that email exists, a reset link has been sent."
}
```

**Fail Response:**
- **Status Code:** 400 Bad Request (Optional security choice) or 200 (to prevent enumeration)
- **Response Type:** JSON
- **Response Data:** Error message
- **Sample Response:**
```json
{
  "error": "Invalid email address provided"
}
```

### 1.7 Validate Reset Token
**Endpoint:** `GET /api/auth/validate-reset-token`
**Description:** Checks if a reset token is valid.

**Request Parameters:**
| Parameter | Type | In | Description |
|---|---|---|---|
| `token` | string | Query | The reset token. |

**Success Response:**
- **Status Code:** 200 OK
- **Response Type:** JSON
- **Response Data:** Validation status
- **Sample Response:**
```json
{
  "valid": true
}
```

**Fail Response:**
- **Status Code:** 400 Bad Request
- **Response Type:** JSON
- **Response Data:** Error message
- **Sample Response:**
```json
{
  "valid": false,
  "error": "Token expired"
}
```

### 1.8 Reset Password
**Endpoint:** `POST /api/auth/reset-password`
**Description:** Resets the password using a valid token.

**Request Parameters:**
| Parameter | Type | In | Description |
|---|---|---|---|
| `token` | string | Body | Valid reset token. |
| `newPassword` | string | Body | New password. |
| `confirmPassword` | string | Body | Confirmation of new password. |

**Success Response:**
- **Status Code:** 200 OK
- **Response Type:** JSON
- **Response Data:** Success message
- **Sample Response:**
```json
{
  "message": "Password has been reset successfully"
}
```

**Fail Response:**
- **Status Code:** 400 Bad Request
- **Response Type:** JSON
- **Response Data:** Error message
- **Sample Response:**
```json
{
  "error": "Passwords do not match"
}
```

### 1.9 Change Password
**Endpoint:** `POST /api/auth/change-password`
**Description:** Changes password for logged-in user.

**Request Parameters:**
| Parameter | Type | In | Description |
|---|---|---|---|
| `currentPassword` | string | Body | Old password. |
| `newPassword` | string | Body | New password. |
| `confirmPassword` | string | Body | Confirmation. |
| `Authorization` | string | Header | Bearer <JWT Token> |

**Success Response:**
- **Status Code:** 200 OK
- **Response Type:** JSON
- **Response Data:** Success message
- **Sample Response:**
```json
{
  "message": "Password changed successfully"
}
```

**Fail Response:**
- **Status Code:** 401 Unauthorized or 400 Bad Request
- **Response Type:** JSON
- **Response Data:** Error message
- **Sample Response:**
```json
{
  "error": "Current password is incorrect"
}
```

---

## 2. User Profile (`/api/user`)

### 2.1 Get Profile
**Endpoint:** `GET /api/user/profile`
**Description:** Fetches current user profile.

**Request Parameters:**
| Parameter | Type | In | Description |
|---|---|---|---|
| `Authorization` | string | Header | Bearer <JWT Token> |

**Success Response:**
- **Status Code:** 200 OK
- **Response Type:** JSON
- **Response Data:** User Object
- **Sample Response:**
```json
{
  "id": 101,
  "username": "budgetHero",
  "email": "hero@example.com",
  "joinDate": "2025-01-15"
}
```

**Fail Response:**
- **Status Code:** 401 Unauthorized
- **Response Type:** JSON
- **Response Data:** Error message
- **Sample Response:**
```json
{
  "error": "Token invalid or expired"
}
```

### 2.2 Update Account
**Endpoint:** `PUT /api/user/update`
**Description:** Updates user account info.

**Request Parameters:**
| Parameter | Type | In | Description |
|---|---|---|---|
| `username` | string | Body | New username. |
| `email` | string | Body | New email. |
| `password` | string | Body | Current password for confirmation. |

**Success Response:**
- **Status Code:** 200 OK
- **Response Type:** JSON
- **Response Data:** Updated User Object
- **Sample Response:**
```json
{
  "id": 101,
  "username": "newHeroName",
  "email": "newemail@example.com"
}
```

**Fail Response:**
- **Status Code:** 401 Unauthorized
- **Response Type:** JSON
- **Response Data:** Error message
- **Sample Response:**
```json
{
  "error": "Incorrect password provided"
}
```

### 2.3 Deactivate Account
**Endpoint:** `POST /api/user/deactivate`
**Description:** Deactivates account (reversible).

**Request Parameters:**
| Parameter | Type | In | Description |
|---|---|---|---|
| `password` | string | Body | Password confirmation. |

**Success Response:**
- **Status Code:** 200 OK
- **Response Type:** JSON
- **Response Data:** Success message
- **Sample Response:**
```json
{
  "message": "Account deactivated successfully"
}
```

**Fail Response:**
- **Status Code:** 401 Unauthorized
- **Response Type:** JSON
- **Response Data:** Error message
- **Sample Response:**
```json
{
  "error": "Incorrect password"
}
```

### 2.4 Delete Account
**Endpoint:** `POST /api/user/delete`
**Description:** Soft deletes the account.

**Request Parameters:**
| Parameter | Type | In | Description |
|---|---|---|---|
| `password` | string | Body | Password confirmation. |

**Success Response:**
- **Status Code:** 200 OK
- **Response Type:** JSON
- **Response Data:** Success message
- **Sample Response:**
```json
{
  "message": "Account deleted successfully"
}
```

**Fail Response:**
- **Status Code:** 401 Unauthorized
- **Response Type:** JSON
- **Response Data:** Error message
- **Sample Response:**
```json
{
  "error": "Incorrect password"
}
```

---

## 3. Transactions (`/api/transactions`)

### 3.1 List Transactions
**Endpoint:** `GET /api/transactions`
**Description:** Retrieves all user transactions.

**Request Parameters:**
| Parameter | Type | In | Description |
|---|---|---|---|
| `Authorization` | string | Header | Bearer <JWT Token> |

**Success Response:**
- **Status Code:** 200 OK
- **Response Type:** JSON
- **Response Data:** List of transactions
- **Sample Response:**
```json
[
  {
    "id": 1,
    "amount": 50.00,
    "categoryId": 2,
    "description": "Groceries",
    "date": "2025-05-20"
  }
]
```

**Fail Response:**
- **Status Code:** 401 Unauthorized
- **Response Type:** JSON
- **Response Data:** Error message
- **Sample Response:**
```json
{
  "error": "Unauthorized"
}
```

### 3.2 List With Categories
**Endpoint:** `GET /api/transactions/with-category`
**Description:** List transactions enriched with category data.

**Success Response:**
- **Status Code:** 200 OK
- **Response Type:** JSON
- **Response Data:** List of transactions with category details
- **Sample Response:**
```json
[
  {
    "id": 1,
    "amount": 50.00,
    "category": { "id": 2, "name": "Food", "type": "EXPENSE" },
    "description": "Groceries",
    "date": "2025-05-20"
  }
]
```

**Fail Response:**
- **Status Code:** 401 Unauthorized
- **Response Type:** JSON
- **Response Data:** Error message
- **Sample Response:**
```json
{
  "error": "Unauthorized"
}
```

### 3.3 Create Transaction
**Endpoint:** `POST /api/transactions`
**Description:** Adds a new income or expense.

**Request Parameters:**
| Parameter | Type | In | Description |
|---|---|---|---|
| `amount` | number | Body | The transaction amount. |
| `category_id` | integer | Body | ID of the linked category. |
| `description` | string | Body | Optional description. |
| `transactionDate`| string | Body | YYYY-MM-DD. |

**Success Response:**
- **Status Code:** 201 Created
- **Response Type:** JSON
- **Response Data:** Created transaction object
- **Sample Response:**
```json
{
  "id": 55,
  "amount": 100.00,
  "categoryId": 3,
  "description": "Freelance Work",
  "date": "2025-05-21"
}
```

**Fail Response:**
- **Status Code:** 400 Bad Request
- **Response Type:** JSON
- **Response Data:** Error message
- **Sample Response:**
```json
{
  "error": "Category not found"
}
```

### 3.4 Update Transaction
**Endpoint:** `PUT /api/transactions/{id}`
**Description:** Updates an existing transaction.

**Request Parameters:**
| Parameter | Type | In | Description |
|---|---|---|---|
| `id` | integer | Path | Transaction ID. |
| `amount` | number | Body | Updated amount. |
| `description` | string | Body | Updated description. |

**Success Response:**
- **Status Code:** 200 OK
- **Response Type:** JSON
- **Response Data:** Updated transaction object
- **Sample Response:**
```json
{
  "id": 55,
  "amount": 120.00,
  "description": "Freelance Work Updated"
}
```

**Fail Response:**
- **Status Code:** 404 Not Found
- **Response Type:** JSON
- **Response Data:** Error message
- **Sample Response:**
```json
{
  "error": "Transaction not found"
}
```

### 3.5 Delete Transaction
**Endpoint:** `DELETE /api/transactions/{id}`
**Description:** Deletes a transaction.

**Request Parameters:**
| Parameter | Type | In | Description |
|---|---|---|---|
| `id` | integer | Path | Transaction ID. |

**Success Response:**
- **Status Code:** 200 OK (or 204 No Content)
- **Response Type:** JSON
- **Response Data:** Success message
- **Sample Response:**
```json
{
  "message": "Transaction deleted"
}
```

**Fail Response:**
- **Status Code:** 404 Not Found
- **Response Type:** JSON
- **Response Data:** Error message
- **Sample Response:**
```json
{
  "error": "Transaction not found"
}
```

### 3.6 Expense Summary
**Endpoint:** `GET /api/transactions/summary/expense`
**Description:** Total expenses for current period.

**Success Response:**
- **Status Code:** 200 OK
- **Response Type:** JSON
- **Response Data:** Total expense amount
- **Sample Response:**
```json
{
  "totalExpense": 1500.50
}
```

**Fail Response:**
- **Status Code:** 401 Unauthorized
- **Response Type:** JSON
- **Response Data:** Error message
- **Sample Response:**
```json
{
  "error": "Unauthorized"
}
```

### 3.7 Income Summary
**Endpoint:** `GET /api/transactions/summary/income`
**Description:** Total income for current period.

**Success Response:**
- **Status Code:** 200 OK
- **Response Type:** JSON
- **Response Data:** Total income amount
- **Sample Response:**
```json
{
  "totalIncome": 3000.00
}
```

**Fail Response:**
- **Status Code:** 401 Unauthorized
- **Response Type:** JSON
- **Response Data:** Error message
- **Sample Response:**
```json
{
  "error": "Unauthorized"
}
```

### 3.8 Monthly Reports
**Endpoint:** `GET /api/transactions/reports/monthly`
**Description:** Aggregated monthly totals.

**Success Response:**
- **Status Code:** 200 OK
- **Response Type:** JSON
- **Response Data:** List of monthly summaries
- **Sample Response:**
```json
[
  { "month": "2025-01", "income": 3000, "expense": 1200 },
  { "month": "2025-02", "income": 3100, "expense": 1100 }
]
```

**Fail Response:**
- **Status Code:** 401 Unauthorized
- **Response Type:** JSON
- **Response Data:** Error message
- **Sample Response:**
```json
{
  "error": "Unauthorized"
}
```

---

## 4. Budgets (`/api/budgets`)

### 4.1 List Budgets
**Endpoint:** `GET /api/budgets`
**Description:** Lists all active budgets.

**Success Response:**
- **Status Code:** 200 OK
- **Response Type:** JSON
- **Response Data:** List of budgets
- **Sample Response:**
```json
[
  {
    "id": 10,
    "category": "Food",
    "limitAmount": 500,
    "spent": 200,
    "remaining": 300
  }
]
```

**Fail Response:**
- **Status Code:** 401 Unauthorized
- **Response Type:** JSON
- **Response Data:** Error message
- **Sample Response:**
```json
{
  "error": "Unauthorized"
}
```

### 4.2 Get Budget
**Endpoint:** `GET /api/budgets/{id}`
**Description:** Gets a single budget by ID.

**Success Response:**
- **Status Code:** 200 OK
- **Response Type:** JSON
- **Response Data:** Budget object
- **Sample Response:**
```json
{
  "id": 10,
  "categoryId": 2,
  "limitAmount": 500,
  "startDate": "2025-05-01",
  "endDate": "2025-05-31"
}
```

**Fail Response:**
- **Status Code:** 404 Not Found
- **Response Type:** JSON
- **Response Data:** Error message
- **Sample Response:**
```json
{
  "error": "Budget not found"
}
```

### 4.3 Create Budget
**Endpoint:** `POST /api/budgets`
**Description:** Sets a spending limit.

**Request Parameters:**
| Parameter | Type | In | Description |
|---|---|---|---|
| `categoryId` | integer | Body | Category ID to limit. |
| `limitAmount` | number | Body | Spending limit. |
| `startDate` | string | Body | YYYY-MM-DD. |
| `endDate` | string | Body | YYYY-MM-DD. |

**Success Response:**
- **Status Code:** 201 Created
- **Response Type:** JSON
- **Response Data:** Created budget object
- **Sample Response:**
```json
{
  "id": 12,
  "categoryId": 2,
  "limitAmount": 600
}
```

**Fail Response:**
- **Status Code:** 400 Bad Request
- **Response Type:** JSON
- **Response Data:** Error message
- **Sample Response:**
```json
{
  "error": "Budget for this category already exists"
}
```

### 4.4 Update Budget
**Endpoint:** `PUT /api/budgets/{id}`
**Description:** Updates budget limits or dates.

**Request Parameters:**
| Parameter | Type | In | Description |
|---|---|---|---|
| `id` | integer | Path | Budget ID. |
| `limitAmount` | number | Body | New limit. |

**Success Response:**
- **Status Code:** 200 OK
- **Response Type:** JSON
- **Response Data:** Updated budget object
- **Sample Response:**
```json
{
  "id": 12,
  "limitAmount": 750
}
```

**Fail Response:**
- **Status Code:** 404 Not Found
- **Response Type:** JSON
- **Response Data:** Error message
- **Sample Response:**
```json
{
  "error": "Budget not found"
}
```

### 4.5 Delete Budget
**Endpoint:** `DELETE /api/budgets/{id}`
**Description:** Soft deletes a budget.

**Success Response:**
- **Status Code:** 200 OK
- **Response Type:** JSON
- **Response Data:** Success message
- **Sample Response:**
```json
{
  "message": "Budget deleted"
}
```

**Fail Response:**
- **Status Code:** 404 Not Found
- **Response Type:** JSON
- **Response Data:** Error message
- **Sample Response:**
```json
{
  "error": "Budget not found"
}
```

### 4.6 Get Budget Transactions
**Endpoint:** `GET /api/transactions/budget-transactions/budget/{budgetId}`
**Description:** Lists expenses linked to a budget.

**Success Response:**
- **Status Code:** 200 OK
- **Response Type:** JSON
- **Response Data:** List of transactions for the budget
- **Sample Response:**
```json
[
  { "id": 1, "amount": 50, "description": "Grocery", "date": "2025-05-10" },
  { "id": 5, "amount": 20, "description": "Snacks", "date": "2025-05-12" }
]
```

**Fail Response:**
- **Status Code:** 404 Not Found
- **Response Type:** JSON
- **Response Data:** Error message
- **Sample Response:**
```json
{
  "error": "Budget not found"
}
```

---

## 5. Savings (`/api/savings`)

### 5.1 List Savings
**Endpoint:** `GET /api/savings`
**Description:** Lists active savings goals.

**Success Response:**
- **Status Code:** 200 OK
- **Response Type:** JSON
- **Response Data:** List of saving goals
- **Sample Response:**
```json
[
  {
    "id": 1,
    "name": "New Car",
    "currentAmount": 2000,
    "targetAmount": 15000,
    "goalDate": "2026-01-01"
  }
]
```

**Fail Response:**
- **Status Code:** 401 Unauthorized
- **Response Type:** JSON
- **Response Data:** Error message
- **Sample Response:**
```json
{
  "error": "Unauthorized"
}
```

### 5.2 Get Saving
**Endpoint:** `GET /api/savings/{id}`
**Description:** Gets details of a specific saving goal.

**Success Response:**
- **Status Code:** 200 OK
- **Response Type:** JSON
- **Response Data:** Saving goal object
- **Sample Response:**
```json
{
  "id": 1,
  "name": "New Car",
  "currentAmount": 2000,
  "targetAmount": 15000
}
```

**Fail Response:**
- **Status Code:** 404 Not Found
- **Response Type:** JSON
- **Response Data:** Error message
- **Sample Response:**
```json
{
  "error": "Savings goal not found"
}
```

### 5.3 Create Saving
**Endpoint:** `POST /api/savings`
**Description:** Creates a new savings goal.

**Request Parameters:**
| Parameter | Type | In | Description |
|---|---|---|---|
| `name` | string | Body | Goal name. |
| `targetAmount` | number | Body | Target amount. |
| `goalDate` | string | Body | YYYY-MM-DD. |

**Success Response:**
- **Status Code:** 201 Created
- **Response Type:** JSON
- **Response Data:** Created saving goal object
- **Sample Response:**
```json
{
  "id": 2,
  "name": "Vacation",
  "currentAmount": 0,
  "targetAmount": 5000
}
```

**Fail Response:**
- **Status Code:** 400 Bad Request
- **Response Type:** JSON
- **Response Data:** Error message
- **Sample Response:**
```json
{
  "error": "Invalid target amount"
}
```

### 5.4 Update Saving
**Endpoint:** `PUT /api/savings/{id}`
**Description:** Updates goal details.

**Success Response:**
- **Status Code:** 200 OK
- **Response Type:** JSON
- **Response Data:** Updated saving goal object
- **Sample Response:**
```json
{
  "id": 2,
  "targetAmount": 6000
}
```

**Fail Response:**
- **Status Code:** 404 Not Found
- **Response Type:** JSON
- **Response Data:** Error message
- **Sample Response:**
```json
{
  "error": "Savings goal not found"
}
```

### 5.5 Delete Saving
**Endpoint:** `DELETE /api/savings/{id}`
**Description:** Soft deletes a savings goal.

**Success Response:**
- **Status Code:** 200 OK
- **Response Type:** JSON
- **Response Data:** Success message
- **Sample Response:**
```json
{
  "message": "Savings goal deleted"
}
```

**Fail Response:**
- **Status Code:** 404 Not Found
- **Response Type:** JSON
- **Response Data:** Error message
- **Sample Response:**
```json
{
  "error": "Savings goal not found"
}
```

### 5.6 Add Saving Transaction
**Endpoint:** `POST /api/savings/{savingId}/transactions`
**Description:** Adds deposit/withdrawal to a goal.

**Request Parameters:**
| Parameter | Type | In | Description |
|---|---|---|---|
| `savingId` | integer | Path | ID of the savings goal. |
| `amount` | number | Body | Amount to add/remove. |
| `savingsAction` | string | Body | "DEPOSIT" or "WITHDRAW". |

**Success Response:**
- **Status Code:** 201 Created
- **Response Type:** JSON
- **Response Data:** Transaction record and updated balance
- **Sample Response:**
```json
{
  "id": 101,
  "amount": 500,
  "action": "DEPOSIT",
  "newBalance": 2500
}
```

**Fail Response:**
- **Status Code:** 400 Bad Request
- **Response Type:** JSON
- **Response Data:** Error message (e.g., Insufficient funds for withdrawal)
- **Sample Response:**
```json
{
  "error": "Insufficient funds in savings"
}
```

### 5.7 Get Saving Transactions
**Endpoint:** `GET /api/savings/{savingId}/transactions`
**Description:** History of deposits/withdrawals for a goal.

**Success Response:**
- **Status Code:** 200 OK
- **Response Type:** JSON
- **Response Data:** List of saving transactions
- **Sample Response:**
```json
[
  { "id": 100, "amount": 1000, "action": "DEPOSIT", "date": "2025-01-01" },
  { "id": 101, "amount": 500, "action": "DEPOSIT", "date": "2025-02-01" }
]
```

**Fail Response:**
- **Status Code:** 404 Not Found
- **Response Type:** JSON
- **Response Data:** Error message
- **Sample Response:**
```json
{
  "error": "Savings goal not found"
}
```

---

## 6. Categories (`/api/categories`)

### 6.1 List Categories
**Endpoint:** `GET /api/categories`
**Description:** Lists all categories with usage counts.

**Success Response:**
- **Status Code:** 200 OK
- **Response Type:** JSON
- **Response Data:** List of categories
- **Sample Response:**
```json
[
  { "id": 1, "name": "Salary", "type": "INCOME" },
  { "id": 2, "name": "Food", "type": "EXPENSE" }
]
```

**Fail Response:**
- **Status Code:** 401 Unauthorized
- **Response Type:** JSON
- **Response Data:** Error message
- **Sample Response:**
```json
{
  "error": "Unauthorized"
}
```

### 6.2 Create Category
**Endpoint:** `POST /api/categories`
**Description:** Creates a custom category.

**Request Parameters:**
| Parameter | Type | In | Description |
|---|---|---|---|
| `name` | string | Body | Category Name. |
| `type` | string | Body | "INCOME" or "EXPENSE". |

**Success Response:**
- **Status Code:** 201 Created
- **Response Type:** JSON
- **Response Data:** Created category object
- **Sample Response:**
```json
{
  "id": 15,
  "name": "Online Subscriptions",
  "type": "EXPENSE"
}
```

**Fail Response:**
- **Status Code:** 400 Bad Request
- **Response Type:** JSON
- **Response Data:** Error message
- **Sample Response:**
```json
{
  "error": "Category already exists"
}
```

### 6.3 Delete Category
**Endpoint:** `DELETE /api/categories/{id}`
**Description:** Deletes a custom category.

**Success Response:**
- **Status Code:** 200 OK
- **Response Type:** JSON
- **Response Data:** Success message
- **Sample Response:**
```json
{
  "message": "Category deleted"
}
```

**Fail Response:**
- **Status Code:** 404 Not Found
- **Response Type:** JSON
- **Response Data:** Error message
- **Sample Response:**
```json
{
  "error": "Category not found or cannot be deleted (system category)"
}
```

---

## 7. Notifications (`/api/notifications`)

### 7.1 List Notifications
**Endpoint:** `GET /api/notifications`
**Description:** Lists all notifications.

**Success Response:**
- **Status Code:** 200 OK
- **Response Type:** JSON
- **Response Data:** List of notifications
- **Sample Response:**
```json
[
  { "id": 1, "message": "Budget limit exceeded for Food", "read": false, "date": "2025-05-20" }
]
```

**Fail Response:**
- **Status Code:** 401 Unauthorized
- **Response Type:** JSON
- **Response Data:** Error message
- **Sample Response:**
```json
{
  "error": "Unauthorized"
}
```

### 7.2 Get Unread Count
**Endpoint:** `GET /api/notifications/unread-count`
**Description:** Number of unread alerts.

**Success Response:**
- **Status Code:** 200 OK
- **Response Type:** JSON
- **Response Data:** Count object
- **Sample Response:**
```json
{
  "unreadCount": 3
}
```

**Fail Response:**
- **Status Code:** 401 Unauthorized
- **Response Type:** JSON
- **Response Data:** Error message
- **Sample Response:**
```json
{
  "error": "Unauthorized"
}
```

### 7.3 Mark Read
**Endpoint:** `PUT /api/notifications/{id}/read`
**Description:** Marks a specific notification as read.

**Success Response:**
- **Status Code:** 200 OK
- **Response Type:** JSON
- **Response Data:** Updated notification
- **Sample Response:**
```json
{
  "id": 1,
  "read": true
}
```

**Fail Response:**
- **Status Code:** 404 Not Found
- **Response Type:** JSON
- **Response Data:** Error message
- **Sample Response:**
```json
{
  "error": "Notification not found"
}
```

### 7.4 Mark All Read
**Endpoint:** `PUT /api/notifications/mark-all-read`
**Description:** Marks all notifications as read.

**Success Response:**
- **Status Code:** 200 OK
- **Response Type:** JSON
- **Response Data:** Success message/count
- **Sample Response:**
```json
{
  "message": "All notifications marked as read"
}
```

**Fail Response:**
- **Status Code:** 401 Unauthorized
- **Response Type:** JSON
- **Response Data:** Error message
- **Sample Response:**
```json
{
  "error": "Unauthorized"
}
```

### 7.5 Delete Notification
**Endpoint:** `DELETE /api/notifications/{id}`
**Description:** Removes a notification.

**Success Response:**
- **Status Code:** 200 OK
- **Response Type:** JSON
- **Response Data:** Success message
- **Sample Response:**
```json
{
  "message": "Notification deleted"
}
```

**Fail Response:**
- **Status Code:** 404 Not Found
- **Response Type:** JSON
- **Response Data:** Error message
- **Sample Response:**
```json
{
  "error": "Notification not found"
}
```

---

## 8. AI Chatbot (`/api/chatbot`)

### 8.1 Send Message
**Endpoint:** `POST /api/chatbot/message`
**Description:** Interaction with Bonzi Buddy.

**Request Parameters:**
| Parameter | Type | In | Description |
|---|---|---|---|
| `message` | string | Body | User input text. |
| `sessionId` | string | Body | UUID for context. |

**Success Response:**
- **Status Code:** 200 OK
- **Response Type:** JSON
- **Response Data:** Bot response message
- **Sample Response:**
```json
{
  "response": "Based on your spending, I recommend reducing dining out expenses.",
  "sessionId": "abc-123-uuid"
}
```

**Fail Response:**
- **Status Code:** 500 Internal Server Error (or 400)
- **Response Type:** JSON
- **Response Data:** Error message
- **Sample Response:**
```json
{
  "error": "Unable to process request at this time"
}
```