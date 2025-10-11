# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **sub-agent documentation system** for e-commerce development. It provides structured guidance, standards, and best practices to help AI agents (like Claude Code) generate professional, secure, and consistent code for e-commerce applications.

The project is a meta-framework: it doesn't contain application code itself, but rather comprehensive documentation that guides code generation through specialized "sub-agents" (documentation modules).

## Architecture

### Core Concept: Sub-Agents System

Sub-agents are specialized markdown documents in `/context/agents/` that define standards, patterns, and best practices for specific domains:

- **[frontend-agent.md](context/agents/frontend-agent.md)** - React components, state management, styling, accessibility, performance
- **[security-agent.md](context/agents/security-agent.md)** - Input validation, authentication, CSRF/XSS prevention, secure coding
- **[ecommerce-agent.md](context/agents/ecommerce-agent.md)** - Shopping cart, checkout, payments, inventory management

### Directory Structure

```
/context/
├── agents/           # Specialized domain experts (frontend, security, e-commerce)
├── standards/        # Code style, naming conventions
├── examples/         # Reference implementations
└── checklists/       # Pre-commit and deployment verification

/                     # Root documentation
├── README.md                              # Quick start guide
├── GUIA_SUB_AGENTES_Y_MEJORES_PRACTICAS.md # Comprehensive theory (SOLID, DRY, security)
├── COMO_USAR_ESTA_GUIA.md                # Usage tutorial
├── GUIA_PROYECTOS_EXISTENTES.md          # Guide for existing projects
└── QUICK_REFERENCE.md                    # Cheat sheet
```

## How to Use This System

### When Users Request Code Generation

1. **Identify relevant sub-agents** - Determine which agents apply (e.g., frontend + security for a login form)
2. **Read the agent files** - Use the Read tool to access the relevant documentation in `/context/agents/`
3. **Apply the standards** - Follow the patterns, principles, and examples from the agents
4. **Include tests** - Most agents emphasize testing as part of implementation

### Common Patterns

Users will typically phrase requests like:

```
"Siguiendo [agent-name], crea [component/feature]..."
"Following frontend-agent and security-agent, create a ProductCard component..."
```

When you see this pattern:

1. Read the specified agent file(s) from `/context/agents/`
2. Apply the standards defined in those files
3. Reference `/context/standards/` for code style and naming conventions
4. Check `/context/examples/` for implementation patterns

### Key Principles from the System

From [GUIA_SUB_AGENTES_Y_MEJORES_PRACTICAS.md](GUIA_SUB_AGENTES_Y_MEJORES_PRACTICAS.md):

**SOLID Principles** - Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion
**DRY** - Don't Repeat Yourself
**KISS** - Keep It Simple, Stupid
**Security First** - Defense in depth, input validation, sanitization, fail secure
**TypeScript Strict Mode** - No `any`, explicit types, proper error handling

### Security Requirements

All code must follow [security-agent.md](context/agents/security-agent.md):

- Input validation with Zod schemas
- Password hashing with bcrypt (10+ rounds)
- JWT tokens with proper expiration
- Parameterized database queries (prevent SQL injection)
- XSS prevention (sanitize HTML with DOMPurify)
- CSRF protection
- Rate limiting on public endpoints
- Security headers (Helmet.js)
- No hardcoded secrets (use environment variables)

### Frontend Standards

From [frontend-agent.md](context/agents/frontend-agent.md):

- Functional components with hooks (no class components)
- TypeScript for all props and state
- CSS Modules or Tailwind for styling
- Accessibility (WCAG AA compliance)
- Performance optimizations (lazy loading, memoization, code splitting)
- React Query for server state
- Zustand/Redux for global state
- Tests with Testing Library

### Code Style

From [code-style.md](context/standards/code-style.md):

- Prettier + ESLint configuration
- TypeScript strict mode enabled
- Import order: external → absolute (@/) → relative
- camelCase for variables/functions, PascalCase for classes/components
- UPPER_SNAKE_CASE for constants
- JSDoc comments for public functions
- Structured error handling with custom error classes

## Extending the System

### For New Projects

Users should personalize [context/project-overview.md](context/project-overview.md) with their specific:

- Tech stack
- Folder structure
- Environment variables
- Business requirements

### For Existing Projects

The system can be adapted to existing codebases:

1. Analyze existing code patterns
2. Create custom sub-agents based on the project's actual architecture
3. Use [context/PLANTILLA_SUB_AGENTE.md](context/PLANTILLA_SUB_AGENTE.md) as a template
4. Gradually apply standards without breaking existing functionality

