import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUsers() {
  try {
    // Create test users with different roles
    const hashedPassword = await bcrypt.hash('password123', 12);

    // Create client/employer user
    const clientUser = await prisma.user.create({
      data: {
        email: 'client@test.com',
        password: hashedPassword,
        name: 'Test Client',
        role: 'employer',
      },
    });

    await prisma.employerProfile.create({
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
        role: 'talent',
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

    // Create trainer user
    const trainerUser = await prisma.user.create({
      data: {
        email: 'trainer@test.com',
        password: hashedPassword,
        name: 'Test Trainer',
        role: 'trainer',
      },
    });

    await prisma.trainerProfile.create({
      data: {
        userId: trainerUser.id,
        organizationName: 'Test Training Academy',
        organizationType: 'training_center',
        contactPersonName: 'Test Trainer',
        contactPersonRole: 'Director',
        description: 'Experienced training organization in web development',
        specializations: ['React', 'Node.js', 'TypeScript'],
        trainingAreas: ['Full Stack Development', 'Frontend', 'Backend'],
      },
    });

    console.log('Test users created successfully!');
    console.log('Client: client@test.com / password123');
    console.log('Talent: talent@test.com / password123');
    console.log('Trainer: trainer@test.com / password123');
  } catch (error) {
    console.error('Error creating test users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUsers();
