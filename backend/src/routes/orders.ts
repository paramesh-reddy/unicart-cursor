import { Router } from 'express'
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth'
import { prisma } from '../lib/prisma'

const router = Router()

// GET /api/orders - Get user's orders
router.get('/', authMiddleware as any, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest
    
    if (!authReq.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const orders = await prisma.order.findMany({
      where: { userId: authReq.user.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                images: {
                  orderBy: { sortOrder: 'asc' },
                  take: 1
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Format orders for frontend
    const formattedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status.toLowerCase(),
      paymentStatus: order.paymentStatus.toLowerCase(),
      paymentMethod: order.paymentMethod,
      subtotal: Number(order.subtotal),
      taxAmount: Number(order.taxAmount),
      shippingAmount: Number(order.shippingAmount),
      discountAmount: Number(order.discountAmount),
      totalAmount: Number(order.totalAmount),
      shippingAddress: typeof order.shippingAddress === 'string' 
        ? JSON.parse(order.shippingAddress) 
        : order.shippingAddress,
      billingAddress: order.billingAddress 
        ? (typeof order.billingAddress === 'string' 
            ? JSON.parse(order.billingAddress) 
            : order.billingAddress)
        : undefined,
      trackingNumber: order.trackingNumber,
      shippedAt: order.shippedAt?.toISOString(),
      deliveredAt: order.deliveredAt?.toISOString(),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      items: order.items.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        productSku: item.product.id,
        quantity: item.quantity,
        unitPrice: Number(item.price),
        totalPrice: Number(item.total),
        image: item.product.images[0]?.url || undefined
      }))
    }))

    res.json({
      success: true,
      orders: formattedOrders
    })
  } catch (error) {
    console.error('Get orders error:', error)
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

// GET /api/orders/:orderId - Get single order details
router.get('/:orderId', authMiddleware as any, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest
    const { orderId } = req.params

    if (!authReq.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: authReq.user.id
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                images: {
                  orderBy: { sortOrder: 'asc' },
                  take: 1
                }
              }
            }
          }
        }
      }
    })

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    // Format order for frontend
    const formattedOrder = {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status.toLowerCase(),
      paymentStatus: order.paymentStatus.toLowerCase(),
      paymentMethod: order.paymentMethod,
      subtotal: Number(order.subtotal),
      taxAmount: Number(order.taxAmount),
      shippingAmount: Number(order.shippingAmount),
      discountAmount: Number(order.discountAmount),
      totalAmount: Number(order.totalAmount),
      shippingAddress: typeof order.shippingAddress === 'string' 
        ? JSON.parse(order.shippingAddress) 
        : order.shippingAddress,
      billingAddress: order.billingAddress 
        ? (typeof order.billingAddress === 'string' 
            ? JSON.parse(order.billingAddress) 
            : order.billingAddress)
        : undefined,
      trackingNumber: order.trackingNumber,
      shippedAt: order.shippedAt?.toISOString(),
      deliveredAt: order.deliveredAt?.toISOString(),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      items: order.items.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        productSku: item.product.id,
        quantity: item.quantity,
        unitPrice: Number(item.price),
        totalPrice: Number(item.total),
        image: item.product.images[0]?.url || undefined
      }))
    }

    res.json({
      success: true,
      order: formattedOrder
    })
  } catch (error) {
    console.error('Get order error:', error)
    res.status(500).json({ error: 'Failed to fetch order' })
  }
})

export default router

