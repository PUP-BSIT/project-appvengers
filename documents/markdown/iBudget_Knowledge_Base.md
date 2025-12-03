# iBudget Knowledge Base

## Overview

iBudget is a modern web application designed to help people, especially students, manage their finances with ease. It simplifies money management by providing an intuitive platform for tracking income and expenses, visualizing spending patterns, setting budgets and savings goals, and receiving notifications about your financial activity.

**Live Application:** https://i-budget.site/

## Getting Started

### How to Access iBudget
1. Open your web browser and go to https://i-budget.site/
2. You'll see the landing page with an overview of iBudget's features
3. Click the "Get Started" button to begin

### Creating Your Account
1. On the auth page, click the "Signup" tab
2. Fill in the registration form:
   - **Username** - Choose a unique username (3-50 characters)
   - **Email** - Enter a valid email address
   - **Password** - Create a secure password (minimum 6 characters)
   - **Confirm Password** - Re-enter your password
3. The form will check if your username and email are available in real-time
4. Click "Sign Up" to create your account
5. Check your email for a verification link and click it to activate your account

### Logging In
1. Go to the auth page and ensure the "Login" tab is selected
2. Enter your email and password
3. Click "Login"
4. If you forget your password, click "Forgot Password?" to reset it

### Resetting Your Password
1. Click "Forgot Password?" on the login page
2. Enter your registered email address
3. Check your email for a password reset link
4. Click the link and enter your new password (minimum 8 characters)
5. Confirm your new password and submit

## Main Features

### Dashboard

The dashboard is your financial command center. After logging in, you'll see:

**Welcome Section**
- A personalized greeting with your username
- Your remaining budget displayed prominently (calculated as Total Income minus Total Expenses)

**Financial Charts**
- **Expense Chart** - A doughnut chart showing your expense breakdown by category
- **Income Chart** - A doughnut chart showing your income sources
- **Spending Overview** - A bar chart showing your spending patterns over time

### Transactions

The transactions page helps you track all your financial activities.

**Summary Cards at the Top:**
- **Total Income** - Sum of all your income transactions
- **Total Expenses** - Sum of all your expense transactions
- **Balance** - Your current balance (Income minus Expenses)

**Transaction List:**
Each transaction shows:
- Date
- Description
- Category (color-coded tag)
- Amount (green for income, red for expenses)

**How to Add a Transaction:**
1. Click the "+ Add Transaction" button
2. Fill in the transaction details:
   - **Date** - Select the transaction date
   - **Category** - Choose from: Income, Entertainment, Bills, Shopping
   - **Description** - Enter a description of the transaction
   - **Type** - Select Income or Expense
   - **Amount** - Enter the amount
3. Click "Add Transaction" to save

**How to Edit a Transaction:**
1. Click the three-dot menu on any transaction card
2. Select "Edit"
3. Modify the details in the form
4. Click "Save" to update

**How to Delete a Transaction:**
1. Click the three-dot menu on any transaction card
2. Select "Delete"
3. Confirm the deletion

**Filtering Transactions:**
- Use the category dropdown to filter transactions by category
- Options: All Categories, Income, Entertainment, Bills, Shopping

### Budgets

The budgets page helps you set spending limits and track your progress.

**Budget Overview Cards:**
- **Total Budgets** - Sum of all your budget limits
- **Total Spent** - How much you've spent across all budgets
- **Remaining** - How much budget you have left

**Budget List:**
Each budget card displays:
- Category name
- Date range (start to end date)
- Current spending vs. budget limit
- Visual progress bar with percentage
- Remaining amount
- "View Budget" button for details

**How to Create a Budget:**
1. Click the "Add Budget" button
2. Fill in the budget details:
   - Category
   - Budget limit amount
   - Start date
   - End date
3. Click "Save" to create the budget

**How to View Budget Details:**
1. Click "View Budget" on any budget card
2. You'll see:
   - KPI panel with remaining budget, total budget, and total expenses
   - Circular progress indicator
   - Expenses history table with all transactions in that budget

**How to Add an Expense to a Budget:**
1. Open the budget details page
2. Click "Add Budget Expense"
3. Enter the expense details
4. Click "Save"

### Savings

The savings page helps you set and track savings goals.

**Savings List:**
Each saving goal card shows:
- Goal name
- Description
- Progress percentage with visual bar
- Current amount and target amount
- Goal date
- "View Details" button

**How to Create a Savings Goal:**
1. Click "Add New Saving" button
2. Fill in the form:
   - **Saving Name** - Name your goal (e.g., "Emergency Fund", "New Phone")
   - **Target Amount** - How much you want to save
   - **Frequency** - How often you plan to save (Daily, Weekly, Monthly)
   - **Goal Date** - When you want to reach your goal
   - **Description** - Optional notes about your goal
3. Click "Save" to create

**How to View Savings Details:**
1. Click "View Details" on any savings card
2. You'll see:
   - Current amount and target amount
   - Remaining amount needed
   - Progress percentage with visual bar
   - Description
   - Start date and goal date
   - Daily saving needed (calculated automatically)
   - Transaction history (deposits and withdrawals)

**How to Add Money to Your Savings:**
1. Open the savings details page
2. Click "Add Saving Transaction"
3. Choose transaction type: Deposit or Withdrawal
4. Enter the amount and description
5. Click "Save"

### Categories

The categories page shows a visual breakdown of your spending and income by category.

**Available Expense Categories:**
- Bills
- Food
- Shopping
- Entertainment
- Health
- Transport
- Education
- Utilities
- Others

