# 📊 Code Coverage Guide for Developers

A comprehensive guide for running, interpreting, and improving code coverage in the iBudget Angular application.

---

## 🚀 Quick Start - Running Tests with Coverage

### Frontend (Angular + Karma)

#### Method 1: Using npm script (Recommended)
```bash
cd frontend/ibudget
npm test
```
This already runs with code coverage enabled (`--code-coverage` flag is in package.json)

#### Method 2: Manual command
```bash
cd frontend/ibudget
ng test --code-coverage --watch=false --browsers=ChromeHeadless
```

#### Method 3: With live browser (for debugging)
```bash
ng test --code-coverage --browsers=Chrome
```

### Backend (Spring Boot + JaCoCo)

#### Method 1: Using Maven wrapper (Recommended)
```bash
cd backend/appvengers
mvnw clean test
```
This runs all tests and automatically generates JaCoCo coverage reports.

#### Method 2: On Unix/Mac systems
```bash
cd backend/appvengers
./mvnw clean test
```

#### Method 3: Using installed Maven
```bash
cd backend/appvengers
mvn clean test
```

**Note:** The JaCoCo plugin is configured to automatically generate coverage reports during the `test` phase.

---

## 📁 Where to Find the Reports

### Quick Access (Recommended)

Coverage reports are accessible from the **project root** via symlinks:
```
coverage/
├── frontend/index.html  ← Frontend coverage (Angular)
└── backend/index.html   ← Backend coverage (Spring Boot/JaCoCo)
```

**To view reports:**
```bash
# From project root
start coverage/frontend/index.html  # Frontend
start coverage/backend/index.html   # Backend
```

### Original Locations

After running tests, coverage reports are generated in:
```
frontend/ibudget/coverage/
├── index.html          ← MAIN REPORT (open this in browser)
├── app/                ← Component-specific reports
├── services/           ← Service-specific reports
├── lcov.info           ← For CI/CD tools
└── [other files]       ← Supporting files

backend/appvengers/target/site/jacoco/
├── index.html          ← Backend coverage report
└── [other files]       ← JaCoCo generated files
```

**Alternative viewing methods:**
- **Windows**: `start frontend/ibudget/coverage/index.html`
- **Mac/Linux**: `open frontend/ibudget/coverage/index.html`
- **Or**: Just double-click the `index.html` file in File Explorer

---

## ⚙️ First-Time Setup for Team Members

**Important:** After cloning the repo or pulling these changes, you need to enable symlink support in Git:

### Step 1: Enable Git Symlinks

```bash
# Enable symlinks for this repository
git config core.symlinks true
```

### Step 2: Pull or Re-checkout

```bash
# If you already pulled before enabling symlinks, re-checkout:
git checkout HEAD -- coverage/

# Or simply pull normally:
git pull origin DevOps
```

The `coverage/` folder will now contain working symlinks! ✅

**Verification:**
```bash
# Check symlinks were created
dir /AL coverage  # Windows
ls -la coverage   # Mac/Linux

# Should show:
# coverage/frontend -> frontend/ibudget/coverage
# coverage/backend -> backend/appvengers/target/site/jacoco
```

---

## 📖 How to Interpret the Coverage Report

### Frontend Coverage (Karma/Istanbul)

#### 1️⃣ Understanding the 4 Coverage Metrics

When you open `coverage/frontend/index.html`, you'll see 4 columns:

| Metric | What It Measures | Example |
|--------|------------------|---------|
| **Statements** | % of executable lines run | `const x = 5;` ✅ if executed |
| **Branches** | % of if/else paths tested | `if (x > 5) {...} else {...}` ✅ if both tested |
| **Functions** | % of functions called | `function test() {...}` ✅ if called |
| **Lines** | % of physical lines executed | Similar to statements |

#### 2️⃣ Color Coding

- 🟢 **Green (80-100%)**: Good coverage
- 🟡 **Yellow (50-79%)**: Medium coverage - needs improvement
- 🔴 **Red (<50%)**: Low coverage - action required

#### 3️⃣ Current Project Stats (as of last run)
```
Statements   : 49.86% (187/375) 🟡
Branches     : 13.51% (10/74)   🔴  ← Needs most work!
Functions    : 44.53% (57/128)  🔴
Lines        : 48.82% (166/340) 🟡
```

### Backend Coverage (JaCoCo)

#### 1️⃣ Understanding JaCoCo Metrics

When you open `coverage/backend/index.html`, you'll see these columns:

| Metric | What It Measures | Example |
|--------|------------------|---------|
| **Instructions** | % of bytecode instructions executed | Most granular metric |
| **Branches** | % of if/else/switch paths tested | Decision points in code |
| **Lines** | % of source code lines executed | Physical lines covered |
| **Methods** | % of methods invoked | Method-level coverage |
| **Classes** | % of classes instantiated/used | Class-level coverage |

