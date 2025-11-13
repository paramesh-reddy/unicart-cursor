import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken } from '@/lib/auth'
import { z } from 'zod'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function applyCors(response: NextResponse, request: NextRequest) {
  const origin = request.headers.get('origin') || '*'
  const requestedHeaders = request.headers.get('access-control-request-headers') || '*'
  response.headers.set('Access-Control-Allow-Origin', origin)
  response.headers.set('Vary', 'Origin')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH')
  response.headers.set('Access-Control-Allow-Headers', requestedHeaders)
  response.headers.set('Access-Control-Max-Age', '86400')
  return response
}

export async function OPTIONS(request: NextRequest) {
  return applyCors(new NextResponse(null, { status: 204 }), request)
}

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().optional(),
  lastName: z.string().optional()
})

// POST /api/auth/register
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, firstName, lastName } = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return applyCors(NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      ), request)
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName: firstName || '',
        lastName: lastName || '',
        role: 'CUSTOMER',
        emailVerified: false,
        isActive: true
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        emailVerified: true,
        createdAt: true
      }
    })

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    return applyCors(NextResponse.json({
      success: true,
      user,
      token
    }), request)

  } catch (error) {
    console.error('Registration error:', error)
    
    if (error instanceof z.ZodError) {
      return applyCors(NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      ), request)
    }

    // Handle known Prisma errors (e.g., unique constraint)
    // @ts-ignore - avoid importing prisma error types to keep bundle small
    if (error?.code === 'P2002') {
      return applyCors(NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      ), request)
    }

    return applyCors(NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    ), request)
  }
}
