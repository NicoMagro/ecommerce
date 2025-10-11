# CI/CD Pipeline Standards

## 🔄 Overview

**CI/CD** (Continuous Integration / Continuous Deployment) is an automated system that reviews and tests code every time changes are pushed to the repository. It acts as an automated inspector that ensures code quality before deployment.

## 🎯 Purpose

**Without CI/CD:**

```
Push → Deploy → Error in production → 😱 Users affected
```

**With CI/CD:**

```
Push → CI detects error → ❌ Blocked → 😌 Users safe
```

## 🤖 How It Works

When you run `git push` to GitHub, the following checks are automatically executed:

### 1. **Lint & Format Check** ✅

```bash
# Verifies code follows style rules
- ESLint: checks for code errors and best practices
- Prettier: checks formatting (spaces, quotes, indentation)
```

**Why?** To maintain consistent and readable code across the team.

**Example:**

```typescript
// ❌ FAIL: Inconsistent quotes
import { Geist } from 'next/font/google';

// ✅ PASS: Consistent quotes (project uses single quotes)
import { Geist } from 'next/font/google';
```

### 2. **TypeScript Type Check** ✅

```bash
# Verifies there are no type errors
npx tsc --noEmit
```

**Why?** To detect type errors before they cause bugs in production.

**Example:**

```typescript
// ❌ FAIL: Type incompatibility
interface ProductFormData {
  description: string; // Required
}
product.description; // string | undefined - incompatible!

// ✅ PASS: Explicit type conversion
{
  description: product.description || ''; // Always string
}
```

### 3. **Build Application** ✅

```bash
# Attempts to compile the application
npm run build
```

**Why?** To ensure the code can be compiled and run in production.

**Example:**

```typescript
// ❌ FAIL: useSearchParams without Suspense (Next.js 15)
export default function Page() {
  const params = useSearchParams(); // Build error!
}

// ✅ PASS: Wrapped in Suspense
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <Content /> {/* Uses useSearchParams here */}
    </Suspense>
  );
}
```

## 📁 Pipeline Configuration

The pipeline is defined in `.github/workflows/ci.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-and-format:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Setup Node.js
      - Install dependencies
      - Run ESLint
      - Run Prettier

  type-check:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Setup Node.js
      - Install dependencies
      - Run TypeScript type check

  build:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Setup Node.js
      - Install dependencies
      - Run production build
```

## 🛡️ Protection Rules

The CI/CD pipeline acts as a gatekeeper:

1. **All checks must pass** before code can be merged
2. **Automatic blocking** of broken code
3. **Consistent standards** enforced on all commits
4. **Early detection** of issues

## 🎁 Benefits

### 1. **Early Error Detection**

- Catches errors before they reach production
- Saves time debugging in production
- Protects users from broken features

### 2. **Consistent Quality**

- All code passes same verification
- Doesn't depend on developers remembering to run tests
- Team maintains same standards

### 3. **Deployment Confidence**

```
✅ TypeScript: No type errors
✅ ESLint: Clean and consistent code
✅ Build: Application compiles correctly
→ Safe to deploy to production
```

### 4. **Collaboration**

- Pull requests show check status
- Code reviews focus on logic, not style
- Automated feedback for contributors

## 📊 Pipeline Visualization

```
Your Code (local)
      ↓
  git push
      ↓
GitHub Actions (CI/CD)
      ↓
┌─────────────────────┐
│  Lint & Format      │ → ✅ Pass
├─────────────────────┤
│  TypeScript Check   │ → ✅ Pass
├─────────────────────┤
│  Build Application  │ → ✅ Pass
└─────────────────────┘
      ↓
All Green 🟢
      ↓
Ready for Deploy
```

## 🔍 Viewing Pipeline Status

### In GitHub:

1. Go to repository: `https://github.com/[username]/[repo]`
2. Click **"Actions"** tab
3. See list of all workflow runs
4. Each commit has its own workflow run
5. Click to see details of each check

### Status Indicators:

- 🟢 **Green checkmark**: All checks passed
- 🔴 **Red X**: One or more checks failed
- 🟡 **Yellow circle**: Checks in progress
- ⚪ **Gray circle**: Checks skipped

