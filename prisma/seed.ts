import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Clear existing seed data first
  console.log("  🗑️  Clearing existing seed data...");
  await prisma.creature.deleteMany();
  await prisma.spell.deleteMany();
  console.log("    ✓ Cleared creatures and spells");

  // Seed D&D 5e SRD Creatures
  await seedCreatures();

  // Seed D&D 5e SRD Spells (sample data for now)
  await seedSpells();

  console.log("✅ Database seeding complete!");
}

async function seedCreatures() {
  console.log("  📦 Seeding creatures...");

  // Read the JSON file
  const jsonPath = path.join(process.cwd(), "json-examples", "dnd5eNPCs.json");
  const jsonData = fs.readFileSync(jsonPath, "utf-8");
  const allCreatures = JSON.parse(jsonData);

  for (const creature of allCreatures) {
    // Extract the AC value (it's an array of objects)
    const armorClass = Array.isArray(creature.armor_class)
      ? creature.armor_class[0]?.value ?? 10
      : creature.armor_class ?? 10;

    await prisma.creature.upsert({
      where: { index: creature.index },
      update: {
        name: creature.name,
        gameSystem: "DND5E",
        size: creature.size,
        creatureType: creature.type,
        challengeRating: creature.challenge_rating,
        stats: JSON.stringify(creature), // Store the entire creature object
      },
      create: {
        index: creature.index,
        name: creature.name,
        gameSystem: "DND5E",
        size: creature.size,
        creatureType: creature.type,
        challengeRating: creature.challenge_rating,
        stats: JSON.stringify(creature), // Store the entire creature object
      },
    });
  }

  console.log(`    ✓ Seeded ${allCreatures.length} creatures`);
}

async function seedSpells() {
  console.log("  📦 Seeding spells...");

  // Read the JSON file
  const jsonPath = path.join(process.cwd(), "json-examples", "dnd5eSpells.json");
  const jsonData = fs.readFileSync(jsonPath, "utf-8");
  const allSpells = JSON.parse(jsonData);

  for (const spell of allSpells) {
    await prisma.spell.upsert({
      where: { index: spell.index },
      update: {
        name: spell.name,
        level: spell.level,
        school: spell.school?.index ?? "unknown",
        gameSystem: "DND5E",
        stats: JSON.stringify(spell), // Store the entire spell object
      },
      create: {
        index: spell.index,
        name: spell.name,
        level: spell.level,
        school: spell.school?.index ?? "unknown",
        gameSystem: "DND5E",
        stats: JSON.stringify(spell), // Store the entire spell object
      },
    });
  }

  console.log(`    ✓ Seeded ${allSpells.length} spells`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
