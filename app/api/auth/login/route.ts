import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, verifyPassword, generateToken } from '@/lib/auth'
import { z } from 'zod'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function applyCors(response: NextResponse, request: NextRequest) {
  const origin = request.headers.get('origin') || '*'
  response.headers.set('Access-Control-Allow-Origin', origin)
  response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH')
  response.headers.set('Access-Control-Allow-Headers', request.headers.get('access-control-request-headers') || 'Content-Type, Authorization, X-Requested-With')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  response.headers.set('Access-Control-Max-Age', '86400')
  if (origin && origin !== '*') {
    response.headers.set('Vary', 'Origin')
  }
  return response
}

export async function OPTIONS(request: NextRequest) {
  return applyCors(new NextResponse(null, { status: 204 }), request)
}

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().optional(),
  lastName: z.string().optional()
})

// POST /api/auth/login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = loginSchema.parse(body)

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        emailVerified: true
      }
    })

    if (!user) {
      return applyCors(NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      ), request)
    }

    if (!user.isActive) {
      return applyCors(NextResponse.json(
        { error: 'Account is deactivated' },
        { status: 401 }
      ), request)
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return applyCors(NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      ), request)
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    })

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user

    return applyCors(NextResponse.json({
      success: true,
      user: userWithoutPassword,
      token
    }), request)

  } catch (error) {
    console.error('Login error:', error)
    
    if (error instanceof z.ZodError) {
      return applyCors(NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      ), request)
    }

    return applyCors(NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    ), request)
  }
}
