# Notification Preferences - E2E Test Matrix

> Notification Preferences Settings Testing

**Route**: `/settings/notifications`  
**Protection**: Authenticated users only (authGuard)  
**Production URL**: `https://i-budget.site/settings/notifications`  
**Last Updated**: December 2025

---

## Overview

The Notification Preferences page allows users to customize their notification settings:
- Budget notification toggles (warning, exceeded, near end)
- Savings notification toggles (deadline, milestones, completed)
- Deadline reminder timing selection
- Delivery settings (sound, toast popups)
- Save changes and reset to defaults

### Key Components
- `NotificationPreferencesComponent` with Angular signals
- `NotificationPreferencesService` for state management
- Toggle switches (form-check-switch)
- Change detection for save button enablement

### Preference Categories
- **Budget Notifications**: Warning (50%), Exceeded, Near End
- **Savings Notifications**: Deadline, Milestones (50%/75%), Completed
- **Delivery Settings**: Sound, Toast popups

---

## Test Matrix

| Test ID | Test Name | Description | Preconditions | Steps | Expected Result | Priority | Type | Status | Last Tested | Notes |
|---------|-----------|-------------|---------------|-------|-----------------|----------|------|--------|-------------|-------|
| PREF-VIEW-001 | View Preferences Page | Verify preferences page loads | User logged in | 1. Navigate to `/settings/notifications` | Page displays all preference cards with toggles | P0 | Smoke | ✅ Passed | Dec 31, 2025 | Core functionality |
| PREF-LOAD-001 | Load Saved Preferences | Verify preferences load from backend | User logged in | 1. Navigate to preferences | Toggles reflect saved preference values | P0 | E2E | ✅ Passed | Dec 31, 2025 | |
| PREF-LOAD-002 | Loading State Display | Verify loading spinner while fetching | User navigating to page | 1. Navigate to preferences | Spinner shown until data loads | P2 | Regression | ✅ Passed | Dec 31, 2025 | |
| PREF-BUD-001 | Toggle Budget Warning | Verify budget warning toggle works | Preferences loaded | 1. Click Budget Warning toggle | Toggle state changes, Save button enabled | P1 | E2E | ✅ Passed | Dec 31, 2025 | |
| PREF-BUD-002 | Toggle Budget Exceeded | Verify budget exceeded toggle works | Preferences loaded | 1. Click Budget Exceeded toggle | Toggle state changes, Save button enabled | P1 | E2E | ✅ Passed | Dec 31, 2025 | |
| PREF-BUD-003 | Toggle Budget Near End | Verify budget near end toggle works | Preferences loaded | 1. Click Budget Ending Soon toggle | Toggle state changes, Save button enabled | P1 | E2E | ✅ Passed | Dec 31, 2025 | |
| PREF-SAV-001 | Toggle Deadline Reminders | Verify deadline toggle works | Preferences loaded | 1. Click Deadline Reminders toggle | Toggle changes, deadline days dropdown appears/hides | P1 | E2E | ✅ Passed | Dec 31, 2025 | Conditional display |
| PREF-SAV-002 | Select Deadline Days | Verify deadline days dropdown works | Deadline reminders enabled | 1. Select different option from dropdown | Value changes to 1/3/7/14 days | P1 | E2E | ✅ Passed | Dec 31, 2025 | |
| PREF-SAV-003 | Toggle Milestone Celebrations | Verify milestone toggle works | Preferences loaded | 1. Click Milestone Celebrations toggle | Toggle state changes | P1 | E2E | ✅ Passed | Dec 31, 2025 | 50%/75% milestones |
| PREF-SAV-004 | Toggle Goal Completed | Verify completed toggle works | Preferences loaded | 1. Click Goal Completed toggle | Toggle state changes | P1 | E2E | ✅ Passed | Dec 31, 2025 | |
| PREF-DEL-001 | Toggle Sound | Verify sound toggle works | Preferences loaded | 1. Click Notification Sound toggle | Toggle state changes | P1 | E2E | ✅ Passed | Dec 31, 2025 | |
| PREF-DEL-002 | Toggle Toast Popups | Verify toast toggle works | Preferences loaded | 1. Click Toast Popups toggle | Toggle state changes | P1 | E2E | ✅ Passed | Dec 31, 2025 | |
| PREF-SAVE-001 | Save Preferences | Verify save updates backend | Changes made | 1. Toggle some preferences 2. Click Save Changes | Success message, preferences saved | P0 | E2E | ✅ Passed | Dec 31, 2025 | |
| PREF-SAVE-002 | Save Button Disabled | Verify save disabled without changes | Preferences loaded, no changes | 1. View preferences | Save Changes button is disabled | P2 | Regression | ✅ Passed | Dec 31, 2025 | |
| PREF-SAVE-003 | Save Loading State | Verify loading state during save | User saving changes | 1. Click Save Changes | Button shows "Saving..." with spinner | P2 | Regression | ✅ Passed | Dec 31, 2025 | |
| PREF-RESET-001 | Reset to Defaults | Verify reset restores defaults | Changes made | 1. Click Reset to Defaults | All toggles reset to default values, success message | P1 | E2E | ✅ Passed | Dec 31, 2025 | |
| PREF-MSG-001 | Success Message Display | Verify success message after save | User saved changes | 1. Save preferences | Green success alert with check icon | P1 | E2E | ✅ Passed | Dec 31, 2025 | |
| PREF-MSG-002 | Error Message Display | Verify error message on failure | API error | 1. Save with network error | Red error alert displayed | P1 | Negative | ⏭️ Skipped | Dec 31, 2025 | Requires network mock |
| PREF-MSG-003 | Dismiss Messages | Verify messages can be dismissed | Message displayed | 1. Click close button on alert | Alert dismissed | P3 | Regression | ✅ Passed | Dec 31, 2025 | |
| PREF-CHG-001 | Change Detection | Verify changes enable save button | Preferences loaded | 1. Toggle any preference | hasChanges() returns true, Save button enabled | P1 | E2E | ✅ Passed | Dec 31, 2025 | |
| PREF-GUARD-001 | Auth Guard Redirect | Verify unauthenticated redirect | User not logged in | 1. Navigate directly to `/settings/notifications` | Redirected to login/auth page | P0 | Smoke | ✅ Passed | Dec 31, 2025 | Security |