## 💻 Pre-commit Hooks (Local CI)

The project uses **Husky** + **lint-staged** for local verification BEFORE commits:

```bash
git commit
      ↓
Husky intercepts
      ↓
Runs lint-staged
      ↓
- ESLint on staged .ts/.tsx files
- Prettier on staged files
      ↓
If pass → Commit succeeds ✅
If fail → Commit blocked ❌
```

**Configuration (`.husky/pre-commit`):**

```bash
#!/usr/bin/env sh
npx lint-staged
```

**Configuration (`.lintstagedrc.json`):**

```json
{
  "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,css,md}": ["prettier --write"]
}
```

### Benefits of Pre-commit Hooks:

1. **Instant Feedback**: Know about issues before pushing
2. **Time Saving**: Don't wait for CI to fail
3. **Clean History**: Only well-formatted code gets committed
4. **Auto-fixing**: Many issues are fixed automatically

## 🚨 Common CI/CD Failures and Solutions

### 1. TypeScript Errors

**Error:**

```
Type 'string | undefined' is not assignable to type 'string'
```

**Solution:**

```typescript
// Provide default values or explicit conversions
const value = optionalValue || '';
const num = optionalNum ?? 0;
```

### 2. ESLint Errors

**Error:**

```
Unexpected console statement. Only console.warn and console.error are allowed
```

**Solution:**

```typescript
// Remove console.log or use allowed methods
console.log('debug'); // ❌ Remove or replace
console.warn('[AUDIT]', data); // ✅ For audit logs
console.error('[ERROR]', error); // ✅ For errors
```

### 3. Prettier Failures

**Error:**

```
Code style issues found in 3 files. Run Prettier with --write to fix.
```

**Solution:**

```bash
# Auto-fix formatting
npm run format
# Or
npx prettier --write "**/*.{js,jsx,ts,tsx,json,css,md}"
```

### 4. Build Failures

**Error:**

```
useSearchParams() should be wrapped in a suspense boundary
```

**Solution:**

```typescript
// Wrap component using dynamic hooks in Suspense
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <ComponentUsingSearchParams />
    </Suspense>
  );
}
```

## 📋 CI/CD Checklist

Before pushing code, ensure:

- [ ] **All tests pass locally**: `npm test`
- [ ] **No TypeScript errors**: `npm run type-check`
- [ ] **No linting issues**: `npm run lint`
- [ ] **Code is formatted**: `npm run format`
- [ ] **Build succeeds**: `npm run build`
- [ ] **Pre-commit hooks pass**: Automatic on `git commit`

## 🎯 Best Practices

### 1. **Run Checks Locally First**

```bash
# Before pushing, run locally
npm run lint
npm run type-check
npm run build
```

### 2. **Fix Issues Immediately**

Don't push broken code hoping it will pass CI - it won't save time.

### 3. **Read Error Messages**

CI error messages are detailed and point to exact issues.

### 4. **Keep Dependencies Updated**

Outdated dependencies can cause CI failures:

```bash
npm outdated
npm update
```

### 5. **Don't Skip Checks**

Never use `--no-verify` to skip pre-commit hooks unless absolutely necessary.

## 🔗 Integration with Development Workflow

```
1. Write code
2. Pre-commit hooks verify (automatic on commit)
3. Push to GitHub
4. CI/CD pipeline runs (automatic)
5. Review checks in GitHub
6. If green, merge PR
7. Deploy to production
```

## 📚 Related Documentation

- **ESLint Configuration**: See `eslint.config.mjs`
- **Prettier Configuration**: See `.prettierrc`
- **TypeScript Configuration**: See `tsconfig.json`
- **GitHub Actions**: See `.github/workflows/ci.yml`
- **Pre-commit Hooks**: See `.husky/pre-commit`

## 💡 Key Takeaways

1. **CI/CD is automated quality control** - Like having a code reviewer that never sleeps
2. **Catches errors early** - Before they reach production
3. **Enforces standards** - Consistent code quality across team
4. **Builds confidence** - Deploy knowing code is verified
5. **Saves time** - Less debugging in production

---

**Remember**: CI/CD is not an obstacle - it's a safety net that helps you ship better code with confidence.
