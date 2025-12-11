import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ------------------------------------------------
// DATASETS (FLOWER SHOP EDITION)
// ------------------------------------------------

const CATEGORIES = [
  'Fresh Bouquets',
  'Indoor Plants',
  'Wedding & Events',
  'Sympathy',
  'Dried Flowers',
  'Vases & Accessories',
];

const PRODUCTS_DATA = [
  // Fresh Bouquets
  { name: 'Velvet Red Roses (12 stems)', category: 'Fresh Bouquets', price: 145.00 },
  { name: 'Sunrise Tulips', category: 'Fresh Bouquets', price: 95.00 },
  { name: 'Classic White Lilies', category: 'Fresh Bouquets', price: 110.00 },
  { name: 'Pastel Peony Bunch', category: 'Fresh Bouquets', price: 180.00 },
  { name: 'Sunflower Surprise', category: 'Fresh Bouquets', price: 85.00 },
  
  // Indoor Plants
  { name: 'Monstera Deliciosa (Potted)', category: 'Indoor Plants', price: 250.00 },
  { name: 'Peace Lily', category: 'Indoor Plants', price: 120.00 },
  { name: 'Fiddle Leaf Fig (Large)', category: 'Indoor Plants', price: 450.00 },
  { name: 'Succulent Trio', category: 'Indoor Plants', price: 65.00 },
  { name: 'Bonsai Tree (Juniper)', category: 'Indoor Plants', price: 320.00 },

  // Wedding & Events
  { name: 'Bridal Rose Bouquet', category: 'Wedding & Events', price: 350.00 },
  { name: 'Boutonnière (White Rose)', category: 'Wedding & Events', price: 45.00 },
  { name: 'Table Centerpiece Arrangement', category: 'Wedding & Events', price: 220.00 },

  // Sympathy
  { name: 'White Wreath Tribute', category: 'Sympathy', price: 280.00 },
  { name: 'Peaceful Basket Arrangement', category: 'Sympathy', price: 150.00 },

  // Dried Flowers
  { name: 'Dried Lavender Bundle', category: 'Dried Flowers', price: 55.00 },
  { name: 'Boho Pampas Grass', category: 'Dried Flowers', price: 90.00 },
  { name: 'Preserved Eucalyptus', category: 'Dried Flowers', price: 75.00 },

  // Vases
  { name: 'Crystal Glass Vase', category: 'Vases & Accessories', price: 80.00 },
  { name: 'Rustic Ceramic Pot', category: 'Vases & Accessories', price: 60.00 },
];

const USERS_DATA = [
  { name: 'Alice Florist', email: 'alice@admin.com', role: 'admin' },
  { name: 'Bob Gardener', email: 'bob@example.com', role: 'customer' },
  { name: 'Charlie Bloom', email: 'charlie@example.com', role: 'customer' },
  { name: 'Diana Petal', email: 'diana@example.com', role: 'customer' },
  { name: 'Evan Green', email: 'evan@example.com', role: 'customer' },
  { name: 'Fiona Rose', email: 'fiona@example.com', role: 'customer' },
];

// ------------------------------------------------
// HELPERS
// ------------------------------------------------

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ------------------------------------------------
// MAIN
// ------------------------------------------------

async function main() {
  console.log('🌸 Starting Flower Shop seeding...');

  // 1. CLEANUP
  console.log('🧹 Clearing garden (deleting old data)...');
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // 2. CREATE CATEGORIES
  console.log('📦 Creating Categories...');
  const categoryMap = new Map();

  for (const catName of CATEGORIES) {
    const category = await prisma.category.create({
      data: { name: catName },
    });
    categoryMap.set(catName, category.id);
  }

  // 3. CREATE PRODUCTS
  console.log('💐 Creating Flowers & Products...');
  const allProductIds = [];

  for (const prod of PRODUCTS_DATA) {
    const categoryId = categoryMap.get(prod.category);
    
    const product = await prisma.product.create({
      data: {
        name: prod.name,
        description: `Fresh, hand-picked ${prod.name} arranged with care.`,
        price: prod.price,
        stock: getRandomInt(5, 50), // Flowers usually have lower stock than electronics
        imageUrl: `https://placehold.co/600x400?text=${encodeURIComponent(prod.name)}`,
        categoryId: categoryId,
      },
    });
    allProductIds.push(product);
  }

  // 4. CREATE USERS
  console.log('👥 Creating Customers...');
  const allUserIds = [];

  for (const u of USERS_DATA) {
    const user = await prisma.user.create({
      data: {
        name: u.name,
        email: u.email,
        password: '$argon2id$v=19$m=65536,t=3,p=4$scrypt_hash_placeholder',
        role: u.role,
      },
    });
    allUserIds.push(user.id);
  }

  // 5. CREATE ORDERS
  console.log('🛒 Simulating Flower Orders...');
  
  const numberOfOrders = 20; 

  for (let i = 0; i < numberOfOrders; i++) {
    const randomUserId = getRandomItem(allUserIds);
    
    // Most flower orders are small (1-3 items)
    const itemsCount = getRandomInt(1, 3);
    const orderItemsData = [];
    let calculatedTotal = 0;

    for (let j = 0; j < itemsCount; j++) {
      const randomProduct = getRandomItem(allProductIds);
      const quantity = getRandomInt(1, 2); // People rarely buy 10 bouquets at once
      const itemTotal = Number(randomProduct.price) * quantity;
      
      calculatedTotal += itemTotal;

      orderItemsData.push({
        productId: randomProduct.id,
        quantity: quantity,
        price: randomProduct.price,
      });
    }

    const statusOptions = ['pending', 'completed', 'cancelled'];
    const status = getRandomItem(statusOptions);
    
    await prisma.order.create({
      data: {
        userId: randomUserId,
        status: status,
        totalAmount: calculatedTotal,
        items: {
          create: orderItemsData,
        },
        payment: status !== 'cancelled' ? {
          create: {
            amount: calculatedTotal,
            method: getRandomItem(['credit_card', 'paypal', 'apple_pay']),
            status: status === 'completed' ? 'paid' : 'pending',
          }
        } : undefined,
      },
    });
  }

  console.log('✅ Flower Shop seeded successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });