# Ejemplo: Componente React con TypeScript

Este es un ejemplo completo de un componente siguiendo todas las mejores prácticas.

````typescript
import { FC, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useCartStore } from '@/store/cart';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';
import type { Product } from '@/types';
import styles from './ProductCard.module.css';

// Validación de props con Zod
const productSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  price: z.number().positive(),
  image: z.string().url(),
  stock: z.number().int().nonnegative(),
  description: z.string().optional()
});

// Props interface
interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact' | 'featured';
  onAddToCart?: (productId: string) => void;
  showDescription?: boolean;
}

/**
 * Componente de tarjeta de producto
 * Muestra información del producto y permite agregarlo al carrito
 *
 * @example
 * ```tsx
 * <ProductCard
 *   product={product}
 *   variant="featured"
 *   onAddToCart={(id) => console.log('Added:', id)}
 * />
 * ```
 */
export const ProductCard: FC<ProductCardProps> = ({
  product,
  variant = 'default',
  onAddToCart,
  showDescription = false
}) => {
  // Hooks - Estado
  const [isAdding, setIsAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Hooks - Store
  const { addItem } = useCartStore();
  const { toast } = useToast();
  const router = useRouter();

  // Validar producto al montar
  useEffect(() => {
    try {
      productSchema.parse(product);
    } catch (error) {
      console.error('Invalid product data:', error);
    }
  }, [product]);

  // Handlers - Memoizados con useCallback
  const handleAddToCart = useCallback(async () => {
    if (quantity > product.stock) {
      toast({
        title: 'Error',
        description: 'Insufficient stock',
        variant: 'destructive'
      });
      return;
    }

    setIsAdding(true);

    try {
      addItem(product, quantity);

      // Callback opcional
      onAddToCart?.(product.id);

      toast({
        title: 'Success',
        description: `${product.name} added to cart`
      });

    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to add product to cart',
        variant: 'destructive'
      });
    } finally {
      setIsAdding(false);
    }
  }, [product, quantity, addItem, onAddToCart, toast]);

  const handleViewDetails = useCallback(() => {
    router.push(`/products/${product.id}`);
  }, [product.id, router]);

  const handleQuantityChange = useCallback((newQuantity: number) => {
    if (newQuantity < 1) return;
    if (newQuantity > product.stock) {
      toast({
        title: 'Warning',
        description: `Only ${product.stock} items available`,
        variant: 'warning'
      });
      return;
    }
    setQuantity(newQuantity);
  }, [product.stock, toast]);

  // Early returns - Loading/Error states
  if (!product) {
    return null;
  }

  // Computed values
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock < 5;

  // Render
  return (
    <article
      className={styles.card}
      data-variant={variant}
      data-out-of-stock={isOutOfStock}
    >
      {/* Image */}
      <div className={styles.imageContainer}>
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className={styles.image}
          onClick={handleViewDetails}
        />

        {isOutOfStock && (
          <span className={styles.badge} data-type="danger">
            Out of Stock
          </span>
        )}

        {isLowStock && !isOutOfStock && (
          <span className={styles.badge} data-type="warning">
            Only {product.stock} left
          </span>
        )}
      </div>

      {/* Content */}
      <div className={styles.content}>
        <h3
          className={styles.title}
          onClick={handleViewDetails}
        >
          {product.name}
        </h3>

        {showDescription && product.description && (
          <p className={styles.description}>
            {product.description}
          </p>
        )}

        <p className={styles.price}>
          ${product.price.toFixed(2)}
        </p>

        {/* Quantity selector */}
        {!isOutOfStock && (
          <div className={styles.quantitySelector}>
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span>{quantity}</span>
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= product.stock}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        )}

        {/* Actions */}
        <div className={styles.actions}>
          <Button
            variant="primary"
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding}
            loading={isAdding}
            fullWidth
          >
            {isAdding ? 'Adding...' : 'Add to Cart'}
          </Button>

          <Button
            variant="ghost"
            onClick={handleViewDetails}
            fullWidth
          >
            View Details
          </Button>
        </div>
      </div>
    </article>
  );
};

// Named export también para testing
export default ProductCard;
````

## Test del Componente

```typescript
// ProductCard.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProductCard } from './ProductCard';
import { useCartStore } from '@/store/cart';
import { useToast } from '@/hooks/useToast';

// Mock dependencies
jest.mock('@/store/cart');
jest.mock('@/hooks/useToast');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn()
  })
}));

describe('ProductCard', () => {
  const mockProduct = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Product',
    price: 99.99,
    image: 'https://example.com/image.jpg',
    stock: 10,
    description: 'Test description'
  };

  const mockAddItem = jest.fn();
  const mockToast = jest.fn();

  beforeEach(() => {
    (useCartStore as jest.Mock).mockReturnValue({
      addItem: mockAddItem
    });
    (useToast as jest.Mock).mockReturnValue({
      toast: mockToast
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} />);

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
    expect(screen.getByAltText('Test Product')).toBeInTheDocument();
  });

  it('shows description when showDescription is true', () => {
    render(
      <ProductCard
        product={mockProduct}
        showDescription
      />
    );

    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('adds product to cart when button is clicked', async () => {
    render(<ProductCard product={mockProduct} />);

    const addButton = screen.getByText('Add to Cart');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockAddItem).toHaveBeenCalledWith(mockProduct, 1);
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Success'
        })
      );
    });
  });

  it('shows out of stock badge when stock is 0', () => {
    const outOfStockProduct = { ...mockProduct, stock: 0 };
    render(<ProductCard product={outOfStockProduct} />);

    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
    expect(screen.getByText('Add to Cart')).toBeDisabled();
  });

  it('shows low stock badge when stock is less than 5', () => {
    const lowStockProduct = { ...mockProduct, stock: 3 };
    render(<ProductCard product={lowStockProduct} />);

    expect(screen.getByText('Only 3 left')).toBeInTheDocument();
  });

  it('updates quantity correctly', () => {
    render(<ProductCard product={mockProduct} />);

    const increaseButton = screen.getByLabelText('Increase quantity');
    fireEvent.click(increaseButton);

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('prevents quantity from exceeding stock', () => {
    const limitedStockProduct = { ...mockProduct, stock: 2 };
    render(<ProductCard product={limitedStockProduct} />);

    const increaseButton = screen.getByLabelText('Increase quantity');
    fireEvent.click(increaseButton);
    fireEvent.click(increaseButton);

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Warning'
      })
    );
  });

  it('calls onAddToCart callback when provided', async () => {
    const mockCallback = jest.fn();
    render(
      <ProductCard
        product={mockProduct}
        onAddToCart={mockCallback}
      />
    );

    const addButton = screen.getByText('Add to Cart');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockCallback).toHaveBeenCalledWith(mockProduct.id);
    });
  });
});
```
