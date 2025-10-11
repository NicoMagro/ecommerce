# E-commerce Platform

> A modern, production-ready e-commerce platform built with Next.js 15, TypeScript, Prisma, and PostgreSQL.

## 🚀 Sprint 0 Complete - Foundation & Setup

This project follows a structured 12-sprint development plan. **Sprint 0** is now complete with all infrastructure and development tools configured.

## ✨ Features (Sprint 0)

- ✅ **Next.js 15** with App Router and Turbopack
- ✅ **TypeScript** (strict mode) for type safety
- ✅ **Tailwind CSS** for styling
- ✅ **Prisma ORM** with PostgreSQL
- ✅ **NextAuth.js v5** for authentication
- ✅ **Security**: Account lockout, password hashing (bcrypt), secure headers
- ✅ **Code Quality**: ESLint, Prettier, Husky pre-commit hooks
- ✅ **CI/CD**: GitHub Actions workflow
- ✅ **Monitoring**: Sentry integration for error tracking
- ✅ **Database Schema**: Complete e-commerce schema with 15+ tables

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.3+
- **Styling**: Tailwind CSS 4

### Backend

- **Runtime**: Node.js 20 LTS
- **Database**: PostgreSQL 16
- **ORM**: Prisma 6.x
- **Authentication**: NextAuth.js v5
- **Validation**: Zod

## 🏁 Getting Started

### Prerequisites

- Node.js 20 or higher
- PostgreSQL database
- Git

### Installation

1. **Install dependencies**

```bash
npm install
```

2. **Set up environment variables**

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/ecommerce"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
```

3. **Set up the database**

```bash
npm run db:generate
npm run db:push
```

4. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 💻 Development Scripts

```bash
npm run dev                # Start development server
npm run build              # Build for production
npm run lint               # Run ESLint
npm run format             # Format code with Prettier
npm run type-check         # TypeScript checks
npm run db:studio          # Open Prisma Studio
```

## 🗄️ Database Schema

Complete e-commerce schema including:

- Users & Authentication
- Products & Categories
- Shopping Cart
- Orders & Payments
- Reviews & Ratings
- Inventory Management

View schema: `prisma/schema.prisma`

## 🔐 Authentication

Powered by NextAuth.js v5 with:

- Password hashing (bcrypt)
- Account lockout protection
- JWT sessions
- Secure cookies
- Input validation

## 📚 Documentation

- [Sprint Plan](../e-commerce/SPRINT_PLAN.md)
- [System Requirements](../e-commerce/SYSTEM_REQUIREMENTS.md)
- [Technical Specifications](../e-commerce/TECHNICAL_SPECIFICATIONS.md)

## 📈 Next Steps

**Sprint 1** (Weeks 3-4): Core Product Catalog

- Product CRUD operations
- Admin dashboard
- Product listing page

See [SPRINT_PLAN.md](../e-commerce/SPRINT_PLAN.md) for the full roadmap.

---

**Built with ❤️ using Next.js, TypeScript, and modern best practices**
