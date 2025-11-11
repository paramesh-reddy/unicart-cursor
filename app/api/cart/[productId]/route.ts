import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import productsData from '@/data/products.json'
import categoriesData from '@/data/categories.json'
import { extractTokenFromHeader } from '@/lib/auth'

export const dynamic = 'force-dynamic'

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

function buildSampleCartItem(item: SampleCartItem | undefined) {
  if (!item) return undefined
  const product = normalizeSampleProduct(getSampleProduct(item.productId))
  if (!product) return undefined

  return {
    id: `sample-${product.id}`,
    productId: product.id,
    quantity: item.quantity,
    price: product.price,
    product
  }
}

// PUT /api/cart/[productId] - Update cart item quantity
export async function PUT(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  if (SAMPLE_MODE) {
    try {
      const { productId } = params
      const body = await request.json()
      const { quantity } = updateCartSchema.parse(body)

      const key = getSampleCartKey(request)
      const cartItems = (sampleCartStore.get(key) ?? []).map((item) => ({
        ...item
      }))

      const index = cartItems.findIndex(
        (item) => item.productId === productId
      )

      if (index === -1) {
        return NextResponse.json(
          { error: 'Item not found in cart' },
          { status: 404 }
        )
      }

      if (quantity === 0) {
        cartItems.splice(index, 1)
        sampleCartStore.set(key, cartItems)

        return NextResponse.json({
          success: true,
          message: 'Item removed from cart'
        })
      }

      cartItems[index].quantity = quantity
      sampleCartStore.set(key, cartItems)

      const updatedItem = buildSampleCartItem(cartItems[index])

      return NextResponse.json({
        success: true,
        message: 'Cart updated successfully',
        item: updatedItem
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validation failed', details: error.errors },
          { status: 400 }
        )
      }

      console.error('Sample update cart error:', error)
      return NextResponse.json(
        { error: 'Failed to update cart' },
        { status: 500 }
      )
    }
  }

  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const { productId } = params
      const body = await request.json()
      const { quantity } = updateCartSchema.parse(body)

      // Find cart item
      const cartItem = await prisma.cartItem.findUnique({
        where: {
          userId_productId: {
            userId: req.user!.id,
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
        return NextResponse.json(
          { error: 'Item not found in cart' },
          { status: 404 }
        )
      }

      // Check stock if updating quantity
      if (quantity > 0 && cartItem.product.trackQuantity && cartItem.product.stockQuantity < quantity) {
        return NextResponse.json(
          { error: 'Insufficient stock available' },
          { status: 400 }
        )
      }

      if (quantity === 0) {
        // Remove item from cart
        await prisma.cartItem.delete({
          where: { id: cartItem.id }
        })

        return NextResponse.json({
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

        return NextResponse.json({
          success: true,
          message: 'Cart updated successfully',
          item: updatedItem
        })
      }

    } catch (error) {
      console.error('Update cart error:', error)
      
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validation failed', details: error.errors },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: 'Failed to update cart' },
        { status: 500 }
      )
    }
  })
}

// DELETE /api/cart/[productId] - Remove item from cart
export async function DELETE(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  if (SAMPLE_MODE) {
    try {
      const { productId } = params
      const key = getSampleCartKey(request)
      const cartItems = (sampleCartStore.get(key) ?? []).map((item) => ({
        ...item
      }))

      const index = cartItems.findIndex(
        (item) => item.productId === productId
      )

      if (index === -1) {
        return NextResponse.json(
          { error: 'Item not found in cart' },
          { status: 404 }
        )
      }

      cartItems.splice(index, 1)
      sampleCartStore.set(key, cartItems)

      return NextResponse.json({
        success: true,
        message: 'Item removed from cart'
      })
    } catch (error) {
      console.error('Sample remove from cart error:', error)
      return NextResponse.json(
        { error: 'Failed to remove item from cart' },
        { status: 500 }
      )
    }
  }

  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const { productId } = params

      const cartItem = await prisma.cartItem.findUnique({
        where: {
          userId_productId: {
            userId: req.user!.id,
            productId: productId
          }
        }
      })

      if (!cartItem) {
        return NextResponse.json(
          { error: 'Item not found in cart' },
          { status: 404 }
        )
      }

      await prisma.cartItem.delete({
        where: { id: cartItem.id }
      })

      return NextResponse.json({
        success: true,
        message: 'Item removed from cart'
      })

    } catch (error) {
      console.error('Remove from cart error:', error)
      return NextResponse.json(
        { error: 'Failed to remove item from cart' },
        { status: 500 }
      )
    }
  })
}
