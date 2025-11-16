import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from '../src/routes/auth'
import productRoutes from '../src/routes/products'
import categoryRoutes from '../src/routes/categories'
import cartRoutes from '../src/routes/cart'
import wishlistRoutes from '../src/routes/wishlist'

dotenv.config()

const app = express()
// CORS configuration - permissive to avoid preflight failures in serverless
const corsOptions: cors.CorsOptions = {
  origin: true, // reflect request Origin
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
}

app.use(cors(corsOptions))
app.options('*', cors(corsOptions))
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'UniCart Backend API is running' })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/wishlist', wishlistRoutes)

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err)
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Export for Vercel serverless
export default app

