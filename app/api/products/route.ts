import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import productsData from '@/data/products.json'
import categoriesData from '@/data/categories.json'

export const dynamic = 'force-dynamic'

const productQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('12'),
  category: z.string().optional(),
  search: z.string().optional(),
  sort: z.string().optional().default('newest'),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  brand: z.string().optional(),
  rating: z.string().optional(),
  featured: z.string().optional()
})

// GET /api/products - Get products with filtering and pagination
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const params = Object.fromEntries(searchParams.entries())

  const {
    page,
    limit,
    category,
    search,
    sort,
    minPrice,
    maxPrice,
    brand,
    rating,
    featured
  } = productQuerySchema.parse(params)

  const pageNum = parseInt(page)
  const limitNumRaw = parseInt(limit)
  const limitNum =
    !Number.isFinite(limitNumRaw) || limitNumRaw <= 0
      ? 12
      : limitNumRaw > 10000
      ? 10000
      : limitNumRaw
  const skip = (pageNum - 1) * limitNum

  const sendFallbackResponse = () => {
    const rawProducts = Array.isArray(productsData) ? productsData : []
    const rawCategories = Array.isArray(categoriesData) ? categoriesData : []

    const normalizeCategory = (categoryId: string) => {
      const matchedCategory =
        rawCategories.find((cat: any) => cat.id === categoryId) ?? null
      return matchedCategory
        ? {
            id: matchedCategory.id,
            name: matchedCategory.name,
            slug: matchedCategory.slug
          }
        : undefined
    }

    const matchesFilters = (product: any) => {
      if (product?.isActive === false) return false

      if (featured === 'true' && !product?.isFeatured) return false

      if (category) {
        const categoryLower = category.toLowerCase()
        const productCategory =
          normalizeCategory(product.categoryId) ??
          rawCategories.find((cat: any) => cat.slug === product.categoryId)
        const productCategoryId = product.categoryId?.toLowerCase?.()
        const productCategorySlug = productCategory?.slug?.toLowerCase?.()
        if (
          productCategoryId !== categoryLower &&
          productCategorySlug !== categoryLower
        ) {
          return false
        }
      }

      if (search) {
        const searchLower = search.toLowerCase()
        const textContent = [
          product?.name,
          product?.description,
          product?.brand
        ]
          .filter(Boolean)
          .map((value: string) => value.toLowerCase())
        if (!textContent.some((value) => value.includes(searchLower))) {
          return false
        }
      }

      if (minPrice && Number.isFinite(parseFloat(minPrice))) {
        if (product?.price < parseFloat(minPrice)) return false
      }

      if (maxPrice && Number.isFinite(parseFloat(maxPrice))) {
        if (product?.price > parseFloat(maxPrice)) return false
      }

      if (brand) {
        if (
          !product?.brand ||
          !product.brand.toLowerCase().includes(brand.toLowerCase())
        ) {
          return false
        }
      }

      if (rating && product?.rating?.average != null) {
        if (product.rating.average < parseFloat(rating)) {
          return false
        }
      } else if (rating && (product?.rating == null || product.rating.average == null)) {
        // If rating filter is requested but product has no rating info, exclude it
        return false
      }

      return true
    }

    const sortProducts = (items: any[]) => {
      const cloned = [...items]
      switch (sort) {
        case 'price-low':
          cloned.sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
          break
        case 'price-high':
          cloned.sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
          break
        case 'name':
          cloned.sort((a, b) =>
            (a.name ?? '').localeCompare(b.name ?? '', undefined, {
              sensitivity: 'base'
            })
          )
          break
        case 'rating':
          cloned.sort(
            (a, b) =>
              (b.rating?.average ?? 0) - (a.rating?.average ?? 0)
          )
          break
        case 'newest':
        default:
          cloned.sort(
            (a, b) =>
              new Date(b.createdAt ?? '').getTime() -
              new Date(a.createdAt ?? '').getTime()
          )
          break
      }
      return cloned
    }

    const filteredProducts = sortProducts(
      rawProducts.filter((product: any) => matchesFilters(product))
    )

    const totalFallback = filteredProducts.length
    const effectiveLimit =
      limitNum <= 0 ? (totalFallback === 0 ? 1 : totalFallback) : limitNum
    const paginated = filteredProducts.slice(skip, skip + effectiveLimit)

    const productsWithCategory = paginated.map((product: any) => ({
      ...product,
      images: Array.isArray(product.images) ? product.images : [],
      variants: Array.isArray(product.variants) ? product.variants : [],
      rating: product.rating ?? { average: 0, count: 0 },
      category: normalizeCategory(product.categoryId),
      reviews: undefined,
      _count: undefined
    }))

    return NextResponse.json({
      success: true,
      products: productsWithCategory,
      pagination: {
        page: pageNum,
        limit: effectiveLimit,
        total: totalFallback,
        pages:
          effectiveLimit > 0
            ? Math.ceil(totalFallback / effectiveLimit)
            : 0
      }
    })
  }

  try {
    const where: any = {
      isActive: true
    }

    if (featured === 'true') {
      where.isFeatured = true
    }

    if (category) {
      where.categoryId = category
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }

    if (brand) {
      where.brand = { contains: brand, mode: 'insensitive' }
    }

    if (rating) {
      where.rating = { average: { gte: parseFloat(rating) } }
    }

    let orderBy: any = { createdAt: 'desc' }
    switch (sort) {
      case 'price-low':
        orderBy = { price: 'asc' }
        break
      case 'price-high':
        orderBy = { price: 'desc' }
        break
      case 'name':
        orderBy = { name: 'asc' }
        break
      case 'rating':
        orderBy = { rating: { average: 'desc' } }
        break
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' }
        break
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: {
          images: {
            orderBy: { sortOrder: 'asc' }
          },
          category: {
            select: { id: true, name: true, slug: true }
          },
          reviews: {
            select: { rating: true }
          },
          _count: {
            select: { reviews: true }
          }
        }
      }),
      prisma.product.count({ where })
    ])

    if (!Array.isArray(products) || products.length === 0) {
      return sendFallbackResponse()
    }

    const productsWithRatings = products.map((product: typeof products[0]) => {
      const reviews = product.reviews
      const averageRating =
        reviews.length > 0
          ? reviews.reduce(
              (sum: number, review: typeof reviews[0]) => sum + review.rating,
              0
            ) / reviews.length
          : 0

      return {
        ...product,
        rating: {
          average: Math.round(averageRating * 10) / 10,
          count: product._count.reviews
        },
        reviews: undefined,
        _count: undefined
      }
    })

  } catch (error) {
    console.error('Get products error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      )
    }

    // Attempt to return fallback data before failing
    return sendFallbackResponse()
  }
}
