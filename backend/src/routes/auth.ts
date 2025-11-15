import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { hashPassword, verifyPassword, generateToken } from '../lib/auth.js'
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js'
import { z } from 'zod'

const router = Router()

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
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body)

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
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' })
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' })
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

    res.json({
      success: true,
      user: userWithoutPassword,
      token
    })

  } catch (error) {
    console.error('Login error:', error)
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      })
    }

    res.status(500).json({ error: 'Login failed' })
  }
})

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = registerSchema.parse(req.body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return res.status(400).json({
        error: 'An account with this email already exists'
      })
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

    res.json({
      success: true,
      user,
      token
    })

  } catch (error) {
    console.error('Registration error:', error)
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      })
    }

    // Handle Prisma errors
    const prismaError = error as any
    if (prismaError?.code === 'P2002') {
      return res.status(400).json({
        error: 'An account with this email already exists'
      })
    }

    // Return detailed error for debugging (but don't expose sensitive info)
    const isDevelopment = process.env.NODE_ENV !== 'production'
    const prismaError = error as any
    
    res.status(500).json({ 
      error: 'Registration failed',
      ...(isDevelopment && {
        details: prismaError?.message || String(error),
        code: prismaError?.code,
        hasDatabase: !!process.env.DATABASE_URL,
        hasJwtSecret: !!process.env.JWT_SECRET
      })
    })
  }
})

// GET /api/auth/me - Get current user profile
router.get('/me', authMiddleware, async (req: AuthenticatedRequest, res) => {
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
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      success: true,
      user
    })

  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ error: 'Failed to get profile' })
  }
})

// PUT /api/auth/me - Update user profile
router.put('/me', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { firstName, lastName, phone } = req.body

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

    res.json({
      success: true,
      user: updatedUser
    })

  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

export default router

