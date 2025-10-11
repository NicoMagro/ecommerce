# CLAUDE.md - E-commerce Platform Project Guide

This file provides guidance to Claude Code when working with this e-commerce application.

## 🎯 Project Overview

This is a **production-ready e-commerce platform** built with Next.js 15, TypeScript, Prisma, and PostgreSQL. The project follows a structured 12-sprint development plan with comprehensive documentation and best practices.

**Current Status**: ✅ **Sprint 0 Complete** - Foundation & Infrastructure Setup

## 📚 Documentation Structure

All project documentation is located within this repository:

### Core Documentation (`/docs/`)

- **[SPRINT_PLAN.md](./docs/SPRINT_PLAN.md)** - Complete 12-sprint development roadmap (6 months)
- **[SYSTEM_REQUIREMENTS.md](./docs/SYSTEM_REQUIREMENTS.md)** - Detailed functional and non-functional requirements
- **[TECHNICAL_SPECIFICATIONS.md](./docs/TECHNICAL_SPECIFICATIONS.md)** - Architecture, tech stack, and implementation details
- **[GUIA_SUB_AGENTES_Y_MEJORES_PRACTICAS.md](./docs/GUIA_SUB_AGENTES_Y_MEJORES_PRACTICAS.md)** - SOLID principles, security (OWASP), and architecture guide

### Context System (`/context/`)

This project uses a **sub-agent system** for consistent, high-quality code generation:

#### Sub-Agents (`/context/agents/`)

- **[frontend-agent.md](./context/agents/frontend-agent.md)** - React components, state management, UI/UX
- **[security-agent.md](./context/agents/security-agent.md)** - Input validation, authentication, OWASP compliance
- **[ecommerce-agent.md](./context/agents/ecommerce-agent.md)** - Shopping cart, checkout, payments, inventory

#### Standards (`/context/standards/`)

- **[code-style.md](./context/standards/code-style.md)** - Code formatting, ESLint, Prettier
- **[naming-conventions.md](./context/standards/naming-conventions.md)** - Naming patterns for files, variables, functions

#### Examples (`/context/examples/`)

- **[component-example.md](./context/examples/component-example.md)** - Complete React component example
- **[api-endpoint-example.md](./context/examples/api-endpoint-example.md)** - API endpoint with tests

#### Checklists (`/context/checklists/`)

- **[pre-commit-checklist.md](./context/checklists/pre-commit-checklist.md)** - Verification before commits

## 🛠️ Technology Stack

### Frontend

- **Next.js 15.5** (App Router + Turbopack)
- **TypeScript 5.x** (strict mode)
- **Tailwind CSS 4**
- **React 19**

### Backend

- **Next.js API Routes** (serverless)
- **Prisma 6.x** (ORM)
- **PostgreSQL 16** (database)
- **NextAuth.js v5** (authentication)
- **Zod** (validation)

### Tools

- **ESLint + Prettier** (code quality)
- **Husky + lint-staged** (git hooks)
- **GitHub Actions** (CI/CD)
- **Sentry** (error monitoring)

## 🚀 How to Use This Guide

### When Generating Code

1. **Identify the feature domain** (e.g., product catalog, authentication, checkout)
2. **Read relevant sub-agents** from `/context/agents/`
3. **Apply the standards** from `/context/standards/`
4. **Reference examples** from `/context/examples/`
5. **Follow the sprint plan** from `/docs/SPRINT_PLAN.md`

### Example Workflow

```
User: "Create a ProductCard component with add to cart functionality"

Claude should:
1. Read: /context/agents/frontend-agent.md
2. Read: /context/agents/ecommerce-agent.md
3. Read: /context/standards/code-style.md
4. Apply: TypeScript strict mode, accessibility, responsive design
5. Generate: Component with tests following all standards
```

## 📋 Development Principles

### Code Quality Standards

**TypeScript Strict Mode**

- ✅ No `any` types allowed
- ✅ Explicit types for all variables
- ✅ Proper error handling

**SOLID Principles**

- **S**ingle Responsibility
- **O**pen/Closed
- **L**iskov Substitution
- **I**nterface Segregation
- **D**ependency Inversion

**Security First (OWASP Top 10)**

- ✅ Input validation (Zod schemas)
- ✅ Password hashing (bcrypt, 12 rounds)
- ✅ SQL injection prevention (Prisma)
- ✅ XSS prevention (sanitization)
- ✅ CSRF protection
- ✅ Rate limiting
- ✅ Security headers (middleware)

### Naming Conventions

- **Files**: `kebab-case.ts` (utils), `PascalCase.tsx` (components)
- **Components**: `PascalCase`
- **Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Types/Interfaces**: `PascalCase`

### File Organization

```typescript
// 1. Imports (external → internal → relative)
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { formatPrice } from './utils';

// 2. Types/Interfaces
interface ProductCardProps {
  product: Product;
}

// 3. Constants
const MAX_QUANTITY = 10;

// 4. Component/Function
export function ProductCard({ product }: ProductCardProps) {
  // Implementation
}

// 5. Exports (if separate)
```

## 🗂️ Project Structure