#### 2️⃣ JaCoCo Color Coding

- 🟢 **Green background**: Fully covered
- 🟡 **Yellow background**: Partially covered (some branches missed)
- 🔴 **Red background**: Not covered
- **Diamond indicators**: Show branch coverage (green = all branches, yellow = partial, red = none)

#### 3️⃣ Navigating JaCoCo Reports

1. **Package view**: Shows coverage by Java package
2. **Class view**: Click a package to see individual classes
3. **Source view**: Click a class to see line-by-line coverage with color coding

---

## 🔍 Navigating the Report

### Frontend Reports (Karma/Istanbul)

#### Step 1: Main Dashboard (`coverage/frontend/index.html`)
- Shows overall project coverage
- Lists all directories (app/, services/)
- Click any directory/file name to drill down

#### Step 2: File-Level View
- Click on a specific file (e.g., `dashboard.ts`)
- See which lines are covered/uncovered
- **Green highlight** = Line was tested ✅
- **Red highlight** = Line was NOT tested ❌
- **Yellow highlight** = Partial branch coverage ⚠️

#### Step 3: Understanding Line Numbers
```typescript
1x  | constructor() { }           // ✅ Called once
5x  | getData() {                 // ✅ Called 5 times
    |   if (condition) {          // ❌ Never tested
    |     return true;            // ❌ Never reached
    |   }
3x  |   return false;             // ✅ Called 3 times
    | }
```

### Backend Reports (JaCoCo)

#### Step 1: Main Dashboard (`coverage/backend/index.html`)
- Shows coverage by package (e.g., `com.appvengers.budgetmanagement`)
- Displays all JaCoCo metrics (Instructions, Branches, Lines, Methods, Classes)
- Click any package to drill down

#### Step 2: Class-Level View
- Lists all classes in the selected package
- Shows coverage for each class
- Click a class name to see source code

#### Step 3: Source Code View
```java
// Green line = fully covered
public void saveUser(User user) {
    if (user != null) {           // Yellow = partial branch (only true tested)
        repository.save(user);    // Green = covered
    } else {
        throw new Exception();    // Red = not covered
    }
}
```

**JaCoCo Line Indicators:**
- **Green diamond** (💚): All branches covered
- **Yellow diamond** (💛): Some branches covered
- **Red diamond** (❤️): No branches covered
- **Line count (on left)**: Number of times line was executed

---

## 🎯 Practical Example - Reading a Component Report

Let's say you open `coverage/app/dashboard/dashboard.ts.html`:

```typescript
// Example coverage view
   1x | import { Component } from '@angular/core';    ✅ Covered
      |
   1x | export class DashboardComponent {             ✅ Covered
   1x |   constructor() { }                           ✅ Covered
      |
      |   ngOnInit() {                                ❌ Not covered
      |     this.loadData();                          ❌ Not covered
      |   }
      |
   5x |   loadData() {                                ✅ Covered (called 5 times)
   5x |     return this.service.getData();            ✅ Covered
      |   }
      |
      |   handleError() {                             ❌ Not covered
      |     console.error('Error occurred');          ❌ Not covered
      |   }
      | }
```

**What this tells you:**
- ✅ Constructor is tested
- ✅ `loadData()` is well tested (called 5 times)
- ❌ `ngOnInit()` is never called in tests → **Write test for this!**
- ❌ `handleError()` is never tested → **Write test for error handling!**

---

## 🛠️ How to Improve Coverage

### Frontend (Angular/TypeScript)

#### 1. Identify Uncovered Code
```bash
# Run tests and open report
cd frontend/ibudget
npm test
start ../../coverage/frontend/index.html
```

#### 2. Look for Red/Yellow Files
- Sort by coverage percentage (click column headers)
- Focus on files with <50% coverage first

#### 3. Write Tests for Uncovered Lines
Example: If `handleError()` is uncovered:

```typescript
// In dashboard.spec.ts
it('should handle errors properly', () => {
  spyOn(console, 'error');  // Spy on console.error
  component.handleError();
  expect(console.error).toHaveBeenCalledWith('Error occurred');
});
```

#### 4. Re-run Tests
```bash
npm test
```

#### 5. Verify Improvement
- Open coverage report again
- Check if `handleError()` is now green ✅

### Backend (Java/Spring Boot)

#### 1. Identify Uncovered Code
```bash
# Run tests and open report
cd backend/appvengers
mvnw clean test
start ../../coverage/backend/index.html
```

