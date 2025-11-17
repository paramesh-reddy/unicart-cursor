import { Router } from 'express'
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth'
import { prisma } from '../lib/prisma'
import { z } from 'zod'
import { extractTokenFromHeader } from '../lib/auth'
import * as productsData from '../data/products.json'
import * as categoriesData from '../data/categories.json'

const router = Router()

const addToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1').max(100, 'Quantity cannot exceed 100')
})

const updateCartSchema = z.object({
  quantity: z.number().min(0, 'Quantity cannot be negative').max(100, 'Quantity cannot exceed 100')
})

type SampleCartItem = {
  productId: string
  quantity: number
}

const SAMPLE_MODE =
  process.env.NEXT_PUBLIC_SAMPLE_MODE !== 'false' ||
  !process.env.DATABASE_URL

const rawSampleProducts = Array.isArray(productsData) ? productsData : []
const rawSampleCategories = Array.isArray(categoriesData) ? categoriesData : []

const globalAny = globalThis as unknown as {
  __sampleCartStore__?: Map<string, SampleCartItem[]>
}

const sampleCartStore =
  globalAny.__sampleCartStore__ ?? new Map<string, SampleCartItem[]>()

if (!globalAny.__sampleCartStore__) {
  globalAny.__sampleCartStore__ = sampleCartStore
}

function getSampleCartKey(authHeader: string | undefined): string {
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

function buildSampleCartItems(items: SampleCartItem[]) {
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
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
        product
      }
    })
    .filter(Boolean) as Array<{
    id: string
    productId: string
    quantity: number
    price: number
    product: any
  }>
}

// GET /api/cart - Get user's cart
router.get('/', async (req, res, next) => {
  if (SAMPLE_MODE) {
    const key = getSampleCartKey(req.headers.authorization)
    const items = sampleCartStore.get(key) ?? []
    const detailedItems = buildSampleCartItems(items)
    const subtotal = detailedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )
    const itemCount = detailedItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    )

    return res.json({
      success: true,
      cart: {
        items: detailedItems,
        subtotal,
        itemCount
      }
    })
  }

  authMiddleware(req as AuthenticatedRequest, res, async () => {
    try {
      const authReq = req as AuthenticatedRequest
      const cartItems = await prisma.cartItem.findMany({
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
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      // Calculate totals
      const subtotal = cartItems.reduce((sum: number, item: typeof cartItems[0]) => {
        const price = typeof item.price === 'number' ? item.price : Number(item.price)
        return sum + (price * item.quantity)
      }, 0)
      const itemCount = cartItems.reduce((sum: number, item: typeof cartItems[0]) => sum + item.quantity, 0)

      res.json({
        success: true,
        cart: {
          items: cartItems,
          subtotal,
          itemCount
        }
      })

    } catch (error) {
      console.error('Get cart error:', error)
      res.status(500).json({ error: 'Failed to fetch cart' })
    }
  })
})