**Available Income Categories:**
- Salary
- Business
- Investments
- Gifts
- Others

**Using the Categories Page:**
1. Use the dropdown to switch between "Expenses" and "Income" view
2. View the bar chart showing amounts per category
3. Hover over bars to see exact amounts

### Reports

The reports page provides summaries of your financial activity over different periods.

**What Reports Show:**
- Date range (period start to end)
- Summary of your financial activity during that period
- Insights about budget adherence and spending patterns

### Notifications

The notifications page keeps you informed about important financial events.

**Types of Notifications:**
- **Warning** (Orange) - Budget exceeded alerts
- **Alert** - Bill reminders and payment due dates
- **Info** (Blue) - Budget warnings when approaching limits

**Managing Notifications:**
- Click "Mark all as read" to clear all unread notifications
- Click the checkmark on individual notifications to mark as read
- Click the trash icon to delete a notification

**When You Have No Notifications:**
- You'll see "No notifications" with a message "You're all caught up!"

### Settings

The settings page allows you to manage your account.

**Account Settings:**
- View and update your username
- View and update your email address
- See your profile picture (displays first letter of username)

**Security Settings:**
- **Change Password:**
  1. Enter your current password
  2. Enter your new password (minimum 8 characters)
  3. Confirm your new password
  4. Click "Save"

- **Privacy Options:**
  - Deactivate Account - Temporarily disable your account
  - Delete Account - Permanently remove your account and all data

## Navigation

### Sidebar Menu
The sidebar provides quick access to all main sections:
- **Dashboard** (house icon) - Financial overview
- **Transactions** (arrows icon) - Income and expense tracking
- **Budgets** (wallet icon) - Budget management
- **Savings** (piggy bank icon) - Savings goals
- **Categories** (tags icon) - Category breakdown
- **Reports** (chart icon) - Financial reports
- **Settings** (gear icon) - Account settings
- **Logout** (arrow icon) - Sign out of your account

### Header
- **Menu button** - Opens sidebar on mobile devices
- **Notifications** - Shows notification count badge
- **Profile** - Quick access to account settings

### Bonzi Budget Buddy
The friendly mascot in the corner is your iBudget assistant! Click on it for help and tips.

## Currency

All amounts in iBudget are displayed in Philippine Peso (PHP / ₱).

## Tips for Effective Use

1. **Log transactions regularly** - Add transactions daily or as they happen for accurate tracking
2. **Set realistic budgets** - Start with budgets based on your actual spending patterns
3. **Review your dashboard** - Check your charts weekly to understand spending patterns
4. **Use categories consistently** - Proper categorization helps with analysis
5. **Set savings goals** - Having clear goals motivates you to save more
6. **Check notifications** - Stay on top of budget warnings and alerts

## Troubleshooting

### Can't Log In?
- Check that your email is verified (check your inbox for verification email)
- Ensure you're using the correct email and password
- Try resetting your password using "Forgot Password?"
- If you see a rate limit message, wait a few minutes before trying again

### Transactions Not Saving?
- Ensure all required fields are filled (date, category, description, type, amount)
- Check your internet connection
- Refresh the page and try again

### Charts Not Loading?
- Refresh the page
- Check your internet connection
- Try using a different browser
- Clear your browser cache

### Forgot Your Password?
1. Go to the login page
2. Click "Forgot Password?"
3. Enter your email address
4. Check your email for the reset link
5. Click the link and create a new password

### Email Verification Issues?
- Check your spam/junk folder for the verification email
- Request a new verification email from the login page
- Ensure you're using the correct email address

## Frequently Asked Questions

**Q: Is iBudget free to use?**
A: Yes, iBudget is completely free to use.

**Q: Is my financial data secure?**
A: Yes, iBudget uses JWT authentication, encrypted data transmission, and follows security best practices to protect your data.

**Q: Can I use iBudget on my phone?**
A: Yes, iBudget is fully responsive and works on mobile browsers. Just visit https://i-budget.site/ on your phone.

**Q: Can I import transactions from my bank?**
A: Currently, iBudget requires manual entry of transactions. Bank integration may be added in future updates.

**Q: How do I delete my account?**
A: Go to Settings > Security Settings and click "Delete Account". This will permanently remove all your data.

**Q: Can I change my email address?**
A: Yes, go to Settings > Account Settings, update your email, and click Save.

**Q: What happens if I exceed my budget?**
A: You'll receive a notification warning you that you've exceeded your budget limit. The budget progress bar will show 100%+ spending.

**Q: How is the "Daily Saving Needed" calculated?**
A: It's calculated by dividing your remaining savings goal by the number of days until your goal date.

**Q: Can I edit or delete transactions after adding them?**
A: Yes, click the three-dot menu on any transaction to edit or delete it.

**Q: What categories are available for transactions?**
A: For expenses: Entertainment, Bills, Shopping. For income: Income category. Custom categories may be added in future updates.

## Contact and Support

**Website:** https://i-budget.site/

**Email Support:** team.appvengers12@gmail.com

**GitHub Repository:** https://github.com/PUP-BSIT/project-appvengers

**Bug Reports:** Submit issues on GitHub with screenshots and steps to reproduce

## About the Team

iBudget was developed by Team Appvengers from Polytechnic University of the Philippines:

- **Justine Delima** - Project Manager / Developer
- **John Matthew Arroyo** - Tech Lead / Developer
- **Ma. Bea Mae Ynion** - UI/UX Designer / Developer
- **James Michael Mejares** - DevOps Engineer / Tester / Developer

---

*Last Updated: December 2025*
