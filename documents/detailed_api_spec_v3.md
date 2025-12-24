# iBudget Backend API Specification

**Version:** 3.2  
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

### 1.2 User Login
**Endpoint:** `POST /api/auth/login`  
**Description:** Authenticates a user and returns a JWT token.

**Request Parameters:**
| Parameter | Type | In | Description |
|---|---|---|---|
| `email` | string | Body | Registered email address. |
| `password` | string | Body | User's password. |

### 1.3 Check Username
**Endpoint:** `GET /api/auth/check-username/{username}`  
**Description:** Checks if a username is already taken.

**Request Parameters:**
| Parameter | Type | In | Description |
|---|---|---|---|
| `username` | string | Path | The username to check. |

### 1.4 Check Email
**Endpoint:** `GET /api/auth/check-email/{email}`  
**Description:** Checks if an email is already registered.

**Request Parameters:**
| Parameter | Type | In | Description |
|---|---|---|---|
| `email` | string | Path | The email to check. |

### 1.5 Verify Email
**Endpoint:** `GET /api/auth/verify-email`  
**Description:** Verifies user's email using a token.

**Request Parameters:**
| Parameter | Type | In | Description |
|---|---|---|---|
| `token` | string | Query | The verification token. |

### 1.6 Forgot Password
**Endpoint:** `POST /api/auth/forgot-password`  
**Description:** Initiates password recovery process.

**Request Parameters:**
| Parameter | Type | In | Description |
|---|---|---|---|
| `email` | string | Body | User's registered email. |

### 1.7 Validate Reset Token
**Endpoint:** `GET /api/auth/validate-reset-token`  
**Description:** Checks if a reset token is valid.

**Request Parameters:**
| Parameter | Type | In | Description |
|---|---|---|---|
| `token` | string | Query | The reset token. |

### 1.8 Reset Password
**Endpoint:** `POST /api/auth/reset-password`  
**Description:** Resets the password using a valid token.

**Request Parameters:**
| Parameter | Type | In | Description |
|---|---|---|---|
| `token` | string | Body | Valid reset token. |
| `newPassword` | string | Body | New password. |
| `confirmPassword` | string | Body | Confirmation of new password. |

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

---

## 2. User Profile (`/api/user`)

### 2.1 Get Profile
**Endpoint:** `GET /api/user/profile`  
**Description:** Fetches current user profile.

**Request Parameters:**
| Parameter | Type | In | Description |
|---|---|---|---|
| `Authorization` | string | Header | Bearer <JWT Token> |

### 2.2 Update Account
**Endpoint:** `PUT /api/user/update`  
**Description:** Updates user account info.

**Request Parameters:**
| Parameter | Type | In | Description |
|---|---|---|---|
| `username` | string | Body | New username. |
| `email` | string | Body | New email. |
| `password` | string | Body | Current password for confirmation. |

### 2.3 Deactivate Account
**Endpoint:** `POST /api/user/deactivate`  
**Description:** Deactivates account (reversible).

**Request Parameters:**
| Parameter | Type | In | Description |
|---|---|---|---|
| `password` | string | Body | Password confirmation. |

### 2.4 Delete Account
**Endpoint:** `POST /api/user/delete`  
**Description:** Soft deletes the account.

**Request Parameters:**
| Parameter | Type | In | Description |
|---|---|---|---|
| `password` | string | Body | Password confirmation. |

---

## 3. Transactions (`/api/transactions`)

### 3.1 List Transactions
**Endpoint:** `GET /api/transactions`  
**Description:** Retrieves all user transactions.

**Request Parameters:**
| Parameter | Type | In | Description |
|---|---|---|---|
| `Authorization` | string | Header | Bearer <JWT Token> |

### 3.2 List With Categories
**Endpoint:** `GET /api/transactions/with-category`  
**Description:** List transactions enriched with category data.

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

### 3.4 Update Transaction
**Endpoint:** `PUT /api/transactions/{id}`  
**Description:** Updates an existing transaction.

**Request Parameters:**
| Parameter | Type | In | Description |
|---|---|---|---|
| `id` | integer | Path | Transaction ID. |
| `amount` | number | Body | Updated amount. |
| `description` | string | Body | Updated description. |

### 3.5 Delete Transaction
**Endpoint:** `DELETE /api/transactions/{id}`  
**Description:** Deletes a transaction.

