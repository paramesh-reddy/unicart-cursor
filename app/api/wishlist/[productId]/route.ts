import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { extractTokenFromHeader } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const SAMPLE_MODE =
  process.env.NEXT_PUBLIC_SAMPLE_MODE !== 'false' ||
  !process.env.DATABASE_URL

type SampleWishlistItem = {
  productId: string
  addedAt: string
}

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

// DELETE /api/wishlist/[productId] - Remove item from wishlist
export async function DELETE(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  if (SAMPLE_MODE) {
    try {
      const { productId } = params
      const key = getSampleWishlistKey(request)
      const items = (sampleWishlistStore.get(key) ?? []).map((item) => ({
        ...item
      }))

      const index = items.findIndex(
        (item) => item.productId === productId
      )

      if (index === -1) {
        return NextResponse.json(
          { error: 'Item not found in wishlist' },
          { status: 404 }
        )
      }

      items.splice(index, 1)
      sampleWishlistStore.set(key, items)

      return NextResponse.json({
        success: true,
        message: 'Item removed from wishlist'
      })
    } catch (error) {
      console.error('Sample remove wishlist error:', error)
      return NextResponse.json(
        { error: 'Failed to remove from wishlist' },
        { status: 500 }
      )
    }
  }

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
