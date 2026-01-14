import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

// Validation schema for updating a combat
const updateCombatSchema = z.object({
  name: z.string().max(100, "Name too long").nullable().optional(),
  status: z.enum(["PREP", "ACTIVE", "COMPLETED"]).optional(),
  round: z.number().int().min(1).optional(),
  turnIndex: z.number().int().min(0).optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

// Helper to verify combat ownership
async function verifyCombatOwnership(combatId: string, userId: string) {
  const combat = await prisma.combat.findUnique({
    where: { id: combatId },
    include: {
      campaign: {
        select: { userId: true },
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

// GET /api/combats/[id] - Get a single combat with creatures
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

    const combat = await prisma.combat.findUnique({
      where: { id },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
            gameSystem: true,
            userId: true,
          },
        },
        creatures: {
          orderBy: [{ initiative: "desc" }, { sortOrder: "asc" }],
        },
      },
    });

    if (!combat) {
      return NextResponse.json(
        {
          data: null,
          error: { code: "NOT_FOUND", message: "Combat not found" },
        },
        { status: 404 }
      );
    }

    if (combat.campaign.userId !== session.user.id) {
      return NextResponse.json(
        {
          data: null,
          error: { code: "FORBIDDEN", message: "Access denied" },
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      data: combat,
      error: null,
    });
  } catch (error) {
    console.error("Error fetching combat:", error);
    return NextResponse.json(
      {
        data: null,
        error: { code: "INTERNAL_ERROR", message: "Something went wrong" },
      },
      { status: 500 }
    );
  }
}

// PATCH /api/combats/[id] - Update a combat (partial update)
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

    const { error: ownershipError } = await verifyCombatOwnership(id, session.user.id);

    if (ownershipError === "NOT_FOUND") {
      return NextResponse.json(
        {
          data: null,
          error: { code: "NOT_FOUND", message: "Combat not found" },
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
    const result = updateCombatSchema.safeParse(body);
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

    // Update the combat
    const combat = await prisma.combat.update({
      where: { id },
      data: result.data,
    });

    return NextResponse.json({
      data: combat,
      error: null,
    });
  } catch (error) {
    console.error("Error updating combat:", error);
    return NextResponse.json(
      {
        data: null,
        error: { code: "INTERNAL_ERROR", message: "Something went wrong" },
      },
      { status: 500 }
    );
  }
}

// PUT /api/combats/[id] - Update a combat
export async function PUT(request: Request, { params }: RouteParams) {
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

    const { error: ownershipError } = await verifyCombatOwnership(id, session.user.id);

    if (ownershipError === "NOT_FOUND") {
      return NextResponse.json(
        {
          data: null,
          error: { code: "NOT_FOUND", message: "Combat not found" },
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
    const result = updateCombatSchema.safeParse(body);
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

    // Update the combat
    const combat = await prisma.combat.update({
      where: { id },
      data: result.data,
    });

    return NextResponse.json({
      data: combat,
      error: null,
    });
  } catch (error) {
    console.error("Error updating combat:", error);
    return NextResponse.json(
      {
        data: null,
        error: { code: "INTERNAL_ERROR", message: "Something went wrong" },
      },
      { status: 500 }
    );
  }
}

// DELETE /api/combats/[id] - Delete a combat
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

    const { error: ownershipError } = await verifyCombatOwnership(id, session.user.id);

    if (ownershipError === "NOT_FOUND") {
      return NextResponse.json(
        {
          data: null,
          error: { code: "NOT_FOUND", message: "Combat not found" },
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

    // Delete the combat (cascades to combat creatures)
    await prisma.combat.delete({
      where: { id },
    });

    return NextResponse.json({
      data: { success: true },
      error: null,
    });
  } catch (error) {
    console.error("Error deleting combat:", error);
    return NextResponse.json(
      {
        data: null,
        error: { code: "INTERNAL_ERROR", message: "Something went wrong" },
      },
      { status: 500 }
    );
  }
}
