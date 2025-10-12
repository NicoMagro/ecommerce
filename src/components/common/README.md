# Common Components

This directory contains reusable components used throughout the application.

## Components

### Breadcrumb

A navigation component that displays the user's current location within the site hierarchy.

**Features:**

- SEO-friendly JSON-LD structured data
- Accessible navigation with ARIA attributes
- Home icon support
- Multiple separator styles (chevron, slash, arrow)
- Current page indication
- Responsive design

**Usage:**

```tsx
import { Breadcrumb } from '@/components/common';

<Breadcrumb
  items={[
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Product Name', href: '/products/product-slug', current: true },
  ]}
/>;
```

**Props:**

- `items` (BreadcrumbItem[]): Array of breadcrumb items
- `className` (string, optional): Additional CSS classes
- `showHomeIcon` (boolean, optional): Show home icon instead of text (default: true)
- `separator` ('chevron' | 'slash' | 'arrow', optional): Separator style (default: 'chevron')

**Helper Functions:**

`generateBreadcrumbs(path, labels?)` - Automatically generates breadcrumb items from a URL path:

```tsx
const items = generateBreadcrumbs('/products/electronics/laptop', {
  products: 'Products',
  electronics: 'Electronics',
  laptop: 'Gaming Laptop',
});
```

---

## Type Definitions

### BreadcrumbItem

```typescript
interface BreadcrumbItem {
  label: string; // Display label
  href: string; // URL path
  current?: boolean; // Is current page
}
```

## Styling

Components use Tailwind CSS utility classes:

- Mobile-first responsive design
- Consistent with design system
- Smooth transitions
- Proper spacing and typography

## SEO

The Breadcrumb component includes:

- JSON-LD structured data (BreadcrumbList schema)
- Proper semantic HTML (`<nav>`, `<ol>`)
- Canonical URLs

## Accessibility

All components follow WCAG AA standards:

- `aria-label="Breadcrumb"` on navigation
- `aria-current="page"` on current item
- Proper list structure (`<ol>`)
- Keyboard navigation support
- Screen reader friendly

## Usage Throughout Application

Breadcrumbs are used in:

- Product detail pages
- Category pages
- Search results
- User account pages
- Checkout flow

## Future Components

Additional common components to be added:

- Modal/Dialog
- Toast notifications
- Loading indicators
- Form inputs
- Buttons
- Cards
- Alerts
