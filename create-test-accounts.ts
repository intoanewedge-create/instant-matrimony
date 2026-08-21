import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Ensure a Membership Plan exists
  let plan = await prisma.membershipPlan.findFirst({
    where: { price: { gte: 1000 } }
  });
  if (!plan) {
    plan = await prisma.membershipPlan.create({
      data: {
        name: 'Standard Plan',
        description: 'Standard access with messaging',
        price: 1500,
        durationDays: 30,
        features: ['MESSAGING', 'CONTACT'],
        isActive: true
      }
    });
  }

  // 2. Create Test User 1 (Male)
  const user1 = await prisma.user.upsert({
    where: { email: 'test_male@example.com' },
    update: {
      profile: {
        update: {
          gender: 'MALE',
          status: 'APPROVED',
          completionPercent: 100
        }
      }
    },
    create: {
      email: 'test_male@example.com',
      password: passwordHash,
      role: 'USER',
      isActive: true,
      publicId: 'M-1001',
      name: 'Rahul Sharma',
      profile: {
        create: {
          gender: 'MALE',
          status: 'APPROVED',
          dateOfBirth: new Date('1990-01-01'),
          height: 175,
          maritalStatus: 'Never Married',
          religion: 'Hindu',
          caste: 'Brahmin',
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India',
          bio: 'Test account for matching.',
          completionPercent: 100
        }
      }
    },
    include: { profile: true }
  });

  // 3. Create Test User 2 (Female)
  const user2 = await prisma.user.upsert({
    where: { email: 'test_female@example.com' },
    update: {
      profile: {
        update: {
          gender: 'FEMALE',
          status: 'APPROVED',
          completionPercent: 100
        }
      }
    },
    create: {
      email: 'test_female@example.com',
      password: passwordHash,
      role: 'USER',
      isActive: true,
      publicId: 'F-1002',
      name: 'Priya Patel',
      profile: {
        create: {
          gender: 'FEMALE',
          status: 'APPROVED',
          dateOfBirth: new Date('1992-05-15'),
          height: 165,
          maritalStatus: 'Never Married',
          religion: 'Hindu',
          caste: 'Patel',
          city: 'Pune',
          state: 'Maharashtra',
          country: 'India',
          bio: 'Test account for matching.',
          completionPercent: 100
        }
      }
    },
    include: { profile: true }
  });

  // 4. Give both users active memberships
  for (const userId of [user1.id, user2.id]) {
    const existingMembership = await prisma.membership.findFirst({
      where: { userId, status: 'ACTIVE' }
    });
    if (!existingMembership) {
      await prisma.membership.create({
        data: {
          userId,
          planId: plan.id,
          status: 'ACTIVE',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        }
      });
    }
  }

  // 5. Create an ACCEPTED interest between them
  const existingInterest = await prisma.interest.findFirst({
    where: {
      OR: [
        { senderId: user1.id, receiverId: user2.id },
        { senderId: user2.id, receiverId: user1.id }
      ]
    }
  });

  if (!existingInterest) {
    await prisma.interest.create({
      data: {
        senderId: user1.id,
        receiverId: user2.id,
        status: 'ACCEPTED'
      }
    });
  } else if (existingInterest.status !== 'ACCEPTED') {
    await prisma.interest.update({
      where: { id: existingInterest.id },
      data: { status: 'ACCEPTED' }
    });
  }

  console.log('--- TEST ACCOUNTS CREATED ---');
  console.log('Account 1 (Male):');
  console.log('  Email: test_male@example.com');
  console.log('  Password: Password123!');
  console.log('\nAccount 2 (Female):');
  console.log('  Email: test_female@example.com');
  console.log('  Password: Password123!');
  console.log('-----------------------------');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
