# UniCart Backend API

This is the separate backend server for the UniCart e-commerce application. It runs on Express.js and provides REST API endpoints for the frontend.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy the environment file:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
   - `DATABASE_URL`: PostgreSQL connection string
   - `JWT_SECRET`: Secret key for JWT tokens
   - `PORT`: Backend server port (default: 5000)
   - `FRONTEND_URL`: Frontend URL for CORS (default: http://localhost:3000)

4. Generate Prisma client:
```bash
npm run db:generate
```

5. Run database migrations:
```bash
npm run db:migrate
```

6. (Optional) Seed the database:
```bash
npm run db:seed
```

## Running the Server

### Development Mode
```bash
npm run dev
```

This will start the server with hot-reload on `http://localhost:5000`

### Production Mode
```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update user profile

### Products
- `GET /api/products` - Get products with filtering and pagination
- `GET /api/products/:id` - Get single product by ID or slug

### Categories
- `GET /api/categories` - Get all categories

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:productId` - Update cart item quantity
- `DELETE /api/cart/:productId` - Remove item from cart

### Wishlist
- `GET /api/wishlist` - Get user's wishlist
- `POST /api/wishlist` - Add item to wishlist
- `DELETE /api/wishlist/:productId` - Remove item from wishlist

## Health Check

- `GET /health` - Server health check endpoint

## Notes

- The backend runs on port 5000 by default
- Make sure the frontend is configured to point to this backend URL
- CORS is enabled for the frontend URL specified in `FRONTEND_URL`
- The backend supports sample mode when `DATABASE_URL` is not set

