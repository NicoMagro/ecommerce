# Frontend Agent

## 🎯 Responsabilidad

Guiar la creación de componentes UI, gestión de estado, estilos y optimización del frontend.

## 📋 Principios

### 1. Arquitectura de Componentes

- **Componentes funcionales** con hooks (no class components)
- **Componentes pequeños y enfocados** (Single Responsibility)
- **Composición sobre herencia**
- **Props drilling máximo de 2 niveles** (usar Context/State management después)

### 2. Estructura de Componentes

```typescript
// src/components/ProductCard/ProductCard.tsx
import { FC } from "react";
import { Product } from "@/types";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
  variant?: "default" | "compact";
}

export const ProductCard: FC<ProductCardProps> = ({
  product,
  onAddToCart,
  variant = "default",
}) => {
  return (
    <article className={styles.card} data-variant={variant}>
      <img src={product.image} alt={product.name} loading="lazy" />
      <h3>{product.name}</h3>
      <p className={styles.price}>${product.price}</p>
      {onAddToCart && (
        <button onClick={() => onAddToCart(product.id)}>Add to Cart</button>
      )}
    </article>
  );
};
```

### 3. Organización de Archivos

```
/components
  /ProductCard
    ProductCard.tsx       # Componente principal
    ProductCard.test.tsx  # Tests
    ProductCard.module.css # Estilos
    index.ts              # Barrel export
```

## 🎨 Estilos

### Preferencias

1. **CSS Modules** para componentes
2. **Tailwind** para utilities
3. **Variables CSS** para temas

```css
/* globals.css */
:root {
  --color-primary: #007bff;
  --color-secondary: #6c757d;
  --color-success: #28a745;
  --color-danger: #dc3545;

  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;

  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
}
```

### Responsive Design

- **Mobile-first approach**
- Breakpoints estándar:
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px

## 🔄 State Management

### Reglas de Estado

1. **Estado local** para UI simple (useState)
2. **Context API** para estado compartido en subsecciones
3. **Zustand/Redux** para estado global de aplicación
4. **React Query** para estado de servidor

```typescript
// ✅ Estado local para toggle simple
const [isOpen, setIsOpen] = useState(false);

// ✅ Context para tema
const { theme, toggleTheme } = useTheme();

// ✅ Zustand para carrito
const { items, addItem, removeItem } = useCartStore();

// ✅ React Query para datos del servidor
const { data: products } = useQuery({
  queryKey: ['products'],
  queryFn: fetchProducts,
});
```

## 🎣 Custom Hooks

```typescript
// src/hooks/useDebounce.ts
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// Uso
const SearchBar = () => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    if (debouncedSearch) {
      fetchResults(debouncedSearch);
    }
  }, [debouncedSearch]);
};
```

## 📱 Accesibilidad (a11y)

### Checklist

- [ ] Todas las imágenes tienen `alt` descriptivo
- [ ] Navegación por teclado funciona correctamente
- [ ] Contraste de colores cumple WCAG AA (4.5:1)
- [ ] Formularios tienen labels asociados
- [ ] Botones tienen texto descriptivo (no solo iconos)
- [ ] Estados de focus visibles
- [ ] ARIA attributes donde sea necesario

```typescript
// ✅ Ejemplo accesible
<button aria-label="Add product to cart" aria-pressed={isInCart}>
  <ShoppingCartIcon aria-hidden="true" />
  Add to Cart
</button>
```

## ⚡ Performance

### Optimizaciones Requeridas

1. **Lazy loading** de componentes pesados
2. **Memoization** para cálculos costosos
3. **Virtual scrolling** para listas largas
4. **Image optimization** (next/image o similar)
5. **Code splitting** por ruta

```typescript
// Lazy loading
const AdminPanel = lazy(() => import('./AdminPanel'));

// Memoization
const totalPrice = useMemo(() => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}, [items]);

// Callbacks memorizados
const handleAddToCart = useCallback(
  (productId: string) => {
    addToCart(productId);
  },
  [addToCart]
);
```

## 🧪 Testing

```typescript
// ProductCard.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { ProductCard } from "./ProductCard";

describe("ProductCard", () => {
  const mockProduct = {
    id: "1",
    name: "Test Product",
    price: 99.99,
    image: "/test.jpg",
  };

  it("renders product information", () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText("Test Product")).toBeInTheDocument();
    expect(screen.getByText("$99.99")).toBeInTheDocument();
  });

  it("calls onAddToCart when button is clicked", () => {
    const handleAddToCart = jest.fn();
    render(<ProductCard product={mockProduct} onAddToCart={handleAddToCart} />);

    fireEvent.click(screen.getByText("Add to Cart"));
    expect(handleAddToCart).toHaveBeenCalledWith("1");
  });
});
```

## 🚨 Anti-Patterns a Evitar

❌ **Props drilling excesivo**
❌ **Componentes gigantes (>300 líneas)**
❌ **Lógica de negocio en componentes UI**
❌ **Usar index como key en listas dinámicas**
❌ **Mutación directa de estado**
❌ **useEffect sin array de dependencias**
❌ **Inline functions en JSX sin memoization**

## ✅ Best Practices

✅ **Extraer lógica compleja a custom hooks**
✅ **Tipos TypeScript para todas las props**
✅ **Error boundaries para errores de rendering**
✅ **Loading y error states en todas las peticiones**
✅ **Validación de formularios con bibliotecas (Zod + React Hook Form)**
✅ **Usar const assertions para arrays/objetos inmutables**