```
ecommerce-app/
├── docs/                          # Project documentation
│   ├── SPRINT_PLAN.md
│   ├── SYSTEM_REQUIREMENTS.md
│   └── TECHNICAL_SPECIFICATIONS.md
├── context/                       # Sub-agent system
│   ├── agents/                    # Domain experts
│   ├── standards/                 # Code standards
│   ├── examples/                  # Reference code
│   └── checklists/                # Verification lists
├── prisma/
│   └── schema.prisma              # Database schema
├── src/
│   ├── app/                       # Next.js pages and API routes
│   ├── components/                # React components
│   ├── lib/                       # Utilities and clients
│   ├── services/                  # Business logic
│   ├── hooks/                     # Custom hooks
│   └── types/                     # TypeScript types
├── .github/workflows/             # CI/CD pipelines
├── CLAUDE.md                      # This file
└── README.md                      # Setup instructions
```

## 🔐 Security Guidelines

**Always apply these security measures:**

1. **Input Validation**: Use Zod schemas for all user inputs
2. **Authentication**: Check session/user before sensitive operations
3. **Authorization**: Verify user permissions (role-based)
4. **Sanitization**: Clean HTML/user content (DOMPurify)
5. **Rate Limiting**: Apply on public endpoints
6. **Error Handling**: Never expose sensitive info in errors
7. **Logging**: Log security events (failed logins, etc.)

## 📝 Sprint System

The project follows a 12-sprint plan:

- **Sprint 0** ✅ - Foundation & Setup (COMPLETED)
- **Sprint 1** 🔄 - Core Product Catalog (NEXT)
- **Sprint 2** - Product Details & Categories
- **Sprint 3** - Search & Filtering
- **Sprint 4** - Shopping Cart
- **Sprint 5** - User Registration & Auth
- **Sprint 6** - Checkout Part 1
- **Sprint 7** - Checkout Part 2 (Stripe)
- **Sprint 8** - Admin Order Management
- **Sprint 9** - Inventory Management
- **Sprint 10** - Reviews & Ratings
- **Sprint 11** - Performance & SEO
- **Sprint 12** - Final Polish & Launch

See [SPRINT_PLAN.md](./docs/SPRINT_PLAN.md) for detailed user stories and tasks.

## 🎯 Current Sprint: Sprint 1 (Next)

**Goal**: Implement Core Product Catalog

**Key Features**:

- Admin can create/edit/delete products
- Product list with pagination
- Product card component
- Image upload (Cloudinary)
- Public product listing
- Tests (>70% coverage)

**Agents to Use**:

- `react-tailwind-frontend`
- `backend-api-architect`
- `database-architect`
- `api-design-architect`
- `testing-quality-assurance`

## 💡 Best Practices

### When Creating Components

1. Read `frontend-agent.md`
2. Use TypeScript strict mode
3. Apply accessibility (WCAG AA)
4. Make it responsive (mobile-first)
5. Write tests (Testing Library)
6. Add JSDoc comments

### When Creating API Endpoints

1. Read `backend-api-architect.md` and `security-agent.md`
2. Validate input with Zod
3. Check authentication/authorization
4. Use Prisma for database access
5. Handle errors properly
6. Add rate limiting
7. Write integration tests

### When Modifying Database

1. Read `database-architect.md`
2. Update Prisma schema
3. Create migration
4. Update types
5. Update related services
6. Consider indexes
7. Test queries

## 🔗 Quick Reference Links

- **Setup**: [README.md](./README.md)
- **Sprint Plan**: [SPRINT_PLAN.md](./docs/SPRINT_PLAN.md)
- **Requirements**: [SYSTEM_REQUIREMENTS.md](./docs/SYSTEM_REQUIREMENTS.md)
- **Tech Specs**: [TECHNICAL_SPECIFICATIONS.md](./docs/TECHNICAL_SPECIFICATIONS.md)
- **Sub-Agents**: [/context/agents/](./context/agents/)
- **Code Style**: [/context/standards/code-style.md](./context/standards/code-style.md)

## 🌐 Language Policy

- **Documentation**: Spanish (user preference) or English
- **Code**: **ALWAYS English** (industry standard)
  - Variables, functions, classes: English
  - Comments in code: English
  - Commit messages: English
- **User interaction**: Can be Spanish or English

## ⚠️ Important Notes

1. **Always follow sub-agents**: Don't skip reading agent documentation
2. **Security is mandatory**: Never compromise on security standards
3. **TypeScript strict**: No exceptions to strict mode
4. **Test coverage**: Aim for >80% coverage
5. **Performance**: Always consider Core Web Vitals
6. **Accessibility**: WCAG AA compliance is required

## 🆘 When Stuck

1. Check relevant sub-agent in `/context/agents/`
2. Review examples in `/context/examples/`
3. Consult sprint plan for context
4. Check technical specifications for architecture
5. Verify against pre-commit checklist

---

**Remember**: This project values **quality over speed**. Follow the established patterns, write tests, and maintain security standards.

**Current working directory**: `/Users/angelnicolasmagro/Documents/Proyectos/ecommerce-app`
