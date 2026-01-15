import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

// Validation schema for updating a combat creature
const updateCombatCreatureSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  identifier: z.string().max(50).nullable().optional(),
  initiative: z.number().int().optional(),
  currentHp: z.number().int().min(0).optional(),
  maxHp: z.number().int().min(1).optional(),
  tempHp: z.number().int().min(0).optional(),
  armorClass: z.number().int().min(0).optional(),
  tokenColor: z.string().max(20).nullable().optional(),
  statusEffects: z.string().optional(), // JSON array string
  isConcentrating: z.boolean().optional(),
  concentrationNote: z.string().max(100).nullable().optional(),
  spellSlots: z.string().nullable().optional(), // JSON object string
  turnNumber: z.number().int().min(1).optional(),
  sortOrder: z.number().int().optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

// Helper to verify combat creature ownership
async function verifyCombatCreatureOwnership(creatureId: string, userId: string) {
  const creature = await prisma.combatCreature.findUnique({
    where: { id: creatureId },
    include: {
      combat: {
        include: {
          campaign: {
            select: { userId: true },
          },
        },
      },
    },
  });

  if (!creature) {
    return { error: "NOT_FOUND", creature: null };
  }

  if (creature.combat.campaign.userId !== userId) {
    return { error: "FORBIDDEN", creature: null };
  }

  return { error: null, creature };
}

// GET /api/combat-creatures/[id] - Get a single combat creature
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          data: null,
          error: { code: "UNAUTHORIZED", message: "Not authenticated" },
        },
        { status: 401 }
      );
    }

    const { error, creature } = await verifyCombatCreatureOwnership(id, session.user.id);

    if (error === "NOT_FOUND") {
      return NextResponse.json(
        {
          data: null,
          error: { code: "NOT_FOUND", message: "Creature not found" },
        },
        { status: 404 }
      );
    }

    if (error === "FORBIDDEN") {
      return NextResponse.json(
        {
          data: null,
          error: { code: "FORBIDDEN", message: "Access denied" },
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      data: creature,
      error: null,
    });
  } catch (error) {
    console.error("Error fetching combat creature:", error);
    return NextResponse.json(
      {
        data: null,
        error: { code: "INTERNAL_ERROR", message: "Something went wrong" },
      },
      { status: 500 }
    );
  }
}

// PATCH /api/combat-creatures/[id] - Update a combat creature
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          data: null,
          error: { code: "UNAUTHORIZED", message: "Not authenticated" },
        },
        { status: 401 }
      );
    }

    const { error: ownershipError } = await verifyCombatCreatureOwnership(id, session.user.id);

    if (ownershipError === "NOT_FOUND") {
      return NextResponse.json(
        {
          data: null,
          error: { code: "NOT_FOUND", message: "Creature not found" },
        },
        { status: 404 }
      );
    }

    if (ownershipError === "FORBIDDEN") {
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
    const result = updateCombatCreatureSchema.safeParse(body);
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

    // Update the combat creature
    const creature = await prisma.combatCreature.update({
      where: { id },
      data: result.data,
    });

    return NextResponse.json({
      data: creature,
      error: null,
    });
  } catch (error) {
    console.error("Error updating combat creature:", error);
    return NextResponse.json(
      {
        data: null,
        error: { code: "INTERNAL_ERROR", message: "Something went wrong" },
      },
      { status: 500 }
    );
  }
}

// DELETE /api/combat-creatures/[id] - Remove a creature from combat
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          data: null,
          error: { code: "UNAUTHORIZED", message: "Not authenticated" },
        },
        { status: 401 }
      );
    }

    const { error: ownershipError } = await verifyCombatCreatureOwnership(id, session.user.id);

    if (ownershipError === "NOT_FOUND") {
      return NextResponse.json(
        {
          data: null,
          error: { code: "NOT_FOUND", message: "Creature not found" },
        },
        { status: 404 }
      );
    }

    if (ownershipError === "FORBIDDEN") {
      return NextResponse.json(
        {
          data: null,
          error: { code: "FORBIDDEN", message: "Access denied" },
        },
        { status: 403 }
      );
    }

    // Delete the combat creature
    await prisma.combatCreature.delete({
      where: { id },
    });

    return NextResponse.json({
      data: { success: true },
      error: null,
    });
  } catch (error) {
    console.error("Error deleting combat creature:", error);
    return NextResponse.json(
      {
        data: null,
        error: { code: "INTERNAL_ERROR", message: "Something went wrong" },
      },
      { status: 500 }
    );
  }
}
