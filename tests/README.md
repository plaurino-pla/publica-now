# Playwright MCP Testing Guide

This directory contains comprehensive end-to-end tests for the Publica.la application, optimized for MCP (Model Context Protocol) testing and AI-assisted development.

## 🚀 Quick Start

### Run All Tests
```bash
npm run test:mcp
```

### Run Tests with UI
```bash
npm run test:mcp:ui
```

### Run Tests in Headed Mode
```bash
npm run test:mcp:headed
```

### Run Fast Tests Only
```bash
npm run test:mcp:fast
```

### Run Mobile Tests
```bash
npm run test:mcp:mobile
```

### View Test Report
```bash
npm run test:mcp:report
```

## 📁 Test Structure

```
tests/
├── README.md                 # This file
├── global-setup.ts          # Global test setup
├── global-teardown.ts       # Global test cleanup
├── utils/
│   └── test-helpers.ts      # Common test utility functions
├── auth.spec.ts             # Authentication tests
├── payment.spec.ts          # Payment system tests
├── homepage.spec.ts         # Homepage functionality tests
├── accessibility.spec.ts    # Accessibility compliance tests
├── mobile-navigation.spec.ts # Mobile navigation tests
├── responsive-design.spec.ts # Responsive design tests
└── performance.spec.ts      # Performance tests
```

## 🔧 Configuration

### MCP Configuration (`playwright.mcp.config.ts`)
- **Optimized for AI-assisted development**
- **Fast execution** with parallel testing
- **Comprehensive reporting** (HTML, JSON, JUnit)
- **Multiple browser projects** (Desktop, Mobile, Fast)
- **Global setup/teardown** for test environment management

### Standard Configuration (`playwright.config.ts`)
- **Production-ready** testing configuration
- **CI/CD optimized** with retries and parallel execution
- **Multiple browser support** (Chrome, Firefox, Safari)

## 🧪 Test Categories

### 1. Authentication Tests (`auth.spec.ts`)
- ✅ Sign-in page functionality
- ✅ Sign-up page functionality
- ✅ Form validation
- ✅ Error handling
- ✅ Navigation between auth pages
- ✅ Accessibility compliance

### 2. Payment System Tests (`payment.spec.ts`)
- ✅ Payment button visibility
- ✅ Subscription button functionality
- ✅ Article purchase buttons
- ✅ Stripe integration triggers
- ✅ UI state management

### 3. Core Functionality Tests
- ✅ Homepage loading and navigation
- ✅ Creator discovery and navigation
- ✅ Content display and interaction
- ✅ Mobile responsiveness
- ✅ Performance metrics

## 🛠️ Test Utilities

### TestHelpers Class
The `TestHelpers` class provides common testing operations:

```typescript
import TestHelpers from './utils/test-helpers';

// Navigate and wait for page load
await TestHelpers.navigateToPage(page, '/creators');

// Fill forms easily
await TestHelpers.fillForm(page, {
  'Email address': 'test@example.com',
  'Password': 'password123'
});

// Check payment buttons
await TestHelpers.checkPaymentButtons(page);
```

## 📊 Test Reporting

### HTML Report
- **Interactive test results**
- **Screenshots and videos** on failure
- **Trace viewer** for debugging
- **Performance metrics**

### JSON Report
- **Machine-readable** test results
- **CI/CD integration** ready
- **Custom reporting** support

### JUnit Report
- **Standard format** for CI systems
- **Jenkins, GitLab CI** compatible
- **Test result aggregation**

## 🚦 Running Tests

### Development Mode
```bash
# Start development server
npm run dev

# Run tests in another terminal
npm run test:mcp
```

### Production Testing
```bash
# Build and start production server
npm run build
npm run start

# Run tests against production
BASE_URL=http://localhost:3000 npm run test:mcp
```

### CI/CD Integration
```bash
# Install dependencies
npm ci

# Build application
npm run build

# Run tests
npm run test:mcp
```

## 🔍 Debugging Tests

### Debug Mode
```bash
npm run test:mcp:debug
```

### UI Mode
```bash
npm run test:mcp:ui
```

### Screenshots and Videos
- **Automatic capture** on test failure
- **Stored in** `test-results/` directory
- **View with** `npm run test:mcp:report`

## 📱 Browser Support

### Desktop Browsers
- **Chromium** (Primary testing)
- **Firefox** (Cross-browser compatibility)
- **WebKit** (Safari compatibility)

### Mobile Browsers
- **Mobile Chrome** (Pixel 5)
- **Mobile Safari** (iPhone 12)

### Fast Testing
- **Optimized configuration** for rapid feedback
- **Minimal browser features** for speed

## 🎯 Best Practices

### 1. Test Isolation
- **Clear cookies** before each test
- **Independent test data** for each test
- **No shared state** between tests

### 2. Reliable Selectors
- **Use semantic selectors** (`getByRole`, `getByLabel`)
- **Avoid fragile selectors** (CSS classes, IDs)
- **Test data attributes** for complex elements

### 3. Proper Waiting
- **Wait for network idle** after actions
- **Wait for elements** to be visible
- **Use appropriate timeouts** for assertions

### 4. Error Handling
- **Graceful failure handling** in tests
- **Meaningful error messages** for debugging
- **Screenshot capture** on failures

## 🚨 Common Issues

### 1. Element Not Found
```typescript
// ❌ Fragile selector
await page.locator('.button').click();

// ✅ Robust selector
await page.getByRole('button', { name: 'Submit' }).click();
```

### 2. Timing Issues
```typescript
// ❌ No waiting
await page.click('#submit');

// ✅ Proper waiting
await page.getByRole('button', { name: 'Submit' }).click();
await page.waitForLoadState('networkidle');
```

### 3. Flaky Tests
```typescript
// ❌ Fixed timeout
await page.waitForTimeout(1000);

// ✅ Dynamic waiting
await page.waitForSelector('[data-testid="content"]', { timeout: 10000 });
```

## 🔄 Continuous Integration

### GitHub Actions
```yaml
- name: Run E2E Tests
  run: npm run test:mcp
  env:
    CI: true
```

### Vercel
```bash
# Add to build command
npm run test:mcp && npm run build
```

## 📈 Performance Testing

### Lighthouse Integration
```typescript
// Run performance audits
const lighthouse = await page.evaluate(() => {
  // Lighthouse audit code
});
```

### Core Web Vitals
- **Largest Contentful Paint (LCP)**
- **First Input Delay (FID)**
- **Cumulative Layout Shift (CLS)**

## 🎉 Getting Help

### Documentation
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)

### Community
- [Playwright Discord](https://discord.gg/playwright)
- [GitHub Issues](https://github.com/microsoft/playwright/issues)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/playwright)

---

**Happy Testing! 🚀**
