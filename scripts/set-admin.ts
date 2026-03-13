import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'zakirullah1579@gmail.com';
  
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email }
  });
  
  if (user) {
    // Update user role to admin
    const updated = await prisma.user.update({
      where: { email },
      data: { role: 'admin' }
    });
    console.log('✅ User updated to admin:', updated.email, updated.role);
  } else {
    console.log('❌ User not found with email:', email);
    console.log('Creating admin user...');
    
    // Create admin user
    const newUser = await prisma.user.create({
      data: {
        email: email,
        password: 'admin123456',
        walletAddress: '0xAdmin' + Date.now().toString(16),
        securityPin: '123456',
        referralCode: 'ADMIN' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        role: 'admin'
      }
    });
    console.log('✅ Admin user created:', newUser.email, newUser.role);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
