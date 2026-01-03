# Savings E2E Test Matrix

## Feature Description

The Savings module allows users to create and manage savings goals. Users can set target amounts, track progress with contributions, and celebrate when goals are achieved.

**Production URL**: https://i-budget.site/savings  
**Routes**:
- `/savings` - Savings goals list (Protected)
- `/savings/add-saving` - Add new savings goal
- `/savings/update-saving/:id` - Update existing savings goal
- `/savings/view-saving/:id` - View savings goal details

---

## Overview

The Savings feature enables users to:
- View all savings goals and their progress
- Create new savings goals with target amounts and deadlines
- Add contributions to existing savings goals
- Update savings goal details
- Delete savings goals
- Track progress towards financial goals
- Celebrate goal completion with visual feedback

---

## Test Matrix

| Test ID | Test Name | Description | Preconditions | Steps | Expected Result | Priority | Type | Status | Last Tested | Notes |
|---------|-----------|-------------|---------------|-------|-----------------|----------|------|--------|-------------|-------|
| SAV-001 | Savings Page Load | Verify savings page loads successfully | User is logged in | 1. Navigate to `/savings` | Savings goals list displays, page loads without errors | P0 | Smoke | ✅ Passed | Dec 29, 2025 | Page loads correctly with empty state or list |
| SAV-002 | View Savings Goals List | Verify all savings goals display | User has existing savings goals | 1. Navigate to `/savings` | All goals show name, target, current amount, progress, deadline | P0 | E2E | ✅ Passed | Dec 29, 2025 | Verified created goal appears in list |
| SAV-003 | Add New Savings Goal | Verify user can create savings goal | User is on savings page | 1. Click "Add Savings Goal" 2. Navigate to `/savings/add-saving` 3. Fill name, target amount, deadline 4. Click Save | Goal is created, appears in list with 0% progress | P0 | E2E | ✅ Passed | Dec 29, 2025 | Created "New Laptop" successfully |
| SAV-004 | View Savings Details | Verify savings details page | User has existing savings goal | 1. Click on savings goal 2. Navigate to `/savings/view-saving/:id` | Details show goal info, contribution history, progress chart | P0 | E2E | ✅ Passed | Dec 29, 2025 | Details page loads correctly |
| SAV-005 | Update Savings Goal | Verify user can update goal | User has existing savings goal | 1. Navigate to `/savings/update-saving/:id` 2. Modify target amount or deadline 3. Save | Goal updates with new values | P0 | E2E | ✅ Passed | Dec 29, 2025 | Updated target amount successfully |
| SAV-006 | Delete Savings Goal | Verify user can delete goal | User has existing savings goal | 1. Click delete on savings goal 2. Confirm deletion | Goal is removed from list | P0 | E2E | ✅ Passed | Dec 29, 2025 | Confirmation modal appears and functions correctly |
| SAV-007 | Delete Savings - Cancel | Verify cancel preserves goal | User has existing savings goal | 1. Click delete 2. Cancel in confirmation modal | Goal remains unchanged | P1 | Negative | ⏭️ Skipped | Dec 29, 2025 | - |
| SAV-008 | Add Contribution | Verify user can add money to goal | User has existing savings goal | 1. Open savings goal 2. Click "Add Contribution" 3. Enter amount 4. Save | Contribution added, current amount increases, progress updates | P0 | E2E | ✅ Passed | Dec 29, 2025 | Added deposit, progress updated |
| SAV-009 | Withdraw Contribution | Verify user can withdraw from goal | User has savings goal with balance | 1. Open savings goal 2. Click "Withdraw" 3. Enter amount 4. Confirm | Amount decreases, progress updates, withdrawal logged | P1 | E2E | ✅ Passed | Dec 29, 2025 | Withdrew funds, balance decreased correctly |
| SAV-010 | Progress Tracking - Percentage | Verify progress percentage accuracy | Savings goal has contributions | 1. View savings goal with contributions | Progress shows correct percentage (current/target * 100) | P0 | E2E | ✅ Passed | Dec 29, 2025 | Percentage calculated correctly (20%, 10%, 8%) |
| SAV-011 | Progress Tracking - Visual Bar | Verify progress bar reflects status | Savings goal has contributions | 1. View savings goal | Progress bar fills proportionally to percentage | P1 | Regression | ✅ Passed | Dec 29, 2025 | Visual check passed |
| SAV-012 | Target Amount Validation - Empty | Verify target amount required | User is creating savings goal | 1. Leave target amount empty 2. Click Save | Error: "Target Amount must be at least 1." | P1 | Negative | ✅ Passed | Jan 3, 2026 | Tested with zero amount - shows validation message |
| SAV-013 | Target Amount Validation - Zero | Verify zero target rejected | User is creating savings goal | 1. Enter 0 as target 2. Click Save | Error: "Target Amount must be at least 1." | P2 | Boundary | ✅ Passed | Jan 3, 2026 | Same validation as empty - covers both cases |
| SAV-014 | Target Amount Validation - Negative | Verify negative target rejected | User is creating savings goal | 1. Enter -1000 as target 2. Click Save | Error: "Target Amount must be at least 1." | P2 | Boundary | Dec 29, 2025: ❌ Failed \| Jan 3, 2026: ✅ Passed (Retest) | Dec 29, 2025 \| Jan 3, 2026 (Retest) | Initial test showed no error; retest shows validation works correctly |
| SAV-015 | Deadline Handling - Past Date | Verify past deadline handling | User is creating savings goal | 1. Set deadline in the past 2. Click Save | Error: "Deadline must be in the future" | P2 | Boundary | ❌ Failed | Jan 3, 2026 | No specific error shown for past dates - form accepts them |
| SAV-016 | Deadline Handling - No Deadline | Verify goal without deadline | User is creating savings goal | 1. Leave deadline empty 2. Fill other fields 3. Save | Goal saves without deadline (open-ended goal) | P2 | E2E | ⏭️ Skipped | Dec 29, 2025 | - |
| SAV-017 | Completion Celebration | Verify celebration on goal completion | Savings goal near completion | 1. Add contribution that reaches 100% 2. Save | Celebration animation/confetti displays, goal marked complete | P1 | E2E | ⏭️ Skipped | Dec 29, 2025 | - |
| SAV-018 | Over-contribution Handling | Verify adding more than target | Savings goal near completion | 1. Add contribution exceeding remaining amount 2. Save | Either blocked with warning OR allows over-saving with 100%+ progress | P2 | Boundary | ⏭️ Skipped | Dec 29, 2025 | - |
| SAV-019 | Empty State | Verify empty state display | New user with no savings goals | 1. Navigate to `/savings` | Empty state shows "Start your first savings goal" with CTA | P2 | Regression | ✅ Passed | Dec 29, 2025 | Validated before creation and after deletion |

