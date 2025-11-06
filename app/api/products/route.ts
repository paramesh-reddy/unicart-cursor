import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const productQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('12'),
  category: z.string().optional(),
  search: z.string().optional(),
  sort: z.string().optional().default('newest'),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  brand: z.string().optional(),
  rating: z.string().optional(),
  featured: z.string().optional()
})

// GET /api/products - Get products with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams.entries())
    const { page, limit, category, search, sort, minPrice, maxPrice, brand, rating, featured } = productQuerySchema.parse(params)

    const pageNum = parseInt(page)
    // Allow fetching all products by setting a very high limit if limit is 0 or very large
    const limitNum = parseInt(limit) > 10000 ? 10000 : parseInt(limit)
    const skip = (pageNum - 1) * limitNum

    // Build where clause
    const where: any = {
      isActive: true
    }

    if (featured === 'true') {
      where.isFeatured = true
    }

    if (category) {
      where.categoryId = category
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }

    if (brand) {
      where.brand = { contains: brand, mode: 'insensitive' }
    }

    if (rating) {
      where.rating = { average: { gte: parseFloat(rating) } }
    }

    // Build orderBy clause
    let orderBy: any = { createdAt: 'desc' }
    switch (sort) {
      case 'price-low':
        orderBy = { price: 'asc' }
        break
      case 'price-high':
        orderBy = { price: 'desc' }
        break
      case 'name':
        orderBy = { name: 'asc' }
        break
      case 'rating':
        orderBy = { rating: { average: 'desc' } }
        break
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' }
        break
    }

    // Get products with pagination
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: {
          images: {
            orderBy: { sortOrder: 'asc' }
          },
          category: {
            select: { id: true, name: true, slug: true }
          },
          reviews: {
            select: { rating: true }
          },
          _count: {
            select: { reviews: true }
          }
        }
      }),
      prisma.product.count({ where })
    ])

    // Calculate average ratings
    const productsWithRatings = products.map((product: typeof products[0]) => {
      const reviews = product.reviews
      const averageRating = reviews.length > 0 
        ? reviews.reduce((sum: number, review: typeof reviews[0]) => sum + review.rating, 0) / reviews.length 
        : 0

      return {
        ...product,
        rating: {
          average: Math.round(averageRating * 10) / 10,
          count: product._count.reviews
        },
        reviews: undefined,
        _count: undefined
      }
    })

    return NextResponse.json({
      success: true,
      products: productsWithRatings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    })

  } catch (error) {
    console.error('Get products error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
