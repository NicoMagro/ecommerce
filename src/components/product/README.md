# Product Components

This directory contains components related to product display and interaction.

## Components

### ProductGallery

A responsive image gallery component with thumbnail navigation and zoom functionality.

**Features:**

- Main image display with navigation arrows
- Thumbnail navigation with visual feedback
- Keyboard navigation support
- Zoom functionality (optional)
- Responsive design (mobile and desktop)
- Full accessibility (WCAG AA compliant)
- Primary image badge
- Image counter

**Usage:**

```tsx
import { ProductGallery } from '@/components/product';

<ProductGallery images={product.images} productName={product.name} enableZoom={true} />;
```

**Props:**

- `images` (ProductImage[]): Array of product images
- `productName` (string): Product name for alt text fallback
- `className` (string, optional): Additional CSS classes
- `enableZoom` (boolean, optional): Enable zoom on hover (default: false)

---

### ProductInfo

Displays comprehensive product information including pricing, stock status, and purchase options.

**Features:**

- Product name and category link
- Price display with discount calculation
- Stock status with visual indicators
- Quantity selector with validation
- Add to cart functionality (placeholder for Sprint 4)
- Expandable description for long text
- Product details section
- Review rating display (if available)

**Usage:**

```tsx
import { ProductInfo } from '@/components/product';

<ProductInfo product={productDetail} onAddToCart={(id, qty) => handleAddToCart(id, qty)} />;
```

**Props:**

- `product` (ProductDetail): Product detail data
- `className` (string, optional): Additional CSS classes
- `onAddToCart` ((productId: string, quantity: number) => void, optional): Add to cart callback

---

## Type Definitions

Both components use types from `@/types/product`:

- `ProductImage` - Image data from Prisma
- `ProductDetail` - Complete product information

## Styling

Components use Tailwind CSS utility classes for styling:

- Mobile-first responsive design
- Consistent spacing and typography
- Accessible color contrast
- Smooth transitions and hover effects

## Accessibility

All components follow WCAG AA standards:

- Proper semantic HTML
- ARIA attributes where needed
- Keyboard navigation support
- Screen reader friendly
- Focus indicators
- Alt text for images

## Integration

These components are used in:

- `/app/products/[slug]/page.tsx` - Product detail page

## Future Enhancements

Planned features for upcoming sprints:

- Sprint 4: Full cart integration
- Sprint 10: Reviews and ratings display
- Wishlist functionality
- Product comparison
- Share buttons
