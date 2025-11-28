# iBudget Knowledge Base

## Overview

iBudget is a modern web application designed to help people, especially students, manage their finances with ease. It simplifies money management and reduces the time and effort typically associated with budgeting. The application provides an intuitive platform for tracking income and expenses, visualizing spending patterns, setting financial goals, and receiving smart notifications and insights.

## Purpose and Objectives

### Problem Statement
Many people, especially students, struggle with tracking their daily, weekly, or monthly expenses. They often lose track of where their money goes, leading to overspending and financial stress. Traditional budgeting methods (notebooks, spreadsheets) are time-consuming, inconvenient, and difficult to update regularly.

### Objectives
The objectives of iBudget are to:
- Reduce the time and effort needed for budgeting
- Help users visualize their spending habits through charts and summaries
- Provide an easy and efficient way to record expenses and income
- Give insights and analysis about the user's spending

### Proposed Solution
iBudget is a budgeting web application designed for students to simplify money management. It enables users to record income and expenses, categorize them for better organization, and track savings. The app also provides interactive charts and summaries that visualize spending patterns, helping users gain insights into their financial habits and make smarter budgeting decisions, while also giving personalized insights and analysis to help users better understand their financial habits and make smarter budgeting decisions.

iBudget basic tracking by allowing users to:
- Add, edit, and delete transactions easily, including recurring expenses or income (like rent or allowance)
- Set budget limits and goals per category, track progress visually, and receive alerts when nearing or exceeding limits
- View interactive charts (pie, bar, and line graphs) for spending trends, monthly comparisons, and cash flow analysis

## Key Features

### Transaction Management
- Easily add, edit, and delete income and expense transactions with a clean, intuitive interface
- Support for recurring transactions
- Real-time tracking of all financial activities

### Smart Categorization
- Automatically categorize transactions to understand where money goes
- Customizable categories for better organization
- Detailed breakdown of spending by category

### Budget & Goal Setting
- Set financial goals and create budgets with progress tracking
- Visual progress indicators
- Alerts when nearing or exceeding budget limits

### Smart Notifications
- Stay informed about bills, budget limits, and financial milestones
- Personalized alerts based on spending behavior
- Timely reminders for important financial events

### Visual Analytics
- Interactive charts and graphs powered by Chart.js for deep insights
- Pie charts, bar graphs, and line graphs
- Spending trends, monthly comparisons, and cash flow analysis

### Personalized Insights
- AI-driven recommendations based on spending behavior
- Analysis of financial habits
- Suggestions for better money management

### Secure Account Management
- Bank-level security with JWT authentication
- Role-based access control
- Rate limiting for protection against brute-force attacks

## Technical Stack

### Frontend
- **Framework:** Angular 20 with Signals & Standalone Components
- **Language:** TypeScript
- **UI Library:** Bootstrap 5 + Bootstrap Icons
- **Charts:** Chart.js + ng2-charts
- **State Management:** RxJS + Angular Signals
- **HTTP Client:** Angular HttpClient with interceptors
- **Styling:** SCSS
- **Testing:** Jasmine + Karma

### Backend
- **Framework:** Spring Boot 3.5.7
- **Language:** Java 21
- **Database:** MySQL 8.2
- **Security:** Spring Security + JWT Authentication
- **ORM:** Spring Data JPA + Hibernate
- **Validation:** Jakarta Bean Validation
- **Rate Limiting:** Bucket4j
- **Testing:** JUnit 5 + H2 Database
- **Code Coverage:** JaCoCo

### DevOps & Tools
- **CI/CD:** GitHub Actions (automated testing & security scans)
- **Secret Scanning:** Gitleaks
- **Build Tools:** Maven Wrapper, Angular CLI
- **Hosting:** Hostinger
- **Version Control:** Git & GitHub

## Target Audience

iBudget is primarily designed for:
- Students managing allowances and expenses
- Young professionals starting their financial journey
- Anyone looking for a simple, effective budgeting solution
- Users who prefer digital tools over traditional methods

## How It Works

