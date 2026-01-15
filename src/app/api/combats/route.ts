import { NextResponse } from "next/server";
import { z } from "zod";
import { DiceRoll } from "@dice-roller/rpg-dice-roller";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

// Validation schema for creating a combat
const createCombatSchema = z.object({
  campaignId: z.string().min(1, "Campaign ID is required"),
  name: z.string().max(100, "Name too long").nullable().optional(),
  creatures: z
    .array(
      z.object({
        sourceId: z.string(),
        sourceType: z.enum(["creature", "custom", "pc"]),
        quantity: z.number().int().min(1).max(20),
        stats: z.string(),
        name: z.string(),
      })
    )
    .optional(),
});

// Helper to roll initiative (d20 + dex modifier)
function rollInitiative(stats: Record<string, unknown>): number {
  const dexterity = (stats.dexterity as number) || 10;
  const dexMod = Math.floor((dexterity - 10) / 2);
  const d20 = Math.floor(Math.random() * 20) + 1;
  return d20 + dexMod;
}

// Helper to roll HP from dice notation
function rollHitPoints(stats: Record<string, unknown>): number {
  const hpRoll = stats.hit_points_roll as string | undefined;

  if (hpRoll) {
    try {
      const roll = new DiceRoll(hpRoll);
      return Math.max(1, roll.total);
    } catch {
      // Fall through to average if roll fails
    }
  }

  if (typeof stats.hit_points === "number") {
    return stats.hit_points;
  } else if (typeof stats.hp === "number") {
    return stats.hp;
  } else if (
    stats.hit_points &&
    typeof (stats.hit_points as Record<string, unknown>).average === "number"
  ) {
    return (stats.hit_points as Record<string, unknown>).average as number;
  }

  return 10;
}

// Helper to get reference HP (for PCs)
function getReferenceHp(stats: Record<string, unknown>): number {
  if (typeof stats.total_hp === "number") {
    return stats.total_hp;
  }
  if (typeof stats.hit_points === "number") {
    return stats.hit_points;
  } else if (typeof stats.hp === "number") {
    return stats.hp;
  } else if (
    stats.hit_points &&
    typeof (stats.hit_points as Record<string, unknown>).average === "number"
  ) {
    return (stats.hit_points as Record<string, unknown>).average as number;
  }
  return 10;
}

// Helper to extract AC from stats
function getArmorClassFromStats(stats: Record<string, unknown>): number {
  if (typeof stats.armor_class === "number") {
    return stats.armor_class;
  } else if (typeof stats.ac === "number") {
    return stats.ac;
  } else if (Array.isArray(stats.armor_class) && stats.armor_class[0]) {
    return (
      ((stats.armor_class[0] as Record<string, unknown>).value as number) || 10
    );
  }
  return 10;
}

// POST /api/combats - Create a new combat encounter
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          data: null,
          error: { code: "UNAUTHORIZED", message: "Not authenticated" },
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate input
    const result = createCombatSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: result.error.issues[0].message,
          },
        },
        { status: 400 }
      );
    }

    const { campaignId, name, creatures } = result.data;

    // Verify the campaign exists and belongs to the user
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      return NextResponse.json(
        {
          data: null,
          error: { code: "NOT_FOUND", message: "Campaign not found" },
        },
        { status: 404 }
      );
    }

    if (campaign.userId !== session.user.id) {
      return NextResponse.json(
        {
          data: null,
          error: { code: "FORBIDDEN", message: "Access denied" },
        },
        { status: 403 }
      );
    }

    // Create combat and creatures in a transaction
    const combat = await prisma.$transaction(async (tx) => {
      // Create the combat
      const newCombat = await tx.combat.create({
        data: {
          name: name || null,
          campaignId,
          status: "PREP",
          round: 1,
          turnIndex: 0,
        },
      });

      // Create creatures if provided
      if (creatures && creatures.length > 0) {
        let sortOrder = 0;

        for (const creatureData of creatures) {
          let stats: Record<string, unknown> = {};
          try {
            stats = JSON.parse(creatureData.stats);
          } catch {
            stats = {};
          }

          const creatureName =
            creatureData.name || (stats.name as string) || "Unknown Creature";
          const armorClass = getArmorClassFromStats(stats);

          // Create multiple instances based on quantity
          for (let i = 0; i < creatureData.quantity; i++) {
            const initiative = rollInitiative(stats);
            const maxHp =
              creatureData.sourceType === "pc"
                ? getReferenceHp(stats)
                : rollHitPoints(stats);

            await tx.combatCreature.create({
              data: {
                combatId: newCombat.id,
                name: creatureName,
                identifier: null,
                initiative,
                currentHp: maxHp,
                maxHp,
                armorClass,
                sourceType: creatureData.sourceType,
                sourceId: creatureData.sourceId,
                statsSnapshot: creatureData.stats,
                sortOrder: sortOrder++,
              },
            });
          }
        }
      }

      // Return combat with creatures
      return tx.combat.findUnique({
        where: { id: newCombat.id },
        include: {
          creatures: {
            orderBy: [{ initiative: "desc" }, { sortOrder: "asc" }],
          },
        },
      });
    });

    return NextResponse.json(
      {
        data: combat,
        error: null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating combat:", error);
    return NextResponse.json(
      {
        data: null,
        error: { code: "INTERNAL_ERROR", message: "Something went wrong" },
      },
      { status: 500 }
    );
  }
}
