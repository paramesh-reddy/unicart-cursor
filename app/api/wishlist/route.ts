import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/wishlist - Get user's wishlist
export async function GET(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const wishlistItems = await prisma.wishlistItem.findMany({
        where: { userId: req.user!.id },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              description: true,
              shortDescription: true,
              brand: true,
              sku: true,
              price: true,
              comparePrice: true,
              costPrice: true,
              stockQuantity: true,
              lowStockThreshold: true,
              weight: true,
              dimensions: true,
              isActive: true,
              isFeatured: true,
              isDigital: true,
              requiresShipping: true,
              trackQuantity: true,
              allowBackorder: true,
              metaTitle: true,
              metaDescription: true,
              tags: true,
              createdAt: true,
              updatedAt: true,
              images: {
                orderBy: { sortOrder: 'asc' },
                take: 1
              },
              category: {
                select: { name: true }
              },
              reviews: {
                select: { rating: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      // Calculate ratings for each product
      const itemsWithRatings = wishlistItems.map((item: typeof wishlistItems[0]) => {
        const reviews = item.product.reviews
        const averageRating = reviews.length > 0 
          ? reviews.reduce((sum: number, review: typeof reviews[0]) => sum + review.rating, 0) / reviews.length 
          : 0

        return {
          ...item,
          product: {
            ...item.product,
            rating: {
              average: Math.round(averageRating * 10) / 10,
              count: reviews.length
            },
            reviews: undefined
          }
        }
      })

      return NextResponse.json({
        success: true,
        wishlist: itemsWithRatings
      })

    } catch (error) {
      console.error('Get wishlist error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch wishlist' },
        { status: 500 }
      )
    }
  })
}

// POST /api/wishlist - Add item to wishlist
export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const body = await request.json()
      const { productId } = body

      if (!productId) {
        return NextResponse.json(
          { error: 'Product ID is required' },
          { status: 400 }
        )
      }

      // Check if product exists
      const product = await prisma.product.findFirst({
        where: { id: productId, isActive: true },
        select: { id: true }
      })

      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        )
      }

      // Check if already in wishlist
      const existingItem = await prisma.wishlistItem.findUnique({
        where: {
          userId_productId: {
            userId: req.user!.id,
            productId: productId
          }
        }
      })

      if (existingItem) {
        return NextResponse.json(
          { error: 'Product already in wishlist' },
          { status: 400 }
        )
      }

      // Add to wishlist
      const wishlistItem = await prisma.wishlistItem.create({
        data: {
          userId: req.user!.id,
          productId: productId
        },
        include: {
          product: {
            include: {
              images: {
                where: { isPrimary: true },
                take: 1
              }
            }
          }
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Product added to wishlist',
        item: wishlistItem
      })

    } catch (error) {
      console.error('Add to wishlist error:', error)
      return NextResponse.json(
        { error: 'Failed to add to wishlist' },
        { status: 500 }
      )
    }
  })
}
