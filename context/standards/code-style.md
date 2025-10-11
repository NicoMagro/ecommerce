# Code Style Guide

## 🎯 Principios Generales

1. **Código legible es mejor que código "inteligente"**
2. **Consistencia es clave**
3. **Menos es más (KISS)**
4. **No repitas código (DRY)**

## 📏 Formateo

### Prettier Configuration

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

### ESLint Rules (TypeScript)

```json
{
  "extends": ["next/core-web-vitals", "plugin:@typescript-eslint/recommended", "prettier"],
  "rules": {
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        "argsIgnorePattern": "^_"
      }
    ],
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "error",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

## 📝 TypeScript

### Strict Mode

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true
  }
}
```

### Type Declarations

```typescript
// ✅ BIEN: Tipos explícitos en parámetros y retorno
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ✅ BIEN: Interfaces para objetos
interface User {
  id: string;
  name: string;
  email: string;
}

// ❌ MAL: any
function processData(data: any) {}

// ✅ BIEN: unknown con type guards
function processData(data: unknown) {
  if (typeof data === 'string') {
    // TypeScript sabe que data es string aquí
    return data.toUpperCase();
  }
}
```

## 🔤 Imports

### Orden de Imports

```typescript
// 1. Imports de bibliotecas externas
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

// 2. Imports absolutos del proyecto (@/)
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@/types';

// 3. Imports relativos
import { ProductCard } from './ProductCard';
import styles from './styles.module.css';

// 4. Imports de tipos (separados si prefieres)
import type { NextPage } from 'next';
```

### Path Aliases (tsconfig.json)

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@lib/*": ["./src/lib/*"],
      "@hooks/*": ["./src/hooks/*"],
      "@types/*": ["./src/types/*"]
    }
  }
}
```

## 🧩 Funciones

### Funciones Arrow vs Regular

```typescript
// ✅ Arrow functions para callbacks y métodos cortos
const handleClick = () => {
  console.log('clicked');
};

const double = (x: number) => x * 2;

// ✅ Regular functions para funciones top-level con nombre
function calculateDiscount(price: number, rate: number): number {
  return price * rate;
}

// ✅ Async/await sobre promises
async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}
```

### Parámetros de Función

```typescript
// ❌ MAL: Demasiados parámetros
function createUser(
  name: string,
  email: string,
  age: number,
  address: string,
  phone: string,
  role: string
) {}

// ✅ BIEN: Usar objeto de opciones
interface CreateUserParams {
  name: string;
  email: string;
  age: number;
  address: string;
  phone: string;
  role: string;
}

function createUser(params: CreateUserParams) {}

// ✅ BIEN: Destructuring
function createUser({ name, email, age }: CreateUserParams) {}
```

## 🎨 React Components

### Component Structure

```typescript
// Template de componente
import { FC } from "react";

interface ComponentNameProps {
  // Props types
}

export const ComponentName: FC<ComponentNameProps> = ({ prop1, prop2 }) => {
  // 1. Hooks
  const [state, setState] = useState();

  // 2. Handlers
  const handleClick = () => {
    // ...
  };

  // 3. Effects
  useEffect(() => {
    // ...
  }, []);

  // 4. Early returns
  if (!data) {
    return <Loading />;
  }

  // 5. Render
  return <div>{/* JSX */}</div>;
};
```

### JSX Formatting

```tsx
// ✅ BIEN: Props en nuevas líneas si son muchos
<Button variant="primary" size="large" onClick={handleClick} disabled={isLoading}>
  Submit
</Button>;

// ✅ BIEN: Destructuring de props
const { variant, size, onClick, disabled } = props;

// ✅ BIEN: Conditional rendering claro
{
  isLoading ? <Spinner /> : <Content />;
}

// ✅ BIEN: Map con key apropiado
{
  items.map((item) => <Item key={item.id} data={item} />);
}
```

## 💬 Comentarios

### JSDoc para Funciones Públicas

````typescript
/**
 * Calcula el precio final después de aplicar descuentos e impuestos
 *
 * @param basePrice - Precio base del producto
 * @param discountPercent - Porcentaje de descuento (0-100)
 * @param taxRate - Tasa de impuesto (ej: 0.21 para 21%)
 * @returns El precio final calculado
 * @throws {Error} Si el precio base es negativo
 *
 * @example
 * ```ts
 * const finalPrice = calculateFinalPrice(100, 10, 0.21);
 * // Returns: 108.9
 * ```
 */
export function calculateFinalPrice(
  basePrice: number,
  discountPercent: number,
  taxRate: number
): number {
  if (basePrice < 0) {
    throw new Error('Base price cannot be negative');
  }

  const discounted = basePrice * (1 - discountPercent / 100);
  return discounted * (1 + taxRate);
}
````

### Comentarios Inline

```typescript
// ✅ BIEN: Explica "por qué"
// Duplicamos el precio porque incluye envío de ida y vuelta
const totalShipping = baseShipping * 2;

// ❌ MAL: Explica "qué" (obvio del código)
// Multiplica baseShipping por 2
const totalShipping = baseShipping * 2;

// ✅ BIEN: Explica decisiones no obvias
// Usamos setTimeout en lugar de setInterval porque necesitamos
// esperar a que termine cada petición antes de hacer la siguiente
setTimeout(() => fetchData(), 1000);
```

### TODO Comments

```typescript
// TODO: Implementar paginación
// FIXME: Este cálculo falla con números negativos
// HACK: Workaround temporal hasta que se arregle el bug del API
// NOTE: Esta función será deprecada en v2.0
```

## 🔧 Error Handling

```typescript
// ✅ BIEN: Error handling específico
try {
  const user = await fetchUser(id);
  return user;
} catch (error) {
  if (error instanceof ValidationError) {
    throw new BadRequestError(error.message);
  }
  if (error instanceof NotFoundError) {
    throw error;
  }
  // Error inesperado
  logger.error('Unexpected error in fetchUser', { error, id });
  throw new InternalServerError('Failed to fetch user');
}

// ✅ BIEN: Clases de error custom
class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}
```

## 📊 Logging

```typescript
// ✅ BIEN: Logging estructurado
logger.info('User logged in', {
  userId: user.id,
  email: user.email,
  timestamp: new Date().toISOString(),
});

logger.error('Payment processing failed', {
  orderId: order.id,
  amount: order.total,
  error: error.message,
  stack: error.stack,
});

// ❌ MAL: console.log en producción
console.log('User:', user); // Usar logger en su lugar
```

## ✅ Best Practices Summary

- ✅ Usar TypeScript strict mode
- ✅ Evitar `any`, usar `unknown` con type guards
- ✅ Funciones pequeñas y enfocadas (<50 líneas)
- ✅ Nombres descriptivos (leer código como prosa)
- ✅ Inmutabilidad por defecto (const, no mutaciones)
- ✅ Separar lógica de presentación
- ✅ Early returns para evitar nesting
- ✅ Destructuring cuando mejora legibilidad
- ✅ Comentarios explican "por qué", no "qué"
- ✅ Tests acompañan código nuevo
