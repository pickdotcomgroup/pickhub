import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  // Create master admin user
  const adminEmail = "admin@pickhub.com";
  const adminPassword = "MasterAdmin2024!"; // Change this in production

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log("Master admin already exists");
    return;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  // Create admin user with profile
  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      name: "Master Admin",
      role: "admin",
      emailVerified: new Date(),
      adminProfile: {
        create: {
          firstName: "Master",
          lastName: "Admin",
          role: "master",
          permissions: {
            canVerifyTalents: true,
            canViewAllUsers: true,
            canManageUsers: true,
            canViewAnalytics: true,
            canManageProjects: true,
          },
        },
      },
    },
    include: {
      adminProfile: true,
    },
  });

  console.log("Master admin created successfully!");
  console.log("Email:", adminEmail);
  console.log("Password:", adminPassword);
  console.log("⚠️  IMPORTANT: Change the password after first login!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
