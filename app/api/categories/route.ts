import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import categoriesData from '@/data/categories.json'
import productsData from '@/data/products.json'

export const dynamic = 'force-dynamic'

// GET /api/categories - Get all categories
export async function GET(request: NextRequest) {
  const fallbackCategories = () => {
    const rawCategories = Array.isArray(categoriesData) ? categoriesData : []
    const rawProducts = Array.isArray(productsData) ? productsData : []

    const getProductCount = (categoryId: string | undefined) =>
      rawProducts.filter(
        (product: any) =>
          product?.categoryId &&
          product.categoryId.toString() === categoryId?.toString()
      ).length

    return rawCategories
      .filter((category: any) => category?.isActive !== false)
      .sort(
        (a: any, b: any) =>
          (a.displayOrder ?? 9999) - (b.displayOrder ?? 9999)
      )
      .map((category: any) => ({
        ...category,
        productCount: getProductCount(category.id),
        children: Array.isArray(category.children)
          ? category.children
              .filter((child: any) => child?.isActive !== false)
              .sort(
                (a: any, b: any) =>
                  (a.displayOrder ?? 9999) - (b.displayOrder ?? 9999)
              )
              .map((child: any) => ({
                ...child,
                productCount: getProductCount(child.id),
                _count: undefined
              }))
          : [],
        _count: undefined
      }))
  }

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

    if (!Array.isArray(categories) || categories.length === 0) {
      return NextResponse.json({
        success: true,
        categories: fallbackCategories()
      })
    }

    const formattedCategories = categories.map(
      (category: typeof categories[0]) => ({
        ...category,
        productCount: category._count.products,
        children: category.children.map(
          (child: typeof category.children[0]) => ({
            ...child,
            productCount: child._count.products,
            _count: undefined
          })
        ),
        _count: undefined
      })
    )

    return NextResponse.json({
      success: true,
      categories: formattedCategories
    })
  } catch (error) {
    console.error('Get categories error:', error)
    return NextResponse.json({
      success: true,
      categories: fallbackCategories()
    })
  }
}