## Commands and Workflows

### Common Development Tasks

```bash
# Linting
npm run lint

# Testing
npm run test
npm run test:coverage

# Type checking
npm run type-check

# Formatting
npm run format
```

### Pre-Commit Checklist

From [context/checklists/pre-commit-checklist.md](context/checklists/pre-commit-checklist.md):

- All inputs validated and sanitized
- No hardcoded secrets
- Tests pass
- Linting passes
- TypeScript compiles without errors
- Security headers configured
- Rate limiting on public endpoints

## Important Conventions

### File Naming

- Components: `PascalCase.tsx` (e.g., `ProductCard.tsx`)
- Utilities: `kebab-case.ts` (e.g., `string-utils.ts`)
- Types: `types.ts` or `interfaces.ts`
- Tests: `ComponentName.test.tsx`

### Component Structure

```typescript
// 1. Imports (external → internal → relative)
// 2. Types/Interfaces
// 3. Constants
// 4. Component definition
// 5. Exports
```

### Error Handling

Always use structured error handling:

- Custom error classes extending `AppError`
- Specific error types (ValidationError, NotFoundError, etc.)
- Proper HTTP status codes
- Security event logging

## Key References

- **Theory**: [GUIA_SUB_AGENTES_Y_MEJORES_PRACTICAS.md](GUIA_SUB_AGENTES_Y_MEJORES_PRACTICAS.md) - Complete guide to SOLID principles, security (OWASP), and architecture
- **Quick Start**: [COMO_USAR_ESTA_GUIA.md](context/COMO_USAR_ESTA_GUIA.md) - How to use the system effectively
- **Cheat Sheet**: [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - 30-second reference
- **FAQ**: [FAQ.md](FAQ.md) - Common questions and troubleshooting

## Language and Code Standards

### Language Policy

- **Documentation**: Primarily in Spanish (user preference)
- **Code**: **ALWAYS in English** (industry standard)
  - Variable names: English (e.g., `productPrice`, not `precioProducto`)
  - Function names: English (e.g., `calculateTotal`, not `calcularTotal`)
  - Class names: English (e.g., `UserService`, not `ServicioUsuario`)
  - Comments in code: English
  - Commit messages: English
- **User interaction**: Can be in Spanish or English

### Why English for Code?

- International collaboration compatibility
- Better integration with libraries and frameworks
- Stack Overflow and documentation searches
- Industry best practices
- Future-proofing for global teams

## Automatic Agent Selection

**Claude should autonomously decide which agents to use** based on the user's request:

### Decision Matrix

| User Request Contains...                  | Use These Agents                                  |
| ----------------------------------------- | ------------------------------------------------- |
| "componente", "UI", "formulario", "botón" | frontend-agent + (security-agent if has inputs)   |
| "endpoint", "API", "ruta", "controller"   | backend-agent + security-agent + api-design-agent |
| "pago", "carrito", "checkout", "producto" | ecommerce-agent + security-agent                  |
| "base de datos", "schema", "migración"    | database-agent + backend-agent                    |
| "test", "prueba", "coverage"              | testing-agent + (relevant domain agent)           |
| "seguridad", "validación", "auth"         | security-agent (always)                           |
| "performance", "optimización", "lento"    | performance-agent + (relevant domain)             |

### Multi-Agent Strategy

**Always consider multiple agents:**

- Security-agent is **almost always** relevant (input validation, sanitization)
- Combine domain agents as needed (e.g., frontend + ecommerce for ProductCard)
- Reference code-style and naming-conventions for consistency

### Example Decision Process

```
User: "Crea un componente de login"
Claude thinks:
  - Login = UI component → frontend-agent
  - Login = handles sensitive data → security-agent
  - Login = authentication → backend-agent (if creating endpoint)
Claude response: "Following frontend-agent and security-agent..."
```

**User doesn't need to specify agents** - Claude should intelligently select them.

## Special Considerations

1. **This is a documentation project** - There is no application source code in `/src/`. The value is in the `/context/` documentation system.

2. **Iterative improvement** - The sub-agents are meant to evolve with the project. Update them as patterns emerge.

3. **Not prescriptive** - Users should adapt agents to their specific needs rather than following them rigidly.

4. **Team collaboration** - The system is designed for consistency across team members, making onboarding faster and code reviews easier.
