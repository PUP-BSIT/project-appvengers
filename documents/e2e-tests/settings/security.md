# Security Settings - E2E Test Matrix

> Security and Password Management Testing

**Route**: `/settings/security/:id`  
**Protection**: Authenticated users only  
**Production URL**: `https://i-budget.site/settings/security/:id`  
**Last Updated**: December 30, 2025

---

## Overview

The Security Settings page allows users to manage their security settings:
- Change password (current, new, confirm)
- Deactivate account (temporary)
- Delete account (permanent soft-delete)
- Password visibility toggles for all password fields

### Key Components
- `Security` component with reactive forms
- `AuthService.changePassword()` for password updates
- `UserService.deactivateAccount()` for account deactivation
- `UserService.softDeleteAccount()` for account deletion
- Bootstrap modals for confirmation dialogs

### Forms
- **Password Change Form**: current_password, new_password, confirm_password
- **Deactivate Form**: reason, password
- **Delete Form**: reason, password

---

## Test Matrix

| Test ID | Test Name | Description | Preconditions | Steps | Expected Result | Priority | Type | Status | Last Tested | Notes |
|---------|-----------|-------------|---------------|-------|-----------------|----------|------|--------|-------------|-------|
| SEC-VIEW-001 | View Security Settings | Verify security settings page loads | User logged in | 1. Navigate to `/settings/security/:id` | Page displays password form and privacy section | P0 | Smoke | ✅ Passed | Dec 29, 2025 | Verified manually |
| SEC-PWD-001 | Change Password Success | Verify password change works | User logged in | 1. Enter current password 2. Enter new password (8+ chars) 3. Confirm new password 4. Click Save | Success message, form cleared | P0 | E2E | ✅ Passed | Dec 29, 2025 | Verified manually |
| SEC-PWD-002 | Current Password Validation | Verify current password required | User logged in | 1. Leave current password empty 2. Fill other fields 3. Submit | "Current Password is required" error | P1 | Negative | ✅ Passed | Dec 29, 2025 | Verified manually |
| SEC-PWD-003 | New Password Required | Verify new password required | User logged in | 1. Fill current password 2. Leave new password empty 3. Submit | "New Password is required" error | P1 | Negative | ✅ Passed | Dec 29, 2025 | Verified manually |
| SEC-PWD-004 | New Password Min Length | Verify 8 character minimum | User logged in | 1. Enter new password < 8 chars 2. Touch field | "Password must be at least 8 characters" error | P0 | Boundary | ✅ Passed | Dec 29, 2025 | Verified manually |
| SEC-PWD-005 | Confirm Password Required | Verify confirm password required | User logged in | 1. Fill current and new password 2. Leave confirm empty 3. Submit | "Confirm Password is required" error | P1 | Negative | ✅ Passed | Dec 29, 2025 | Verified manually |
| SEC-PWD-006 | Password Mismatch | Verify passwords must match | User logged in | 1. Enter new password 2. Enter different confirm password 3. Submit | "New password and confirm password do not match" error | P0 | Negative | ✅ Passed | Dec 29, 2025 | Verified manually |
| SEC-PWD-007 | Wrong Current Password | Verify incorrect current password handling | User logged in | 1. Enter wrong current password 2. Enter valid new/confirm 3. Submit | API error message displayed | P1 | Negative | ✅ Passed | Dec 29, 2025 | Verified manually |
| SEC-VIS-001 | Toggle Current Password | Verify current password visibility toggle | User logged in | 1. Enter current password 2. Click eye icon | Password toggles visible/hidden, icon changes | P2 | Regression | ✅ Passed | Dec 29, 2025 | Verified manually |
| SEC-VIS-002 | Toggle New Password | Verify new password visibility toggle | User logged in | 1. Enter new password 2. Click eye icon | Password toggles visible/hidden | P2 | Regression | ✅ Passed | Dec 29, 2025 | Verified manually |
| SEC-VIS-003 | Toggle Confirm Password | Verify confirm password visibility toggle | User logged in | 1. Enter confirm password 2. Click eye icon | Password toggles visible/hidden | P2 | Regression | ✅ Passed | Dec 29, 2025 | Verified manually |
| SEC-DEACT-001 | Open Deactivate Modal | Verify deactivate modal opens | User logged in | 1. Click "Deactivate Account" button | Modal opens with form and warning message | P1 | E2E | ✅ Passed | Dec 29, 2025 | Verified manually |
| SEC-DEACT-002 | Deactivate Account Success | Verify account deactivation works | User logged in | 1. Click Deactivate Account 2. Enter reason 3. Enter password 4. Submit | Account deactivated, redirected to login | P0 | E2E | ✅ Passed | Dec 29, 2025 | Verified manually |
| SEC-DEACT-003 | Deactivate Validation | Verify deactivate form validation | Modal open | 1. Leave fields empty 2. Submit | Validation errors for reason and password | P1 | Negative | ✅ Passed | Dec 29, 2025 | Verified manually |
| SEC-DEACT-004 | Cancel Deactivate | Verify cancel closes modal | Modal open | 1. Click Cancel button | Modal closes, no changes made | P2 | Regression | ✅ Passed | Dec 29, 2025 | Verified manually |
| SEC-REACT-001 | Reactivate Deactivated Account | Verify deactivated account can be reactivated | Account deactivated | 1. Try to login with deactivated account 2. See reactivation prompt 3. Enter password 4. Click Reactivate | Account reactivated, auto-login to dashboard | P0 | E2E | ✅ Passed | Dec 30, 2025 | **NEW FEATURE**: Full reactivation flow implemented and verified |
| SEC-REACT-002 | Reactivation Wrong Password | Verify reactivation fails with wrong password | Account deactivated | 1. Try to login 2. See reactivation prompt 3. Enter wrong password 4. Click Reactivate | Error message displayed | P1 | Negative | ✅ Passed | Dec 30, 2025 | **NEW FEATURE**: Proper error handling verified |
| SEC-REACT-003 | Cancel Reactivation | Verify cancel hides reactivation prompt | Reactivation prompt shown | 1. Click Cancel button | Prompt hidden, form reset | P2 | Regression | ✅ Passed | Dec 30, 2025 | **NEW FEATURE**: Cancel functionality verified |
| SEC-DEL-001 | Open Delete Modal | Verify delete modal opens | User logged in | 1. Click "Delete Account" button | Modal opens with warning and form | P1 | E2E | ✅ Passed | Dec 29, 2025 | Verified manually |
| SEC-DEL-002 | Delete Account Success | Verify account deletion works | User logged in | 1. Click Delete Account 2. Enter reason 3. Enter password 4. Submit | Account soft-deleted, redirected to login | P0 | E2E | ✅ Passed | Dec 29, 2025 | Verified manually. Database marked with delete date. |
| SEC-DEL-003 | Delete Warning Display | Verify 30-day warning shown | Delete modal open | 1. View modal | Warning about 30-day permanent deletion displayed | P1 | E2E | ✅ Passed | Dec 29, 2025 | Verified manually |
| SEC-DEL-004 | Delete Validation | Verify delete form validation | Modal open | 1. Leave fields empty 2. Submit | Validation errors for reason and password | P1 | Negative | ✅ Passed | Dec 29, 2025 | Verified password requirement before delete button enabled |
| SEC-DEL-005 | Cancel Delete | Verify cancel closes modal | Modal open | 1. Click Cancel button | Modal closes, no changes made | P2 | Regression | ✅ Passed | Dec 29, 2025 | Verified manually |
| SEC-OAUTH-001 | OAuth User Deactivate | Verify OAuth user can deactivate with email confirmation | OAuth user logged in | 1. Click Deactivate Account 2. Enter reason 3. Enter email address 4. Submit | Account deactivated, redirected to login | P0 | E2E | ✅ Passed | Jan 3, 2026 | Manually verified - OAuth users use email confirmation instead of password |
| SEC-OAUTH-002 | OAuth User Delete | Verify OAuth user can delete with email confirmation | OAuth user logged in | 1. Click Delete Account 2. Enter reason 3. Enter email address 4. Submit | Account soft-deleted, redirected to login | P0 | E2E | ✅ Passed | Jan 3, 2026 | Manually verified - OAuth users use email confirmation instead of password |
| SEC-OAUTH-003 | OAuth Email Mismatch | Verify OAuth user blocked with wrong email | OAuth user, modal open | 1. Enter reason 2. Enter wrong email | Delete button disabled, "Email does not match" error | P1 | Negative | ✅ Passed | Jan 3, 2026 | Manually verified - Wrong email validation working correctly |
| SEC-OAUTH-004 | OAuth Email Confirmation UI | Verify email input shown instead of password for OAuth | OAuth user logged in | 1. Open deactivate/delete modal | Email confirmation field shown, password field hidden | P1 | E2E | ✅ Passed | Jan 3, 2026 | Manually verified - UI correctly shows email field for OAuth users |
| SEC-OAUTH-005 | Local User Still Uses Password | Verify local user still sees password field | Local user logged in | 1. Open deactivate/delete modal | Password field shown, email confirmation hidden | P1 | Regression | ✅ Passed | Jan 3, 2026 | Manually verified - Local users still use password field (backward compatibility) |
| SEC-MSG-001 | Success Message Display | Verify success message after password change | Password changed | 1. Complete password change | Green success alert displayed | P1 | E2E | ✅ Passed | Dec 29, 2025 | Verified manually |
| SEC-MSG-002 | Error Message Display | Verify error message on failure | Invalid submission | 1. Submit with wrong password | Red error alert displayed | P1 | Negative | ✅ Passed | Dec 29, 2025 | Verified manually |
| SEC-SUBMIT-001 | Loading State | Verify loading state during submission | User submitting form | 1. Click Save button | Spinner shown, button disabled | P2 | Regression | ✅ Passed | Dec 29, 2025 | Verified manually |

