import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import { Pool } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'

// Ensure environment variables are loaded before reading DATABASE_URL
dotenv.config()

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function getDatabaseUrl(): string {
  const candidates = [
    process.env.DATABASE_URL,
    process.env.POSTGRES_URL,
    process.env.NEON_DATABASE_URL,
  ].filter(Boolean) as string[]

  const connectionString = candidates[0]
  if (!connectionString) {
    throw new Error(
      'DATABASE_URL is not set. Please configure a valid PostgreSQL connection string.'
    )
  }

  try {
    // Validate URL early to provide a clearer error than the driver default
    const parsed = new URL(connectionString)
    if (!parsed.hostname) {
      throw new Error('Missing host in DATABASE_URL')
    }
  } catch (err) {
    throw new Error(
      'Invalid DATABASE_URL. Ensure it is a valid PostgreSQL URL, e.g. postgresql://user:pass@host:5432/db?sslmode=require'
    )
  }

  return connectionString
}

function isNeonUrl(connectionString: string): boolean {
  try {
    const host = new URL(connectionString).hostname
    return host.endsWith('.neon.tech')
  } catch {
    return false
  }
}

const prismaClient =
  globalForPrisma.prisma ??
  (() => {
    const connectionString = getDatabaseUrl()
    const isNeon = isNeonUrl(connectionString)

    if (isNeon) {
      // Use Prisma's Neon adapter factory with PoolConfig
      const adapter = new PrismaNeon({ connectionString })
      return new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'production' ? ['error'] : ['warn', 'error'],
      })
    }

    // Non-Neon providers: use default Prisma datasource URL
    return new PrismaClient({
      datasourceUrl: connectionString,
      log: process.env.NODE_ENV === 'production' ? ['error'] : ['warn', 'error'],
    })
  })()

export const prisma = prismaClient
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prismaClient
}
