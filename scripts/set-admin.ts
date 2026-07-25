import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function setAdmin() {
  const email = "manan.n.chandak@gmail.com";
  
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log(`User with email ${email} not found. Creating...`);
    await prisma.user.create({
      data: {
        email,
        name: "Manan Chandak",
        role: "admin",
      },
    });
    console.log("Admin user created.");
    return;
  }

  await prisma.user.update({
    where: { email },
    data: { role: "admin" },
  });
  console.log(`User ${email} promoted to admin.`);
}

setAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