// POST /api/cart - Add item to cart
router.post('/', async (req, res, next) => {
  if (SAMPLE_MODE) {
    try {
      const { productId, quantity } = addToCartSchema.parse(req.body)

      let product = normalizeSampleProduct(getSampleProduct(productId))

      // If product not found in sample data and DATABASE_URL exists, try database
      if (!product && process.env.DATABASE_URL) {
        try {
          const dbProduct = await prisma.product.findFirst({
            where: { id: productId, isActive: true },
            select: { id: true, price: true, stockQuantity: true, trackQuantity: true }
          })
          
          if (dbProduct) {
            // Use database route instead
            return authMiddleware(req as AuthenticatedRequest, res, async () => {
              try {
                const authReq = req as AuthenticatedRequest
                const { productId, quantity } = addToCartSchema.parse(req.body)

                // Get product details
                const product = await prisma.product.findFirst({
                  where: { id: productId, isActive: true },
                  select: { id: true, price: true, stockQuantity: true, trackQuantity: true }
                })

                if (!product) {
                  return res.status(404).json({ error: 'Product not found' })
                }

                // Check stock availability
                if (product.trackQuantity && product.stockQuantity < quantity) {
                  return res.status(400).json({ error: 'Insufficient stock available' })
                }

                // Check if item already exists in cart
                const existingItem = await prisma.cartItem.findUnique({
                  where: {
                    userId_productId: {
                      userId: authReq.user!.id,
                      productId: productId
                    }
                  }
                })

                if (existingItem) {
                  // Update quantity
                  const newQuantity = existingItem.quantity + quantity
                  
                  if (product.trackQuantity && product.stockQuantity < newQuantity) {
                    return res.status(400).json({ error: 'Insufficient stock available' })
                  }

                  const updatedItem = await prisma.cartItem.update({
                    where: { id: existingItem.id },
                    data: { 
                      quantity: newQuantity,
                      price: product.price
                    },
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
                          }
                        }
                      }
                    }
                  })

                  return res.json({
                    success: true,
                    message: 'Cart updated successfully',
                    item: updatedItem
                  })
                } else {
                  // Add new item
                  const newItem = await prisma.cartItem.create({
                    data: {
                      userId: authReq.user!.id,
                      productId: productId,
                      quantity: quantity,
                      price: product.price
                    },
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
                          }
                        }
                      }
                    }
                  })

                  return res.json({
                    success: true,
                    message: 'Item added to cart successfully',
                    item: newItem
                  })
                }

              } catch (error) {
                console.error('Add to cart error:', error)
                
                if (error instanceof z.ZodError) {
                  return res.status(400).json({
                    error: 'Validation failed',
                    details: error.errors
                  })
                }

                return res.status(500).json({ error: 'Failed to add item to cart' })
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

      const key = getSampleCartKey(req.headers.authorization)
      const cartItems = (sampleCartStore.get(key) ?? []).map((item) => ({
        ...item
      }))

      const existingItem = cartItems.find(
        (item) => item.productId === product.id
      )

      if (existingItem) {
        existingItem.quantity += quantity
      } else {
        cartItems.push({
          productId: product.id,
          quantity
        })
      }

      sampleCartStore.set(key, cartItems)

      const itemPayload = buildSampleCartItems([
        existingItem ?? { productId: product.id, quantity }
      ])[0]

      return res.json({
        success: true,
        message: existingItem
          ? 'Cart updated successfully'
          : 'Item added to cart successfully',
        item: itemPayload
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors
        })
      }

      console.error('Sample add to cart error:', error)
      return res.status(500).json({ error: 'Failed to add item to cart' })
    }
  }

  authMiddleware(req as AuthenticatedRequest, res, async () => {
    try {
      const authReq = req as AuthenticatedRequest
      const { productId, quantity } = addToCartSchema.parse(req.body)

      // Get product details
      const product = await prisma.product.findFirst({
        where: { id: productId, isActive: true },
        select: { id: true, price: true, stockQuantity: true, trackQuantity: true }
      })

      if (!product) {
        return res.status(404).json({ error: 'Product not found' })
      }

      // Check stock availability
      if (product.trackQuantity && product.stockQuantity < quantity) {
        return res.status(400).json({ error: 'Insufficient stock available' })
      }

      // Check if item already exists in cart
      const existingItem = await prisma.cartItem.findUnique({
        where: {
          userId_productId: {
            userId: authReq.user!.id,
            productId: productId
          }
        }
      })

      if (existingItem) {
        // Update quantity
        const newQuantity = existingItem.quantity + quantity
        
        if (product.trackQuantity && product.stockQuantity < newQuantity) {
          return res.status(400).json({ error: 'Insufficient stock available' })
        }

        const updatedItem = await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { 
            quantity: newQuantity,
            price: product.price
          },
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
                }
              }
            }
          }
        })

        return res.json({
          success: true,
          message: 'Cart updated successfully',
          item: updatedItem
        })
      } else {
        // Add new item
        const newItem = await prisma.cartItem.create({
          data: {
            userId: authReq.user!.id,
            productId: productId,
            quantity: quantity,
            price: product.price
          },
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
                }
              }
            }
          }
        })

        return res.json({
          success: true,
          message: 'Item added to cart successfully',
          item: newItem
        })
      }

    } catch (error) {
      console.error('Add to cart error:', error)
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors
        })
      }

      return res.status(500).json({ error: 'Failed to add item to cart' })
    }
  })
})

