import { Router } from 'express'
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth'
import { prisma } from '../lib/prisma'
import { extractTokenFromHeader } from '../lib/auth'
import * as productsData from '../data/products.json'
import * as categoriesData from '../data/categories.json'

const router = Router()

type SampleWishlistItem = {
  productId: string
  addedAt: string
}

// Use database mode if DATABASE_URL is set, otherwise use sample mode
const SAMPLE_MODE = !process.env.DATABASE_URL || process.env.NEXT_PUBLIC_SAMPLE_MODE === 'true'

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

function getSampleWishlistKey(authHeader: string | undefined): string {
  return extractTokenFromHeader(authHeader) || 'guest'
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
router.get('/', async (req, res, next) => {
  if (SAMPLE_MODE) {
    const key = getSampleWishlistKey(req.headers.authorization)
    const items = sampleWishlistStore.get(key) ?? []
    const wishlist = buildSampleWishlistItems(items).map((item) => ({
      ...item,
      product: {
        ...item.product,
        rating: item.product.rating ?? { average: 0, count: 0 }
      }
    }))

    return res.json({
      success: true,
      wishlist
    })
  }

  return authMiddleware(req as AuthenticatedRequest, res, async () => {
    try {
      const authReq = req as AuthenticatedRequest
      const wishlistItems = await prisma.wishlistItem.findMany({
        where: { userId: authReq.user!.id },
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

      res.json({
        success: true,
        wishlist: itemsWithRatings
      })

    } catch (error) {
      console.error('Get wishlist error:', error)
      res.status(500).json({ error: 'Failed to fetch wishlist' })
    }
  })
})

// POST /api/wishlist - Add item to wishlist
router.post('/', async (req, res, next) => {
  if (SAMPLE_MODE) {
    try {
      const { productId } = req.body

      if (!productId) {
        return res.status(400).json({ error: 'Product ID is required' })
      }

      let product = normalizeSampleProduct(getSampleProduct(productId))

      // If product not found in sample data and DATABASE_URL exists, try database
      if (!product && process.env.DATABASE_URL) {
        try {
          const dbProduct = await prisma.product.findFirst({
            where: { id: productId, isActive: true },
            select: { id: true }
          })
          
          if (dbProduct) {
            // Use database route instead
            return authMiddleware(req as AuthenticatedRequest, res, async () => {
              try {
                const authReq = req as AuthenticatedRequest
                const { productId } = req.body

                if (!productId) {
                  return res.status(400).json({ error: 'Product ID is required' })
                }

                // Check if product exists
                const product = await prisma.product.findFirst({
                  where: { id: productId, isActive: true },
                  select: { id: true }
                })

                if (!product) {
                  return res.status(404).json({ error: 'Product not found' })
                }

                // Check if already in wishlist
                const existingItem = await prisma.wishlistItem.findUnique({
                  where: {
                    userId_productId: {
                      userId: authReq.user!.id,
                      productId: productId
                    }
                  }
                })

                if (existingItem) {
                  return res.status(400).json({ error: 'Product already in wishlist' })
                }

                // Add to wishlist
                const wishlistItem = await prisma.wishlistItem.create({
                  data: {
                    userId: authReq.user!.id,
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

                res.json({
                  success: true,
                  message: 'Product added to wishlist',
                  item: wishlistItem
                })

              } catch (error) {
                console.error('Add to wishlist error:', error)
                res.status(500).json({ error: 'Failed to add to wishlist' })
              }
            })
          }
        } catch (dbError) {
          console.error('Database fallback error:', dbError)
        }
      }

      if (!product) {
        return res.status(404).json({ error: 'Product not found' })
      }

      const key = getSampleWishlistKey(req.headers.authorization)
      const items = (sampleWishlistStore.get(key) ?? []).map((item) => ({
        ...item
      }))

      const alreadyExists = items.some(
        (item) => item.productId === product.id
      )

      if (alreadyExists) {
        return res.status(400).json({ error: 'Product already in wishlist' })
      }

      const newItem: SampleWishlistItem = {
        productId: product.id,
        addedAt: new Date().toISOString()
      }

      items.push(newItem)
      sampleWishlistStore.set(key, items)

      const itemPayload = buildSampleWishlistItems([newItem])[0]

      return res.json({
        success: true,
        message: 'Product added to wishlist',
        item: itemPayload
      })
    } catch (error) {
      console.error('Sample add to wishlist error:', error)
      return res.status(500).json({ error: 'Failed to add to wishlist' })
    }
  }

  authMiddleware(req as AuthenticatedRequest, res, async () => {
    try {
      const authReq = req as AuthenticatedRequest
      const { productId } = req.body

      if (!productId) {
        return res.status(400).json({ error: 'Product ID is required' })
      }

      // Check if product exists
      const product = await prisma.product.findFirst({
        where: { id: productId, isActive: true },
        select: { id: true }
      })

      if (!product) {
        return res.status(404).json({ error: 'Product not found' })
      }

      // Check if already in wishlist
      const existingItem = await prisma.wishlistItem.findUnique({
        where: {
          userId_productId: {
            userId: authReq.user!.id,
            productId: productId
          }
        }
      })

      if (existingItem) {
        return res.status(400).json({ error: 'Product already in wishlist' })
      }

      // Add to wishlist
      const wishlistItem = await prisma.wishlistItem.create({
        data: {
          userId: authReq.user!.id,
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

      res.json({
        success: true,
        message: 'Product added to wishlist',
        item: wishlistItem
      })

    } catch (error) {
      console.error('Add to wishlist error:', error)
      res.status(500).json({ error: 'Failed to add to wishlist' })
    }
  })
})

// DELETE /api/wishlist/:productId - Remove item from wishlist
router.delete('/:productId', async (req, res, next) => {
  if (SAMPLE_MODE) {
    try {
      const { productId } = req.params
      const key = getSampleWishlistKey(req.headers.authorization)
      const items = (sampleWishlistStore.get(key) ?? []).map((item) => ({
        ...item
      }))

      const index = items.findIndex(
        (item) => item.productId === productId
      )

      if (index === -1) {
        return res.status(404).json({ error: 'Item not found in wishlist' })
      }

      items.splice(index, 1)
      sampleWishlistStore.set(key, items)

      return res.json({
        success: true,
        message: 'Item removed from wishlist'
      })
    } catch (error) {
      console.error('Sample remove wishlist error:', error)
      return res.status(500).json({ error: 'Failed to remove from wishlist' })
    }
  }

  authMiddleware(req as AuthenticatedRequest, res, async () => {
    try {
      const authReq = req as AuthenticatedRequest
      const { productId } = req.params

      const wishlistItem = await prisma.wishlistItem.findUnique({
        where: {
          userId_productId: {
            userId: authReq.user!.id,
            productId: productId
          }
        }
      })

      if (!wishlistItem) {
        return res.status(404).json({ error: 'Item not found in wishlist' })
      }

      await prisma.wishlistItem.delete({
        where: { id: wishlistItem.id }
      })

      res.json({
        success: true,
        message: 'Item removed from wishlist'
      })
    } catch (error) {
      console.error('Remove from wishlist error:', error)
      res.status(500).json({ error: 'Failed to remove from wishlist' })
    }
  })
})

export default router

