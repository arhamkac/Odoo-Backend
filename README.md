# E-commerce API Documentation

**Base URL:** `https://odoo-backend-lnru.onrender.com`

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

All responses follow this format:
```json
{
  "statusCode": "number",
  "data": "object/array",
  "message": "string",
  "success": "boolean"
}
```

---

## User Routes (`/api/users`)

### Register User
- **POST** `/api/users/register`
- **Authentication:** Not required
- **Content-Type:** `multipart/form-data`

**Input:**
```json
{
  "username": "string (required)",
  "email": "string (required)",
  "password": "string (required)",
  "profileImage": "file (required)"
}
```

**What to expect:** User object with id, username, email, profileImage, timestamps

### Login User
- **POST** `/api/users/login`
- **Authentication:** Not required

**Input:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**What to expect:** User object + accessToken + refreshToken, cookies set

### Logout User
- **POST** `/api/users/logout`
- **Authentication:** Required

**Input:** None

**What to expect:** Empty data object, cookies cleared

### Refresh Token
- **POST** `/api/users/refrehToken`
- **Authentication:** Required

**Input:** None (uses refresh token from cookies)

**What to expect:** New accessToken + refreshToken, cookies updated

### Get User Profile
- **GET** `/api/users/me`
- **Authentication:** Required

**Input:** None

**What to expect:** Current user's profile (excludes password, refreshToken)

### Update User Profile
- **PATCH** `/api/users/me/update`
- **Authentication:** Required

**Input:**
```json
{
  "username": "string (optional)",
  "email": "string (optional)",
  "password": "string (optional)"
}
```

**What to expect:** Updated user profile (excludes password, refreshToken)

---

## Product Routes (`/api/product`)

### Create Product
- **POST** `/api/product/create`
- **Authentication:** Required
- **Content-Type:** `multipart/form-data`

**Input:**
```json
{
  "title": "string (required)",
  "description": "string (required)",
  "category": "string (required)",
  "price": "number (required)",
  "image": "file (required)"
}
```

**What to expect:** Complete product object with sellerId

### Get All Products
- **GET** `/api/product/all`
- **Authentication:** Not required

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Products per page (default: 10)
- `category`: Filter by category
- `search`: Search in product titles
- `sortBy`: Field to sort by (default: createdAt)
- `sortOrder`: "asc" or "desc" (default: asc)

**What to expect:** Products array + pagination object (total, page, limit, totalPages)

### Get Product Details
- **GET** `/api/product/:id`
- **Authentication:** Not required

**Input:** Product ID in URL

**What to expect:** Complete product object with all fields

### Update Product
- **PATCH** `/api/product/update/:id`
- **Authentication:** Required (must be product owner)
- **Content-Type:** `multipart/form-data` (if updating image)

**Input:**
```json
{
  "title": "string (optional)",
  "description": "string (optional)",
  "category": "string (optional)",
  "price": "number (optional)",
  "image": "file (optional)"
}
```

**What to expect:** Updated product object

### Delete Product
- **DELETE** `/api/product/delete/:id`
- **Authentication:** Required (must be product owner)

**Input:** Product ID in URL

**What to expect:** null data, success message

---

## Cart Routes (`/api/cart`)

### Get Cart
- **GET** `/api/cart/`
- **Authentication:** Required

**Input:** None

**What to expect:** Cart object with items array (populated with product details) or empty { items: [] }

### Add to Cart
- **POST** `/api/cart/add`
- **Authentication:** Required

**Input:**
```json
{
  "productId": "string (required)",
  "quantity": "number (required, min: 1)"
}
```

**What to expect:** Updated cart object (creates new cart if doesn't exist, updates quantity if item exists)

### Remove from Cart
- **POST** `/api/cart/remove/:productId`
- **Authentication:** Required

**Input:** Product ID in URL

**What to expect:** Updated cart object with item removed completely

### Clear Cart
- **DELETE** `/api/cart/clear`
- **Authentication:** Required

**Input:** None

**What to expect:** Empty object, cart deleted from database

---

## Order Routes (`/api/order`)

### Place Order
- **POST** `/api/order/place`
- **Authentication:** Required

**Input:** None (uses current user's cart)

**What to expect:** Order object with items, totalPrice, timestamps. Cart gets cleared automatically.

### Get My Orders
- **GET** `/api/order/my-orders`
- **Authentication:** Required

**Input:** None

**What to expect:** Array of user's orders with populated product details in items

### Get Order Details
- **GET** `/api/order/:id`
- **Authentication:** Required

**Input:** Order ID in URL

**What to expect:** Complete order object with populated product details in items

---

## Error Responses

**Format:**
```json
{
  "statusCode": "number (400-500)",
  "message": "Error description",
  "success": false
}
```

**Common Status Codes:**
- `400` - Bad Request (missing/invalid fields)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (not authorized for this action)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

---

## Important Notes

1. **Authentication:** Tokens are set as HTTP-only cookies AND returned in response
2. **File Uploads:** Use `multipart/form-data` for image uploads
3. **Image Storage:** Images uploaded to Cloudinary, URLs returned
4. **Cart Behavior:** 
   - Adding existing item updates quantity (doesn't add to existing)
   - Remove completely removes item regardless of quantity
5. **Order Behavior:**
   - Must have items in cart to place order
   - Cart is automatically cleared after successful order
6. **Product Ownership:** Only product creator can update/delete their products
7. **Validation:** Email format and domain validation on registration
8. **Timestamps:** All models include createdAt/updatedAt automatically
