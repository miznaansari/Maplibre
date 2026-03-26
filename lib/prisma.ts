  // prisma.ts
  import 'dotenv/config'
  import { PrismaMariaDb } from '@prisma/adapter-mariadb'
  import { PrismaClient } from '../generated/prisma/client'

  // Create the adapter for MySQL/MariaDB
  const adapter = new PrismaMariaDb({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,  
    database: process.env.DATABASE_NAME,
    connectionLimit: 30, // adjust to your MySQL limit
  })

  // Singleton pattern so the pool is reused
  const globalForPrisma = globalThis as unknown as {
    prisma?: PrismaClient
  }

  if (!globalForPrisma.prisma) {
    console.log('🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢[Prisma] imported new instance')
    console.log('[Prisma] Creating NEW PrismaClient (new pool)')
  } else {
    console.log("||||||||||||||||||||||||==================exisitng")
    console.log('[Prisma] Reusing EXISTING PrismaClient from global (same pool)')
  }

  export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
      adapter,
      // let Prisma log pool startup, queries, etc.
      // log: ['info', 'warn', 'error'],
    })

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
    console.log('[Prisma] PrismaClient attached to globalForPrisma in dev')
  }

  // Optional: log when you explicitly connect (e.g. in app bootstrap)
  export async function connectPrisma() {
    console.log('[Prisma] Calling $connect()')
    await prisma.$connect()
    console.log('[Prisma] $connect() resolved')
  }