---

## Page Elements Reference

### Selectors

| Element | Selector | Description |
|---------|----------|-------------|
| Main Container | `.notification-preferences-panel` | Main panel container |
| Info Container | `.info-container` | Header section |
| Loading Spinner | `.loading-container .spinner-border` | Loading state |
| Success Alert | `.alert.alert-success.message-alert` | Success message |
| Error Alert | `.alert.alert-danger.message-alert` | Error message |
| Cards Container | `.cards-container` | Preference cards wrapper |
| Budget Card | `.card` (Budget Notifications) | Budget preferences card |
| Savings Card | `.card` (Savings Notifications) | Savings preferences card |
| Delivery Card | `.card` (Delivery Settings) | Delivery preferences card |
| Card Header | `.card-header` | Card title section |
| Header Icon | `.header-icon` | Category icon |
| Preference Item | `.preference-item` | Individual preference row |
| Preference Title | `.preference-title` | Preference name |
| Preference Description | `.preference-desc` | Preference description |
| Toggle Switch | `.form-check-input[type="checkbox"]` | Toggle switch input |
| Deadline Dropdown | `.deadline-days-select select` | Days before dropdown |
| Action Buttons | `.action-buttons` | Bottom button container |
| Reset Button | `.btn-outline-secondary` (Reset) | Reset to Defaults button |
| Save Button | `.btn-primary` (Save) | Save Changes button |

### Toggle IDs

| Toggle | ID | Default |
|--------|-----|---------|
| Budget Warning | `#budgetWarning` | true |
| Budget Exceeded | `#budgetExceeded` | true |
| Budget Near End | `#budgetNearEnd` | true |
| Savings Deadline | `#savingsDeadline` | true |
| Savings Milestone | `#savingsMilestone` | true |
| Savings Completed | `#savingsCompleted` | true |
| Sound Enabled | `#soundEnabled` | true |
| Toast Enabled | `#toastEnabled` | true |

