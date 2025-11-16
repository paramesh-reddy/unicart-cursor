import { Request, Response, NextFunction } from 'express'
import { verifyToken, extractTokenFromHeader } from '../lib/auth'
import { prisma } from '../lib/prisma'

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
    role: string
  }
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractTokenFromHeader(req.headers.authorization)
    
    if (!token) {
      res.status(401).json({ error: 'Authentication required' })
      return
    }

    const payload = verifyToken(token)
    if (!payload) {
      res.status(401).json({ error: 'Invalid token' })
      return
    }

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, isActive: true }
    })

    if (!user || !user.isActive) {
      res.status(401).json({ error: 'User not found or inactive' })
      return
    }

    // Add user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    }

    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    res.status(401).json({ error: 'Authentication failed' })
  }
}

export async function adminMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  await authMiddleware(req, res, () => {
    if (req.user?.role !== 'ADMIN') {
      res.status(403).json({ error: 'Admin access required' })
      return
    }
    next()
  })
}

