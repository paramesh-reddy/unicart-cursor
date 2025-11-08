import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/products/[id] - Get single product by ID or slug
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Try to find by ID first, then by slug
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { id },
          { slug: id }
        ],
        isActive: true
      },
      include: {
        images: {
          orderBy: { sortOrder: 'asc' }
        },
        category: {
          select: { id: true, name: true, slug: true }
        },
        variants: {
          where: { isActive: true },
          orderBy: { createdAt: 'asc' }
        },
        reviews: {
          include: {
            user: {
              select: { firstName: true, lastName: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { reviews: true }
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Calculate average rating
    const reviews = product.reviews
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum: number, review: typeof reviews[0]) => sum + review.rating, 0) / reviews.length 
      : 0

    const productWithRating = {
      ...product,
      rating: {
        average: Math.round(averageRating * 10) / 10,
        count: product._count.reviews
      },
      reviews: reviews.map((review: typeof reviews[0]) => ({
        ...review,
        user: {
          name: `${review.user.firstName || ''} ${review.user.lastName || ''}`.trim() || 'Anonymous'
        }
      })),
      _count: undefined
    }

    return NextResponse.json({
      success: true,
      product: productWithRating
    })

  } catch (error) {
    console.error('Get product error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}
