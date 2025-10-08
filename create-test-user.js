import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUsers() {
  try {
    // Create test users with different roles
    const hashedPassword = await bcrypt.hash('password123', 12);

    // Create client user
    const clientUser = await prisma.user.create({
      data: {
        email: 'client@test.com',
        password: hashedPassword,
        name: 'Test Client',
      },
    });

    await prisma.clientProfile.create({
      data: {
        userId: clientUser.id,
        firstName: 'Test',
        lastName: 'Client',
        companyName: 'Test Company',
        industry: 'Technology',
        companySize: '1-10',
      },
    });

    // Create talent user
    const talentUser = await prisma.user.create({
      data: {
        email: 'talent@test.com',
        password: hashedPassword,
        name: 'Test Talent',
      },
    });

    await prisma.talentProfile.create({
      data: {
        userId: talentUser.id,
        firstName: 'Test',
        lastName: 'Talent',
        title: 'Full Stack Developer',
        skills: ['React', 'Node.js', 'TypeScript'],
        experience: 'senior',
        hourlyRate: '$75/hr',
      },
    });

    // Create agency user
    const agencyUser = await prisma.user.create({
      data: {
        email: 'agency@test.com',
        password: hashedPassword,
        name: 'Test Agency',
      },
    });

    await prisma.agencyProfile.create({
      data: {
        userId: agencyUser.id,
        firstName: 'Test',
        lastName: 'Agency',
        agencyName: 'Test Agency Inc',
        description: 'Full-service digital agency',
        teamSize: '6-15',
        skills: ['React', 'Node.js', 'UI/UX Design'],
      },
    });

    console.log('Test users created successfully!');
    console.log('Client: client@test.com / password123');
    console.log('Talent: talent@test.com / password123');
    console.log('Agency: agency@test.com / password123');
  } catch (error) {
    console.error('Error creating test users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUsers();
