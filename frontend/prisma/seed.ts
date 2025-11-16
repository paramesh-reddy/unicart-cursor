import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create admin user
  const adminPassword = await hashPassword('Admin@123')
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      emailVerified: true,
      isActive: true
    }
  })

  console.log('✅ Admin user created:', admin.email)

  // Create categories
  const categories = [
    {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Latest electronic devices and gadgets',
      icon: '📱',
      sortOrder: 1
    },
    {
      name: 'Fashion',
      slug: 'fashion',
      description: 'Trendy clothing and accessories',
      icon: '👕',
      sortOrder: 2
    },
    {
      name: 'Home & Garden',
      slug: 'home-garden',
      description: 'Everything for your home and garden',
      icon: '🏠',
      sortOrder: 3
    },
    {
      name: 'Sports',
      slug: 'sports',
      description: 'Sports equipment and fitness gear',
      icon: '⚽',
      sortOrder: 4
    },
    {
      name: 'Books',
      slug: 'books',
      description: 'Books and educational materials',
      icon: '📚',
      sortOrder: 5
    },
    {
      name: 'Beauty',
      slug: 'beauty',
      description: 'Beauty and personal care products',
      icon: '💄',
      sortOrder: 6
    }
  ]

  const createdCategories = []
  for (const category of categories) {
    const created = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category
    })
    createdCategories.push(created)
  }

  console.log('✅ Categories created:', createdCategories.length)

  // Create sample products
  const products = [
    {
      name: 'Premium Wireless Headphones',
      slug: 'premium-wireless-headphones',
      description: 'Experience crystal-clear audio with our premium wireless headphones. Features active noise cancellation, 30-hour battery life, and premium comfort.',
      shortDescription: 'Premium wireless headphones with ANC and 30-hour battery',
      categoryId: createdCategories[0].id, // Electronics
      brand: 'AudioTech',
      sku: 'AT-WH-001',
      price: 299.99,
      comparePrice: 399.99,
      stockQuantity: 45,
      lowStockThreshold: 10,
      isActive: true,
      isFeatured: true,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
          alt: 'Premium Wireless Headphones',
          isPrimary: true,
          sortOrder: 1
        }
      ]
    },
    {
      name: 'Smart Fitness Watch',
      slug: 'smart-fitness-watch',
      description: 'Track your fitness goals with this advanced smartwatch. Features heart rate monitoring, GPS, water resistance, and 7-day battery life.',
      shortDescription: 'Advanced fitness tracking smartwatch with GPS',
      categoryId: createdCategories[0].id, // Electronics
      brand: 'FitTech',
      sku: 'FT-SW-002',
      price: 199.99,
      comparePrice: 249.99,
      stockQuantity: 32,
      lowStockThreshold: 5,
      isActive: true,
      isFeatured: true,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
          alt: 'Smart Fitness Watch',
          isPrimary: true,
          sortOrder: 1
        }
      ]
    },
    {
      name: 'Organic Cotton T-Shirt',
      slug: 'organic-cotton-t-shirt',
      description: 'Comfortable and sustainable organic cotton t-shirt. Perfect for everyday wear with a modern fit and soft feel.',
      shortDescription: 'Sustainable organic cotton t-shirt',
      categoryId: createdCategories[1].id, // Fashion
      brand: 'EcoWear',
      sku: 'EW-TS-003',
      price: 29.99,
      comparePrice: 39.99,
      stockQuantity: 120,
      lowStockThreshold: 20,
      isActive: true,
      isFeatured: false,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
          alt: 'Organic Cotton T-Shirt',
          isPrimary: true,
          sortOrder: 1
        }
      ]
    },
    {
      name: 'Smart Home Speaker',
      slug: 'smart-home-speaker',
      description: 'Voice-controlled smart speaker with premium sound quality. Compatible with all major smart home platforms.',
      shortDescription: 'Voice-controlled smart speaker with premium sound',
      categoryId: createdCategories[2].id, // Home & Garden
      brand: 'SmartHome',
      sku: 'SH-SP-004',
      price: 149.99,
      comparePrice: 199.99,
      stockQuantity: 28,
      lowStockThreshold: 8,
      isActive: true,
      isFeatured: true,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1543512214-318c7553f230?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
          alt: 'Smart Home Speaker',
          isPrimary: true,
          sortOrder: 1
        }
      ]
    },
    {
      name: 'Yoga Mat Premium',
      slug: 'yoga-mat-premium',
      description: 'Non-slip premium yoga mat with excellent cushioning. Perfect for yoga, pilates, and other fitness activities.',
      shortDescription: 'Non-slip premium yoga mat',
      categoryId: createdCategories[3].id, // Sports
      brand: 'FlexFit',
      sku: 'FF-YM-005',
      price: 49.99,
      comparePrice: 69.99,
      stockQuantity: 75,
      lowStockThreshold: 15,
      isActive: true,
      isFeatured: false,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
          alt: 'Yoga Mat Premium',
          isPrimary: true,
          sortOrder: 1
        }
      ]
    }
  ]

  for (const productData of products) {
    const { images, ...productInfo } = productData
    const product = await prisma.product.create({
      data: productInfo
    })

    // Create product images
    for (const imageData of images) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          ...imageData
        }
      })
    }

    console.log('✅ Product created:', product.name)
  }

  console.log('🎉 Database seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