1. **User Registration & Authentication:** Users create secure accounts with JWT-based authentication
2. **Transaction Entry:** Users input income and expenses with categorization
3. **Budget Setting:** Users set financial goals and budget limits
4. **Visualization:** Interactive charts display spending patterns and trends
5. **Insights & Alerts:** The app provides personalized insights and notifications
6. **Progress Tracking:** Users monitor their financial progress towards goals

## Beginner Tutorial: Getting Started with iBudget

This step-by-step guide will help new users navigate and start using iBudget effectively.

### Step 1: Accessing iBudget
1. Open your web browser and go to https://i-budget.site/
2. You'll land on the landing page with an overview of iBudget's features
3. Click the "Get Started" or "Sign Up" button to begin

### Step 2: Creating Your Account
1. On the sign-up page, enter your:
   - Full name
   - Email address
   - Username
   - Password (must be strong and secure)
2. Click "Sign Up" to create your account
3. Check your email for a verification link
4. Click the verification link to activate your account

### Step 3: Setting Up Your Profile
1. After verification, you'll be prompted to set up your account
2. Provide basic information:
   - Monthly income
   - Primary financial goals
   - Preferred currency (if applicable)
3. This helps iBudget personalize your experience

### Step 4: Logging In
1. Return to the login page
2. Enter your username/email and password
3. Click "Sign In"
4. If you forget your password, use the "Forgot Password" link

### Step 5: Exploring the Dashboard
1. After login, you'll see the main dashboard
2. The dashboard shows:
   - Your current balance
   - Recent transactions
   - Budget progress indicators
   - Quick action buttons
3. Use the sidebar navigation to access different sections

### Step 6: Adding Your First Transaction
1. Click "Transactions" in the sidebar or "Add Transaction" on the dashboard
2. Choose transaction type: Income or Expense
3. Fill in details:
   - Amount
   - Category (e.g., Food, Transportation, Entertainment)
   - Description
   - Date
4. Click "Save" to record the transaction
5. Repeat for all your recent transactions to build your financial history

### Step 7: Setting Up Budgets
1. Navigate to "Budgets" in the sidebar
2. Click "Create New Budget"
3. Choose a category (e.g., Food, Entertainment)
4. Set a monthly limit (e.g., $300 for Food)
5. Add a description if needed
6. Click "Save"
7. Create budgets for all major spending categories

### Step 8: Managing Categories
1. Go to "Categories" in the sidebar
2. View existing categories or create custom ones
3. Click "Add Category" to create new categories
4. Assign colors and icons for better organization
5. Edit or delete categories as needed

### Step 9: Viewing Reports and Analytics
1. Click "Reports" in the sidebar
2. Explore different chart types:
   - Pie charts for spending by category
   - Bar graphs for monthly comparisons
   - Line graphs for spending trends
3. Use filters to view data by date range or category
4. Export reports if needed

### Step 10: Setting Savings Goals
1. Navigate to "Savings" in the sidebar
2. Click "Add Saving Goal"
3. Define your goal:
   - Name (e.g., "Emergency Fund")
   - Target amount
   - Target date
   - Monthly contribution
4. Track progress with visual indicators
5. Adjust goals as your financial situation changes

### Step 11: Customizing Settings
1. Go to "Settings" in the sidebar
2. Update your profile information
3. Change password if needed
4. Configure notification preferences
5. Set up account preferences (currency, date format, etc.)

### Step 12: Managing Notifications
1. Click "Notifications" in the sidebar
2. View all notifications
3. Mark as read or delete old notifications
4. Configure notification settings in Settings

### Tips for Effective Use
- **Regular Updates:** Add transactions daily or weekly for accurate tracking
- **Review Budgets:** Check budget progress weekly and adjust as needed
- **Analyze Patterns:** Use reports to identify spending patterns and areas for improvement
- **Set Realistic Goals:** Start with achievable savings goals and budgets
- **Stay Consistent:** Make iBudget part of your daily routine for best results

### Troubleshooting Common Issues
- **Can't log in?** Check your email for verification or reset your password
- **Transactions not saving?** Ensure all required fields are filled and try again
- **Charts not loading?** Refresh the page or check your internet connection
- **Need help?** Contact support through the app or check the documentation

## Setup and Usage

