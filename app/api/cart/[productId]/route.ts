import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const updateCartSchema = z.object({
  quantity: z.number().min(0, 'Quantity cannot be negative').max(100, 'Quantity cannot exceed 100')
})

// PUT /api/cart/[productId] - Update cart item quantity
export async function PUT(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
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
