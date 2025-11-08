import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/categories - Get all categories
export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { products: true }
        },
        children: {
          where: { isActive: true },
          include: {
            _count: {
              select: { products: true }
            }
          },
          orderBy: { sortOrder: 'asc' }
        }
      },
      orderBy: { sortOrder: 'asc' }
    })

    // Format categories with product counts
    const formattedCategories = categories.map((category: typeof categories[0]) => ({
      ...category,
      productCount: category._count.products,
      children: category.children.map((child: typeof category.children[0]) => ({
        ...child,
        productCount: child._count.products,
        _count: undefined
      })),
      _count: undefined
    }))

    return NextResponse.json({
      success: true,
      categories: formattedCategories
    })

  } catch (error) {
    console.error('Get categories error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}
