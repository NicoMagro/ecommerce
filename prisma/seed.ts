/**
 * Database Seed Script
 * Creates initial data for development and testing
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Create Admin User
  console.log('Creating admin user...');
  const passwordHash = await bcrypt.hash('Admin123!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@ecommerce.com' },
    update: {},
    create: {
      email: 'admin@ecommerce.com',
      name: 'Admin User',
      passwordHash: passwordHash,
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // 2. Create Test Customer
  console.log('Creating test customer...');
  const customerPasswordHash = await bcrypt.hash('Customer123!', 12);

  const customer = await prisma.user.upsert({
    where: { email: 'customer@test.com' },
    update: {},
    create: {
      email: 'customer@test.com',
      name: 'Test Customer',
      passwordHash: customerPasswordHash,
      role: 'CUSTOMER',
      emailVerified: new Date(),
    },
  });

  console.log('✅ Test customer created:', customer.email);

  // 3. Create Categories
  console.log('Creating categories...');

  const electronics = await prisma.category.upsert({
    where: { slug: 'electronics' },
    update: {},
    create: {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Electronic devices and gadgets',
      sortOrder: 1,
    },
  });

  const clothing = await prisma.category.upsert({
    where: { slug: 'clothing' },
    update: {},
    create: {
      name: 'Clothing',
      slug: 'clothing',
      description: 'Fashion and apparel',
      sortOrder: 2,
    },
  });

  const shoes = await prisma.category.upsert({
    where: { slug: 'shoes' },
    update: {},
    create: {
      name: 'Shoes',
      slug: 'shoes',
      description: 'Footwear for all occasions',
      sortOrder: 3,
      parentId: clothing.id, // Sub-category of clothing
    },
  });

  const accessories = await prisma.category.upsert({
    where: { slug: 'accessories' },
    update: {},
    create: {
      name: 'Accessories',
      slug: 'accessories',
      description: 'Fashion accessories',
      sortOrder: 4,
    },
  });

  console.log('✅ Categories created:', [
    electronics.name,
    clothing.name,
    shoes.name,
    accessories.name,
  ]);

  // 4. Create Sample Products (optional)
  console.log('Creating sample products...');

  const product1 = await prisma.product.upsert({
    where: { sku: 'SAMPLE-001' },
    update: {},
    create: {
      sku: 'SAMPLE-001',
      name: 'Sample Product',
      slug: 'sample-product',
      description: 'This is a sample product for testing',
      shortDescription: 'Sample product',
      price: 99.99,
      categoryId: electronics.id,
      status: 'ACTIVE',
      featured: true,
    },
  });

  // Create inventory for the product
  await prisma.inventory.upsert({
    where: { productId: product1.id },
    update: {},
    create: {
      productId: product1.id,
      quantity: 100,
      reservedQuantity: 0,
      lowStockThreshold: 10,
    },
  });

  console.log('✅ Sample products created');

  console.log('\n🎉 Seed completed successfully!\n');
  console.log('📧 Admin credentials:');
  console.log('   Email: admin@ecommerce.com');
  console.log('   Password: Admin123!');
  console.log('\n📧 Customer credentials:');
  console.log('   Email: customer@test.com');
  console.log('   Password: Customer123!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
