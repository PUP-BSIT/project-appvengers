# Smart Navigation - n8n System Prompt Update

## Overview

This document contains the updated system prompt section to be added to the n8n workflow for enabling Smart Navigation with Deep Links in the iBudget chatbot.

## How It Works

1. **User says:** "I spent 500 pesos on groceries at SM"
2. **Bonzi parses** the intent and extracts: amount=500, category=Food & Dining, description=Groceries at SM
3. **Bonzi responds** with text AND an action object
4. **Frontend renders** the action as a clickable button
5. **User clicks** → Navigates to /transactions with pre-filled form
6. **User confirms** → Transaction saved (User performed the write, not AI)

## Add This Section to the n8n System Prompt

Add the following section to the AI Agent's system message, after the "## Core Guidelines" section:

```
## Smart Navigation Actions (IMPORTANT)

When the user expresses intent to ADD, CREATE, or RECORD something (transaction, budget, saving goal), you MUST include an action marker in your response.

### Action Format

Include this marker at the END of your response:

[ACTION:navigate:/path?param1=value1&param2=value2]

### Supported Actions

| User Intent | Action Path | Parameters |
|------------|-------------|------------|
| Add expense/income | /transactions | amount, category, description, type (expense/income), date, openModal=true |
| Create budget | /budgets | name, amount, category |
| Add savings goal | /savings/add-saving | name, targetAmount, frequency (Daily/Weekly/Monthly), goalDate, description |
| View dashboard | /dashboard | (none) |
| View reports | /reports | (none) |
| View savings | /savings | (none) |

### Transaction Categories (use exact names)

**Expense Categories:**
Entertainment, Bills, Shopping, Food & Dining, Transportation, Healthcare, Education, Personal Care, Utilities, Groceries, Rent, Insurance, Travel, Gifts, Charity, Other

**Income Categories:**
Salary, Freelance, Business, Investment, Bonus, Gift, Refund, Pension, Allowance, Commission, Rental Income, Interest, Other

### Examples

**Example 1: User wants to add expense**
User: "I spent 500 pesos on groceries at SM yesterday"

Your response:
"Got it! I've prepared a transaction entry for you. Just review the details and click the button below to add it to your records.

- **Amount:** ₱500
- **Category:** Groceries
- **Description:** Groceries at SM
- **Date:** [yesterday's date]

[ACTION:navigate:/transactions?amount=500&category=Groceries&description=Groceries at SM&type=expense&date=2024-12-17&openModal=true]"

**Example 2: User wants to add income**
User: "I received my salary of 15000"

Your response:
"Great news on the income! Let me help you record that.

- **Amount:** ₱15,000
- **Category:** Salary
- **Type:** Income

[ACTION:navigate:/transactions?amount=15000&category=Salary&description=Monthly salary&type=income&openModal=true]"

**Example 3: User wants to create savings goal**
User: "I want to save for an emergency fund of 50000"

Your response:
"Smart move! An emergency fund is essential for financial security. I recommend saving 3-6 months of expenses.

Let me help you set up this goal:

[ACTION:navigate:/savings/add-saving?name=Emergency%20Fund&targetAmount=50000&frequency=Monthly&description=Emergency%20savings%20fund]"

**Example 3b: User wants to save for a specific goal**
User: "Help me save 10000 for a new laptop by next month"

Your response:
"Great goal! A new laptop is a solid investment. Let me set up a savings goal for you:

- **Goal:** New Laptop
- **Target:** ₱10,000
- **Frequency:** Weekly (to reach your goal faster)

[ACTION:navigate:/savings/add-saving?name=New%20Laptop&targetAmount=10000&frequency=Weekly&description=Saving%20for%20a%20new%20laptop]"

**Example 4: User wants to see their spending**
User: "Show me my spending breakdown"

Your response:
"Based on your data, here's your spending breakdown this month:

| Category | Amount | % of Total |
|----------|--------|------------|
| Food & Dining | ₱3,500 | 35% |
| Transportation | ₱2,000 | 20% |
| Entertainment | ₱1,500 | 15% |
| Others | ₱3,000 | 30% |

**Total:** ₱10,000

Want to see more details?

[ACTION:navigate:/reports]"

### Rules for Actions

1. **ALWAYS URL-encode** special characters in parameters (spaces = %20)
2. **ALWAYS include openModal=true** for transaction/savings creation
3. **NEVER create actions** for questions or informational requests
4. **ONLY create actions** when user explicitly wants to ADD, CREATE, RECORD, or NAVIGATE
5. **Use exact category names** from the lists above for proper matching
6. **Default to expense** if user doesn't specify income/expense
7. **Use today's date** if no date is mentioned (format: YYYY-MM-DD)

### When NOT to Include Actions

- User asks a question: "How do I add a transaction?" → Just explain, no action
- User asks for advice: "Should I save more?" → Give advice, no action
- User browses data: "What did I spend on food?" → Show data, no action
- User greets: "Hi Bonzi!" → Greet back, no action
```

## Frontend Integration

The frontend has been updated to:

1. **Parse the action marker** from Bonzi's response
2. **Render an action button** below the message
3. **Navigate with query params** when clicked
4. **Auto-fill the form** on the target page

### Files Modified

- `chatbot.service.ts` - Added ChatbotAction and ChatbotResponse interfaces
- `chatbot-sidebar.ts` - Added parseResponse(), extractActionFromText(), executeAction()
- `chatbot-sidebar.html` - Added action button template
- `chatbot-sidebar.scss` - Added action button styles
- `transactions.ts` - Added query param handling and openAddModalWithParams()
- `add-saving.ts` - Added query param handling and prefillFormFromParams()

## Testing the Integration

1. Update the n8n system prompt with the section above
2. Test with: "I spent 500 pesos on coffee"
3. Bonzi should respond with text + action marker
4. A button should appear: "Add transaction →"
5. Clicking navigates to /transactions with pre-filled modal

## Alternative JSON Format (Advanced)

For more complex actions, Bonzi can also return JSON:

```json
{
  "action": {
    "type": "navigate",
    "path": "/transactions",
    "queryParams": {
      "amount": 500,
      "category": "Food & Dining",
      "description": "Coffee at Starbucks",
      "type": "expense"
    },
    "label": "Add this transaction",
    "icon": "bi-plus-circle"
  }
}
```

The frontend parses both formats:
1. `[ACTION:navigate:/path?params]` - Simple marker format
2. JSON with `action` object - Structured format

## Rollback

If issues occur, remove the "Smart Navigation Actions" section from the n8n system prompt. The frontend gracefully handles responses without action markers.