#### 2. Analyze JaCoCo Report
- Look for red/yellow packages and classes
- Focus on service and controller classes first
- Check branch coverage for complex logic

#### 3. Write Unit Tests for Uncovered Code
Example: Testing a service method:

```java
// In UserServiceTest.java
@Test
public void testSaveUser_WithValidUser_ShouldSave() {
    // Arrange
    User user = new User("John", "john@example.com");
    when(userRepository.save(any(User.class))).thenReturn(user);
    
    // Act
    User result = userService.saveUser(user);
    
    // Assert
    assertNotNull(result);
    verify(userRepository, times(1)).save(user);
}

@Test
public void testSaveUser_WithNullUser_ShouldThrowException() {
    // Act & Assert
    assertThrows(IllegalArgumentException.class, () -> {
        userService.saveUser(null);
    });
}
```

#### 4. Re-run Tests
```bash
mvnw clean test
```

#### 5. Verify Improvement
- Refresh JaCoCo report
- Check if coverage metrics improved
- Ensure all branches are now green

---

## 💡 Best Practices for Your Team

### ✅ DO:

1. **Run tests before committing**
   ```bash
   npm test
   ```

2. **Check coverage for new features**
   - Aim for >80% coverage on new code

3. **Focus on critical paths first**
   - User authentication
   - Data submission/validation
   - Error handling

4. **Use coverage to find edge cases**
   - Yellow branches = missing if/else tests
   - Red functions = completely untested features

### ❌ DON'T:

1. **Don't aim for 100% blindly**
   - Some code doesn't need tests (simple getters/setters)
   - Focus on business logic

2. **Don't write tests just for coverage**
   - Write meaningful tests that catch bugs
   - Coverage is a tool, not the goal

3. **Don't ignore branch coverage**
   - 13.51% branch coverage means most if/else paths are untested
   - This is where bugs hide!

---

## 📊 Coverage Goals for This Project

Based on current state, here are recommended targets:

### Frontend Coverage Goals

| Metric | Current | Short-term Goal | Long-term Goal |
|--------|---------|-----------------|----------------|
| Statements | 49.86% | **60%** | 80% |
| Branches | 13.51% 🚨 | **40%** | 70% |
| Functions | 44.53% | **60%** | 80% |
| Lines | 48.82% | **60%** | 80% |

**Priority:** Focus on **branch coverage** first - it's critically low!

### Backend Coverage Goals

| Metric | Target | Priority |
|--------|--------|----------|
| Instructions | **70%** | Medium |
| Branches | **60%** | High |
| Lines | **70%** | Medium |
| Methods | **75%** | High |
| Classes | **80%** | Medium |

**Priority:** Focus on **service and controller classes** - they contain critical business logic.

---

## 🐛 Troubleshooting

### Frontend Issues

#### Issue: "Coverage directory not found"
```bash
# Solution: Run tests first
cd frontend/ibudget
npm test
```

#### Issue: "Chrome not found" error
```bash
# Solution: Use ChromeHeadless
ng test --code-coverage --watch=false --browsers=ChromeHeadless
```

#### Issue: Tests run but coverage not generated
```bash
# Solution: Make sure --code-coverage flag is present
ng test --code-coverage
```

#### Issue: Old coverage data showing
```bash
# Solution: Delete coverage folder and re-run
rm -rf coverage    # Mac/Linux
rmdir /s coverage  # Windows
npm test
```

### Backend Issues

#### Issue: "mvnw: command not found"
```bash
# Solution 1: Use ./mvnw on Unix/Mac
cd backend/appvengers
./mvnw clean test

# Solution 2: Use mvnw.cmd on Windows
cd backend/appvengers
mvnw.cmd clean test

# Solution 3: Use installed Maven
mvn clean test
```

#### Issue: JaCoCo report not generated
```bash
# Solution: Ensure tests actually run
cd backend/appvengers
mvnw clean test

# Check for target/site/jacoco/index.html
# If missing, verify pom.xml has JaCoCo plugin configured
```

#### Issue: "Tests passed but no coverage shown"
```bash
# Solution: JaCoCo runs during test phase
# Make sure you're using 'test' goal, not 'compile'
mvnw clean test    # ✅ Correct
mvnw compile       # ❌ Won't generate coverage
```

#### Issue: Coverage symlink not working
```bash
# Solution: Re-enable symlinks and checkout
git config core.symlinks true
git checkout HEAD -- coverage/

# Or access original report directly:
start backend/appvengers/target/site/jacoco/index.html
```

---

## 🔗 Integrating with CI/CD

The `lcov.info` file can be used with tools like:
- **Codecov**: Upload coverage to Codecov.io
- **Coveralls**: Similar to Codecov
- **SonarQube**: Code quality platform
- **GitHub Actions**: Display coverage in PRs

