import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const addToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1').max(100, 'Quantity cannot exceed 100')
})

// GET /api/cart - Get user's cart
export async function GET(request: NextRequest) {
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
