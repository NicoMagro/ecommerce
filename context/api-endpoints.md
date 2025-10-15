# API Endpoints Documentation

Complete reference for all API endpoints in the e-commerce platform. All endpoints follow RESTful conventions and standardized response formats.

## Table of Contents

1. [Response Format Standards](#response-format-standards)
2. [HTTP Status Codes](#http-status-codes)
3. [Authentication & Authorization](#authentication--authorization)
4. [Error Codes](#error-codes)
5. [Product Endpoints](#product-endpoints)
6. [Pagination & Filtering](#pagination--filtering)

---

## Response Format Standards

All API endpoints follow a consistent response structure for both success and error cases.

### Success Response

```typescript
{
  "data": {
    // Actual resource data or array of resources
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z",  // ISO 8601 format
    "createdBy"?: "user-id",                    // Present for create operations
    "updatedBy"?: "user-id",                    // Present for update operations
    "deletedBy"?: "user-id",                    // Present for delete operations
    "pagination"?: {                            // Present for paginated responses
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

### Error Response

```typescript
{
  "error": "Human-readable error message",
  "code"?: "ERROR_CODE",                        // Machine-readable error code
  "statusCode": 400,                            // HTTP status code
  "details"?: [                                  // Validation errors array
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

---

## HTTP Status Codes

| Code  | Meaning               | Usage                                           |
| ----- | --------------------- | ----------------------------------------------- |
| `200` | OK                    | Successful GET, PUT, DELETE                     |
| `201` | Created               | Successful POST (resource created)              |
| `204` | No Content            | Successful DELETE (no body returned)            |
| `400` | Bad Request           | Validation error, malformed request             |
| `401` | Unauthorized          | Missing or invalid authentication               |
| `403` | Forbidden             | Authenticated but insufficient permissions      |
| `404` | Not Found             | Resource does not exist                         |
| `409` | Conflict              | Resource conflict (duplicate, version mismatch) |
| `422` | Unprocessable Entity  | Semantic validation error                       |
| `429` | Too Many Requests     | Rate limit exceeded                             |
| `500` | Internal Server Error | Unexpected server error                         |
| `503` | Service Unavailable   | Temporary service outage                        |

---

## Authentication & Authorization

### Authentication Header

All protected endpoints require a valid session cookie from NextAuth.js v5.

**Session Cookie**: Automatically managed by NextAuth.js

- Cookie Name: `authjs.session-token` (production) or `authjs.session-token` (development)
- HttpOnly: true
- Secure: true (production)
- SameSite: Lax

### Role-Based Access Control (RBAC)

| Role                | Description       | Access Level                |
| ------------------- | ----------------- | --------------------------- |
| `CUSTOMER`          | Regular user      | Public endpoints + own data |
| `ADMIN`             | Administrator     | All endpoints               |
| `SUPPORT`           | Support staff     | Read orders, users          |
| `INVENTORY_MANAGER` | Inventory manager | Products, inventory         |

### Authorization Check Pattern

```typescript
import { auth } from '@/auth';

export async function POST(request: NextRequest) {
  // 1. Check authentication
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      {
        error: 'Authentication required',
        code: 'UNAUTHORIZED',
        statusCode: 401,
      },
      { status: 401 }
    );
  }

  // 2. Check authorization (role-based)
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json(
      {
        error: 'Insufficient permissions',
        code: 'FORBIDDEN',
        statusCode: 403,
      },
      { status: 403 }
    );
  }

  // Continue with logic...
}
```

---

## Error Codes

Standard error codes used across all endpoints:

| Code                   | HTTP Status | Description                   |
| ---------------------- | ----------- | ----------------------------- |
| `VALIDATION_ERROR`     | 400         | Input validation failed       |
| `UNAUTHORIZED`         | 401         | Not authenticated             |
| `FORBIDDEN`            | 403         | Insufficient permissions      |
| `NOT_FOUND`            | 404         | Resource not found            |
| `CONFLICT`             | 409         | Resource conflict (duplicate) |
| `UNPROCESSABLE_ENTITY` | 422         | Semantic validation error     |
| `RATE_LIMIT_EXCEEDED`  | 429         | Too many requests             |
| `INTERNAL_ERROR`       | 500         | Server error                  |

---

## Product Endpoints

### Base URL Pattern

- **Public endpoints**: `/api/v1/products`
- **Admin endpoints**: `/api/v1/admin/products`

---

### 1. Create Product

Creates a new product in the catalog.

**Endpoint**: `POST /api/v1/admin/products`

**Authentication**: Required (ADMIN or INVENTORY_MANAGER only)

**Rate Limit**: 20 requests per minute

**Request Headers**:

```http
Content-Type: application/json
Cookie: authjs.session-token=<session-token>
```

**Request Body**:

```json
{
  "sku": "PROD-001",
  "name": "Premium Wireless Headphones",
  "slug": "premium-wireless-headphones",
  "description": "High-quality wireless headphones with noise cancellation",
  "shortDescription": "Premium sound quality with 30h battery life",
  "price": 199.99,
  "compareAtPrice": 249.99,
  "costPrice": 120.0,
  "categoryId": "cat_abc123",
  "status": "DRAFT",
  "featured": false,
  "seoTitle": "Premium Wireless Headphones - Buy Now",
  "seoDescription": "Shop premium wireless headphones with noise cancellation...",
  "images": [
    {
      "url": "https://cdn.example.com/image1.jpg",
      "altText": "Headphones front view",
      "sortOrder": 0,
      "isPrimary": true
    }
  ],
  "initialStock": 100
}
```

**Validation Rules**:

- `sku`: Required, unique, 3-50 characters
- `name`: Required, 3-200 characters
- `slug`: Required, unique, lowercase, hyphens only
- `description`: Optional, max 5000 characters
- `shortDescription`: Optional, max 500 characters
- `price`: Required, positive decimal (max 10 digits, 2 decimals)
- `compareAtPrice`: Optional, positive decimal
- `costPrice`: Optional, positive decimal
- `categoryId`: Required, valid category ID
- `status`: Optional, enum: DRAFT, ACTIVE, ARCHIVED (default: DRAFT)
- `featured`: Optional, boolean (default: false)
- `images`: Optional, array of image objects (max 10)
- `initialStock`: Optional, non-negative integer (default: 0)

**Success Response** (201 Created):

```json
{
  "data": {
    "id": "prod_abc123xyz",
    "sku": "PROD-001",
    "name": "Premium Wireless Headphones",
    "slug": "premium-wireless-headphones",
    "description": "High-quality wireless headphones with noise cancellation",
    "shortDescription": "Premium sound quality with 30h battery life",
    "price": "199.99",
    "compareAtPrice": "249.99",
    "costPrice": "120.00",
    "status": "DRAFT",
    "featured": false,
    "seoTitle": "Premium Wireless Headphones - Buy Now",
    "seoDescription": "Shop premium wireless headphones with noise cancellation...",
    "categoryId": "cat_abc123",
    "category": {
      "id": "cat_abc123",
      "name": "Electronics",
      "slug": "electronics"
    },
    "images": [
      {
        "id": "img_xyz789",
        "url": "https://cdn.example.com/image1.jpg",
        "altText": "Headphones front view",
        "sortOrder": 0,
        "isPrimary": true
      }
    ],
    "inventory": {
      "id": "inv_def456",
      "productId": "prod_abc123xyz",
      "quantity": 100,
      "reservedQuantity": 0,
      "lowStockThreshold": 10
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "deletedAt": null
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "createdBy": "user_admin123"
  }
}
```

**Error Responses**:

401 Unauthorized:

```json
{
  "error": "Authentication required",
  "code": "UNAUTHORIZED",
  "statusCode": 401
}
```

403 Forbidden:

```json
{
  "error": "Only admins and inventory managers can create products",
  "code": "FORBIDDEN",
  "statusCode": 403
}
```

400 Validation Error:

```json
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "statusCode": 400,
  "details": [
    {
      "field": "price",
      "message": "Price must be a positive number"
    },
    {
      "field": "sku",
      "message": "SKU must be between 3 and 50 characters"
    }
  ]
}
```

409 Conflict:

```json
{
  "error": "Product with SKU 'PROD-001' already exists",
  "code": "CONFLICT",
  "statusCode": 409
}
```

---

### 2. List Products (Public)

Retrieves a paginated list of active products for public display.

**Endpoint**: `GET /api/v1/products`

**Authentication**: Not required

**Rate Limit**: 60 requests per minute

**Query Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number (min: 1) |
| `limit` | integer | No | 20 | Items per page (min: 1, max: 100) |
| `categoryId` | string | No | - | Filter by category ID |
| `search` | string | No | - | Search in name, description |
| `minPrice` | number | No | - | Minimum price filter |
| `maxPrice` | number | No | - | Maximum price filter |
| `featured` | boolean | No | - | Filter featured products |
| `sort` | string | No | createdAt:desc | Sort field and order |

**Sort Options**:

- `createdAt:asc` / `createdAt:desc` (default)
- `price:asc` / `price:desc`
- `name:asc` / `name:desc`

**Example Request**:

```http
GET /api/v1/products?page=1&limit=20&categoryId=cat_abc123&sort=price:asc
```

**Success Response** (200 OK):

```json
{
  "data": [
    {
      "id": "prod_abc123",
      "sku": "PROD-001",
      "name": "Premium Wireless Headphones",
      "slug": "premium-wireless-headphones",
      "shortDescription": "Premium sound quality with 30h battery life",
      "price": "199.99",
      "compareAtPrice": "249.99",
      "featured": false,
      "category": {
        "id": "cat_abc123",
        "name": "Electronics",
        "slug": "electronics"
      },
      "images": [
        {
          "id": "img_xyz789",
          "url": "https://cdn.example.com/image1.jpg",
          "altText": "Headphones front view",
          "isPrimary": true
        }
      ],
      "inventory": {
        "quantity": 100,
        "inStock": true
      },
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "meta": {
    "timestamp": "2024-01-15T11:00:00.000Z",
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

**Error Responses**:

400 Bad Request (Invalid Query):

```json
{
  "error": "Invalid query parameters",
  "code": "VALIDATION_ERROR",
  "statusCode": 400,
  "details": [
    {
      "field": "page",
      "message": "Page must be a positive integer"
    }
  ]
}
```

---

### 3. Get Single Product

Retrieves detailed information about a specific product.

**Endpoint**: `GET /api/v1/products/[id]`

**Authentication**: Not required

**Rate Limit**: 120 requests per minute

**URL Parameters**:

- `id`: Product ID (required)

**Example Request**:

```http
GET /api/v1/products/prod_abc123
```

**Success Response** (200 OK):

```json
{
  "data": {
    "id": "prod_abc123",
    "sku": "PROD-001",
    "name": "Premium Wireless Headphones",
    "slug": "premium-wireless-headphones",
    "description": "High-quality wireless headphones with noise cancellation and premium sound quality...",
    "shortDescription": "Premium sound quality with 30h battery life",
    "price": "199.99",
    "compareAtPrice": "249.99",
    "status": "ACTIVE",
    "featured": false,
    "seoTitle": "Premium Wireless Headphones - Buy Now",
    "seoDescription": "Shop premium wireless headphones with noise cancellation...",
    "category": {
      "id": "cat_abc123",
      "name": "Electronics",
      "slug": "electronics",
      "description": "Electronic devices and accessories"
    },
    "images": [
      {
        "id": "img_xyz789",
        "url": "https://cdn.example.com/image1.jpg",
        "altText": "Headphones front view",
        "sortOrder": 0,
        "isPrimary": true
      },
      {
        "id": "img_xyz790",
        "url": "https://cdn.example.com/image2.jpg",
        "altText": "Headphones side view",
        "sortOrder": 1,
        "isPrimary": false
      }
    ],
    "inventory": {
      "quantity": 100,
      "reservedQuantity": 5,
      "availableQuantity": 95,
      "inStock": true,
      "lowStockThreshold": 10
    },
    "reviews": {
      "averageRating": 4.5,
      "totalReviews": 128
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "meta": {
    "timestamp": "2024-01-15T11:15:00.000Z"
  }
}
```

**Error Responses**:

404 Not Found:

```json
{
  "error": "Product not found",
  "code": "NOT_FOUND",
  "statusCode": 404
}
```

400 Bad Request (Invalid ID):

```json
{
  "error": "Invalid product ID format",
  "code": "VALIDATION_ERROR",
  "statusCode": 400
}
```

---

### 4. Update Product

Updates an existing product's information.

**Endpoint**: `PUT /api/v1/admin/products/[id]`

**Authentication**: Required (ADMIN or INVENTORY_MANAGER only)

**Rate Limit**: 30 requests per minute

**URL Parameters**:

- `id`: Product ID (required)

**Request Headers**:

```http
Content-Type: application/json
Cookie: authjs.session-token=<session-token>
```

**Request Body** (all fields optional for partial update):

```json
{
  "name": "Premium Wireless Headphones v2",
  "description": "Updated description with new features",
  "price": 219.99,
  "status": "ACTIVE",
  "featured": true,
  "categoryId": "cat_xyz456"
}
```

**Validation Rules** (same as create, but all optional):

- Any field from create endpoint can be updated
- Cannot update: `id`, `sku`, `createdAt`
- `slug` can be updated but must remain unique

**Success Response** (200 OK):

```json
{
  "data": {
    "id": "prod_abc123",
    "sku": "PROD-001",
    "name": "Premium Wireless Headphones v2",
    "slug": "premium-wireless-headphones",
    "description": "Updated description with new features",
    "shortDescription": "Premium sound quality with 30h battery life",
    "price": "219.99",
    "compareAtPrice": "249.99",
    "costPrice": "120.00",
    "status": "ACTIVE",
    "featured": true,
    "categoryId": "cat_xyz456",
    "category": {
      "id": "cat_xyz456",
      "name": "Audio Equipment",
      "slug": "audio-equipment"
    },
    "images": [
      {
        "id": "img_xyz789",
        "url": "https://cdn.example.com/image1.jpg",
        "altText": "Headphones front view",
        "sortOrder": 0,
        "isPrimary": true
      }
    ],
    "inventory": {
      "id": "inv_def456",
      "quantity": 100,
      "reservedQuantity": 5,
      "lowStockThreshold": 10
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T14:20:00.000Z",
    "deletedAt": null
  },
  "meta": {
    "timestamp": "2024-01-15T14:20:00.000Z",
    "updatedBy": "user_admin123"
  }
}
```

**Error Responses**:

401 Unauthorized:

```json
{
  "error": "Authentication required",
  "code": "UNAUTHORIZED",
  "statusCode": 401
}
```

403 Forbidden:

```json
{
  "error": "Only admins and inventory managers can update products",
  "code": "FORBIDDEN",
  "statusCode": 403
}
```

404 Not Found:

```json
{
  "error": "Product not found",
  "code": "NOT_FOUND",
  "statusCode": 404
}
```

400 Validation Error:

```json
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "statusCode": 400,
  "details": [
    {
      "field": "price",
      "message": "Price must be a positive number"
    }
  ]
}
```

409 Conflict:

```json
{
  "error": "Product with slug 'premium-wireless-headphones-v2' already exists",
  "code": "CONFLICT",
  "statusCode": 409
}
```

---

### 5. Delete Product (Soft Delete)

Archives a product (soft delete). Product is not permanently removed but marked as ARCHIVED.

**Endpoint**: `DELETE /api/v1/admin/products/[id]`

**Authentication**: Required (ADMIN only)

**Rate Limit**: 20 requests per minute

**URL Parameters**:

- `id`: Product ID (required)

**Request Headers**:

```http
Cookie: authjs.session-token=<session-token>
```

**Business Rules**:

- Products with pending orders cannot be deleted
- Products with reserved inventory cannot be deleted
- Soft delete sets `status` to `ARCHIVED` and `deletedAt` to current timestamp
- Archived products are not visible in public listings

**Success Response** (200 OK):

```json
{
  "data": {
    "id": "prod_abc123",
    "status": "ARCHIVED",
    "deletedAt": "2024-01-15T15:00:00.000Z"
  },
  "meta": {
    "timestamp": "2024-01-15T15:00:00.000Z",
    "deletedBy": "user_admin123"
  }
}
```

**Error Responses**:

401 Unauthorized:

```json
{
  "error": "Authentication required",
  "code": "UNAUTHORIZED",
  "statusCode": 401
}
```

403 Forbidden:

```json
{
  "error": "Only admins can delete products",
  "code": "FORBIDDEN",
  "statusCode": 403
}
```

404 Not Found:

```json
{
  "error": "Product not found",
  "code": "NOT_FOUND",
  "statusCode": 404
}
```

422 Unprocessable Entity:

```json
{
  "error": "Cannot delete product with pending orders or reserved inventory",
  "code": "UNPROCESSABLE_ENTITY",
  "statusCode": 422,
  "details": [
    {
      "field": "orderItems",
      "message": "Product has 3 pending orders"
    },
    {
      "field": "inventory.reservedQuantity",
      "message": "Product has 5 reserved items"
    }
  ]
}
```

---

### 6. List Products (Admin)

Retrieves all products including drafts and archived items for admin management.

**Endpoint**: `GET /api/v1/admin/products`

**Authentication**: Required (ADMIN or INVENTORY_MANAGER only)

**Rate Limit**: 60 requests per minute

**Query Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number (min: 1) |
| `limit` | integer | No | 20 | Items per page (min: 1, max: 100) |
| `status` | string | No | - | Filter by status (DRAFT, ACTIVE, ARCHIVED) |
| `categoryId` | string | No | - | Filter by category ID |
| `search` | string | No | - | Search in name, description, SKU |
| `lowStock` | boolean | No | - | Filter products below threshold |
| `sort` | string | No | createdAt:desc | Sort field and order |

**Example Request**:

```http
GET /api/v1/admin/products?page=1&limit=20&status=ACTIVE&lowStock=true
```

**Success Response** (200 OK):

```json
{
  "data": [
    {
      "id": "prod_abc123",
      "sku": "PROD-001",
      "name": "Premium Wireless Headphones",
      "slug": "premium-wireless-headphones",
      "price": "199.99",
      "status": "ACTIVE",
      "featured": false,
      "category": {
        "id": "cat_abc123",
        "name": "Electronics"
      },
      "inventory": {
        "quantity": 8,
        "reservedQuantity": 2,
        "lowStockThreshold": 10,
        "isLowStock": true
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T14:20:00.000Z"
    }
  ],
  "meta": {
    "timestamp": "2024-01-15T16:00:00.000Z",
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

---

## Product Image Management Endpoints

### Base URL Pattern

- **Admin endpoints**: `/api/v1/admin/products/[id]/images`

All image management endpoints require **ADMIN** authentication.

---

### 7. Upload Product Images

Uploads one or multiple images for a product to Cloudinary.

**Endpoint**: `POST /api/v1/admin/products/[id]/images`

**Authentication**: Required (ADMIN only)

**Rate Limit**: 20 requests per minute

**URL Parameters**:

- `id`: Product ID (required)

**Request Headers**:

```http
Content-Type: application/json
Cookie: authjs.session-token=<session-token>
```

**Request Body** (Single Image):

```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "altText": "Premium headphones front view",
  "isPrimary": true
}
```

**Request Body** (Multiple Images):

```json
{
  "images": [
    {
      "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
      "altText": "Premium headphones front view",
      "isPrimary": true
    },
    {
      "image": "data:image/png;base64,iVBORw0KGgo...",
      "altText": "Premium headphones side view",
      "isPrimary": false
    },
    {
      "image": "data:image/webp;base64,UklGRiQAAABXRUJQ...",
      "altText": "Premium headphones packaging"
    }
  ]
}
```

**Validation Rules**:

- `image`: Required, base64 encoded data URL
- Image format: JPEG, PNG, or WebP only
- Max file size: 5MB per image
- Max images per request: 10
- Max images per product: 10 total
- `altText`: Optional, max 255 characters, HTML tags stripped
- `isPrimary`: Optional, boolean (default: false)
- Only one image can be marked as primary

**Business Rules**:

- First image uploaded becomes primary by default if no primary exists
- If image is marked as primary, all other images are automatically set to non-primary
- Images are automatically assigned sequential `sortOrder` values
- Cloudinary service must be configured (returns 503 if not)

**Success Response** (201 Created) - Single Image:

```json
{
  "success": true,
  "data": {
    "id": "img_xyz789",
    "productId": "prod_abc123",
    "url": "https://res.cloudinary.com/demo/image/upload/v1234567890/ecommerce/products/prod_abc123/image.jpg",
    "altText": "Premium headphones front view",
    "sortOrder": 0,
    "isPrimary": true,
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Image uploaded successfully",
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

**Success Response** (201 Created) - Multiple Images:

```json
{
  "success": true,
  "data": [
    {
      "id": "img_xyz789",
      "productId": "prod_abc123",
      "url": "https://res.cloudinary.com/demo/image/upload/v1234567890/ecommerce/products/prod_abc123/image1.jpg",
      "altText": "Premium headphones front view",
      "sortOrder": 0,
      "isPrimary": true,
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": "img_xyz790",
      "productId": "prod_abc123",
      "url": "https://res.cloudinary.com/demo/image/upload/v1234567890/ecommerce/products/prod_abc123/image2.png",
      "altText": "Premium headphones side view",
      "sortOrder": 1,
      "isPrimary": false,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "message": "3 images uploaded successfully",
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "count": 3
  }
}
```

**Error Responses**:

401 Unauthorized:

```json
{
  "error": "Unauthorized",
  "message": "You must be logged in to upload images",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

403 Forbidden:

```json
{
  "error": "Forbidden",
  "message": "Only admins can upload product images",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

404 Not Found:

```json
{
  "error": "Not Found",
  "message": "Product not found",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

400 Validation Error:

```json
{
  "error": "Validation Error",
  "message": "Invalid request data",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "details": [
    {
      "path": ["image"],
      "message": "Image size must not exceed 5MB"
    },
    {
      "path": ["altText"],
      "message": "Alt text must not exceed 255 characters"
    }
  ]
}
```

409 Conflict:

```json
{
  "error": "Conflict",
  "message": "Product already has maximum of 10 images",
  "code": "MAX_IMAGES_EXCEEDED",
  "statusCode": 409
}
```

503 Service Unavailable:

```json
{
  "error": "Service Unavailable",
  "message": "Image upload service is not configured",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### 8. Get Product Images

Retrieves all images for a specific product.

**Endpoint**: `GET /api/v1/admin/products/[id]/images`

**Authentication**: Required (ADMIN only)

**Rate Limit**: 60 requests per minute

**URL Parameters**:

- `id`: Product ID (required)

**Example Request**:

```http
GET /api/v1/admin/products/prod_abc123/images
```

**Success Response** (200 OK):

```json
{
  "data": [
    {
      "id": "img_xyz789",
      "productId": "prod_abc123",
      "url": "https://res.cloudinary.com/demo/image/upload/v1234567890/ecommerce/products/prod_abc123/image1.jpg",
      "altText": "Premium headphones front view",
      "sortOrder": 0,
      "isPrimary": true,
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": "img_xyz790",
      "productId": "prod_abc123",
      "url": "https://res.cloudinary.com/demo/image/upload/v1234567890/ecommerce/products/prod_abc123/image2.jpg",
      "altText": "Premium headphones side view",
      "sortOrder": 1,
      "isPrimary": false,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "meta": {
    "timestamp": "2024-01-15T11:00:00.000Z",
    "count": 2
  }
}
```

**Error Responses**:

404 Not Found:

```json
{
  "error": "Not Found",
  "message": "Product not found",
  "timestamp": "2024-01-15T11:00:00.000Z"
}
```

---

### 9. Set Primary Image

Sets a specific image as the primary product image.

**Endpoint**: `PATCH /api/v1/admin/products/[id]/images/primary`

**Authentication**: Required (ADMIN only)

**Rate Limit**: 30 requests per minute

**URL Parameters**:

- `id`: Product ID (required)

**Request Headers**:

```http
Content-Type: application/json
Cookie: authjs.session-token=<session-token>
```

**Request Body**:

```json
{
  "imageId": "img_xyz790"
}
```

**Validation Rules**:

- `imageId`: Required, valid image ID (CUID format)
- Image must belong to the specified product

**Business Rules**:

- Previous primary image is automatically set to non-primary
- Only one image can be primary at a time

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "id": "img_xyz790",
    "productId": "prod_abc123",
    "url": "https://res.cloudinary.com/demo/image/upload/v1234567890/ecommerce/products/prod_abc123/image2.jpg",
    "altText": "Premium headphones side view",
    "sortOrder": 1,
    "isPrimary": true,
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Primary image updated successfully",
  "meta": {
    "timestamp": "2024-01-15T12:00:00.000Z",
    "updatedBy": "user_admin123"
  }
}
```

**Error Responses**:

404 Not Found (Product):

```json
{
  "error": "Not Found",
  "message": "Product not found",
  "code": "PRODUCT_NOT_FOUND",
  "statusCode": 404
}
```

404 Not Found (Image):

```json
{
  "error": "Not Found",
  "message": "Image not found or does not belong to this product",
  "code": "IMAGE_NOT_FOUND",
  "statusCode": 404
}
```

400 Validation Error:

```json
{
  "error": "Validation Error",
  "message": "Invalid image ID format",
  "timestamp": "2024-01-15T12:00:00.000Z",
  "details": [
    {
      "path": ["imageId"],
      "message": "Invalid image ID format"
    }
  ]
}
```

---

### 10. Reorder Images

Updates the display order of product images.

**Endpoint**: `PATCH /api/v1/admin/products/[id]/images/reorder`

**Authentication**: Required (ADMIN only)

**Rate Limit**: 30 requests per minute

**URL Parameters**:

- `id`: Product ID (required)

**Request Headers**:

```http
Content-Type: application/json
Cookie: authjs.session-token=<session-token>
```

**Request Body**:

```json
{
  "imageOrders": [
    {
      "imageId": "img_xyz790",
      "sortOrder": 0
    },
    {
      "imageId": "img_xyz789",
      "sortOrder": 1
    },
    {
      "imageId": "img_xyz791",
      "sortOrder": 2
    }
  ]
}
```

**Validation Rules**:

- `imageOrders`: Required, array of 1-10 objects
- `imageId`: Required, valid image ID (CUID format)
- `sortOrder`: Required, integer 0-999
- All image IDs must be unique
- All sort orders must be unique
- All images must belong to the specified product

**Business Rules**:

- Images are displayed in ascending `sortOrder`
- Only specified images are reordered
- Other images maintain their existing order

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": [
    {
      "id": "img_xyz790",
      "productId": "prod_abc123",
      "url": "https://res.cloudinary.com/demo/image/upload/v1234567890/ecommerce/products/prod_abc123/image2.jpg",
      "altText": "Premium headphones side view",
      "sortOrder": 0,
      "isPrimary": true,
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": "img_xyz789",
      "productId": "prod_abc123",
      "url": "https://res.cloudinary.com/demo/image/upload/v1234567890/ecommerce/products/prod_abc123/image1.jpg",
      "altText": "Premium headphones front view",
      "sortOrder": 1,
      "isPrimary": false,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "message": "Images reordered successfully",
  "meta": {
    "timestamp": "2024-01-15T13:00:00.000Z",
    "updatedBy": "user_admin123"
  }
}
```

**Error Responses**:

404 Not Found:

```json
{
  "error": "Not Found",
  "message": "Product not found",
  "statusCode": 404
}
```

400 Validation Error:

```json
{
  "error": "Validation Error",
  "message": "Invalid request data",
  "timestamp": "2024-01-15T13:00:00.000Z",
  "details": [
    {
      "path": ["imageOrders"],
      "message": "Duplicate image IDs are not allowed"
    },
    {
      "path": ["imageOrders", 0, "sortOrder"],
      "message": "Sort order must be non-negative"
    }
  ]
}
```

422 Unprocessable Entity:

```json
{
  "error": "Unprocessable Entity",
  "message": "One or more images do not belong to this product",
  "code": "INVALID_IMAGE_OWNERSHIP",
  "statusCode": 422,
  "details": [
    {
      "field": "imageId",
      "value": "img_xyz999",
      "message": "Image does not belong to product prod_abc123"
    }
  ]
}
```

---

### 11. Update Image Metadata

Updates alt text or primary status for a specific image.

**Endpoint**: `PATCH /api/v1/admin/products/[id]/images/[imageId]`

**Authentication**: Required (ADMIN only)

**Rate Limit**: 30 requests per minute

**URL Parameters**:

- `id`: Product ID (required)
- `imageId`: Image ID (required)

**Request Headers**:

```http
Content-Type: application/json
Cookie: authjs.session-token=<session-token>
```

**Request Body** (all fields optional):

```json
{
  "altText": "Updated alt text for accessibility",
  "isPrimary": true
}
```

**Validation Rules**:

- `altText`: Optional, max 255 characters, HTML tags stripped
- `isPrimary`: Optional, boolean
- At least one field must be provided

**Business Rules**:

- If `isPrimary` is set to true, previous primary image is set to false
- Empty `altText` will use product name as fallback

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "id": "img_xyz789",
    "productId": "prod_abc123",
    "url": "https://res.cloudinary.com/demo/image/upload/v1234567890/ecommerce/products/prod_abc123/image1.jpg",
    "altText": "Updated alt text for accessibility",
    "sortOrder": 0,
    "isPrimary": true,
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Image metadata updated successfully",
  "meta": {
    "timestamp": "2024-01-15T14:00:00.000Z",
    "updatedBy": "user_admin123"
  }
}
```

**Error Responses**:

404 Not Found:

```json
{
  "error": "Not Found",
  "message": "Image not found",
  "statusCode": 404
}
```

400 Validation Error:

```json
{
  "error": "Validation Error",
  "message": "At least one field (altText or isPrimary) must be provided",
  "statusCode": 400
}
```

---

### 12. Delete Product Image

Deletes a specific product image from Cloudinary and database.

**Endpoint**: `DELETE /api/v1/admin/products/[id]/images/[imageId]`

**Authentication**: Required (ADMIN only)

**Rate Limit**: 20 requests per minute

**URL Parameters**:

- `id`: Product ID (required)
- `imageId`: Image ID (required)

**Request Headers**:

```http
Cookie: authjs.session-token=<session-token>
```

**Business Rules**:

- Image is deleted from both Cloudinary and database
- If deleted image was primary, the first remaining image becomes primary
- Cloudinary deletion failure doesn't prevent database deletion (logged but continues)
- Cannot delete if it's the only product image (business rule, optional)

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "Image deleted successfully",
  "meta": {
    "timestamp": "2024-01-15T15:00:00.000Z"
  }
}
```

**Error Responses**:

401 Unauthorized:

```json
{
  "error": "Unauthorized",
  "message": "You must be logged in to delete images",
  "timestamp": "2024-01-15T15:00:00.000Z"
}
```

403 Forbidden:

```json
{
  "error": "Forbidden",
  "message": "Only admins can delete product images",
  "timestamp": "2024-01-15T15:00:00.000Z"
}
```

404 Not Found (Product):

```json
{
  "error": "Not Found",
  "message": "Product not found",
  "timestamp": "2024-01-15T15:00:00.000Z"
}
```

404 Not Found (Image):

```json
{
  "error": "Not Found",
  "message": "Image not found",
  "timestamp": "2024-01-15T15:00:00.000Z"
}
```

422 Unprocessable Entity:

```json
{
  "error": "Unprocessable Entity",
  "message": "Cannot delete the only product image",
  "code": "MINIMUM_IMAGES_REQUIRED",
  "statusCode": 422
}
```

---

## Pagination & Filtering

### Pagination Standards

All list endpoints support pagination with the following parameters:

| Parameter | Type    | Default | Min | Max | Description         |
| --------- | ------- | ------- | --- | --- | ------------------- |
| `page`    | integer | 1       | 1   | -   | Current page number |
| `limit`   | integer | 20      | 1   | 100 | Items per page      |

**Example**:

```http
GET /api/v1/products?page=2&limit=50
```

**Response includes pagination metadata**:

```json
{
  "data": [...],
  "meta": {
    "pagination": {
      "page": 2,
      "limit": 50,
      "total": 150,
      "totalPages": 3
    }
  }
}
```

### Filtering Standards

**Query Parameter Format**:

- Simple filters: `?status=ACTIVE`
- Range filters: `?minPrice=10&maxPrice=100`
- Array filters: `?categoryIds=cat1,cat2,cat3`
- Boolean filters: `?featured=true`
- Search: `?search=wireless+headphones`

**Search Behavior**:

- Case-insensitive
- Partial matches allowed
- Searches across multiple fields (name, description, SKU)
- Uses database full-text search for performance

### Sorting Standards

**Sort Parameter Format**: `field:order`

**Valid Orders**:

- `asc`: Ascending (A-Z, 0-9, oldest-newest)
- `desc`: Descending (Z-A, 9-0, newest-oldest)

**Examples**:

```http
GET /api/v1/products?sort=price:asc
GET /api/v1/products?sort=createdAt:desc
GET /api/v1/products?sort=name:asc
```

---

## Implementation Checklist

When implementing new endpoints, ensure:

- [ ] RESTful URL structure (nouns, plural, hierarchical)
- [ ] Appropriate HTTP methods and status codes
- [ ] Standardized response format (data + meta)
- [ ] Zod schema validation for all inputs
- [ ] Authentication check (if protected)
- [ ] Authorization check (role-based)
- [ ] Input sanitization (XSS prevention)
- [ ] Rate limiting applied
- [ ] Error handling for all scenarios
- [ ] Consistent error format with codes
- [ ] Pagination support (for list endpoints)
- [ ] Filtering support (where applicable)
- [ ] Sorting support (where applicable)
- [ ] Database query optimization (indexes, select fields)
- [ ] Logging for security events
- [ ] API documentation updated
- [ ] Integration tests written
- [ ] TypeScript types exported

---

## Type Definitions

### Shared Types

```typescript
// src/types/api.ts

/**
 * Standard API success response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  meta: ApiMetadata;
}

/**
 * Standard API metadata
 */
export interface ApiMetadata {
  timestamp: string;
  createdBy?: string;
  updatedBy?: string;
  deletedBy?: string;
  pagination?: PaginationMetadata;
}

/**
 * Pagination metadata
 */
export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Standard API error response
 */
export interface ApiError {
  error: string;
  code?: string;
  statusCode: number;
  details?: ValidationError[];
}

/**
 * Validation error detail
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Query parameters for paginated list endpoints
 */
export interface ListQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
}
```

### Product-Specific Types

```typescript
// src/types/product.ts

import { Product, ProductImage, Inventory, Category } from '@prisma/client';

/**
 * Product with relations for public view
 */
export type PublicProduct = Product & {
  category: Pick<Category, 'id' | 'name' | 'slug'>;
  images: ProductImage[];
  inventory: Pick<Inventory, 'quantity'> & {
    inStock: boolean;
  };
  reviews?: {
    averageRating: number;
    totalReviews: number;
  };
};

/**
 * Product with full relations for admin view
 */
export type AdminProduct = Product & {
  category: Category;
  images: ProductImage[];
  inventory: Inventory & {
    availableQuantity: number;
    isLowStock: boolean;
  };
};

/**
 * Product creation input
 */
export interface CreateProductInput {
  sku: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  categoryId: string;
  status?: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  featured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  images?: CreateProductImageInput[];
  initialStock?: number;
}

/**
 * Product image creation input
 */
export interface CreateProductImageInput {
  url: string;
  altText?: string;
  sortOrder?: number;
  isPrimary?: boolean;
}

/**
 * Product update input
 */
export type UpdateProductInput = Partial<Omit<CreateProductInput, 'sku' | 'initialStock'>>;

/**
 * Product list query parameters
 */
export interface ProductListQuery extends ListQueryParams {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  status?: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  lowStock?: boolean;
}
```

---

## Security Considerations

### Input Validation

All endpoints implement:

1. **Zod schema validation** for type safety
2. **String length limits** to prevent DoS
3. **Number range validation** for prices/quantities
4. **Array size limits** for images/relations
5. **SQL injection prevention** via Prisma ORM
6. **XSS prevention** via input sanitization

### Rate Limiting

Applied per IP address:

- **Public read endpoints**: 60-120 req/min
- **Admin endpoints**: 20-30 req/min
- **Create/update endpoints**: 20 req/min

### OWASP Compliance

- **A01:2021 - Broken Access Control**: Role-based authorization checks
- **A02:2021 - Cryptographic Failures**: Secure session cookies, HTTPS only
- **A03:2021 - Injection**: Parameterized queries via Prisma
- **A04:2021 - Insecure Design**: Soft deletes, audit trails
- **A05:2021 - Security Misconfiguration**: Security headers in middleware
- **A07:2021 - Authentication Failures**: NextAuth.js with account locking
- **A08:2021 - Software Integrity Failures**: Dependency scanning in CI/CD

---

## Future Endpoints (Planned)

### Sprint 2-3

- `/api/v1/categories` - Category management
- `/api/v1/products/[id]/images` - Image management

### Sprint 4

- `/api/v1/cart` - Shopping cart operations

### Sprint 5

- `/api/v1/auth/register` - User registration
- `/api/v1/auth/verify-email` - Email verification

### Sprint 6-7

- `/api/v1/orders` - Order creation and management
- `/api/v1/checkout` - Checkout process

### Sprint 10

- `/api/v1/products/[id]/reviews` - Product reviews

---

**Last Updated**: 2024-01-15
**Version**: 1.0.0
**Maintained By**: API Design Architect
