import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  accelerate: true,            // ✅ REQUIRED for withAccelerate()
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
})