Example GitHub Action:
```yaml
- name: Run tests with coverage
  run: cd frontend/ibudget && npm test

- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v3
  with:
    file: ./frontend/ibudget/coverage/lcov.info
```

---

## 📝 Available NPM Scripts

The project already includes these helpful npm scripts in `frontend/ibudget/package.json`:

```json
{
  "scripts": {
    "test": "ng test --code-coverage --watch=false --browsers=ChromeHeadless",
    "test:watch": "ng test --code-coverage",
    "test:coverage": "ng test --code-coverage --watch=false --browsers=ChromeHeadless && start coverage/index.html",
    "test:no-coverage": "ng test --watch=false --browsers=ChromeHeadless"
  }
}
```

You can use these commands:
```bash
cd frontend/ibudget
npm run test:coverage    # Run tests and auto-open report
npm run test:watch       # Run tests in watch mode with coverage
npm run test:no-coverage # Quick test without coverage
```

## 🔧 Maven Commands for Backend

Common Maven commands for backend testing and coverage:

```bash
cd backend/appvengers

# Run tests with coverage (recommended)
mvnw clean test

# Run tests without cleaning
mvnw test

# Skip tests (not recommended, but useful for quick builds)
mvnw clean install -DskipTests

# Run specific test class
mvnw test -Dtest=UserServiceTest

# Run tests with verbose output
mvnw test -X

# Generate coverage report without re-running tests (if .exec file exists)
mvnw jacoco:report
```

---

## 🎓 Team Workflow Recommendation

### 1. Before starting work:
```bash
git pull origin DevOps
```

### 2. Frontend Development:
```bash
cd frontend/ibudget
npm install
npm run test:watch  # Keep tests running while developing
```

### 3. Backend Development:
```bash
cd backend/appvengers
# Develop your feature/fix
# Then run tests:
mvnw clean test
```

### 4. Before committing:

**Frontend:**
```bash
cd frontend/ibudget
npm test            # Run all tests
start ../../coverage/frontend/index.html
# Aim for at least 60% coverage on new code
```

**Backend:**
```bash
cd backend/appvengers
mvnw clean test     # Run all tests
start ../../coverage/backend/index.html
# Aim for at least 70% coverage on new code
```

### 5. Review together:
- Weekly coverage review in team meetings
- Focus on improving branch coverage
- Share testing patterns and techniques
- Compare frontend vs backend coverage trends

---

## 📚 Additional Resources

### Frontend Testing
- **Karma Coverage**: https://github.com/karma-runner/karma-coverage
- **Angular Testing Guide**: https://angular.io/guide/testing
- **Jasmine Docs**: https://jasmine.github.io/
- **Istanbul (coverage tool)**: https://istanbul.js.org/
- **Test Fix Documentation**: See `frontend/ibudget/testFixDocs.md` for common test issues and solutions

### Backend Testing
- **JaCoCo Documentation**: https://www.jacoco.org/jacoco/trunk/doc/
- **JUnit 5 User Guide**: https://junit.org/junit5/docs/current/user-guide/
- **Spring Boot Testing**: https://spring.io/guides/gs/testing-web/
- **Mockito Framework**: https://site.mockito.org/
- **Maven Surefire Plugin**: https://maven.apache.org/surefire/maven-surefire-plugin/

---

## 📌 Quick Reference Cheat Sheet

### Frontend Commands
```bash
# Run tests with coverage
cd frontend/ibudget && npm test

# View coverage report
start coverage/frontend/index.html        # Windows
open coverage/frontend/index.html         # Mac/Linux

# Run tests in watch mode
npm run test:watch

# Run specific test file
ng test --include='**/dashboard.spec.ts'

# Run tests without coverage (faster)
ng test --watch=false --browsers=ChromeHeadless
```

### Backend Commands
```bash
# Run tests with coverage
cd backend/appvengers && mvnw clean test

# View coverage report
start coverage/backend/index.html         # Windows
open coverage/backend/index.html          # Mac/Linux

# Run specific test class
mvnw test -Dtest=UserServiceTest

# Run all tests in a package
mvnw test -Dtest=com.appvengers.budgetmanagement.*

# Generate report only (without re-running tests)
mvnw jacoco:report
```

---

**Last Updated**: November 11, 2025

**Frontend Test Status**: 29/29 tests passing ✅  
**Frontend Coverage**: ~49% statements, ~13% branches

**Backend Test Status**: 1/1 tests passing ✅  
**Backend Coverage**: JaCoCo configured and operational

For questions or issues, refer to the team's testing documentation or ask in the team chat.