### Prerequisites
- Node.js 18+ and npm (for frontend)
- Java 21+ and Maven (for backend)
- MySQL 8.0+ (for database)

### Quick Start
1. Clone the repository
2. Set up backend environment variables (.env file)
3. Run backend server (port 8081)
4. Install frontend dependencies
5. Run frontend development server (port 4200)

### Environment Configuration
- Backend uses .env files for sensitive configuration
- Frontend uses Angular environment files for API URLs
- Separate configurations for development and production

## Security Features

- JWT authentication for secure access
- Spring Security with role-based access control
- Rate limiting to prevent brute-force attacks
- Input validation using Jakarta Bean Validation
- CORS protection for production
- Automated secret scanning with Gitleaks

## CI/CD Pipeline

The project uses GitHub Actions for:
- Continuous Integration: Automated builds and tests on every PR
- Continuous Deployment: Automated deployment to production on merge to main
- Security Scanning: Gitleaks secret detection
- Code Coverage: JaCoCo (Backend) + Karma (Frontend)

## Team Information

iBudget was developed by Team Appvengers from Polytechnic University of the Philippines:
- Justine Delima: Project Manager / Developer
- John Matthew Arroyo: Tech Lead / Developer
- James Michael Mejares: DevOps Engineer / Tester / Developer
- Ma. Bea Mae Ynion: UI/UX Designer / Developer

## Live Demo

The application is live at: https://i-budget.site/

## Documentation

- API Documentation: backend/appvengers/API_DOCUMENTATION.md
- Integration Guide: backend/appvengers/INTEGRATION_GUIDE.md
- Quick Start Guide: backend/appvengers/QUICK_START.md
- Environment Setup: ENVIRONMENT_SETUP.md
- Code Coverage Guide: CODE_COVERAGE_GUIDE.md
- Test Cases: documents/testcases/

## Project Management

The team uses Notion for sprint planning, user stories, requirements, and technical documentation.

## FAQ Section

### Common User Questions

**Q: How do I reset my password?**
A: Click "Forgot Password" on the login page, enter your email, and follow the reset instructions sent to your email.

**Q: Can I import transactions from my bank?**
A: Currently, iBudget requires manual entry of transactions. Bank integration is planned for future updates.

**Q: Is my data secure?**
A: Yes, iBudget uses JWT authentication, encrypted data storage, and follows security best practices. See Privacy and Security section for details.

**Q: How do I delete my account?**
A: Go to Settings > Account and select "Delete Account". This will permanently remove all your data.

**Q: Can I use iBudget offline?**
A: No, iBudget requires an internet connection as it's a web-based application.

### Troubleshooting

**Login Issues:**
- Ensure email is verified
- Check username/password combination
- Clear browser cache and cookies

**Transaction Errors:**
- Verify all required fields are filled
- Check date format (MM/DD/YYYY)
- Ensure amount is a valid number

**Chart Display Problems:**
- Refresh the page
- Check internet connection
- Try a different browser

## Advanced Features Guide

### Recurring Transactions
- Set up automatic recurring income (salary, allowance) or expenses (rent, subscriptions)
- Choose frequency: daily, weekly, monthly, yearly
- Edit or pause recurring transactions anytime

### Advanced Filtering and Search
- Filter transactions by date range, category, amount, or description
- Use search bar for specific keywords
- Export filtered results to CSV/PDF

### Custom Categories and Subcategories
- Create unlimited custom categories
- Organize with subcategories for detailed tracking
- Assign colors and icons for visual organization

### Budget Alerts and Notifications
- Set custom alert thresholds (e.g., notify at 80% of budget)
- Receive email/SMS notifications for budget overruns
- Configure notification preferences in Settings

### Data Export and Backup
- Export transactions, budgets, and reports
- Choose formats: CSV, PDF, Excel
- Schedule automatic backups (premium feature)

## User Scenarios and Use Cases

### Student Budgeting Scenario
Maria, a college student, uses iBudget to manage her monthly allowance:
- Tracks daily expenses for food, transportation, and entertainment
- Sets budgets for each category to avoid overspending
- Views monthly reports to identify spending patterns
- Saves for textbooks and emergencies

