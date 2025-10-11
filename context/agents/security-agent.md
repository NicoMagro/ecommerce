# Security Agent

## 🔒 Responsabilidad

Asegurar que todo el código generado cumple con estándares de seguridad profesionales.

## 🎯 Principios de Seguridad

### 1. Defense in Depth

- Múltiples capas de seguridad
- Nunca confiar solo en el frontend
- Validación en frontend Y backend
- Principio de mínimo privilegio

### 2. Security by Design

- Seguridad desde el inicio, no como agregado
- Fail secure (fallar de forma segura)
- Logging de eventos de seguridad
- Auditoría regular

## 🛡️ Validación y Sanitización

### Input Validation

```typescript
import { z } from 'zod';

// ✅ Validación estricta con Zod
const loginSchema = z.object({
  email: z.string().email('Invalid email format').max(255, 'Email too long'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password too long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      'Password must contain uppercase, lowercase, number, and special character'
    ),
});

const registerSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// Uso
function validateLogin(data: unknown) {
  try {
    return loginSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(error.errors);
    }
    throw error;
  }
}
```

### Sanitización

```typescript
import DOMPurify from 'isomorphic-dompurify';
import validator from 'validator';

// ✅ Sanitizar HTML
function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p'],
    ALLOWED_ATTR: ['href'],
  });
}

// ✅ Sanitizar strings generales
function sanitizeString(input: string): string {
  return validator.escape(validator.trim(input));
}

// ✅ Validar y sanitizar URL
function sanitizeURL(url: string): string | null {
  if (!validator.isURL(url, { protocols: ['http', 'https'] })) {
    return null;
  }
  return url;
}
```

## 🔐 Autenticación

### Password Hashing

```typescript
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

// ✅ Hash de contraseña
async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

// ✅ Verificación de contraseña
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// ❌ NUNCA hacer esto
function weakHash(password: string) {
  return crypto.createHash('md5').update(password).digest('hex');
}
```

### JWT Tokens

```typescript
import jwt from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
  role: string;
  iat?: number;
  exp?: number;
}

// ✅ Generar token seguro
function generateToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters');
  }

  return jwt.sign(payload, secret, {
    expiresIn: '1h',
    algorithm: 'HS256',
  });
}

// ✅ Verificar token
function verifyToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthError('Token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AuthError('Invalid token');
    }
    throw error;
  }
}

// ✅ Refresh tokens (almacenar en DB)
interface RefreshToken {
  token: string;
  userId: string;
  expiresAt: Date;
}

async function generateRefreshToken(userId: string): Promise<string> {
  const token = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 días

  await db.refreshToken.create({
    data: { token, userId, expiresAt },
  });

  return token;
}
```

## 🚫 Prevención de Vulnerabilidades

### 1. SQL Injection

```typescript
// ❌ VULNERABLE
const query = `SELECT * FROM users WHERE email = '${email}'`;
db.query(query);

// ✅ SEGURO: Usar queries parametrizadas
const query = 'SELECT * FROM users WHERE email = ?';
db.query(query, [email]);

// ✅ SEGURO: Usar ORM
const user = await prisma.user.findUnique({
  where: { email },
});
```

### 2. XSS (Cross-Site Scripting)

```typescript
// ✅ React escapa automáticamente
function UserComment({ comment }: { comment: string }) {
  return <div>{comment}</div>; // Seguro por defecto
}

// ❌ PELIGROSO
function UnsafeHTML({ html }: { html: string }) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

// ✅ SEGURO: Si necesitas HTML, sanitiza
import DOMPurify from "isomorphic-dompurify";

function SafeHTML({ html }: { html: string }) {
  const clean = DOMPurify.sanitize(html);
  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}
```

### 3. CSRF (Cross-Site Request Forgery)

```typescript
import csrf from 'csurf';

// ✅ Middleware CSRF
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  },
});

app.use(csrfProtection);

// En formularios
app.get('/form', (req, res) => {
  res.render('form', { csrfToken: req.csrfToken() });
});

// Verificar en POST
app.post('/submit', (req, res) => {
  // Token verificado automáticamente por middleware
  // ...
});
```

### 4. Inyección de NoSQL