---

## Page Elements Reference

| Element | Selector/Identifier | Description |
|---------|---------------------|-------------|
| Savings List | `.savings-list`, `[data-testid="savings-list"]` | Container for all savings goals |
| Savings Card | `.savings-card`, `[data-testid="savings-card"]` | Individual savings goal card |
| Add Savings Button | `[data-testid="add-saving-btn"]`, `.add-saving-btn` | Button to create new goal |
| Goal Name | `.goal-name`, `[data-testid="goal-name"]` | Savings goal name |
| Target Amount | `.target-amount`, `[data-testid="target-amount"]` | Target savings amount |
| Current Amount | `.current-amount`, `[data-testid="current-amount"]` | Current saved amount |
| Progress Bar | `.progress-bar`, `[data-testid="savings-progress"]` | Visual progress indicator |
| Progress Percentage | `.progress-percent`, `[data-testid="progress-percent"]` | Percentage display |
| Deadline | `.deadline`, `[data-testid="deadline"]` | Goal deadline date |
| Edit Button | `[data-testid="edit-saving"]`, `.edit-btn` | Edit goal action |
| Delete Button | `[data-testid="delete-saving"]`, `.delete-btn` | Delete goal action |
| View Button | `[data-testid="view-saving"]`, `.view-btn` | View details action |
| Add Contribution Button | `[data-testid="add-contribution"]`, `.contribute-btn` | Add money action |
| Contribution Modal | `.contribution-modal`, `[data-testid="contribution-modal"]` | Add contribution form |
| Contribution Amount | `#contributionAmount`, `[data-testid="contribution-amount"]` | Amount input field |
| Savings Form | `.savings-form`, `[data-testid="savings-form"]` | Create/Edit savings form |
| Name Input | `#savingName`, `[data-testid="saving-name-input"]` | Goal name field |
| Target Input | `#targetAmount`, `[data-testid="target-input"]` | Target amount field |
| Deadline Input | `#deadline`, `[data-testid="deadline-input"]` | Deadline date picker |
| Save Button | `[data-testid="save-saving"]`, `.save-btn` | Save goal button |
| Celebration Overlay | `.celebration`, `[data-testid="confetti"]` | Goal completion celebration |

---

## Test Data Requirements

| Data Type | Description | Example Values |
|-----------|-------------|----------------|
| Test User | Authenticated user | `testuser@example.com` / `TestPass123!` |
| New Savings Goal | Goal for creation test | Name: "Emergency Fund", Target: $10,000, Deadline: 6 months from now |
| In-Progress Goal | Goal with partial progress | Name: "Vacation", Target: $5,000, Current: $2,500 (50%) |
| Near-Complete Goal | Goal close to completion | Name: "New Laptop", Target: $1,500, Current: $1,400 (93%) |
| Completed Goal | Goal at 100% | Name: "Holiday Gift", Target: $500, Current: $500 |
| Contribution Amounts | Various contribution values | $50, $100, $500, $1000 |
| Deadlines | Various deadline scenarios | Tomorrow, Next month, Next year, None |

---

## Notes

- Contribution history should be displayed on detail page
- Consider testing recurring contribution reminders if feature exists
- Progress percentage should round appropriately for display
- Celebration animation may use confetti.service.ts
- Test behavior when deadline passes but goal not complete
- Currency formatting should match user preferences
