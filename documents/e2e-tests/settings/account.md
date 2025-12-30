# Account Settings - E2E Test Matrix

> User Account Settings Testing

**Route**: `/settings/account/:id`  
**Protection**: Authenticated users only (authGuard)  
**Production URL**: `https://i-budget.site/settings/account/:id`  
**Last Updated**: December 2025

---

## Overview

The Account Settings page allows users to manage their personal information:
- View and update username
- View and update email
- Password confirmation for changes
- Profile picture display (first letter avatar)
- Success/error feedback messages

### Key Components
- `Account` component with reactive form
- `AuthService.getProfile()` for loading user data
- `UserService.updateAccount()` for saving changes
- Form validation with Angular Reactive Forms

### Form Fields
- Username (required)
- Email (required, email format)
- Password (no longer required - removed in OAuth update)

---

## Test Matrix

| Test ID | Test Name | Description | Preconditions | Steps | Expected Result | Priority | Type | Status | Last Tested | Notes |
|---------|-----------|-------------|---------------|-------|-----------------|----------|------|--------|-------------|-------|
| ACCT-VIEW-001 | View Account Settings | Verify account settings page loads | User logged in | 1. Navigate to `/settings/account/:id` | Page displays with user profile info and form | P0 | Smoke | ✅ Passed | Dec 29, 2025 | Verified manually |
| ACCT-LOAD-001 | Load User Data | Verify user data pre-fills form | User logged in | 1. Navigate to account settings | Username and email fields populated with current values | P0 | E2E | ✅ Passed | Dec 29, 2025 | Verified manually |
| ACCT-AVATAR-001 | Display Avatar Letter | Verify profile avatar shows first letter | User logged in | 1. View account settings | Avatar displays first letter of username in uppercase | P2 | Regression | ✅ Passed | Dec 29, 2025 | Verified manually |
| ACCT-UPD-001 | Update Username | Verify username can be changed | User logged in | 1. Enter new username 2. Click Save | Username updated, success message shown | P0 | E2E | ✅ Passed | Dec 29, 2025 | Password no longer required |
| ACCT-UPD-002 | Update Email | Verify email can be changed | User logged in | 1. Enter new email 2. Click Save | Email updated, success message shown | P0 | E2E | ✅ Passed | Dec 29, 2025 | Password no longer required |
| ACCT-UPD-003 | Update Both Fields | Verify username and email update together | User logged in | 1. Change username 2. Change email 3. Click Save | Both fields updated, success message shown | P1 | E2E | ✅ Passed | Dec 29, 2025 | Password no longer required |
| ACCT-VAL-001 | Username Required | Verify username required validation | User logged in | 1. Clear username field 2. Touch field 3. Try to submit | "Username is required" error, submit disabled | P1 | Negative | ✅ Passed | Dec 29, 2025 | Verified manually |
| ACCT-VAL-002 | Email Required | Verify email required validation | User logged in | 1. Clear email field 2. Touch field 3. Try to submit | "Email is required" error, submit disabled | P1 | Negative | ✅ Passed | Dec 29, 2025 | Verified manually |
| ACCT-VAL-003 | Email Format | Verify email format validation | User logged in | 1. Enter invalid email (e.g., "test") 2. Touch field | "Please enter a valid email" error | P1 | Negative | ✅ Passed | Dec 29, 2025 | Verified manually |
| ACCT-OAUTH-001 | OAuth User No Password Field | Verify OAuth and local users see same simplified form | User logged in | 1. Navigate to account settings | No password field shown for any user | P1 | E2E | ⏳ Pending | - | New: Password field removed for all users |
| ACCT-MSG-001 | Success Message Display | Verify success message appears | User submits valid changes | 1. Update field 2. Save | Green success alert with message | P1 | E2E | ✅ Passed | Dec 29, 2025 | Password no longer required |
| ACCT-MSG-002 | Error Message Display | Verify error message appears | Invalid password provided | 1. Update field 2. Enter wrong password 3. Save | Red error alert with error message | P1 | Negative | ✅ Passed | Dec 29, 2025 | Verified manually |
| ACCT-MSG-003 | Dismiss Messages | Verify messages can be dismissed | Success/error message displayed | 1. Click close button on alert | Message dismissed | P3 | Regression | ✅ Passed | Dec 29, 2025 | Verified manually |
| ACCT-SUBMIT-001 | Submit Loading State | Verify loading state during submit | User saving changes | 1. Click Save button | Button shows "Saving..." with spinner, disabled | P2 | Regression | ✅ Passed | Dec 29, 2025 | Verified manually |
| ACCT-GUARD-001 | Auth Guard Redirect | Verify unauthenticated redirect | User not logged in | 1. Navigate directly to `/settings/account/1` | Redirected to login/auth page | P0 | Smoke | ✅ Passed | Dec 29, 2025 | Implicitly passed |

