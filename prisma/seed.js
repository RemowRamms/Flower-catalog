const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')

const pool = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter: pool })

// ----------------------------
// SAMPLE DATA
// ----------------------------
const userData = [
  {
    name: 'Alice',
    email: 'alice@example.com',
    password: 'securepassword',
    role: 'customer',
    orders: {
      create: [
        {
          totalAmount: 300.00,
          status: 'pending',
          items: {
            create: [
              {
                quantity: 2,
                price: 150.00,
                product: {
                  create: {
                    name: 'Red Roses Bouquet',
                    description: '12 Fresh red roses',
                    price: 150.00,
                    stock: 50,
                    imageUrl: 'https://example.com/red-roses.jpg',
                    category: {
                      create: { name: 'Bouquets' }
                    }
                  }
                }
              }
            ]
          },
          payment: {
            create: {
              amount: 300.00,
              method: 'card',
              status: 'paid'
            }
          }
        }
      ]
    }
  },
  {
    name: 'Nilu',
    email: 'nilu@example.com',
    password: 'securepassword',
    role: 'customer',
    orders: {
      create: [
        {
          totalAmount: 120.00,
          status: 'completed',
          items: {
            create: [
              {
                quantity: 1,
                price: 120.00,
                product: {
                  create: {
                    name: 'Sunflower Bouquet',
                    description: 'Bright yellow sunflowers',
                    price: 120.00,
                    stock: 30,
                    imageUrl: 'https://example.com/sunflowers.jpg',
                    category: {
                      create: { name: 'Bouquets' }
                    }
                  }
                }
              }
            ]
          },
          payment: {
            create: {
              amount: 120.00,
              method: 'paypal',
              status: 'paid'
            }
          }
        }
      ]
    }
  },
  {
    name: 'Mahmoud',
    email: 'mahmoud@example.com',
    password: 'securepassword',
    role: 'customer',
    orders: { create: [] }
  }
]

// ----------------------------
// MAIN SEED FUNCTION
// ----------------------------
async function main() {
  console.log(`🌱 Starting database seeding...`)

  // Delete existing data (order matters due to FK constraints)
  await prisma.payment.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()

  // Insert users with nested orders, products, payments
  for (const u of userData) {
    const user = await prisma.user.create({ data: u })
    console.log(`Created user with id: ${user.id}`)
  }

  console.log(`🌱 Database seeding finished!`)
}

// ----------------------------
// RUN SEED
// ----------------------------
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