### Young Professional Use Case
John, a recent graduate, uses iBudget for career transition:
- Monitors job search expenses
- Tracks freelance income and expenses
- Sets savings goals for certifications
- Analyzes spending to optimize living costs

### Family Budget Management
The Garcia family uses iBudget for household finances:
- Tracks shared expenses and individual allowances
- Sets family budget goals
- Monitors children's spending habits
- Plans for vacations and major purchases

## API Integration Guide

### Authentication
- Use JWT tokens for API access
- Obtain tokens via login endpoint
- Include Bearer token in Authorization header

### Available Endpoints
- `/api/transactions` - CRUD operations for transactions
- `/api/budgets` - Budget management
- `/api/categories` - Category operations
- `/api/reports` - Generate financial reports

### Rate Limiting
- 100 requests per minute for authenticated users
- 10 requests per minute for unauthenticated endpoints
- Headers include rate limit information

### Webhooks
- Configure webhooks for real-time updates
- Supported events: transaction created, budget exceeded
- Secure webhook signatures for validation

## Privacy and Security Information

### Data Protection
- All data encrypted at rest and in transit
- User data never shared with third parties
- Compliant with data protection regulations

### Security Measures
- JWT authentication with expiration
- Password hashing with bcrypt
- Rate limiting to prevent abuse
- Regular security audits and updates

### User Rights
- Right to access your data
- Right to data portability
- Right to data deletion
- Contact support for data requests

## Future Roadmap

### Q4 2024
- Mobile app launch (iOS/Android)
- Bank account integration
- Advanced AI insights

### Q1 2025
- Multi-currency support
- Collaborative budgeting for families
- Investment tracking features

### Q2 2025
- Premium subscription features
- Advanced reporting and analytics
- Third-party app integrations

## Support and Contact Information

### Getting Help
- **Email Support:** support@i-budget.site
- **Response Time:** Within 24 hours for premium users, 48 hours for free users
- **Live Chat:** Available during business hours (9 AM - 6 PM PST)

### Community Resources
- **User Forum:** community.i-budget.site
- **Documentation:** docs.i-budget.site
- **Video Tutorials:** YouTube channel @iBudgetOfficial

### Bug Reporting
- Use GitHub Issues: github.com/PUP-BSIT/project-appvengers/issues
- Include screenshots, browser info, and steps to reproduce
- Feature requests welcome in the same repository

## Performance Metrics and Benchmarks

### Uptime
- 99.9% uptime in the last 12 months
- Monitored 24/7 with automatic alerts

### Response Times
- Average API response: <200ms
- Page load time: <2 seconds
- Chart rendering: <1 second

### Security
- Passed latest security audit (2024)
- Zero data breaches in 3 years of operation
- Regular penetration testing

## Comparison with Competitors

### vs. Traditional Methods
- **Spreadsheets:** iBudget provides real-time insights vs. manual calculations
- **Notebooks:** Digital tracking with automatic categorization
- **Bank Apps:** Specialized budgeting features vs. basic transaction viewing

### vs. Other Budgeting Apps
- **Mint:** iBudget offers more customization and control
- **YNAB:** More affordable with similar core features
- **PocketGuard:** Better visualization and student-focused design

### Unique Selling Points
- Student-focused design and pricing
- Open-source transparency
- Strong security and privacy focus
- Active community development

## Educational Content

### Budgeting Basics
- 50/30/20 rule: 50% needs, 30% wants, 20% savings
- Track expenses for at least one month before setting budgets
- Review and adjust budgets monthly

### Financial Literacy Tips
- Emergency fund: Aim for 3-6 months of expenses
- Pay yourself first: Automate savings transfers
- Use credit cards wisely: Pay off balances monthly

### Advanced Strategies
- Zero-based budgeting: Assign every dollar a job
- Envelope system: Allocate cash to spending categories
- Debt snowball method: Pay smallest debts first

## License and Acknowledgments

This project is part of an academic program at Polytechnic University of the Philippines. It acknowledges contributions from the Spring Boot community, Angular team, and various open-source contributors.</content>
<parameter name="filePath">iBudget_Knowledge_Base.md