# E-commerce Agent

## 🛒 Responsabilidad

Guiar la implementación de funcionalidades específicas de e-commerce: carrito, checkout, pagos, inventario.

## 🎯 Principios de E-commerce

### 1. User Experience

- Checkout lo más simple posible (menos pasos = más conversiones)
- Carrito persistente (localStorage + DB)
- Stock visible en tiempo real
- Confirmaciones claras en cada paso

### 2. Confiabilidad

- Transacciones atómicas
- Manejo de race conditions en stock
- Idempotencia en operaciones de pago
- Rollback automático en errores

## 🛒 Carrito de Compras

### Modelo de Datos

```typescript
interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant?: {
    size?: string;
    color?: string;
  };
  maxQuantity: number; // Stock disponible
}

interface Cart {
  id: string;
  userId?: string; // null para usuarios anónimos
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  couponCode?: string;
  discount?: number;
  expiresAt: Date;
}
```

### Store con Zustand

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.productId === product.id);

          if (existingItem) {
            // Verificar stock
            const newQuantity = existingItem.quantity + quantity;
            if (newQuantity > product.stock) {
              throw new Error('Insufficient stock');
            }

            return {
              items: state.items.map((item) =>
                item.productId === product.id ? { ...item, quantity: newQuantity } : item
              ),
            };
          }

          // Nuevo item
          return {
            items: [
              ...state.items,
              {
                id: crypto.randomUUID(),
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity,
                image: product.image,
                maxQuantity: product.stock,
              },
            ],
          };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) => {
            if (item.productId === productId) {
              if (quantity > item.maxQuantity) {
                throw new Error('Insufficient stock');
              }
              return { ...item, quantity };
            }
            return item;
          }),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
      // Solo persistir items
      partialize: (state) => ({ items: state.items }),
    }
  )
);
```

### Sincronización con Backend

```typescript
// Hook para sincronizar carrito
function useCartSync() {
  const { items, clearCart } = useCartStore();
  const { user } = useAuth();

  // Sincronizar cuando el usuario hace login
  useEffect(() => {
    if (user) {
      syncCartWithServer();
    }
  }, [user]);

  async function syncCartWithServer() {
    if (!user || items.length === 0) return;

    try {
      // Merge local cart con cart del servidor
      await fetch('/api/cart/sync', {
        method: 'POST',
        body: JSON.stringify({ items }),
      });
    } catch (error) {
      console.error('Failed to sync cart:', error);
    }
  }
}
```

## 💳 Checkout Process

### 1. Información de Envío

```typescript
interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

const shippingSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  address: z.object({
    street: z.string().min(5),
    city: z.string().min(2),
    state: z.string().min(2),
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/),
    country: z.string().length(2), // ISO code
  }),
});
```

### 2. Resumen de Orden

```typescript
interface OrderSummary {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
}

function calculateOrderSummary(
  items: CartItem[],
  shippingMethod: ShippingMethod,
  coupon?: Coupon
): OrderSummary {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const shipping = calculateShipping(items, shippingMethod);

  const discount = coupon ? calculateDiscount(subtotal, coupon) : 0;

  const taxableAmount = subtotal - discount + shipping;
  const tax = taxableAmount * 0.21; // 21% IVA (ajustar según región)

  const total = taxableAmount + tax;

  return {
    items,
    subtotal,
    shipping,
    tax,
    discount,
    total,
  };
}
```

## 💰 Integración de Pagos (Stripe)

### Setup

```typescript
// lib/stripe.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
});
```

### Create Payment Intent

```typescript
// app/api/checkout/route.ts
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const { orderId, amount } = await req.json();

    // Validar
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }

    // Verificar que el monto coincida
    if (order.total !== amount) {
      return Response.json({ error: 'Amount mismatch' }, { status: 400 });
    }

    // Crear Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convertir a centavos
      currency: 'usd',
      metadata: {
        orderId: order.id,
        userId: order.userId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Actualizar orden con Payment Intent ID
    await db.order.update({
      where: { id: orderId },
      data: {
        paymentIntentId: paymentIntent.id,
        status: 'AWAITING_PAYMENT',
      },
    });

    return Response.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Payment intent creation failed:', error);
    return Response.json({ error: 'Payment initialization failed' }, { status: 500 });
  }
}
```

### Webhook Handler

```typescript
// app/api/webhooks/stripe/route.ts
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return Response.json({ error: 'No signature' }, { status: 400 });
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: 'Webhook processing failed' }, { status: 400 });
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata.orderId;

  // Transacción atómica
  await db.$transaction(async (tx) => {
    // 1. Actualizar estado de orden
    await tx.order.update({
      where: { id: orderId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
    });

    // 2. Reducir stock
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    for (const item of order!.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    // 3. Enviar email de confirmación
    await sendOrderConfirmationEmail(order!);
  });
}
```

## 📦 Gestión de Inventario

### Modelo de Producto

```typescript
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  sku: string;
  category: string;
  images: string[];
  variants?: ProductVariant[];
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  createdAt: Date;
  updatedAt: Date;
}

