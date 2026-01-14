import { NextResponse } from "next/server";
import { z } from "zod";
import { DiceRoll } from "@dice-roller/rpg-dice-roller";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

// Validation schema for adding creatures to combat
const addCreaturesSchema = z.object({
  creatures: z.array(
    z.object({
      sourceId: z.string(),
      sourceType: z.enum(["creature", "custom", "pc"]),
      quantity: z.number().int().min(1).max(20),
      stats: z.string(), // JSON stats snapshot
      name: z.string(), // Creature/PC name
    })
  ),
});

type RouteParams = { params: Promise<{ id: string }> };

// Helper to verify combat ownership
async function verifyCombatOwnership(combatId: string, userId: string) {
  const combat = await prisma.combat.findUnique({
    where: { id: combatId },
    include: {
      campaign: {
        select: { userId: true, gameSystem: true },
      },
      creatures: {
        select: { id: true },
      },
    },
  });

  if (!combat) {
    return { error: "NOT_FOUND", combat: null };
  }

  if (combat.campaign.userId !== userId) {
    return { error: "FORBIDDEN", combat: null };
  }

  return { error: null, combat };
}

// Helper to roll initiative (d20 + dex modifier)
function rollInitiative(stats: Record<string, unknown>): number {
  const dexterity = (stats.dexterity as number) || 10;
  const dexMod = Math.floor((dexterity - 10) / 2);
  const d20 = Math.floor(Math.random() * 20) + 1;
  return d20 + dexMod;
}

// Helper to roll HP from dice notation
function rollHitPoints(stats: Record<string, unknown>): number {
  // Check for hit_points_roll notation (e.g., "8d8+16")
  const hpRoll = stats.hit_points_roll as string | undefined;

  if (hpRoll) {
    try {
      const roll = new DiceRoll(hpRoll);
      // Ensure we get at least 1 HP
      return Math.max(1, roll.total);
    } catch {
      // Fall through to average if roll fails
    }
  }

  // Fall back to average HP
  if (typeof stats.hit_points === "number") {
    return stats.hit_points;
  } else if (typeof stats.hp === "number") {
    return stats.hp;
  } else if (stats.hit_points && typeof (stats.hit_points as Record<string, unknown>).average === "number") {
    return (stats.hit_points as Record<string, unknown>).average as number;
  }

  return 10; // Default fallback
}

// Helper to get reference HP (for PCs and when we need the average)
function getReferenceHp(stats: Record<string, unknown>): number {
  // Check for PC format first
  if (typeof stats.total_hp === "number") {
    return stats.total_hp;
  }
  // Then check NPC formats
  if (typeof stats.hit_points === "number") {
    return stats.hit_points;
  } else if (typeof stats.hp === "number") {
    return stats.hp;
  } else if (stats.hit_points && typeof (stats.hit_points as Record<string, unknown>).average === "number") {
    return (stats.hit_points as Record<string, unknown>).average as number;
  }
  return 10;
}

// POST /api/combats/[id]/creatures - Add creatures to combat
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    const { id: combatId } = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          data: null,
          error: { code: "UNAUTHORIZED", message: "Not authenticated" },
        },
        { status: 401 }
      );
    }

    const { error: ownershipError, combat } = await verifyCombatOwnership(
      combatId,
      session.user.id
    );

    if (ownershipError === "NOT_FOUND") {
      return NextResponse.json(
        {
          data: null,
          error: { code: "NOT_FOUND", message: "Combat not found" },
        },
        { status: 404 }
      );
    }

    if (ownershipError === "FORBIDDEN" || !combat) {
      return NextResponse.json(
        {
          data: null,
          error: { code: "FORBIDDEN", message: "Access denied" },
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate input
    const result = addCreaturesSchema.safeParse(body);
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

    const { creatures } = result.data;
    const createdCreatures: Array<{
      id: string;
      name: string;
      initiative: number;
    }> = [];

    // Get current max sort order
    const existingCount = combat.creatures.length;
    let sortOrder = existingCount;

    // Create combat creatures
    for (const creatureData of creatures) {
      // Parse stats
      let stats: Record<string, unknown> = {};
      try {
        stats = JSON.parse(creatureData.stats);
      } catch {
        stats = {};
      }

      const name = creatureData.name || (stats.name as string) || "Unknown Creature";

      // Extract AC once (doesn't need to be rolled per instance)
      let armorClass = 10;
      if (typeof stats.armor_class === "number") {
        armorClass = stats.armor_class;
      } else if (typeof stats.ac === "number") {
        armorClass = stats.ac;
      } else if (Array.isArray(stats.armor_class) && stats.armor_class[0]) {
        armorClass = (stats.armor_class[0] as Record<string, unknown>).value as number || 10;
      }

      // Create multiple instances based on quantity
      for (let i = 0; i < creatureData.quantity; i++) {
        const initiative = rollInitiative(stats);

        // Roll HP for each instance (NPCs get different HP, PCs use static)
        const maxHp = creatureData.sourceType === "pc"
          ? getReferenceHp(stats)
          : rollHitPoints(stats);

        const combatCreature = await prisma.combatCreature.create({
          data: {
            combatId,
            name,
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

        createdCreatures.push({
          id: combatCreature.id,
          name: combatCreature.name,
          initiative: combatCreature.initiative,
        });
      }
    }

    // Fetch updated combat with all creatures
    const updatedCombat = await prisma.combat.findUnique({
      where: { id: combatId },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
            gameSystem: true,
          },
        },
        creatures: {
          orderBy: [{ initiative: "desc" }, { sortOrder: "asc" }],
        },
      },
    });

    return NextResponse.json({
      data: {
        combat: updatedCombat,
        added: createdCreatures,
      },
      error: null,
    });
  } catch (error) {
    console.error("Error adding creatures to combat:", error);
    return NextResponse.json(
      {
        data: null,
        error: { code: "INTERNAL_ERROR", message: "Something went wrong" },
      },
      { status: 500 }
    );
  }
}
