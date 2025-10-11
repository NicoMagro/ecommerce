# Naming Conventions

## 📝 Variables y Funciones

### Variables: camelCase

```typescript
const userName = 'John';
const isActive = true;
const hasPermission = false;
const shouldUpdate = true;
const itemCount = 5;
```

### Constantes: UPPER_SNAKE_CASE

```typescript
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_URL = 'https://api.example.com';
const DEFAULT_TIMEOUT = 5000;
const PAGE_SIZE = 20;
```

### Funciones: camelCase (verbos)

```typescript
function getUserById(id: string) {}
function calculateTotal(items: CartItem[]) {}
function validateEmail(email: string) {}
async function fetchProducts() {}
```

### Funciones Booleanas: is/has/should/can prefix

```typescript
function isValidEmail(email: string): boolean {}
function hasPermission(user: User, action: string): boolean {}
function shouldRefetch(): boolean {}
function canEdit(user: User): boolean {}
```

## 🏛️ Classes e Interfaces

### Classes: PascalCase (sustantivos)

```typescript
class UserService {}
class ProductRepository {}
class PaymentProcessor {}
class EmailValidator {}
```

### Interfaces: PascalCase (con 'I' prefix opcional)

```typescript
// Opción 1: Sin prefix (recomendado)
interface User {}
interface Product {}

// Opción 2: Con prefix 'I'
interface IUserRepository {}
interface IPaymentService {}
```

### Types: PascalCase

```typescript
type OrderStatus = 'pending' | 'processing' | 'shipped';
type UserId = string;
type Nullable<T> = T | null;
```

## 📁 Archivos

### Componentes: PascalCase

```
ProductCard.tsx
UserProfile.tsx
ShoppingCart.tsx
CheckoutForm.tsx
```

### Utilities/Helpers: kebab-case

```
string-utils.ts
date-helpers.ts
validation-rules.ts
api-client.ts
```

### Pages/Routes: kebab-case

```
products.tsx
user-profile.tsx
checkout.tsx
order-confirmation.tsx
```

### Tests: mismo nombre + .test o .spec

```
ProductCard.test.tsx
user-service.spec.ts
validation-rules.test.ts
```

## 📂 Carpetas

### kebab-case

```
/components
/user-profile
/shopping-cart
/api-routes
/utils
```

## 🔤 React Components

### Component Props: PascalCase + Props suffix

```typescript
interface ProductCardProps {
  product: Product;
  onAddToCart: (id: string) => void;
}

export const ProductCard: FC<ProductCardProps> = (props) => {
  // ...
};
```

### Event Handlers: handle prefix

```typescript
function handleClick() {}
function handleSubmit(e: FormEvent) {}
function handleInputChange(value: string) {}
```

### Callback Props: on prefix

```typescript
interface Props {
  onClick: () => void;
  onSubmit: (data: FormData) => void;
  onChange: (value: string) => void;
}
```

## 🗄️ Database

### Tables: snake_case, plural

```sql
users
products
order_items
cart_sessions
```

### Columns: snake_case

```sql
user_id
created_at
updated_at
first_name
is_active
```

## 🌐 API Endpoints

### REST: kebab-case, plural para recursos

```
GET    /api/products
GET    /api/products/:id
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id

GET    /api/users/:userId/orders
POST   /api/cart/items
```

## 🔑 Environment Variables

### UPPER_SNAKE_CASE

```bash
DATABASE_URL
JWT_SECRET
STRIPE_SECRET_KEY
NEXT_PUBLIC_APP_URL
NODE_ENV
```

### Prefix para variables públicas (Next.js)

```bash
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_STRIPE_PUBLIC_KEY
```

## 📦 NPM Packages/Modules

### kebab-case

```json
{
  "name": "@myorg/user-service",
  "name": "payment-processor"
}
```

## 🎨 CSS/Tailwind

### Classes: kebab-case para custom classes

```css
.product-card {
}
.user-profile-header {
}
.checkout-form {
}
```

### CSS Modules: camelCase en TypeScript

```typescript
import styles from "./ProductCard.module.css";

<div className={styles.productCard}>
  <h3 className={styles.productTitle}>...</h3>
</div>;
```

## 🔢 Enums

### PascalCase para nombre, UPPER_CASE para valores

```typescript
enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
}

// O con const assertion
const OrderStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
} as const;
```

## 🧪 Tests

### Describe: nombre del componente/función

```typescript
describe('ProductCard', () => {
  // ...
});

describe('calculateDiscount', () => {
  // ...
});
```

### It/Test: comportamiento esperado

```typescript
it('renders product name and price', () => {});
it('calls onAddToCart when button is clicked', () => {});
it('throws error when stock is insufficient', () => {});
```

## ❌ Nombres a Evitar

```typescript
// ❌ MAL: No descriptivo
const data = fetchData();
const temp = x + y;
const flag = true;

// ✅ BIEN: Descriptivo
const userData = fetchUserData();
const totalPrice = basePrice + tax;
const isAuthenticated = true;

// ❌ MAL: Abreviaciones confusas
const usrMgr = new UserManager();
const prdSrv = new ProductService();

// ✅ BIEN: Nombres completos
const userManager = new UserManager();
const productService = new ProductService();

// ❌ MAL: Nombres genéricos
function process() {}
function handle() {}

// ✅ BIEN: Nombres específicos
function processPayment() {}
function handleUserLogin() {}
```

## 📋 Quick Reference

| Type             | Convention       | Example                             |
| ---------------- | ---------------- | ----------------------------------- |
| Variable         | camelCase        | `userName`, `isActive`              |
| Constant         | UPPER_SNAKE_CASE | `MAX_ITEMS`, `API_URL`              |
| Function         | camelCase        | `getUserById()`, `calculateTotal()` |
| Class            | PascalCase       | `UserService`, `PaymentProcessor`   |
| Interface        | PascalCase       | `User`, `Product`                   |
| Component        | PascalCase       | `ProductCard`, `UserProfile`        |
| File (component) | PascalCase       | `ProductCard.tsx`                   |
| File (utility)   | kebab-case       | `string-utils.ts`                   |
| Folder           | kebab-case       | `/user-profile`, `/api-routes`      |
| CSS Class        | kebab-case       | `.product-card`                     |
| Database Table   | snake_case       | `user_orders`                       |
| API Endpoint     | kebab-case       | `/api/user-orders`                  |
| Env Variable     | UPPER_SNAKE_CASE | `DATABASE_URL`                      |
