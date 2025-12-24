# iBudget Backend API Documentation

This document provides a comprehensive list of all REST API endpoints available in the iBudget backend system.

## 1. Authentication (`/api/auth`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/signup` | Register a new user account. |
| POST | `/login` | Authenticate user and receive a JWT token. (Rate limited) |
| GET | `/check-username/{username}` | Check if a username is already taken. |
| GET | `/check-email/{email}` | Check if an email is already registered. |
| GET | `/verify-email` | Verify user email using a token. |
| POST | `/forgot-password` | Request a password reset email. |
| GET | `/validate-reset-token` | Validate a password reset token. |
| POST | `/reset-password` | Reset password using a valid token. |
| POST | `/change-password` | Change password for authenticated user. |
| POST | `/resend-verification` | Resend verification email. |

## 2. User Profile (`/api/user`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/profile` | Fetch the authenticated user's profile details. |
| POST | `/deactivate` | Deactivate the user's account. |
| POST | `/delete` | Soft delete the user's account. |
| PUT | `/update` | Update user account information. |

## 3. Transactions (`/api/transactions`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/` | List all transactions for the authenticated user. |
| GET | `/with-category` | List transactions including category details. |
| POST | `/` | Create a new transaction (Income/Expense). |
| PUT | `/{id}` | Update an existing transaction. |
| DELETE | `/{id}` | Delete a transaction. |
| GET | `/summary/expense` | Get a summary of all expenses. |
| GET | `/summary/income` | Get a summary of all income. |
| GET | `/reports/monthly` | Fetch monthly financial reports. |

## 4. Budgets (`/api/budgets`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/budgets` | Get all active budgets for the current user. |
| POST | `/budgets` | Create a new budget limit for a category. |
| GET | `/budgets/{id}` | Get specific budget details. |
| PUT | `/budgets/{id}` | Update budget limits or dates. |
| DELETE | `/budgets/{id}` | Soft delete a budget. |
| GET | `/transactions/budget/{budgetId}` | Get all expenses associated with a budget. |
| GET | `/transactions/budgets/{budgetId}/summary` | Get a summary of spending vs budget limit. |

## 5. Savings (`/api/savings`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/savings` | List all active savings goals. |
| POST | `/savings` | Create a new savings goal. |
| GET | `/savings/{id}` | Get details of a specific savings goal. |
| PUT | `/savings/{id}` | Update a savings goal. |
| DELETE | `/savings/{id}` | Soft delete a savings goal. |
| GET | `/savings/transactions` | List all savings-related transactions. |
| POST | `/savings/{savingId}/transactions` | Add a transaction (Deposit/Withdraw) to a saving goal. |
| GET | `/savings/{savingId}/refresh-current-amount` | Recalculate the current total for a saving goal. |

## 6. Categories (`/api/categories`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/categories` | List all categories with usage counts. |
| POST | `/categories` | Create a custom category. |
| DELETE | `/{id}` | Delete a custom category. |

## 7. AI Chatbot (`/api/chatbot`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/message` | Send a message to Bonzi Buddy AI assistant. |

## 8. Notifications (`/api/notifications`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/` | Fetch all notifications. |
| GET | `/unread-count` | Get count of unread notifications. |
| PUT | `/{id}/read` | Mark a notification as read. |
| PUT | `/mark-all-read` | Mark all notifications as read. |
| DELETE | `/{id}` | Delete a notification. |
| POST | `/generate` | Manually trigger notification generation (Dev only). |

---

**Note:** All endpoints (except public Auth ones) require a valid JWT Bearer token in the `Authorization` header.