interface ProductVariant {
  id: string;
  productId: string;
  name: string; // e.g., "Red - Large"
  sku: string;
  price: number;
  stock: number;
  attributes: {
    color?: string;
    size?: string;
  };
}
```

### Stock Management

```typescript
// Verificar stock antes de crear orden
async function checkStockAvailability(items: CartItem[]): Promise<boolean> {
  for (const item of items) {
    const product = await db.product.findUnique({
      where: { id: item.productId },
    });

    if (!product || product.stock < item.quantity) {
      return false;
    }
  }

  return true;
}

// Reservar stock temporalmente (durante checkout)
async function reserveStock(orderId: string, items: CartItem[]) {
  await db.$transaction(async (tx) => {
    for (const item of items) {
      await tx.stockReservation.create({
        data: {
          orderId,
          productId: item.productId,
          quantity: item.quantity,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min
        },
      });

      await tx.product.update({
        where: { id: item.productId },
        data: {
          reservedStock: {
            increment: item.quantity,
          },
        },
      });
    }
  });
}

// Liberar stock si la orden expira o falla
async function releaseStock(orderId: string) {
  await db.$transaction(async (tx) => {
    const reservations = await tx.stockReservation.findMany({
      where: { orderId },
    });

    for (const reservation of reservations) {
      await tx.product.update({
        where: { id: reservation.productId },
        data: {
          reservedStock: {
            decrement: reservation.quantity,
          },
        },
      });
    }

    await tx.stockReservation.deleteMany({
      where: { orderId },
    });
  });
}
```

## 🎫 Sistema de Cupones

```typescript
interface Coupon {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number; // 20 para 20% o 10 para $10
  minPurchase?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
}

async function validateCoupon(code: string, subtotal: number): Promise<Coupon> {
  const coupon = await db.coupon.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (!coupon) {
    throw new Error('Invalid coupon code');
  }

  if (!coupon.isActive) {
    throw new Error('Coupon is not active');
  }

  const now = new Date();
  if (now < coupon.validFrom || now > coupon.validUntil) {
    throw new Error('Coupon has expired');
  }

  if (coupon.minPurchase && subtotal < coupon.minPurchase) {
    throw new Error(`Minimum purchase of $${coupon.minPurchase} required`);
  }

  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    throw new Error('Coupon usage limit reached');
  }

  return coupon;
}

function calculateDiscount(subtotal: number, coupon: Coupon): number {
  let discount = 0;

  if (coupon.type === 'PERCENTAGE') {
    discount = subtotal * (coupon.value / 100);
  } else {
    discount = coupon.value;
  }

  // Aplicar descuento máximo si existe
  if (coupon.maxDiscount && discount > coupon.maxDiscount) {
    discount = coupon.maxDiscount;
  }

  // No puede ser mayor que el subtotal
  return Math.min(discount, subtotal);
}
```

## 📊 Analytics y Tracking

```typescript
// Trackear eventos importantes
interface AnalyticsEvent {
  type:
    | 'view_product'
    | 'add_to_cart'
    | 'remove_from_cart'
    | 'begin_checkout'
    | 'add_payment_info'
    | 'purchase';
  userId?: string;
  sessionId: string;
  data: any;
  timestamp: Date;
}

async function trackEvent(event: Omit<AnalyticsEvent, 'timestamp'>) {
  await db.analyticsEvent.create({
    data: {
      ...event,
      timestamp: new Date(),
    },
  });

  // También enviar a servicio externo (Google Analytics, Mixpanel, etc.)
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event.type, event.data);
  }
}

// Uso
trackEvent({
  type: 'purchase',
  userId: user?.id,
  sessionId: getSessionId(),
  data: {
    orderId: order.id,
    value: order.total,
    currency: 'USD',
    items: order.items.map((item) => ({
      id: item.productId,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    })),
  },
});
```

## ✅ Checklist de E-commerce

### Funcionalidades Básicas

- [ ] Catálogo de productos con filtros
- [ ] Vista detallada de producto
- [ ] Carrito de compras persistente
- [ ] Checkout multi-paso
- [ ] Integración de pagos
- [ ] Confirmación de orden por email

### Stock y Inventario

- [ ] Verificación de stock en tiempo real
- [ ] Reserva temporal durante checkout
- [ ] Actualización atómica de inventario
- [ ] Notificaciones de bajo stock
- [ ] Sistema de backorders (opcional)

### Pagos

- [ ] Payment intent con Stripe
- [ ] Webhooks configurados
- [ ] Manejo de fallos de pago
- [ ] Reembolsos (refunds)
- [ ] Idempotencia en operaciones

### UX

- [ ] Loading states en todas las acciones
- [ ] Mensajes de error claros
- [ ] Confirmaciones visuales
- [ ] Mobile responsive
- [ ] Accesibilidad (a11y)

### Seguridad

- [ ] Validación de precios en backend
- [ ] Verificación de ownership de ordenes
- [ ] Rate limiting en endpoints críticos
- [ ] Logging de transacciones
- [ ] Datos de pago nunca en frontend