// PUT /api/cart/:productId - Update cart item quantity
router.put('/:productId', async (req, res, next) => {
  if (SAMPLE_MODE) {
    try {
      const { productId } = req.params
      const { quantity } = updateCartSchema.parse(req.body)

      const key = getSampleCartKey(req.headers.authorization)
      const cartItems = (sampleCartStore.get(key) ?? []).map((item) => ({
        ...item
      }))

      const index = cartItems.findIndex(
        (item) => item.productId === productId
      )

      if (index === -1) {
        return res.status(404).json({ error: 'Item not found in cart' })
      }

      if (quantity === 0) {
        cartItems.splice(index, 1)
        sampleCartStore.set(key, cartItems)

        return res.json({
          success: true,
          message: 'Item removed from cart'
        })
      }

      cartItems[index].quantity = quantity
      sampleCartStore.set(key, cartItems)

      const updatedItem = buildSampleCartItems([cartItems[index]])[0]

      return res.json({
        success: true,
        message: 'Cart updated successfully',
        item: updatedItem
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors
        })
      }

      console.error('Sample update cart error:', error)
      return res.status(500).json({ error: 'Failed to update cart' })
    }
  }

  authMiddleware(req as AuthenticatedRequest, res, async () => {
    try {
      const authReq = req as AuthenticatedRequest
      const { productId } = req.params
      const { quantity } = updateCartSchema.parse(req.body)

      // Find cart item
      const cartItem = await prisma.cartItem.findUnique({
        where: {
          userId_productId: {
            userId: authReq.user!.id,
            productId: productId
          }
        },
        include: {
          product: {
            select: { stockQuantity: true, trackQuantity: true }
          }
        }
      })

      if (!cartItem) {
        return res.status(404).json({ error: 'Item not found in cart' })
      }

      // Check stock if updating quantity
      if (quantity > 0 && cartItem.product.trackQuantity && cartItem.product.stockQuantity < quantity) {
        return res.status(400).json({ error: 'Insufficient stock available' })
      }

      if (quantity === 0) {
        // Remove item from cart
        await prisma.cartItem.delete({
          where: { id: cartItem.id }
        })

        return res.json({
          success: true,
          message: 'Item removed from cart'
        })
      } else {
        // Update quantity
        const updatedItem = await prisma.cartItem.update({
          where: { id: cartItem.id },
          data: { quantity },
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
                }
              }
            }
          }
        })

        return res.json({
          success: true,
          message: 'Cart updated successfully',
          item: updatedItem
        })
      }

    } catch (error) {
      console.error('Update cart error:', error)
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors
        })
      }

      return res.status(500).json({ error: 'Failed to update cart' })
    }
  })
})

// DELETE /api/cart/:productId - Remove item from cart
router.delete('/:productId', async (req, res, next) => {
  if (SAMPLE_MODE) {
    try {
      const { productId } = req.params
      const key = getSampleCartKey(req.headers.authorization)
      const cartItems = (sampleCartStore.get(key) ?? []).map((item) => ({
        ...item
      }))

      const index = cartItems.findIndex(
        (item) => item.productId === productId
      )

      if (index === -1) {
        return res.status(404).json({ error: 'Item not found in cart' })
      }

      cartItems.splice(index, 1)
      sampleCartStore.set(key, cartItems)

      return res.json({
        success: true,
        message: 'Item removed from cart'
      })
    } catch (error) {
      console.error('Sample remove from cart error:', error)
      return res.status(500).json({ error: 'Failed to remove item from cart' })
    }
  }

  authMiddleware(req as AuthenticatedRequest, res, async () => {
    try {
      const authReq = req as AuthenticatedRequest
      const { productId } = req.params

      const cartItem = await prisma.cartItem.findUnique({
        where: {
          userId_productId: {
            userId: authReq.user!.id,
            productId: productId
          }
        }
      })

      if (!cartItem) {
        return res.status(404).json({ error: 'Item not found in cart' })
      }

      await prisma.cartItem.delete({
        where: { id: cartItem.id }
      })

      res.json({
        success: true,
        message: 'Item removed from cart'
      })

    } catch (error) {
      console.error('Remove from cart error:', error)
      res.status(500).json({ error: 'Failed to remove item from cart' })
    }
  })
})

export default router

