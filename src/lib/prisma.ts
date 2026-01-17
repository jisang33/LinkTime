import { PrismaClient } from '@/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'
import fs from 'fs'

const prismaClientSingleton = () => {
  const primaryPath = path.join(process.cwd(), 'dev.db')
  const fallbackPath = path.join(process.cwd(), 'timesync', 'dev.db')
  const dbPath = fs.existsSync(primaryPath) ? primaryPath : fallbackPath
  const adapter = new PrismaBetterSqlite3({ url: dbPath })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new PrismaClient({ adapter } as any)
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>
} & typeof global

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
