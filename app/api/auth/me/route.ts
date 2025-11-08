import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/auth/me - Get current user profile
export async function GET(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          emailVerified: true,
          isActive: true,
          createdAt: true,
          lastLogin: true,
          addresses: {
            select: {
              id: true,
              type: true,
              firstName: true,
              lastName: true,
              address1: true,
              address2: true,
              city: true,
              state: true,
              zipCode: true,
              country: true,
              phone: true,
              isDefault: true
            }
          }
        }
      })

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        user
      })

    } catch (error) {
      console.error('Get profile error:', error)
      return NextResponse.json(
        { error: 'Failed to get profile' },
        { status: 500 }
      )
    }
  })
}

// PUT /api/auth/me - Update user profile
export async function PUT(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const body = await request.json()
      const { firstName, lastName, phone } = body

      const updatedUser = await prisma.user.update({
        where: { id: req.user!.id },
        data: {
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          phone: phone || undefined
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          emailVerified: true,
          isActive: true,
          createdAt: true,
          lastLogin: true
        }
      })

      return NextResponse.json({
        success: true,
        user: updatedUser
      })

    } catch (error) {
      console.error('Update profile error:', error)
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }
  })
}