```typescript
// ❌ VULNERABLE
const user = await User.findOne({
  email: req.body.email,
  password: req.body.password, // Objeto malicioso: { $ne: null }
});

// ✅ SEGURO: Validar y sanitizar
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const { email, password } = loginSchema.parse(req.body);
const user = await User.findOne({ email });

if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
  throw new AuthError('Invalid credentials');
}
```

## 🔑 Variables de Entorno

```typescript
// ✅ Validación de variables de entorno
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  ALLOWED_ORIGINS: z.string().transform((s) => s.split(',')),
  PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)),
});

export const env = envSchema.parse(process.env);

// ❌ NUNCA hardcodear secretos
const apiKey = 'sk_live_abc123'; // MAL

// ✅ Usar variables de entorno
const apiKey = process.env.STRIPE_SECRET_KEY; // BIEN
```

### .env.example

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Authentication
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
REFRESH_TOKEN_SECRET=another-super-secret-key-for-refresh-tokens

# Stripe
STRIPE_PUBLIC_KEY=pk_test_your_key
STRIPE_SECRET_KEY=sk_test_your_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

## 🌐 CORS y Headers de Seguridad

```typescript
import cors from 'cors';
import helmet from 'helmet';

// ✅ CORS configurado correctamente
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = env.ALLOWED_ORIGINS;
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ✅ Headers de seguridad con Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);

// ✅ Headers adicionales
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
```

## ⏱️ Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

// ✅ Rate limiting general
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por ventana
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});

// ✅ Rate limiting estricto para autenticación
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Solo 5 intentos de login
  skipSuccessfulRequests: true, // No contar requests exitosos
  message: 'Too many login attempts, please try again later',
});

app.use('/api/', generalLimiter);
app.post('/api/auth/login', authLimiter, loginController);
```

## 📝 Logging de Seguridad

```typescript
import winston from 'winston';

const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'security' },
  transports: [
    new winston.transports.File({
      filename: 'logs/security.log',
      level: 'warn',
    }),
  ],
});

// ✅ Loggear eventos de seguridad
function logSecurityEvent(event: {
  type:
    | 'login_attempt'
    | 'login_success'
    | 'login_failure'
    | 'token_expired'
    | 'unauthorized_access'
    | 'validation_error';
  userId?: string;
  ip: string;
  userAgent: string;
  details?: any;
}) {
  securityLogger.info({
    ...event,
    timestamp: new Date().toISOString(),
  });
}

// Uso
app.post('/api/auth/login', async (req, res) => {
  logSecurityEvent({
    type: 'login_attempt',
    ip: req.ip,
    userAgent: req.headers['user-agent'] || 'unknown',
  });

  // ... lógica de login
});
```

## 🔍 Checklist de Seguridad

### Antes de cada commit:

- [ ] Todas las entradas de usuario están validadas
- [ ] Todas las entradas están sanitizadas
- [ ] No hay secretos hardcodeados
- [ ] Passwords hasheados con bcrypt (10+ rounds)
- [ ] Tokens JWT con expiración adecuada
- [ ] Queries de DB usan parámetros (no string concatenation)
- [ ] CORS configurado correctamente
- [ ] Rate limiting en endpoints públicos
- [ ] Headers de seguridad configurados
- [ ] Logs de eventos de seguridad implementados

### Antes de deploy:

- [ ] Variables de entorno validadas
- [ ] HTTPS habilitado
- [ ] Certificado SSL válido
- [ ] Cookies con flags secure y httpOnly
- [ ] Ningún endpoint de debug expuesto
- [ ] Dependencias actualizadas (npm audit)
- [ ] Secrets rotados si fueron expuestos

## 🚨 Respuesta a Incidentes

```typescript
// Cuando detectes actividad sospechosa
async function handleSuspiciousActivity(userId: string, reason: string) {
  // 1. Loggear
  securityLogger.warn({
    type: 'suspicious_activity',
    userId,
    reason,
    timestamp: new Date(),
  });

  // 2. Notificar a administradores
  await notifyAdmins({
    subject: 'Suspicious Activity Detected',
    userId,
    reason,
  });

  // 3. Considerar bloquear temporalmente
  if (reason === 'multiple_failed_logins') {
    await blockUserTemporarily(userId, 15 * 60 * 1000); // 15 min
  }
}
```

## 📚 Recursos

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
