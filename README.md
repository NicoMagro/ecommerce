# E-commerce Platform

> A modern, production-ready e-commerce platform built with Next.js 15, TypeScript, Prisma, and PostgreSQL.

## 🎉 Sprint 1 Complete - Core Product Catalog (100%)

This project follows a structured 12-sprint development plan. **Sprint 0** and **Sprint 1** are now complete with full product catalog functionality and admin management.

## ✨ Current Features

### 🏗️ Sprint 0 - Foundation & Infrastructure ✅

- ✅ **Next.js 15** with App Router and Turbopack
- ✅ **TypeScript** (strict mode) for type safety
- ✅ **Tailwind CSS 4** for modern styling
- ✅ **Prisma ORM** with PostgreSQL database
- ✅ **NextAuth.js v5** for authentication
- ✅ **Security**: Password hashing (bcrypt), secure headers, input validation
- ✅ **Code Quality**: ESLint, Prettier, Husky pre-commit hooks
- ✅ **CI/CD Pipeline**: GitHub Actions with automated checks
- ✅ **Monitoring**: Sentry integration for error tracking
- ✅ **Database Schema**: Complete e-commerce schema with 15+ tables
- ✅ **Sub-Agent System**: Specialized documentation for consistent code generation

### 🛍️ Sprint 1 - Core Product Catalog ✅

- ✅ **Admin Product Management** (US-1.1)
  - Full CRUD operations for products
  - Role-based access control (ADMIN only)
  - Input validation with Zod schemas
  - Audit logging

- ✅ **Public Product API** (US-1.2)
  - RESTful API with pagination
  - Advanced filtering (category, price, search, featured)
  - Sorting options (newest, price, name)
  - Optimized database queries

- ✅ **Product Card Component** (US-1.3)
  - Responsive design (mobile-first)
  - Image display with fallback
  - WCAG AA accessibility compliance
  - Price formatting with sale indicators

- ✅ **Cloudinary Integration** (US-1.4)
  - Cloud-based image management
  - Upload/delete functionality
  - Primary image selection
  - Base64 support
  - Automatic image optimization

- ✅ **Product Listing Page** (US-1.5)
  - Public product grid
  - Pagination controls
  - Loading states
  - Error handling

- ✅ **Admin Products Dashboard** (US-1.6)
  - Statistics overview
  - Product management interface
  - Image gallery management
  - Professional UI with Tailwind

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 15.5.4 (App Router + Turbopack)
- **Language**: TypeScript 5.3+ (strict mode)
- **Styling**: Tailwind CSS 4
- **UI Components**: Custom components with Headless UI patterns
- **Image Handling**: Next.js Image + Cloudinary

### Backend

- **Runtime**: Node.js 20 LTS
- **Database**: PostgreSQL 16
- **ORM**: Prisma 6.x
- **Authentication**: NextAuth.js v5 (credentials provider)
- **Validation**: Zod schemas
- **File Upload**: Cloudinary SDK v2

### DevOps & Quality

- **CI/CD**: GitHub Actions
- **Testing**: Jest + React Testing Library (setup)
- **Linting**: ESLint with Next.js config
- **Formatting**: Prettier
- **Git Hooks**: Husky + lint-staged
- **Monitoring**: Sentry
- **Database Tools**: Prisma Studio

## 🏁 Getting Started

### Prerequisites

- Node.js 20 or higher
- PostgreSQL 16 database
- Cloudinary account (for image uploads)
- Git

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/NicoMagro/ecommerce.git
cd ecommerce
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ecommerce?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Sentry (optional)
SENTRY_DSN="your_sentry_dsn"
```

4. **Set up the database**

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database with sample data
npm run db:seed
```

5. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Default Admin Credentials

```
Email: admin@ecommerce.com
Password: Admin123!
```

**⚠️ Important**: Change these credentials in production!

## 💻 Development Scripts

```bash
# Development
npm run dev                # Start development server (with Turbopack)
npm run build              # Build for production
npm start                  # Start production server

# Code Quality
npm run lint               # Run ESLint
npm run lint:fix           # Fix ESLint errors automatically
npm run format             # Format code with Prettier
npm run format:check       # Check formatting without modifying files
npm run type-check         # TypeScript type checking

# Database
npm run db:generate        # Generate Prisma Client
npm run db:push            # Push schema to database
npm run db:migrate         # Create a migration
npm run db:studio          # Open Prisma Studio (database GUI)
npm run db:seed            # Seed database with sample data

# Testing (coming in Sprint 10)
npm test                   # Run tests
npm run test:coverage      # Run tests with coverage
```

## 🗄️ Database Schema

Complete e-commerce schema including:

- **Users & Authentication**: User accounts, sessions, credentials
- **Products & Categories**: Products, categories, images, variants
- **Shopping Cart**: Cart items, session management
- **Orders & Payments**: Orders, order items, payment records
- **Reviews & Ratings**: Product reviews and ratings
- **Inventory Management**: Stock tracking, reservations

View complete schema: `prisma/schema.prisma`

### Key Models:

- `User`: User accounts with role-based access
- `Product`: Products with images, pricing, and inventory
- `Category`: Product categorization with hierarchy
- `ProductImage`: Cloudinary-hosted images
- `Order`: Customer orders with status tracking
- `Cart`: Shopping cart functionality

## 🔐 Security Features

### Authentication

