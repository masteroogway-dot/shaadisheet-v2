import { PrismaClient } from "@prisma/client";
import { WEDDING_TEMPLATES } from "../src/lib/weddingTemplates";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding WeddingTemplate table...");

  for (const template of WEDDING_TEMPLATES) {
    const existing = await prisma.weddingTemplate.findUnique({
      where: { slug: template.slug },
    });

    if (existing) {
      console.log(`  Skipping ${template.slug} (already exists)`);
      continue;
    }

    await prisma.weddingTemplate.create({
      data: {
        name: template.name,
        slug: template.slug,
        country: template.country,
        religion: template.religion,
        region: template.region,
        currency: template.currency,
        events: JSON.stringify(template.events),
        budgetRanges: JSON.stringify(template.budgetRanges),
        dressCodes: JSON.stringify(template.dressCodes),
        foodDefaults: JSON.stringify(template.foodDefaults),
        checklistItems: JSON.stringify(template.checklistItems),
        guestRange: JSON.stringify(template.guestRange),
        planningMonths: template.planningMonths,
      },
    });

    console.log(`  Created ${template.slug}`);
  }

  console.log("Done! Seeded", WEDDING_TEMPLATES.length, "templates.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