**Request Parameters:**
| Parameter | Type | In | Description |
|---|---|---|---|
| `id` | integer | Path | Transaction ID. |

### 3.6 Expense Summary
**Endpoint:** `GET /api/transactions/summary/expense`  
**Description:** Total expenses for current period.

### 3.7 Income Summary
**Endpoint:** `GET /api/transactions/summary/income`  
**Description:** Total income for current period.

### 3.8 Monthly Reports
**Endpoint:** `GET /api/transactions/reports/monthly`  
**Description:** Aggregated monthly totals.

---

## 4. Budgets (`/api/budgets`)

### 4.1 List Budgets
**Endpoint:** `GET /api/budgets`  
**Description:** Lists all active budgets.

### 4.2 Get Budget
**Endpoint:** `GET /api/budgets/{id}`  
**Description:** Gets a single budget by ID.

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

### 4.4 Update Budget
**Endpoint:** `PUT /api/budgets/{id}`  
**Description:** Updates budget limits or dates.

**Request Parameters:**
| Parameter | Type | In | Description |
|---|---|---|---|
| `id` | integer | Path | Budget ID. |
| `limitAmount` | number | Body | New limit. |

### 4.5 Delete Budget
**Endpoint:** `DELETE /api/budgets/{id}`  
**Description:** Soft deletes a budget.

### 4.6 Get Budget Transactions
**Endpoint:** `GET /api/transactions/budget-transactions/budget/{budgetId}`  
**Description:** Lists expenses linked to a budget.

---

## 5. Savings (`/api/savings`)

### 5.1 List Savings
**Endpoint:** `GET /api/savings`  
**Description:** Lists active savings goals.

### 5.2 Get Saving
**Endpoint:** `GET /api/savings/{id}`  
**Description:** Gets details of a specific saving goal.

### 5.3 Create Saving
**Endpoint:** `POST /api/savings`  
**Description:** Creates a new savings goal.

**Request Parameters:**
| Parameter | Type | In | Description |
|---|---|---|---|
| `name` | string | Body | Goal name. |
| `targetAmount` | number | Body | Target amount. |
| `goalDate` | string | Body | YYYY-MM-DD. |

### 5.4 Update Saving
**Endpoint:** `PUT /api/savings/{id}`  
**Description:** Updates goal details.

### 5.5 Delete Saving
**Endpoint:** `DELETE /api/savings/{id}`  
**Description:** Soft deletes a savings goal.

### 5.6 Add Saving Transaction
**Endpoint:** `POST /api/savings/{savingId}/transactions`  
**Description:** Adds deposit/withdrawal to a goal.

**Request Parameters:**
| Parameter | Type | In | Description |
|---|---|---|---|
| `savingId` | integer | Path | ID of the savings goal. |
| `amount` | number | Body | Amount to add/remove. |
| `savingsAction` | string | Body | "DEPOSIT" or "WITHDRAW". |

### 5.7 Get Saving Transactions
**Endpoint:** `GET /api/savings/{savingId}/transactions`  
**Description:** History of deposits/withdrawals for a goal.

---

## 6. Categories (`/api/categories`)

### 6.1 List Categories
**Endpoint:** `GET /api/categories`  
**Description:** Lists all categories with usage counts.

### 6.2 Create Category
**Endpoint:** `POST /api/categories`  
**Description:** Creates a custom category.

**Request Parameters:**
| Parameter | Type | In | Description |
|---|---|---|---|
| `name` | string | Body | Category Name. |
| `type` | string | Body | "INCOME" or "EXPENSE". |

### 6.3 Delete Category
**Endpoint:** `DELETE /api/categories/{id}`  
**Description:** Deletes a custom category.

---

## 7. Notifications (`/api/notifications`)

### 7.1 List Notifications
**Endpoint:** `GET /api/notifications`  
**Description:** Lists all notifications.

### 7.2 Get Unread Count
**Endpoint:** `GET /api/notifications/unread-count`  
**Description:** Number of unread alerts.

### 7.3 Mark Read
**Endpoint:** `PUT /api/notifications/{id}/read`  
**Description:** Marks a specific notification as read.

### 7.4 Mark All Read
**Endpoint:** `PUT /api/notifications/mark-all-read`  
**Description:** Marks all notifications as read.

### 7.5 Delete Notification
**Endpoint:** `DELETE /api/notifications/{id}`  
**Description:** Removes a notification.

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
