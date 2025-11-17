<div align="center">

# 💰 iBudget

**Smart Personal Finance Management Made Simple**

[![Live Demo](https://img.shields.io/badge/demo-live-success?style=for-the-badge&logo=vercel)](https://i-budget.site/)
[![CI](https://img.shields.io/github/actions/workflow/status/PUP-BSIT/project-appvengers/ci.yml?branch=main&style=for-the-badge&logo=github&label=CI)](https://github.com/PUP-BSIT/project-appvengers/actions/workflows/ci.yml)
[![CD](https://img.shields.io/github/actions/workflow/status/PUP-BSIT/project-appvengers/cd.yml?branch=main&style=for-the-badge&logo=github&label=CD)](https://github.com/PUP-BSIT/project-appvengers/actions/workflows/cd.yml)
[![Security](https://img.shields.io/github/actions/workflow/status/PUP-BSIT/project-appvengers/gitleaks.yml?branch=main&style=for-the-badge&logo=security&label=Security)](https://github.com/PUP-BSIT/project-appvengers/actions/workflows/gitleaks.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=for-the-badge)](LICENSE)

[Live Demo](https://i-budget.site/) • [Documentation](documents/) • [API Docs](backend/appvengers/API_DOCUMENTATION.md) • [Report Bug](https://github.com/PUP-BSIT/project-appvengers/issues)

</div>

---

## 📖 About

**iBudget** is a modern web application designed to help people, especially students, manage their finances with ease. Built with cutting-edge technologies, it simplifies money management and reduces the time and effort typically associated with budgeting.

### 🎯 Problem Statement

Students and young professionals often struggle with:
- ❌ Overspending and financial stress
- ❌ Lack of visibility into spending habits
- ❌ Difficulty tracking daily, weekly, and monthly expenses
- ❌ No clear financial goals or budgets

### ✨ Our Solution

iBudget provides an intuitive, efficient platform to:
- ✅ Track all income and expenses in real-time
- ✅ Visualize spending patterns with interactive charts
- ✅ Set and achieve financial goals
- ✅ Receive smart notifications and insights
- ✅ Make informed financial decisions

---

## 🚀 Key Features

<table>
<tr>
<td width="50%">

### 💳 Transaction Management
Easily add, edit, and delete income and expense transactions with a clean, intuitive interface.

### 📊 Smart Categorization
Automatically categorize transactions to understand where your money goes.

### 🎯 Budget & Goal Setting
Set financial goals and create budgets with progress tracking.

</td>
<td width="50%">

### 🔔 Smart Notifications
Stay informed about bills, budget limits, and financial milestones.

### 📈 Visual Analytics
Interactive charts and graphs powered by Chart.js for deep insights.

### 🤖 Personalized Insights
AI-driven recommendations based on your spending behavior.

### 🔒 Secure Account Management
Bank-level security with JWT authentication and rate limiting.

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

### Frontend
![Angular](https://img.shields.io/badge/Angular_20-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap_5-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)
![SCSS](https://img.shields.io/badge/SCSS-CC6699?style=for-the-badge&logo=sass&logoColor=white)

- **Framework:** Angular 20 with Signals & Standalone Components
- **State Management:** RxJS + Angular Signals
- **UI Library:** Bootstrap 5 + Bootstrap Icons
- **Charts:** Chart.js + ng2-charts
- **HTTP Client:** Angular HttpClient with interceptors
- **Testing:** Jasmine + Karma

### Backend
![Spring Boot](https://img.shields.io/badge/Spring_Boot_3-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![Java](https://img.shields.io/badge/Java_21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

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
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)
![Hostinger](https://img.shields.io/badge/Hostinger-673DE6?style=for-the-badge&logo=hostinger&logoColor=white)
![Maven](https://img.shields.io/badge/Maven-C71A36?style=for-the-badge&logo=apachemaven&logoColor=white)
![Gitleaks](https://img.shields.io/badge/Gitleaks-000000?style=for-the-badge&logo=git&logoColor=white)

- **CI/CD:** GitHub Actions (automated testing & security scans)
- **Secret Scanning:** Gitleaks
- **Build Tools:** Maven Wrapper, Angular CLI
- **Hosting:** Hostinger
- **Version Control:** Git & GitHub

---

## 🌐 Live Demo

🔗 **Production:** [https://i-budget.site/](https://i-budget.site/)

**Hosting:** Hostinger with MySQL database backend

---

## 📦 Project Structure

```
project-appvengers/
├── frontend/ibudget/          # Angular 20 application
│   ├── src/app/               # Components, services, models
│   ├── src/environments/      # Environment configurations
│   └── src/styles/            # Global SCSS styles
├── backend/appvengers/        # Spring Boot API
│   ├── src/main/java/         # Java source code
│   │   └── com.backend.appvengers/
│   │       ├── controller/    # REST controllers
│   │       ├── service/       # Business logic
│   │       ├── repository/    # Data access layer
│   │       ├── entity/        # JPA entities
│   │       ├── dto/           # Data transfer objects
│   │       ├── security/      # JWT & authentication
│   │       └── config/        # Spring configuration
│   └── src/test/              # Unit & integration tests
├── documents/                 # Project documentation & diagrams
├── coverage/                  # Code coverage reports
└── .github/workflows/         # CI/CD pipelines
```

---

## 🚦 Getting Started

### Prerequisites

- **Frontend:** Node.js 18+ and npm
- **Backend:** Java 21+ and Maven
- **Database:** MySQL 8.0+

### Quick Start

#### 1️⃣ Clone the Repository
```bash
git clone git@github.com:PUP-BSIT/project-appvengers.git
cd project-appvengers
```

#### 2️⃣ Backend Setup
```bash
cd backend/appvengers

# Copy environment template
copy .env.example .env  # Windows
cp .env.example .env    # Mac/Linux

# Edit .env with your database credentials
# DB_URL, DB_USERNAME, DB_PASSWORD, JWT_SECRET

# Build and run
./mvnw clean install    # Mac/Linux
.\mvnw clean install    # Windows

./mvnw spring-boot:run  # Mac/Linux
.\mvnw spring-boot:run  # Windows
```
**Backend runs on:** `http://localhost:8081`

#### 3️⃣ Frontend Setup
```bash
cd frontend/ibudget

# Install dependencies
npm install

# Start development server
npm start
```
**Frontend runs on:** `http://localhost:4200`

### 🧪 Running Tests

**Frontend:**
```bash
cd frontend/ibudget
npm test              # Run tests with coverage (headless)
npm run test:watch    # Run tests with Chrome UI
```

**Backend:**
```bash
cd backend/appvengers
./mvnw test           # Mac/Linux
.\mvnw test           # Windows
```

**View Coverage Reports:**
- Frontend: `coverage/frontend/index.html`
- Backend: `coverage/backend/index.html`

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [API Documentation](backend/appvengers/API_DOCUMENTATION.md) | Complete REST API reference |
| [Integration Guide](backend/appvengers/INTEGRATION_GUIDE.md) | Frontend-Backend integration |
| [Quick Start Guide](backend/appvengers/QUICK_START.md) | Setup and deployment guide |
| [Environment Setup](ENVIRONMENT_SETUP.md) | Environment configuration |
| [Code Coverage Guide](CODE_COVERAGE_GUIDE.md) | Testing and coverage setup |
| [Sprint Documents](documents/sprints/) | Sprint planning and retrospectives |
| [Test Cases](documents/testcases/) | Comprehensive test documentation |

---

## 🔒 Security

- **🔐 JWT Authentication:** Secure token-based authentication
- **🛡️ Spring Security:** Role-based access control
- **⏱️ Rate Limiting:** Bucket4j for brute-force protection
- **🔍 Secret Scanning:** Automated Gitleaks checks via GitHub Actions
- **✅ Input Validation:** Jakarta Bean Validation
- **🔄 CORS Protection:** Configured for production environment

---

## 📊 CI/CD Pipeline

Our GitHub Actions workflows ensure code quality and automated deployment:

- ✅ **Continuous Integration** - Automated builds and tests on every PR
- 🚀 **Continuous Deployment** - Automated deployment to production on merge to main
- 🔒 **Security Scanning** - Gitleaks secret detection
- 📈 **Code Coverage** - JaCoCo (Backend) + Karma (Frontend)
- 🎉 **PR Greetings** - Automated contributor welcome

**Deployment Flow:** `Push to main` → `CI Tests` → `Build Artifacts` → `Deploy to prod branch` → `VPS Deployment` → `Live at i-budget.site`

---

## 📝 Project Management

**Workspace:** [Notion Project Timeline](https://www.notion.so/2687c41b891680988424fc18255e652a?v=2687c41b8916806db623000c9428995b&source=copy_link)

We use Notion for:
- Sprint planning and tracking
- User stories and requirements
- Technical documentation
- Team collaboration

---

## 👥 The Appvengers Team

<div align="center">

<table>
  <tr>
    <td align="center" width="25%">
      <img src="https://github.com/identicons/pm.png" width="100px;" alt="PM"/><br />
      <sub><b>Justine Delima</b></sub><br />
      <sup>Project Manager / Developer</sup>
    </td>
    <td align="center" width="25%">
      <img src="https://github.com/identicons/tl.png" width="100px;" alt="TL"/><br />
      <sub><b>John Matthew Arroyo</b></sub><br />
      <sup>Tech Lead / Developer</sup>
    </td>
    <td align="center" width="25%">
      <img src="https://github.com/identicons/qa.png" width="100px;" alt="QA"/><br />
      <sub><b>James Michael Mejares</b></sub><br />
      <sup>DevOps Engineer / Tester / Developer</sup>
    </td>
    <td align="center" width="25%">
      <img src="https://github.com/identicons/ux.png" width="100px;" alt="UX"/><br />
      <sub><b>Ma. Bea Mae Ynion</b></sub><br />
      <sup>UI/UX Designer / Developer</sup>
    </td>
  </tr>
</table>

</div>

---

## 📜 License

This project is part of an academic program at **Polytechnic University of the Philippines**.

---

## 🙏 Acknowledgments

- **PUP BSIT** - For the opportunity to build this project
- **Spring Boot Community** - For excellent documentation
- **Angular Team** - For the powerful framework
- **Open Source Contributors** - For the amazing tools and libraries

---

<div align="center">

**Made with ❤️ by Team Appvengers**

[⬆ Back to Top](#-ibudget)

</div>