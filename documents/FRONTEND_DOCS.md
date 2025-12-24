# iBudget Frontend Documentation

## 1. Overview
The **iBudget** frontend is a modern Single Page Application (SPA) built with **Angular 20**. It provides a responsive, interactive user interface for personal finance management, featuring real-time updates, data visualization, and an AI-powered chatbot assistant.

## 2. Technology Stack

- **Framework:** Angular 20.3.15
- **Language:** TypeScript 5.9.2
- **Styling:** SCSS, Bootstrap 5.3.8, Bootstrap Icons
- **State Management:** Angular Signals & RxJS
- **Build Tool:** Angular CLI
- **Testing:** Jasmine (Unit), Karma (Runner), Playwright (E2E)
- **Visualization:** Chart.js, ng2-charts
- **HTTP Client:** Angular HttpClient

## 3. Project Structure (`frontend/ibudget`)

The application follows a modular structure where features are organized into their own directories.

```text
src/app/
├── auth-page/              # Authentication wrapper components
├── budgets/                # Budget management features
├── categories/             # Transaction category management
├── chatbot-sidebar/        # Bonzi Buddy AI assistant interface
├── dashboard/              # Main overview with analytics
├── email-verification/     # Email verification flows
├── guards/                 # Route guards (AuthGuard, etc.)
├── header/                 # Top navigation bar
├── landing-page/           # Public landing page
├── login/                  # User login form
├── notifications/          # Notification center logic & UI
├── reports/                # Detailed financial reports
├── services/               # Shared services (API, State)
├── settings/               # User preferences and profile
├── shared/                 # Shared UI components
├── sidebar/                # Main navigation sidebar
├── sign-up/                # User registration
├── transactions/           # Transaction CRUD operations
└── ...                     # Utility components (toast, etc.)
```

## 4. Key Features & Modules

### 4.1 Authentication & Security
- **Login/Signup:** Secure forms with validation.
- **Email Verification:** Handles token-based verification flows.
- **Guards:** Protects private routes (`AuthGuard`) preventing unauthorized access.
- **Interceptors:** Automatically attaches JWT tokens to outgoing requests (`AuthInterceptor`).

### 4.2 Dashboard & Analytics
- **Visualizations:** Uses `Chart.js` to render income vs. expense graphs.
- **Summary Cards:** Real-time calculation of total balance, income, and expenses.

### 4.3 Financial Management
- **Transactions:** Full CRUD capabilities for income and expenses.
- **Budgets:** Set spending limits per category with visual progress bars.
- **Savings:** Goal-tracking features for saving targets.

### 4.4 AI Chatbot (Bonzi Buddy)
- **Component:** `chatbot-sidebar`
- **Functionality:**
  - Integrated chat interface for financial advice.
  - Context-aware responses based on user data.
  - "Add Transaction" shortcuts generated from natural language.

### 4.5 Notifications
- **Real-time:** WebSocket integration (`@stomp/stompjs`) for instant alerts.
- **UI:** Toast notifications and a dedicated notification panel.
- **Categorization:** High/Medium/Low priority indicators.

## 5. Configuration

### 5.1 Environment Variables
Configuration is managed via `src/environments/`:
- `environment.ts`: Development settings.
- `environment.production.ts`: Production settings (API URLs, etc.).

### 5.2 Build & Serve
- **Run Dev Server:** `npm start` or `ng serve` (Access at `http://localhost:4200`)
- **Build Prod:** `npm run build`
- **Run Tests:** `npm test`

## 6. Styling
- **Global Styles:** `src/styles.scss` (includes Bootstrap imports and global variables).
- **Component Styles:** Scoped SCSS files for individual components.
- **Theme:** Custom color palette defined for "Appvengers" branding.

## 7. Testing
- **Unit Tests:** Co-located `*.spec.ts` files using Jasmine.
- **E2E Tests:** `playwright-tests/` directory for full browser automation scenarios.