---

## Page Elements Reference

### Selectors

| Element | Selector | Description |
|---------|----------|-------------|
| Third Panel | `.third-panel` | Security header section |
| Info Container | `.info-container` | Title and description |
| Security Card | `.card.security-settings-panel` | Password form card |
| Card Header | `.card-header` | "Password" header |
| Success Alert | `.alert.alert-success` | Success message |
| Error Alert | `.alert.alert-danger` | Error message |
| Security Form | `form.security-form-wrapper` | Password change form |
| Current Password Input | `input[formControlName="current_password"]` | Current password field |
| New Password Input | `input[formControlName="new_password"]` | New password field |
| Confirm Password Input | `input[formControlName="confirm_password"]` | Confirm password field |
| Password Toggle Button | `.btn-outline-secondary` | Eye icon buttons |
| Save Button | `button[type="submit"]` | Save button |
| Privacy Panel | `.privacy-panel` | Account actions section |
| Deactivate Button | `.btn-secondary` (Deactivate Account) | Open deactivate modal |
| Delete Button | `.btn-danger` (Delete Account) | Open delete modal |
| Deactivate Modal | `#deactivateModal` | Deactivate confirmation modal |
| Delete Modal | `#deleteModal` | Delete confirmation modal |
| Modal Reason Input | `textarea[formControlName="reason"]` | Reason textarea |
| Modal Password Input | `input[formControlName="password"]` | Modal password field |
| Modal Cancel Button | `.btn-secondary` (Cancel) | Cancel modal button |
| Modal Submit Button | `.btn-warning` / `.btn-danger` | Submit modal action |
| Validation Error | `.text-danger.small` | Validation error text |
| Spinner | `.spinner-border` | Loading indicator |