---

## Page Elements Reference

### Selectors

| Element | Selector | Description |
|---------|----------|-------------|
| Main Container | `.account-settings-panel` | Main settings container |
| Info Section | `.info-container` | Header with title and description |
| Settings Card | `.card` | Form card container |
| Card Header | `.card-header` | "Personal Information" header |
| Profile Container | `.profile-container` | Avatar and username display |
| Profile Image | `.profile-container .image` | Avatar image (placeholder) |
| Username Display | `.profile-container .fw-semibold` | Current username text |
| Success Alert | `.alert.alert-success` | Success message alert |
| Error Alert | `.alert.alert-danger` | Error message alert |
| Alert Close Button | `.btn-close` | Dismiss alert button |
| Account Form | `form.account-form-container` | Main form element |
| Username Label | `label[for="username"]` | Username field label |
| Username Input | `input#username` | Username text input |
| Email Label | `label[for="email"]` | Email field label |
| Email Input | `input#email` | Email text input |
| Password Label | `label[for="password"]` | Password field label |
| Password Input | `input#password` | Password input |
| Password Toggle | `.input-group .btn-outline-secondary` | Eye icon toggle |
| Submit Button | `button[type="submit"]` | Save button |
| Spinner | `.spinner-border` | Loading spinner |
| Validation Error | `.text-danger.small` | Validation error text |

### Component Structure

```
Account Settings Page
├── ToggleableSidebar
├── Header
├── SubHeader (Settings navigation)
└── Main Content
    └── Account Settings Panel
        ├── Info Container
        │   ├── Title (Account)
        │   └── Description
        └── Card
            ├── Card Header (Personal Information)
            └── Card Body
                ├── Profile Container
                │   ├── Avatar Image
                │   └── Username Display
                ├── Success/Error Alerts
                └── Form
                    ├── Username Field
                    ├── Email Field
                    ├── Password Field (with toggle)
                    └── Save Button
```

---

## Test Data Requirements

### User Accounts

| Account Type | Email | Username | Password | Purpose |
|--------------|-------|----------|----------|---------|
| Test User | `account_test@example.com` | `testuser` | `TestPass123!` | Standard testing |
| Update Target | `account_new@example.com` | `newuser` | `TestPass123!` | After update values |

### Form Validation Test Data

| Scenario | Username | Email | Password | Expected Error |
|----------|----------|-------|----------|----------------|
| Empty Username | `` | `valid@email.com` | `TestPass123!` | Username is required |
| Empty Email | `testuser` | `` | `TestPass123!` | Email is required |
| Invalid Email | `testuser` | `notanemail` | `TestPass123!` | Please enter a valid email |
| Empty Password | `testuser` | `valid@email.com` | `` | Password is required |
| Wrong Password | `testuser` | `valid@email.com` | `WrongPass!` | API error message |

### Update Scenarios

| Original Username | Original Email | New Username | New Email |
|-------------------|----------------|--------------|-----------|
| `testuser` | `test@example.com` | `updateduser` | `updated@example.com` |

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/profile` | GET | Fetch current user profile |
| `/api/users/update-account` | PUT | Update account details |

### Request Payload (Update)

```json
{
  "username": "newusername",
  "email": "newemail@example.com"
}
```

> **Note**: Password is no longer required for account updates. Users are authenticated via JWT.

### Response Format

```json
{
  "success": true,
  "message": "Account updated successfully",
  "data": {
    "id": 1,
    "username": "newusername",
    "email": "newemail@example.com"
  }
}
```

---

**Test Coverage Summary**

| Priority | Count | Description |
|----------|-------|-------------|
| P0 | 5 | Critical path, must pass |
| P1 | 5 | Important features |
| P2 | 3 | Secondary features |
| P3 | 1 | Edge cases |
| **Total** | **14** | |
