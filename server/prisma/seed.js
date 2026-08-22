import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const ADMIN_EMAIL = 'admin@crm.local'
const ADMIN_PASSWORD = 'Admin@12345'

async function main() {
  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10)

  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: {
      name: 'Admin',
      email: ADMIN_EMAIL,
      password: hashed,
      role: 'ADMIN',
    },
  })

  console.log(`Seeded admin user: ${admin.email} (id: ${admin.id})`)
  console.log(`Login with email "${ADMIN_EMAIL}" and password "${ADMIN_PASSWORD}" — change this in a real deployment.`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