### Component Structure

```
Security Settings Page
├── ToggleableSidebar
├── Header
├── SubHeader (Settings navigation)
└── Main Content
    ├── Third Panel (Security info)
    ├── Security Settings Card
    │   ├── Card Header (Password)
    │   └── Card Body
    │       ├── Success/Error Alerts
    │       └── Form
    │           ├── Current Password (with toggle)
    │           ├── New Password (with toggle)
    │           ├── Confirm Password (with toggle)
    │           └── Save Button
    ├── Privacy Panel
    │   └── Card
    │       ├── Deactivate Account Button
    │       └── Delete Account Button
    ├── Deactivate Modal
    │   ├── Header
    │   ├── Warning Text
    │   └── Form (reason, password, buttons)
    └── Delete Modal
        ├── Header (red text)
        ├── Warning Alert
        └── Form (reason, password, buttons)
```

---

## Test Data Requirements

### User Accounts

| Account Type | Email | Password | Purpose |
|--------------|-------|----------|---------|
| Test User | `security_test@example.com` | `TestPass123!` | Standard testing |
| Deactivate Test | `security_deact@example.com` | `TestPass123!` | Deactivation testing |
| Delete Test | `security_delete@example.com` | `TestPass123!` | Deletion testing |

### Password Change Test Data

| Scenario | Current | New | Confirm | Expected Result |
|----------|---------|-----|---------|-----------------|
| Valid Change | `TestPass123!` | `NewPass456!` | `NewPass456!` | Success |
| Short Password | `TestPass123!` | `Short1` | `Short1` | Min length error |
| Mismatch | `TestPass123!` | `NewPass456!` | `Different789!` | Mismatch error |
| Wrong Current | `WrongPass!` | `NewPass456!` | `NewPass456!` | API error |
| Empty Fields | `` | `` | `` | Required errors |

### Deactivate/Delete Test Data

| Scenario | Reason | Password | Expected Result |
|----------|--------|----------|-----------------|
| Valid Deactivate | `Taking a break` | `TestPass123!` | Account deactivated |
| Valid Delete | `No longer needed` | `TestPass123!` | Account soft-deleted |
| Missing Reason | `` | `TestPass123!` | Reason required error |
| Wrong Password | `Reason text` | `WrongPass!` | API error |

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/change-password` | POST | Change user password |
| `/api/auth/reactivate` | POST | Reactivate deactivated account |
| `/api/users/deactivate` | POST | Deactivate account |
| `/api/users/delete` | POST | Soft delete account |

### Password Change Payload

```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass456!",
  "confirmPassword": "NewPass456!"
}
```

### Deactivate/Delete Payload

**For Local Users (with password):**
```json
{
  "password": "TestPass123!",
  "reason": "User provided reason"
}
```

**For OAuth Users (without password):**
```json
{
  "confirmEmail": "user@example.com",
  "reason": "User provided reason"
}
```

### Reactivate Account Payload

```json
{
  "email": "user@example.com",
  "password": "TestPass123!"
}
```

---

**Test Coverage Summary**

| Priority | Count | Description |
|----------|-------|-------------|
| P0 | 6 | Critical path, must pass |
| P1 | 11 | Important features |
| P2 | 7 | Secondary features |
| P3 | 0 | Edge cases |
| **Total** | **24** | |
