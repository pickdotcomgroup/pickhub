import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding courses...");

  // First, find or create a trainer user
  let trainer = await prisma.user.findFirst({
    where: { role: "trainer" },
  });

  if (!trainer) {
    trainer = await prisma.user.create({
      data: {
        email: "trainer@example.com",
        name: "Demo Trainer",
        role: "trainer",
        trainerProfile: {
          create: {
            organizationName: "Demo Training Academy",
            contactPersonName: "Demo Trainer",
            specializations: ["Web Development", "Cloud Computing"],
            trainingAreas: ["Software Engineering", "DevOps"],
          },
        },
      },
    });
    console.log("Created demo trainer:", trainer.id);
  }

  // Sample courses matching the pricing tiers (prices in PHP)
  const courses = [
    {
      id: "free-trial",
      title: "Free Trial - Web Development Basics",
      description: "A free introductory course to test the platform. Learn the basics of web development.",
      price: 0,
      level: "beginner",
      duration: "1 week",
      category: "Web Development",
      skills: ["HTML", "CSS"],
    },
    {
      id: "online-essential",
      title: "Essential Web Development",
      description: "Perfect for individual learners starting their journey into web development. Learn HTML, CSS, and JavaScript fundamentals.",
      price: 2499,
      level: "beginner",
      duration: "1 month",
      category: "Web Development",
      skills: ["HTML", "CSS", "JavaScript"],
    },
    {
      id: "online-professional",
      title: "Professional Full-Stack Development",
      description: "Best for serious professionals advancing their career with mentorship and verified certification.",
      price: 4999,
      level: "intermediate",
      duration: "1 month",
      category: "Web Development",
      skills: ["React", "Node.js", "PostgreSQL", "TypeScript"],
    },
    {
      id: "online-team",
      title: "Team Full-Stack Development",
      description: "Ideal for small teams learning together with collaborative projects and team progress tracking.",
      price: 9999,
      level: "intermediate",
      duration: "1 month",
      category: "Web Development",
      skills: ["React", "Node.js", "Team Collaboration", "Best Practices"],
    },
    {
      id: "onsite-essential",
      title: "On-Site Essential Training",
      description: "Hands-on workshop experience for individuals with in-person attendance.",
      price: 4999,
      level: "beginner",
      duration: "1 month",
      category: "Corporate Training",
      skills: ["Team Collaboration", "Fundamentals"],
    },
    {
      id: "onsite-professional",
      title: "On-Site Professional Workshop",
      description: "Premium onsite experience with mentorship and verified certification.",
      price: 8999,
      level: "intermediate",
      duration: "1 month",
      category: "Corporate Training",
      skills: ["Advanced Development", "Best Practices"],
    },
    {
      id: "onsite-team",
      title: "Team On-Site Workshop",
      description: "Complete team training solution with private workshop option and team building activities.",
      price: 19999,
      level: "intermediate",
      duration: "1 month",
      category: "Corporate Training",
      skills: ["Team Training", "Collaboration", "Best Practices"],
    },
  ];

  for (const courseData of courses) {
    const existing = await prisma.course.findUnique({
      where: { id: courseData.id },
    });

    if (existing) {
      console.log(`Course ${courseData.id} already exists, updating...`);
      await prisma.course.update({
        where: { id: courseData.id },
        data: {
          ...courseData,
          trainerId: trainer.id,
          status: "published",
          currency: "PHP",
        },
      });
    } else {
      await prisma.course.create({
        data: {
          ...courseData,
          trainerId: trainer.id,
          status: "published",
          currency: "PHP",
        },
      });
      console.log(`Created course: ${courseData.title}`);
    }
  }

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