- **NextAuth.js v5** with credentials provider
- **Password hashing**: bcrypt with 12 rounds
- **Account lockout**: Protection against brute force (5 failed attempts)
- **JWT sessions**: Secure, stateless authentication
- **Secure cookies**: httpOnly, secure, sameSite settings

### Authorization

- **Role-based access control** (RBAC)
- Admin-only routes protected by middleware
- API endpoints validate user permissions

### Input Validation

- **Zod schemas** for all user inputs
- **SQL injection prevention** via Prisma
- **XSS protection** with input sanitization
- **CSRF protection** in forms

### Security Headers

- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach
- **Modern UI**: Tailwind CSS 4 with custom components
- **Accessibility**: WCAG AA compliance
- **Loading States**: Skeleton screens and spinners
- **Error Handling**: User-friendly error messages
- **Toast Notifications**: Success/error feedback
- **Dark Mode Ready**: Design system prepared for dark mode

## 🔄 CI/CD Pipeline

Automated checks on every push:

- ✅ **Lint & Format Check**: ESLint + Prettier
- ✅ **TypeScript Type Check**: Zero type errors
- ✅ **Build Application**: Successful compilation

See [CI/CD Pipeline Standards](context/standards/ci-cd-pipeline.md) for details.

## 📚 Documentation

### Project Documentation

- **[CLAUDE.md](CLAUDE.md)** - Guide for AI assistants (Claude Code)
- **[SPRINT_PLAN.md](SPRINT_PLAN.md)** - Complete 12-sprint roadmap
- **[SYSTEM_REQUIREMENTS.md](SYSTEM_REQUIREMENTS.md)** - Functional & non-functional requirements
- **[TECHNICAL_SPECIFICATIONS.md](TECHNICAL_SPECIFICATIONS.md)** - Architecture & tech stack details

### Context System (for AI Assistants)

- **[/context/agents/](context/agents/)** - Specialized sub-agents for different domains
- **[/context/standards/](context/standards/)** - Code style, naming conventions, CI/CD
- **[/context/examples/](context/examples/)** - Reference implementations
- **[/context/checklists/](context/checklists/)** - Pre-commit and deployment checklists

### Sprint Documentation

- **[Sprint 1 Progress](docs/SPRINT_1_PROGRESS.md)** - Detailed sprint tracking
- **[US-1.1 Summary](docs/US-1.1_COMPLETION_SUMMARY.md)** - Admin CRUD completion
- **[US-1.2 Summary](docs/US-1.2_COMPLETION_SUMMARY.md)** - Public API completion
- **[US-1.3 Summary](docs/US-1.3_COMPLETION_SUMMARY.md)** - Product Card completion
- **[US-1.4 Summary](docs/US-1.4_COMPLETION_SUMMARY.md)** - Cloudinary integration
- **[US-1.5 Summary](docs/US-1.5_COMPLETION_SUMMARY.md)** - Product listing page
- **[US-1.6 Summary](docs/US-1.6_COMPLETION_SUMMARY.md)** - Admin dashboard

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Docker (Coming Soon)

Docker support will be added in Sprint 11.

## 📈 Project Status & Roadmap

### ✅ Completed Sprints

- **Sprint 0** (Weeks 1-2): Foundation & Infrastructure Setup - **100% Complete**
- **Sprint 1** (Weeks 3-4): Core Product Catalog - **100% Complete**

### 🔄 Next Sprint

**Sprint 2** (Weeks 5-6): Product Details & Categories

**Planned Features:**

- Enhanced product detail page with image gallery
- Category management (CRUD for categories)
- Product variants (size, color, etc.)
- Advanced filtering on product listing
- SEO optimization for product pages
- Related products recommendations

### 📅 Future Sprints

- **Sprint 3**: Search & Filtering
- **Sprint 4**: Shopping Cart
- **Sprint 5**: User Registration & Authentication
- **Sprint 6**: Checkout Part 1
- **Sprint 7**: Checkout Part 2 (Stripe Integration)
- **Sprint 8**: Admin Order Management
- **Sprint 9**: Inventory Management
- **Sprint 10**: Reviews & Ratings
- **Sprint 11**: Performance & SEO
- **Sprint 12**: Final Polish & Launch

See [SPRINT_PLAN.md](SPRINT_PLAN.md) for complete details.

## 🤝 Contributing

This is currently a solo project, but contributions are welcome!

### Development Workflow

1. Create a feature branch
2. Make your changes
3. Ensure all checks pass:
   ```bash
   npm run lint
   npm run type-check
   npm run build
   ```
4. Commit with meaningful messages
5. Push and create a pull request

### Code Standards

- **TypeScript strict mode** - No `any` types
- **ESLint** - Follow project rules
- **Prettier** - Auto-formatting on save
- **Conventional Commits** - Use semantic commit messages
- **Tests** - Write tests for new features (Sprint 10+)

## 📝 License

MIT License - feel free to use this project for learning or as a starter template.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Database with [Prisma](https://www.prisma.io/)
- Authentication with [NextAuth.js](https://next-auth.js.org/)
- Images with [Cloudinary](https://cloudinary.com/)
- Monitoring with [Sentry](https://sentry.io/)

## 📧 Contact

**Developer**: Nico Magro
**GitHub**: [@NicoMagro](https://github.com/NicoMagro)
**Repository**: [github.com/NicoMagro/ecommerce](https://github.com/NicoMagro/ecommerce)

---

**Built with ❤️ using Next.js, TypeScript, and modern best practices**

**Status**: 🟢 Active Development | Sprint 1 Complete | Ready for Sprint 2
