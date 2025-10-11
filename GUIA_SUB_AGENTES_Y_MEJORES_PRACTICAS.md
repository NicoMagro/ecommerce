# Guía Completa: Sub-Agentes y Mejores Prácticas para Desarrollo Web

## 📋 Tabla de Contenidos

1. [Arquitectura de Sub-Agentes](#arquitectura-de-sub-agentes)
2. [Sub-Agentes Recomendados](#sub-agentes-recomendados)
3. [Estructura de la Carpeta /context](#estructura-de-la-carpeta-context)
4. [Mejores Prácticas de Programación](#mejores-prácticas-de-programación)
5. [Estándares de Código](#estándares-de-código)
6. [Seguridad](#seguridad)
7. [Flujo de Trabajo Recomendado](#flujo-de-trabajo-recomendado)

---

## 🏗️ Arquitectura de Sub-Agentes

### Concepto Principal

Los sub-agentes son módulos especializados que proporcionan documentación, contexto y reglas específicas para diferentes aspectos del desarrollo. El agente principal (Claude) los consulta para tomar decisiones informadas.

### ¿Por qué usar Sub-Agentes?

- ✅ **Especialización**: Cada agente maneja un dominio específico
- ✅ **Consistencia**: Reglas uniformes en todo el proyecto
- ✅ **Escalabilidad**: Fácil agregar nuevos dominios
- ✅ **Mantenibilidad**: Documentación centralizada y versionada

---

## 🤖 Sub-Agentes Recomendados

### 1. **Frontend Sub-Agent**

**Archivo**: `/context/frontend-agent.md`

**Responsabilidades**:

- Guías de componentes UI/UX
- Estilos y temas (CSS/Tailwind/etc)
- Estado de la aplicación (Redux, Zustand, Context API)
- Optimización de rendimiento frontend
- Accesibilidad (a11y)

**Casos de uso**:

- Crear componentes React/Vue/Angular
- Implementar diseño responsivo
- Manejar formularios y validaciones
- Implementar lazy loading e code splitting

---

### 2. **Backend Sub-Agent**

**Archivo**: `/context/backend-agent.md`

**Responsabilidades**:

- Arquitectura de APIs (REST, GraphQL)
- Manejo de base de datos
- Autenticación y autorización
- Middleware y validaciones
- Logging y monitoreo

**Casos de uso**:

- Crear endpoints de API
- Diseñar esquemas de base de datos
- Implementar autenticación JWT/OAuth
- Manejar archivos y uploads

---

### 3. **Database Sub-Agent**

**Archivo**: `/context/database-agent.md`

**Responsabilidades**:

- Diseño de esquemas
- Migraciones y seeds
- Optimización de queries
- Índices y relaciones
- Estrategias de caché

**Casos de uso**:

- Crear modelos de datos
- Escribir migraciones
- Optimizar consultas lentas
- Implementar transacciones

---

### 4. **Security Sub-Agent**

**Archivo**: `/context/security-agent.md`

**Responsabilidades**:

- Validación y sanitización de inputs
- Prevención de vulnerabilidades (XSS, CSRF, SQL Injection)
- Gestión de secretos y variables de entorno
- Headers de seguridad
- Rate limiting y throttling

**Casos de uso**:

- Revisar código en busca de vulnerabilidades
- Implementar protección CSRF
- Configurar CORS correctamente
- Manejar datos sensibles

---

### 5. **Testing Sub-Agent**

**Archivo**: `/context/testing-agent.md`

**Responsabilidades**:

- Estrategias de testing (unit, integration, e2e)
- Configuración de test runners
- Mocking y fixtures
- Coverage y calidad de tests
- TDD/BDD guidelines

**Casos de uso**:

- Escribir tests unitarios
- Crear tests de integración
- Implementar tests e2e con Playwright/Cypress
- Configurar CI/CD para tests

---

### 6. **DevOps Sub-Agent**

**Archivo**: `/context/devops-agent.md`

**Responsabilidades**:

- Configuración de entornos (dev, staging, prod)
- Docker y containerización
- CI/CD pipelines
- Deployment strategies
- Monitoreo y logging

**Casos de uso**:

- Crear Dockerfiles
- Configurar GitHub Actions/GitLab CI
- Setup de variables de entorno
- Configurar reverse proxy (Nginx)

---

### 7. **Documentation Sub-Agent**

**Archivo**: `/context/documentation-agent.md`

**Responsabilidades**:

- Estándares de documentación de código
- README y guías de setup
- Documentación de APIs
- Changelog y release notes
- Comentarios en código

**Casos de uso**:

- Generar documentación de API
- Escribir READMEs completos
- Documentar funciones complejas
- Crear guías de contribución

---

### 8. **Performance Sub-Agent**

**Archivo**: `/context/performance-agent.md`

**Responsabilidades**:

- Optimización de bundle size
- Caching strategies
- Lazy loading y code splitting
- Optimización de imágenes
- Web Vitals (LCP, FID, CLS)

**Casos de uso**:

- Optimizar tiempo de carga
- Reducir tamaño de bundles
- Implementar service workers
- Optimizar consultas a BD

---

### 9. **API Design Sub-Agent**

**Archivo**: `/context/api-design-agent.md`

**Responsabilidades**:

- Naming conventions para endpoints
- Versionamiento de APIs
- Códigos de estado HTTP
- Estructura de respuestas
- Paginación y filtrado

**Casos de uso**:

- Diseñar nuevos endpoints
- Estructurar respuestas de error
- Implementar paginación
- Versionado de API

---

### 10. **E-commerce Specialist Sub-Agent** ⭐

**Archivo**: `/context/ecommerce-agent.md`

**Responsabilidades**:

- Carrito de compras y checkout
- Gestión de productos e inventario
- Pasarelas de pago (Stripe, PayPal)
- Órdenes y fulfillment
- Búsqueda y filtros de productos

**Casos de uso**:

- Implementar carrito de compras
- Integrar Stripe/PayPal
- Sistema de cupones y descuentos
- Gestión de stock

---

## 📁 Estructura de la Carpeta /context

```
/context/
├── README.md                      # Índice de todos los sub-agentes
├── project-overview.md            # Visión general del proyecto
├── tech-stack.md                  # Stack tecnológico usado
│
├── agents/                        # Sub-agentes especializados
│   ├── frontend-agent.md
│   ├── backend-agent.md
│   ├── database-agent.md
│   ├── security-agent.md
│   ├── testing-agent.md
│   ├── devops-agent.md
│   ├── documentation-agent.md
│   ├── performance-agent.md
│   ├── api-design-agent.md
│   └── ecommerce-agent.md
│
├── standards/                     # Estándares del proyecto
│   ├── code-style.md             # Reglas de estilo de código
│   ├── naming-conventions.md     # Convenciones de nombres
│   ├── git-workflow.md           # Flujo de trabajo con Git
│   └── code-review.md            # Checklist de code review
│
├── architecture/                  # Arquitectura del sistema
│   ├── system-design.md          # Diseño del sistema
│   ├── data-flow.md              # Flujo de datos
│   ├── folder-structure.md       # Estructura de carpetas
│   └── dependencies.md           # Gestión de dependencias
│
├── examples/                      # Ejemplos de código
│   ├── component-template.tsx
│   ├── api-endpoint-template.ts
│   ├── test-template.spec.ts
│   └── model-template.ts
│
└── checklists/                    # Listas de verificación
    ├── pre-commit-checklist.md
    ├── deployment-checklist.md
    └── security-checklist.md
```

---

## 💎 Mejores Prácticas de Programación

### 1. **Principios SOLID**

#### S - Single Responsibility Principle (SRP)

```typescript
// ❌ MAL: Una clase hace demasiado
class User {
  saveToDatabase() {}
  sendEmail() {}
  validateData() {}
}

// ✅ BIEN: Cada clase tiene una responsabilidad
class User {}
class UserRepository {
  save(user: User) {}
}
class EmailService {
  send(to: string, subject: string) {}
}
class UserValidator {
  validate(user: User) {}
}
```

#### O - Open/Closed Principle

```typescript
// ✅ Abierto para extensión, cerrado para modificación
interface PaymentProcessor {
  process(amount: number): Promise<void>;
}

class StripePayment implements PaymentProcessor {
  async process(amount: number) {
    /* ... */
  }
}

class PayPalPayment implements PaymentProcessor {
  async process(amount: number) {
    /* ... */
  }
}
```

#### L - Liskov Substitution Principle

```typescript
// Las clases derivadas deben ser sustituibles por sus clases base
class Bird {
  fly() {}
}

// ❌ MAL: Penguin es un Bird pero no puede volar
class Penguin extends Bird {
  fly() {
    throw new Error("Can't fly");
  }
}

// ✅ BIEN: Mejor diseño
interface Animal {}
interface FlyingAnimal extends Animal {
  fly(): void;
}
```

#### I - Interface Segregation Principle

```typescript
// ❌ MAL: Interfaz demasiado grande
interface Worker {
  work(): void;
  eat(): void;
  sleep(): void;
}

// ✅ BIEN: Interfaces pequeñas y específicas
interface Workable {
  work(): void;
}
interface Eatable {
  eat(): void;
}
interface Sleepable {
  sleep(): void;
}
```

#### D - Dependency Inversion Principle

```typescript
// ✅ Depender de abstracciones, no de concreciones
interface Logger {
  log(message: string): void;
}

class ConsoleLogger implements Logger {
  log(message: string) {
    console.log(message);
  }
}

class UserService {
  constructor(private logger: Logger) {}

  createUser() {
    this.logger.log('User created');
  }
}
```

---

### 2. **DRY - Don't Repeat Yourself**

```typescript
// ❌ MAL: Código duplicado
function calculateDiscountForVIP(price: number) {
  return price * 0.8;
}
function calculateDiscountForRegular(price: number) {
  return price * 0.95;
}

// ✅ BIEN: Reutilización
function calculateDiscount(price: number, discountRate: number) {
  return price * (1 - discountRate);
}
```

---

### 3. **KISS - Keep It Simple, Stupid**

```typescript
// ❌ MAL: Demasiado complejo
const isEven = (n: number) => (n % 2 === 0 ? true : false);

// ✅ BIEN: Simple y directo
const isEven = (n: number) => n % 2 === 0;
```

---

### 4. **YAGNI - You Aren't Gonna Need It**

No implementes funcionalidades "por si acaso". Solo escribe código que necesites ahora.

---

### 5. **Composición sobre Herencia**

```typescript
// ✅ BIEN: Usar composición
class Logger {
  log(message: string) {
    console.log(message);
  }
}

class Database {
  constructor(private logger: Logger) {}

  save(data: any) {
    this.logger.log('Saving data');
    // ...
  }
}
```

---

### 6. **Fail Fast**

```typescript
// ✅ Validar temprano y fallar rápido
function processPayment(amount: number, userId: string) {
  if (!amount || amount <= 0) {
    throw new Error('Invalid amount');
  }
  if (!userId) {
    throw new Error('User ID required');
  }
  // continuar con la lógica
}
```

---

### 7. **Inmutabilidad**

```typescript
// ✅ Preferir datos inmutables
const addItem = (cart: readonly Item[], newItem: Item): Item[] => {
  return [...cart, newItem];
};

// Usar const por defecto
const user = { name: 'John' };
```

---

### 8. **Funciones Pure**

```typescript
// ✅ Funciones puras: mismo input = mismo output, sin side effects
const add = (a: number, b: number): number => a + b;

// ❌ MAL: Side effects
let total = 0;
const addToTotal = (value: number) => {
  total += value; // modifica estado externo
};
```

---

## 📏 Estándares de Código

### 1. **Naming Conventions**

```typescript
// Variables y funciones: camelCase
const userName = 'John';
function getUserById(id: string) {}

// Clases e Interfaces: PascalCase
class UserService {}
interface UserRepository {}

// Constantes: UPPER_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_URL = 'https://api.example.com';

// Archivos de componentes: PascalCase
// UserProfile.tsx, ProductCard.tsx

// Archivos de utilities: kebab-case
// string-utils.ts, date-helpers.ts

// Variables booleanas: is/has/should prefix
const isActive = true;
const hasPermission = false;
const shouldUpdate = true;
```

---

### 2. **Estructura de Archivos**

```typescript
// Orden recomendado en archivos:
// 1. Imports
import React from 'react';
import { UserService } from './services';

// 2. Types/Interfaces
interface Props {
  userId: string;
}

// 3. Constants
const DEFAULT_TIMEOUT = 5000;

// 4. Component/Function
export const UserProfile: React.FC<Props> = ({ userId }) => {
  // ...
};

// 5. Exports
export default UserProfile;
```

---

### 3. **Comentarios**

```typescript
/**
 * Calcula el precio final después de aplicar descuentos e impuestos
 * @param basePrice - Precio base del producto
 * @param discountPercent - Porcentaje de descuento (0-100)
 * @param taxRate - Tasa de impuestos (ej: 0.21 para 21%)
 * @returns Precio final calculado
 * @throws {Error} Si el precio base es negativo
 */
function calculateFinalPrice(basePrice: number, discountPercent: number, taxRate: number): number {
  if (basePrice < 0) {
    throw new Error('El precio base no puede ser negativo');
  }

  const discountedPrice = basePrice * (1 - discountPercent / 100);
  return discountedPrice * (1 + taxRate);
}

// Comentarios inline solo cuando es necesario explicar "por qué", no "qué"
// ❌ MAL
const total = price * 2; // multiplica precio por 2

// ✅ BIEN
// Duplicamos el precio porque incluye envío de ida y vuelta
const total = price * 2;
```

---

### 4. **Error Handling**

```typescript
// ✅ BIEN: Manejo estructurado de errores
class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// Usar errores específicos
class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, true);
  }
}

class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, true);
  }
}

// En funciones async
async function getUser(id: string): Promise<User> {
  try {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User');
    }
    return user;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    // Log error inesperado
    logger.error('Unexpected error in getUser', error);
    throw new AppError('Internal server error', 500);
  }
}
```

---

### 5. **TypeScript Best Practices**

```typescript
// ✅ Usar tipos estrictos
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}

// ✅ Evitar 'any'
// ❌ MAL
function processData(data: any) { }

// ✅ BIEN
function processData(data: unknown) {
  if (typeof data === 'string') {
    // TypeScript sabe que data es string aquí
  }
}

// ✅ Usar tipos utilitarios
interface User {
  id: string;
  name: string;
  email: string;
  password: string;
}

// Omitir campos sensibles
type PublicUser = Omit<User, 'password'>;

// Solo campos requeridos para actualización
type UpdateUserDTO = Partial<Pick<User, 'name' | 'email'>>;

// ✅ Usar enums o const assertions
// Opción 1: Enum
enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered'
}

// Opción 2: Const assertion
const OrderStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered'
} as const;

type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];
```

---

## 🔒 Seguridad

### 1. **Validación de Inputs**

```typescript
import { z } from 'zod';

// ✅ Usar bibliotecas de validación como Zod
const userSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  age: z.number().min(18).max(120),
});

function createUser(data: unknown) {
  // Validar y parsear
  const validatedData = userSchema.parse(data);
  // ...
}
```

---

### 2. **Prevención de Inyección SQL**

```typescript
// ❌ MAL: Vulnerable a SQL injection
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ BIEN: Usar queries parametrizadas
const query = 'SELECT * FROM users WHERE email = ?';
db.execute(query, [email]);

// ✅ O usar un ORM
const user = await prisma.user.findUnique({
  where: { email },
});
```

---

### 3. **Prevención XSS**

```typescript
// ✅ En React, escapa automáticamente
<div>{userInput}</div> // Seguro por defecto

// ❌ PELIGROSO: dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ Si necesitas HTML, sanitízalo
import DOMPurify from 'dompurify';

<div dangerouslySetInnerHTML={{
  __html: DOMPurify.sanitize(userInput)
}} />
```

---

### 4. **Autenticación y Autorización**

```typescript
// ✅ Usar JWT correctamente
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// Hashear passwords
const hashedPassword = await bcrypt.hash(password, 10);

// Verificar password
const isValid = await bcrypt.compare(inputPassword, hashedPassword);

// Generar JWT
const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET!, {
  expiresIn: '1h',
});

// Middleware de autenticación
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

---

### 5. **Variables de Entorno**

```typescript
// .env (NUNCA commitear este archivo)
DATABASE_URL=postgresql://user:pass@localhost:5432/db
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_test_...

// .env.example (SÍ commitear este archivo)
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
JWT_SECRET=your-secret-here
STRIPE_SECRET_KEY=sk_test_your_key_here

// ✅ Validar variables de entorno al inicio
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.string().transform(Number)
});

export const env = envSchema.parse(process.env);
```

---

### 6. **Rate Limiting**

```typescript
import rateLimit from 'express-rate-limit';

// ✅ Implementar rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana
  message: 'Too many requests from this IP',
});

app.use('/api/', limiter);

// Rate limiting más estricto para login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts',
});

app.post('/api/login', loginLimiter, loginController);
```

---

### 7. **Headers de Seguridad**

```typescript
import helmet from 'helmet';

// ✅ Usar Helmet para headers de seguridad
app.use(helmet());

// Configurar CORS correctamente
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
```

---

### 8. **Sanitización de Datos**

```typescript
// ✅ Sanitizar inputs
import validator from 'validator';

function sanitizeInput(input: string): string {
  return validator.escape(validator.trim(input));
}

// ✅ Sanitizar objetos profundos
function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeInput(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  if (obj && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      acc[key] = sanitizeObject(obj[key]);
      return acc;
    }, {} as any);
  }
  return obj;
}
```

---

## 🔄 Flujo de Trabajo Recomendado

### 1. **Antes de Empezar una Tarea**

```
1. Lee el contexto relevante de /context/
2. Identifica qué sub-agentes consultar
3. Revisa los estándares de código aplicables
4. Verifica ejemplos en /context/examples/
```

### 2. **Durante el Desarrollo**

```
1. Escribe código siguiendo los estándares
2. Añade tests unitarios
3. Documenta funciones complejas
4. Valida seguridad con el security-agent
5. Revisa performance si es crítico
```

### 3. **Antes de Commit**

```
1. Ejecuta linter: npm run lint
2. Ejecuta tests: npm run test
3. Verifica coverage: npm run test:coverage
4. Revisa /context/checklists/pre-commit-checklist.md
5. Escribe mensaje de commit descriptivo
```

### 4. **Code Review**

```
1. Sigue /context/standards/code-review.md
2. Verifica que cumple con los sub-agentes relevantes
3. Revisa seguridad y performance
4. Asegura que hay tests adecuados
```

---

## 📝 Ejemplo de Uso de Sub-Agentes

### Escenario: Crear un endpoint para procesar pagos

**Paso 1**: Consultar sub-agentes relevantes

```
- /context/agents/backend-agent.md → estructura del endpoint
- /context/agents/api-design-agent.md → naming y convenciones
- /context/agents/security-agent.md → validaciones y seguridad
- /context/agents/ecommerce-agent.md → lógica de pagos
- /context/agents/testing-agent.md → cómo testear
```

**Paso 2**: Implementar siguiendo las guías

```typescript
// Siguiendo los estándares de todos los sub-agentes consultados
import { z } from 'zod';
import { stripe } from '@/lib/stripe';
import { authMiddleware } from '@/middleware/auth';

const paymentSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().length(3),
  orderId: z.string().uuid(),
});

export async function POST(req: Request) {
  try {
    // Validación (Security Agent)
    const body = paymentSchema.parse(await req.json());

    // Autorización (Security Agent)
    const user = await authMiddleware(req);

    // Verificar que la orden pertenece al usuario
    const order = await db.order.findUnique({
      where: { id: body.orderId },
    });

    if (order.userId !== user.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Procesar pago (E-commerce Agent)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: body.amount,
      currency: body.currency,
      metadata: { orderId: body.orderId },
    });

    // Respuesta estandarizada (API Design Agent)
    return Response.json(
      {
        data: {
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    // Error handling estandarizado
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }

    logger.error('Payment processing failed', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**Paso 3**: Escribir tests (Testing Agent)

```typescript
describe('POST /api/payments', () => {
  it('should process payment successfully', async () => {
    // Test implementation
  });

  it('should reject invalid amount', async () => {
    // Test implementation
  });

  it('should reject unauthorized access', async () => {
    // Test implementation
  });
});
```

---

## 🎯 Checklist Final

### Para el Agente Principal (Claude)

- [ ] Consultar sub-agentes relevantes antes de generar código
- [ ] Seguir los estándares definidos en /context/standards/
- [ ] Validar seguridad usando security-agent
- [ ] Incluir tests cuando sea apropiado
- [ ] Documentar código complejo
- [ ] Usar ejemplos de /context/examples/ como referencia
- [ ] Seguir las convenciones de naming
- [ ] Aplicar principios SOLID
- [ ] Mantener código DRY y KISS
- [ ] Implementar manejo de errores robusto

### Para el Desarrollador

- [ ] Crear la estructura de /context/ al inicio del proyecto
- [ ] Mantener los sub-agentes actualizados
- [ ] Agregar ejemplos conforme el proyecto crece
- [ ] Revisar y refinar estándares periódicamente
- [ ] Usar los checklists antes de commits y deploys
- [ ] Entrenar al equipo en el uso de sub-agentes
- [ ] Documentar decisiones arquitectónicas importantes

---

## 🚀 Próximos Pasos

1. **Crear la estructura /context/** en tu proyecto
2. **Empezar con los sub-agentes más críticos** (frontend, backend, security)
3. **Definir estándares** específicos para tu tech stack
4. **Añadir ejemplos** conforme desarrolles patrones comunes
5. **Iterar y mejorar** los sub-agentes basándote en experiencias reales

---

## 📚 Recursos Adicionales

- **Clean Code** - Robert C. Martin
- **Design Patterns** - Gang of Four
- **Refactoring** - Martin Fowler
- **The Pragmatic Programmer** - Hunt & Thomas
- **OWASP Top 10** - Vulnerabilidades de seguridad web
- **TypeScript Deep Dive** - Basarat Ali Syed
- **Web.dev** - Google's web development best practices

---

**¡Buena suerte con tu proyecto e-commerce y el aprendizaje de Claude Code!** 🎉
