# 🛒 UniCart - Full-Stack E-Commerce Platform

A modern, production-ready e-commerce platform built with Next.js 14, TypeScript, PostgreSQL, and Prisma ORM.

![Next.js](https://img.shields.io/badge/Next.js-14.2.5-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue?logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-blue?logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-6.17.1-2D3748?logo=prisma)

## ✨ Features

- 🛍️ **Product Catalog** - Browse and search products with advanced filtering
- 🛒 **Shopping Cart** - Real-time cart management with database persistence
- ❤️ **Wishlist** - Save favorite products across sessions
- 👤 **User Authentication** - Secure JWT-based authentication with role-based access
- 🔐 **Admin Dashboard** - Complete product management system
- 💳 **Checkout Process** - Multi-step checkout with order tracking
- 📱 **Responsive Design** - Mobile-first approach with modern UI
- 🔍 **Global Search** - Real-time product search with debouncing
- 🗄️ **Database Integration** - PostgreSQL with Prisma ORM
- 🔒 **Secure APIs** - RESTful API routes with authentication middleware

## 🚀 Tech Stack

### **Frontend**
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **State Management:** Zustand
- **Form Handling:** React Hook Form + Zod

### **Backend**
- **API:** Next.js API Routes
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT + bcryptjs
- **Email:** Nodemailer (optional)

## 📦 Installation

### **Prerequisites**
- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- Git installed

### **1. Clone Repository**
```bash
git clone https://github.com/yourusername/unicart.git
cd unicart
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Setup Environment Variables**
Create `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/unicart_db"

# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key-min-32-characters"
JWT_EXPIRES_IN="7d"

# Application
NEXT_PUBLIC_APP_NAME="UniCart"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# Admin Credentials (for seeding)
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="Admin@123"
```

### **4. Setup Database**
```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database with initial data
npm run db:seed
```

### **5. Run Development Server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🗄️ Database Schema

The application includes comprehensive database models:
- **Users** - Authentication and profiles
- **Products** - Catalog with variants and images
- **Categories** - Product categorization
- **Orders** - Order management and tracking
- **Cart & Wishlist** - User collections
- **Reviews** - Product ratings and feedback
- **Addresses** - Shipping and billing

## 📚 API Endpoints

### **Authentication**
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update user profile

### **Products**
- `GET /api/products` - Get all products (with filtering)
- `GET /api/products/[id]` - Get single product

### **Cart**
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/[productId]` - Update cart item
- `DELETE /api/cart/[productId]` - Remove from cart

### **Wishlist**
- `GET /api/wishlist` - Get user wishlist
- `POST /api/wishlist` - Add to wishlist
- `DELETE /api/wishlist/[productId]` - Remove from wishlist

### **Categories**
- `GET /api/categories` - Get all categories

## 🔐 Default Admin Credentials

```
Email: admin@example.com
Password: Admin@123
```

## 🚀 Deployment (Vercel)

### **1. Push to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### **2. Deploy on Vercel**
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Add environment variables (see `.env.local` example)
4. Deploy

### **3. Setup Production Database**
Use Vercel Postgres, Supabase, or Railway for your production database.

### **4. Run Migrations**
```bash
npx prisma migrate deploy
npm run db:seed
```

For detailed deployment instructions, see [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)

## 📱 Building the Android App (Capacitor)

Follow these steps once your APIs are working:

1. **Set environment variables**

   Make sure `NEXT_PUBLIC_API_URL` points to your deployed API (for example `https://unicart-frontned1.vercel.app`). Update `.env` (or `.env.production`) and run `npx cap sync` so Capacitor gets the new values.

2. **Build the web assets**

   ```bash
   npm run build
   ```

3. **Sync Capacitor**

   ```bash
   npx cap sync android
   ```

4. **Build the Android APK**

   ```bash
   cd android
   ./gradlew assembleDebug   # use assembleRelease for a release build
   ```

5. **Install and test**

   The APK is generated in `android/app/build/outputs/apk/`. Install it on a device or emulator and verify login/register flows against your deployed API.


## 📖 Documentation

- **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)** - Complete deployment guide
- **[DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md)** - Quick deployment reference
- **[project_overview.md](./project_overview.md)** - Full project documentation
- **[BRD.md](./BRD.md)** - Business requirements document
- **[UI_UX_Wireframes.md](./UI_UX_Wireframes.md)** - UI/UX specifications
- **[Architectural_Design_Document.md](./Architectural_Design_Document.md)** - Architecture details

## 🛠️ Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking

# Database Commands
npm run db:generate  # Generate Prisma Client
npm run db:push      # Push schema to database
npm run db:migrate   # Create and run migrations
npm run db:seed      # Seed database with initial data
npm run db:studio    # Open Prisma Studio
```

## 📁 Project Structure

```
unicart/
├── app/                      # Next.js App Router
│   ├── api/                 # API Routes (Backend)
│   │   ├── auth/           # Authentication endpoints
│   │   ├── products/       # Product management
│   │   ├── cart/           # Shopping cart
│   │   └── wishlist/       # Wishlist management
│   ├── products/           # Product pages
│   ├── cart/               # Cart page
│   ├── checkout/           # Checkout flow
│   ├── admin/              # Admin dashboard
│   └── ...
├── components/              # React components
├── prisma/                  # Database schema
├── lib/                     # Utilities and helpers
├── store/                   # Zustand stores
├── types/                   # TypeScript types
└── public/                  # Static assets
```

## 🎨 Features Overview

### **Customer Features**
- Browse products with filtering and sorting
- Add products to cart and wishlist
- User registration and login
- Product search with real-time results
- Multi-step checkout process
- Order history and tracking
- Product reviews and ratings
- Responsive mobile design

### **Admin Features**
- Secure admin dashboard
- Product CRUD operations
- Category management
- Order management
- User management
- Analytics and reports

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Protected API routes
- Role-based access control
- Environment variable security
- SQL injection prevention (Prisma)
- CORS configuration

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Database with [Prisma](https://www.prisma.io/)
- UI Components from [shadcn/ui](https://ui.shadcn.com/)

## 📧 Support

For support, email your-email@example.com or open an issue on GitHub.

---

**⭐ If you like this project, please give it a star on GitHub!**
