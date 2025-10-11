# Project Overview - E-commerce Platform

## 📋 Table of Contents

1. [Introduction](#introduction)
2. [Project Status](#project-status)
3. [Documentation Map](#documentation-map)
4. [Quick Start Guide](#quick-start-guide)
5. [Architecture Overview](#architecture-overview)
6. [Development Workflow](#development-workflow)

---

## 🎯 Introduction

This is a **modern, production-ready e-commerce platform** built with industry best practices and a focus on:

- **Security**: OWASP Top 10 compliance, secure authentication, input validation
- **Performance**: Core Web Vitals optimization, code splitting, caching strategies
- **Scalability**: Horizontal scaling, database optimization, serverless architecture
- **Quality**: TypeScript strict mode, >80% test coverage, automated CI/CD
- **Accessibility**: WCAG 2.1 Level AA compliance

### Key Features

- 🛒 Complete product catalog with categories and search
- 🛍️ Shopping cart with guest and authenticated user support
- 💳 Secure checkout with Stripe integration
- 👤 User authentication and profile management
- 📦 Order tracking and management
- ⭐ Product reviews and ratings
- 📊 Admin dashboard with analytics
- 📱 Mobile-responsive design
- 🔍 SEO optimization

---

## 📊 Project Status

### Current Sprint: **Sprint 0 (Completed) ✅**

**Infrastructure and Foundation**

- ✅ Next.js 15 with TypeScript configured
- ✅ Database schema designed (Prisma + PostgreSQL)
- ✅ Authentication system implemented (NextAuth.js v5)
- ✅ CI/CD pipeline configured (GitHub Actions)
- ✅ Error monitoring setup (Sentry)
- ✅ Code quality tools (ESLint, Prettier, Husky)

### Next Sprint: **Sprint 1 (Weeks 3-4)**

**Core Product Catalog**

- Product CRUD operations
- Admin dashboard
- Product listing page
- Image upload integration

See [SPRINT_PLAN.md](./SPRINT_PLAN.md) for complete roadmap.

---

## 📚 Documentation Map

### Essential Reading

**For Getting Started**

1. [README.md](../README.md) - Setup instructions
2. [SPRINT_PLAN.md](./SPRINT_PLAN.md) - Development roadmap
3. [SYSTEM_REQUIREMENTS.md](./SYSTEM_REQUIREMENTS.md) - What we're building

**For Development**

1. [TECHNICAL_SPECIFICATIONS.md](./TECHNICAL_SPECIFICATIONS.md) - How to build it
2. [/context/agents/](../context/agents/) - Code generation standards
3. [/context/standards/](../context/standards/) - Code style guides

**For Understanding the System**

1. [GUIA_SUB_AGENTES_Y_MEJORES_PRACTICAS.md](./GUIA_SUB_AGENTES_Y_MEJORES_PRACTICAS.md) - Theory and principles
2. [CLAUDE.md](../CLAUDE.md) - AI assistant guide

### Documentation Hierarchy

```
📁 ecommerce-app/
├── 📄 README.md                        # Setup & quick start
├── 📄 CLAUDE.md                        # AI assistant guide
├── 📁 docs/                            # Project documentation
│   ├── 📄 PROJECT_OVERVIEW.md          # This file
│   ├── 📄 SPRINT_PLAN.md               # 12-sprint roadmap
│   ├── 📄 SYSTEM_REQUIREMENTS.md       # Feature specifications
│   ├── 📄 TECHNICAL_SPECIFICATIONS.md  # Architecture & tech
│   └── 📄 GUIA_SUB_AGENTES_...md       # Principles & theory
└── 📁 context/                         # Development standards
    ├── 📁 agents/                      # Domain-specific guides
    │   ├── 📄 frontend-agent.md
    │   ├── 📄 security-agent.md
    │   └── 📄 ecommerce-agent.md
    ├── 📁 standards/                   # Code standards
    │   ├── 📄 code-style.md
    │   └── 📄 naming-conventions.md
    ├── 📁 examples/                    # Reference code
    └── 📁 checklists/                  # Verification lists
```

---

## 🚀 Quick Start Guide

### Prerequisites

- Node.js 20+
- PostgreSQL 16
- Git

### Setup (5 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your database credentials

# 3. Setup database
npm run db:generate
npm run db:push

# 4. Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Development Tools

```bash
# Database GUI
npm run db:studio         # Opens Prisma Studio

# Code Quality
npm run lint              # Check for errors
npm run format            # Format code
npm run type-check        # TypeScript validation

# Database
npm run db:migrate        # Create migration
npm run db:seed           # Seed database
```

---

## 🏗️ Architecture Overview

### Technology Stack

**Frontend Layer**

```
Next.js 15 (App Router + Turbopack)
├── React 19
├── TypeScript 5.x
├── Tailwind CSS 4
└── Zustand (state) + React Query (server state)
```

**Backend Layer**

```
Next.js API Routes (Serverless)
├── Prisma ORM
├── PostgreSQL 16
├── NextAuth.js v5
└── Zod (validation)
```

**Infrastructure**

```
Deployment: Vercel
├── CDN: Cloudflare
├── Monitoring: Sentry
├── CI/CD: GitHub Actions
└── Search: Algolia (optional)
```

### Data Model

**Core Entities**: 15+ tables including:

- Users & Authentication
- Products & Categories & Images
- Shopping Cart & Cart Items
- Orders & Order Items & Payments
- Reviews & Review Votes
- Inventory & Addresses

See [prisma/schema.prisma](../prisma/schema.prisma) for complete schema.

### API Structure

```
/api
├── /auth/[...nextauth]      # Authentication
├── /products                # Product CRUD
│   ├── GET    /             # List products
│   ├── POST   /             # Create (admin)
│   ├── GET    /:id          # Get one
│   └── PUT    /:id          # Update (admin)
├── /cart                    # Shopping cart
├── /checkout                # Checkout flow
├── /orders                  # Order management
└── /webhooks/stripe         # Payment webhooks
```

---

## 🔄 Development Workflow

### Feature Development Process

1. **Read Sprint Plan**
   - Identify current sprint and user stories
   - Review acceptance criteria

2. **Consult Sub-Agents**
   - Read relevant agent documentation
   - Apply standards and patterns

3. **Implement Feature**
   - Write code following TypeScript strict mode
   - Add proper types and validation
   - Include JSDoc comments

4. **Write Tests**
   - Unit tests for business logic
   - Integration tests for APIs
   - Component tests for UI
   - E2E tests for critical flows

5. **Code Review**
   - Pre-commit hooks run automatically
   - CI/CD pipeline validates
   - Manual code review

6. **Deploy**
   - Merge to `develop` → staging
   - Merge to `main` → production

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/product-listing

# Make changes (hooks run on commit)
git add .
git commit -m "feat: add product listing page"

# Push and create PR
git push origin feature/product-listing
```

### Commit Message Convention

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code restructuring
- `test:` Adding tests
- `chore:` Maintenance

---

## 📈 Success Metrics

### Technical KPIs

- **Test Coverage**: >80%
- **TypeScript Coverage**: 100% (strict mode)
- **Lighthouse Score**: >90
- **Core Web Vitals**: All green
- **API Response Time**: <300ms (p95)
- **Uptime**: 99.9%

### Business KPIs

- **Conversion Rate**: >2.5%
- **Cart Abandonment**: <70%
- **Page Load Time**: <3s
- **Mobile Traffic**: 60%+

---

## 🔗 External Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

## 🤝 Team & Contacts

**Development Team**: Your Team
**Architecture**: Based on sub-agents system
**Timeline**: 6 months (12 sprints × 2 weeks)

---

## 📝 Version History

- **v0.1.0** (2025-01-10) - Sprint 0 Complete - Foundation & Setup

---

**Last Updated**: 2025-01-10
**Next Review**: Sprint 1 completion
