# 📊 Code Coverage Guide for Developers

A comprehensive guide for running, interpreting, and improving code coverage in the iBudget Angular application.

---

## 🚀 Quick Start - Running Tests with Coverage

### Method 1: Using npm script (Recommended)
```bash
cd frontend/ibudget
npm test
```
This already runs with code coverage enabled (`--code-coverage` flag is in package.json)

### Method 2: Manual command
```bash
cd frontend/ibudget
ng test --code-coverage --watch=false --browsers=ChromeHeadless
```

### Method 3: With live browser (for debugging)
```bash
ng test --code-coverage --browsers=Chrome
```

---

## 📁 Where to Find the Reports

After running tests, coverage reports are generated in:
```
frontend/ibudget/coverage/
├── index.html          ← MAIN REPORT (open this in browser)
├── app/                ← Component-specific reports
├── services/           ← Service-specific reports
├── lcov.info           ← For CI/CD tools
└── [other files]       ← Supporting files
```

**To view the HTML report:**
- **Windows**: `start coverage/index.html`
- **Mac/Linux**: `open coverage/index.html`
- **Or**: Just double-click `coverage/index.html` in File Explorer

---

## 📖 How to Interpret the Coverage Report

### 1️⃣ Understanding the 4 Coverage Metrics

When you open `coverage/index.html`, you'll see 4 columns:

| Metric | What It Measures | Example |
|--------|------------------|---------|
| **Statements** | % of executable lines run | `const x = 5;` ✅ if executed |
| **Branches** | % of if/else paths tested | `if (x > 5) {...} else {...}` ✅ if both tested |
| **Functions** | % of functions called | `function test() {...}` ✅ if called |
| **Lines** | % of physical lines executed | Similar to statements |

### 2️⃣ Color Coding

- 🟢 **Green (80-100%)**: Good coverage
- 🟡 **Yellow (50-79%)**: Medium coverage - needs improvement
- 🔴 **Red (<50%)**: Low coverage - action required

### 3️⃣ Current Project Stats (as of last run)
```
Statements   : 49.86% (187/375) 🟡
Branches     : 13.51% (10/74)   🔴  ← Needs most work!
Functions    : 44.53% (57/128)  🔴
Lines        : 48.82% (166/340) 🟡
```

---

## 🔍 Navigating the Report

### Step 1: Main Dashboard (`index.html`)
- Shows overall project coverage
- Lists all directories (app/, services/)
- Click any directory/file name to drill down

### Step 2: File-Level View
- Click on a specific file (e.g., `dashboard.ts`)
- See which lines are covered/uncovered
- **Green highlight** = Line was tested ✅
- **Red highlight** = Line was NOT tested ❌
- **Yellow highlight** = Partial branch coverage ⚠️

### Step 3: Understanding Line Numbers
```typescript
1x  | constructor() { }           // ✅ Called once
5x  | getData() {                 // ✅ Called 5 times
    |   if (condition) {          // ❌ Never tested
    |     return true;            // ❌ Never reached
    |   }
3x  |   return false;             // ✅ Called 3 times
    | }
```

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

### 1. Identify Uncovered Code
```bash
# Run tests and open report
npm test
start coverage/index.html
```

### 2. Look for Red/Yellow Files
- Sort by coverage percentage (click column headers)
- Focus on files with <50% coverage first

### 3. Write Tests for Uncovered Lines
Example: If `handleError()` is uncovered:

```typescript
// In dashboard.spec.ts
it('should handle errors properly', () => {
  spyOn(console, 'error');  // Spy on console.error
  component.handleError();
  expect(console.error).toHaveBeenCalledWith('Error occurred');
});
```

### 4. Re-run Tests
```bash
npm test
```

### 5. Verify Improvement
- Open coverage report again
- Check if `handleError()` is now green ✅

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

| Metric | Current | Short-term Goal | Long-term Goal |
|--------|---------|-----------------|----------------|
| Statements | 49.86% | **60%** | 80% |
| Branches | 13.51% 🚨 | **40%** | 70% |
| Functions | 44.53% | **60%** | 80% |
| Lines | 48.82% | **60%** | 80% |

**Priority:** Focus on **branch coverage** first - it's critically low!

---

## 🐛 Troubleshooting

### Issue: "Coverage directory not found"
```bash
# Solution: Run tests first
npm test
```

### Issue: "Chrome not found" error
```bash
# Solution: Use ChromeHeadless
ng test --code-coverage --watch=false --browsers=ChromeHeadless
```

### Issue: Tests run but coverage not generated
```bash
# Solution: Make sure --code-coverage flag is present
ng test --code-coverage
```

### Issue: Old coverage data showing
```bash
# Solution: Delete coverage folder and re-run
rm -rf coverage    # Mac/Linux
rmdir /s coverage  # Windows
npm test
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

## 📝 Suggested NPM Scripts

Add these to `frontend/ibudget/package.json` for easier commands:

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

Then teammates can use:
```bash
npm run test:coverage    # Run tests and auto-open report
npm run test:watch       # Run tests in watch mode with coverage
npm run test:no-coverage # Quick test without coverage
```

---

## 🎓 Team Workflow Recommendation

### 1. Before starting work:
```bash
git pull origin DevOps
cd frontend/ibudget
npm install
```

### 2. While developing:
```bash
npm run test:watch  # Keep tests running
```

### 3. Before committing:
```bash
npm test            # Run all tests
# Check coverage report
# Aim for at least 60% coverage on new code
```

### 4. Review together:
- Weekly coverage review in team meetings
- Focus on improving branch coverage
- Share testing patterns and techniques

---

## 📚 Additional Resources

- **Karma Coverage**: https://github.com/karma-runner/karma-coverage
- **Angular Testing Guide**: https://angular.io/guide/testing
- **Jasmine Docs**: https://jasmine.github.io/
- **Istanbul (coverage tool)**: https://istanbul.js.org/
- **Test Fix Documentation**: See `frontend/ibudget/testFixDocs.md` for common test issues and solutions

---

## 📌 Quick Reference Cheat Sheet

```bash
# Run tests with coverage
npm test

# View coverage report
start coverage/index.html                # Windows
open coverage/index.html                 # Mac/Linux

# Run tests in watch mode
npm run test:watch

# Run specific test file
ng test --include='**/dashboard.spec.ts'

# Run tests without coverage (faster)
ng test --watch=false --browsers=ChromeHeadless
```

---

**Last Updated**: November 11, 2025  
**Test Status**: 29/29 tests passing ✅  
**Current Coverage**: ~49% statements, ~13% branches

For questions or issues, refer to the team's testing documentation or ask in the team chat.