### Component Structure

```
Notification Preferences Page
├── ToggleableSidebar
├── Header
├── SubHeader (Settings navigation)
└── Main Content
    └── Notification Preferences Panel
        ├── Info Container
        │   ├── Title
        │   └── Description
        ├── Loading State (while fetching)
        ├── Success/Error Alerts
        ├── Cards Container
        │   ├── Budget Notifications Card
        │   │   ├── Header (icon + title)
        │   │   └── Body
        │   │       ├── Budget Warning Toggle
        │   │       ├── Budget Exceeded Toggle
        │   │       └── Budget Near End Toggle
        │   ├── Savings Notifications Card
        │   │   ├── Header (icon + title)
        │   │   └── Body
        │   │       ├── Deadline Reminders Toggle
        │   │       ├── Deadline Days Dropdown (conditional)
        │   │       ├── Milestone Celebrations Toggle
        │   │       └── Goal Completed Toggle
        │   └── Delivery Settings Card
        │       ├── Header (icon + title)
        │       └── Body
        │           ├── Notification Sound Toggle
        │           └── Toast Popups Toggle
        └── Action Buttons
            ├── Reset to Defaults Button
            └── Save Changes Button
```

---

## Test Data Requirements

### User Accounts

| Account Type | Email | Password | Purpose |
|--------------|-------|----------|---------|
| Test User | `prefs_test@example.com` | `TestPass123!` | Standard testing |

### Default Preference Values

| Preference | Default Value |
|------------|---------------|
| budgetWarningEnabled | true |
| budgetExceededEnabled | true |
| budgetNearEndEnabled | true |
| savingsDeadlineEnabled | true |
| savingsDeadlineDays | 7 |
| savingsMilestoneEnabled | true |
| savingsCompletedEnabled | true |
| soundEnabled | true |
| toastEnabled | true |

### Deadline Days Options

| Value | Label |
|-------|-------|
| 1 | 1 day before |
| 3 | 3 days before |
| 7 | 7 days before |
| 14 | 14 days before |

### Test Scenarios

| Scenario | Changes Made | Expected State |
|----------|--------------|----------------|
| Disable All Budget | All budget toggles off | 3 preferences changed |
| Disable All Savings | All savings toggles off | 4 preferences changed |
| Change Deadline Days | 7 -> 3 | 1 preference changed |
| Disable All Delivery | Sound + Toast off | 2 preferences changed |
| Reset After Changes | Any changes made | All toggles return to defaults |

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/notification-preferences` | GET | Fetch current preferences |
| `/api/notification-preferences` | PUT | Update preferences |
| `/api/notification-preferences/reset` | POST | Reset to defaults |

### Preferences Object

```typescript
interface NotificationPreferences {
  budgetWarningEnabled: boolean;
  budgetExceededEnabled: boolean;
  budgetNearEndEnabled: boolean;
  savingsDeadlineEnabled: boolean;
  savingsDeadlineDays: number;
  savingsMilestoneEnabled: boolean;
  savingsCompletedEnabled: boolean;
  soundEnabled: boolean;
  toastEnabled: boolean;
}
```

### Response Format

```json
{
  "budgetWarningEnabled": true,
  "budgetExceededEnabled": true,
  "budgetNearEndEnabled": true,
  "savingsDeadlineEnabled": true,
  "savingsDeadlineDays": 7,
  "savingsMilestoneEnabled": true,
  "savingsCompletedEnabled": true,
  "soundEnabled": true,
  "toastEnabled": true
}
```

---

**Test Coverage Summary**

| Priority | Count | Description |
|----------|-------|-------------|
| P0 | 3 | Critical path, must pass |
| P1 | 13 | Important features |
| P2 | 3 | Secondary features |
| P3 | 1 | Edge cases |
| **Total** | **20** | |
