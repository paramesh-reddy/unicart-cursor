import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import productsData from '@/data/products.json'
import categoriesData from '@/data/categories.json'
import { extractTokenFromHeader } from '@/lib/auth'

export const dynamic = 'force-dynamic'

type SampleWishlistItem = {
  productId: string
  addedAt: string
}

const SAMPLE_MODE =
  process.env.NEXT_PUBLIC_SAMPLE_MODE !== 'false' ||
  !process.env.DATABASE_URL

const rawSampleProducts = Array.isArray(productsData) ? productsData : []
const rawSampleCategories = Array.isArray(categoriesData) ? categoriesData : []

const globalAny = globalThis as unknown as {
  __sampleWishlistStore__?: Map<string, SampleWishlistItem[]>
}

const sampleWishlistStore =
  globalAny.__sampleWishlistStore__ ??
  new Map<string, SampleWishlistItem[]>()

if (!globalAny.__sampleWishlistStore__) {
  globalAny.__sampleWishlistStore__ = sampleWishlistStore
}

function getSampleWishlistKey(request: NextRequest): string {
  return (
    extractTokenFromHeader(request.headers.get('authorization')) || 'guest'
  )
}

function getSampleProduct(productId: string) {
  return rawSampleProducts.find(
    (product: any) =>
      product.id === productId || product.slug === productId
  )
}

function normalizeSampleProduct(product: any) {
  if (!product) {
    return undefined
  }

  const category = rawSampleCategories.find(
    (cat: any) => cat.id === product.categoryId
  )

  return {
    ...product,
    images: Array.isArray(product.images) ? product.images : [],
    variants: Array.isArray(product.variants) ? product.variants : [],
    rating: product.rating ?? { average: 0, count: 0 },
    category: category
      ? {
          id: category.id,
          name: category.name,
          slug: category.slug
        }
      : undefined
  }
}

function buildSampleWishlistItems(items: SampleWishlistItem[]) {
  return items
    .map((item) => {
      const product = normalizeSampleProduct(
        getSampleProduct(item.productId)
      )
      if (!product) {
        return null
      }

      return {
        id: `sample-${product.id}`,
        userId: 'sample-user',
        productId: product.id,
        createdAt: item.addedAt,
        updatedAt: item.addedAt,
        product: {
          ...product,
          reviews: undefined,
          _count: undefined
        }
      }
    })
    .filter(Boolean) as Array<{
    id: string
    userId: string
    productId: string
    createdAt: string
    updatedAt: string
    product: any
  }>
}

// GET /api/wishlist - Get user's wishlist
export async function GET(request: NextRequest) {
  if (SAMPLE_MODE) {
    const key = getSampleWishlistKey(request)
    const items = sampleWishlistStore.get(key) ?? []
    const wishlist = buildSampleWishlistItems(items).map((item) => ({
      ...item,
      product: {
        ...item.product,
        rating: item.product.rating ?? { average: 0, count: 0 }
      }
    }))

    return NextResponse.json({
      success: true,
      wishlist
    })
  }

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
  if (SAMPLE_MODE) {
    try {
      const body = await request.json()
      const { productId } = body

      if (!productId) {
        return NextResponse.json(
          { error: 'Product ID is required' },
          { status: 400 }
        )
      }

      const product = normalizeSampleProduct(getSampleProduct(productId))

      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        )
      }

      const key = getSampleWishlistKey(request)
      const items = (sampleWishlistStore.get(key) ?? []).map((item) => ({
        ...item
      }))

      const alreadyExists = items.some(
        (item) => item.productId === product.id
      )

      if (alreadyExists) {
        return NextResponse.json(
          { error: 'Product already in wishlist' },
          { status: 400 }
        )
      }

      const newItem: SampleWishlistItem = {
        productId: product.id,
        addedAt: new Date().toISOString()
      }

      items.push(newItem)
      sampleWishlistStore.set(key, items)

      const itemPayload = buildSampleWishlistItems([newItem])[0]

      return NextResponse.json({
        success: true,
        message: 'Product added to wishlist',
        item: itemPayload
      })
    } catch (error) {
      console.error('Sample add to wishlist error:', error)
      return NextResponse.json(
        { error: 'Failed to add to wishlist' },
        { status: 500 }
      )
    }
  }

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
