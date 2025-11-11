import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import productsData from '@/data/products.json'
import categoriesData from '@/data/categories.json'
import { extractTokenFromHeader } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const addToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1').max(100, 'Quantity cannot exceed 100')
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

function getSampleCartKey(request: NextRequest): string {
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
export async function GET(request: NextRequest) {
  if (SAMPLE_MODE) {
    const key = getSampleCartKey(request)
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

    return NextResponse.json({
      success: true,
      cart: {
        items: detailedItems,
        subtotal,
        itemCount
      }
    })
  }

  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const cartItems = await prisma.cartItem.findMany({
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

      return NextResponse.json({
        success: true,
        cart: {
          items: cartItems,
          subtotal,
          itemCount
        }
      })

    } catch (error) {
      console.error('Get cart error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch cart' },
        { status: 500 }
      )
    }
  })
}

// POST /api/cart - Add item to cart
export async function POST(request: NextRequest) {
  if (SAMPLE_MODE) {
    try {
      const body = await request.json()
      const { productId, quantity } = addToCartSchema.parse(body)

      const product = normalizeSampleProduct(getSampleProduct(productId))

      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        )
      }

      const key = getSampleCartKey(request)
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

      return NextResponse.json({
        success: true,
        message: existingItem
          ? 'Cart updated successfully'
          : 'Item added to cart successfully',
        item: itemPayload
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validation failed', details: error.errors },
          { status: 400 }
        )
      }

      console.error('Sample add to cart error:', error)
      return NextResponse.json(
        { error: 'Failed to add item to cart' },
        { status: 500 }
      )
    }
  }

  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const body = await request.json()
      const { productId, quantity } = addToCartSchema.parse(body)

      // Get product details
      const product = await prisma.product.findFirst({
        where: { id: productId, isActive: true },
        select: { id: true, price: true, stockQuantity: true, trackQuantity: true }
      })

      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        )
      }

      // Check stock availability
      if (product.trackQuantity && product.stockQuantity < quantity) {
        return NextResponse.json(
          { error: 'Insufficient stock available' },
          { status: 400 }
        )
      }

      // Check if item already exists in cart
      const existingItem = await prisma.cartItem.findUnique({
        where: {
          userId_productId: {
            userId: req.user!.id,
            productId: productId
          }
        }
      })

      if (existingItem) {
        // Update quantity
        const newQuantity = existingItem.quantity + quantity
        
        if (product.trackQuantity && product.stockQuantity < newQuantity) {
          return NextResponse.json(
            { error: 'Insufficient stock available' },
            { status: 400 }
          )
        }

        const updatedItem = await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { 
            quantity: newQuantity,
            price: product.price // Update price in case it changed
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

        return NextResponse.json({
          success: true,
          message: 'Cart updated successfully',
          item: updatedItem
        })
      } else {
        // Add new item
        const newItem = await prisma.cartItem.create({
          data: {
            userId: req.user!.id,
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

        return NextResponse.json({
          success: true,
          message: 'Item added to cart successfully',
          item: newItem
        })
      }

    } catch (error) {
      console.error('Add to cart error:', error)
      
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validation failed', details: error.errors },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: 'Failed to add item to cart' },
        { status: 500 }
      )
    }
  })
}
