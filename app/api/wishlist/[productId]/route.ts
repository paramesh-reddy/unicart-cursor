import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// DELETE /api/wishlist/[productId] - Remove item from wishlist
export async function DELETE(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const { productId } = params

      const wishlistItem = await prisma.wishlistItem.findUnique({
        where: {
          userId_productId: {
            userId: req.user!.id,
            productId: productId
          }
        }
      })

      if (!wishlistItem) {
        return NextResponse.json(
          { error: 'Item not found in wishlist' },
          { status: 404 }
        )
      }

      await prisma.wishlistItem.delete({
        where: { id: wishlistItem.id }
      })

      return NextResponse.json({
        success: true,
        message: 'Item removed from wishlist'
      })

    } catch (error) {
      console.error('Remove from wishlist error:', error)
      return NextResponse.json(
        { error: 'Failed to remove from wishlist' },
        { status: 500 }
      )
    }
  })
}
