import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

// GET /api/creatures/[id]?sourceType=creature|custom|pc
// Fetch a single creature for "Use as Template" feature
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const sourceType = searchParams.get("sourceType");

    if (!sourceType || !['creature', 'custom', 'pc'].includes(sourceType)) {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: "Valid sourceType query parameter is required (creature, custom, or pc)",
          },
        },
        { status: 400 }
      );
    }

    // SRD creatures are public, but custom creatures and PCs require auth
    if (sourceType === 'custom' || sourceType === 'pc') {
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

      // Fetch custom creature
      if (sourceType === 'custom') {
        const customCreature = await prisma.customCreature.findUnique({
          where: { id },
        });

        if (!customCreature) {
          return NextResponse.json(
            {
              data: null,
              error: { code: "NOT_FOUND", message: "Custom creature not found" },
            },
            { status: 404 }
          );
        }

        // Authorization check
        if (customCreature.userId !== session.user.id) {
          return NextResponse.json(
            {
              data: null,
              error: { code: "FORBIDDEN", message: "Not authorized" },
            },
            { status: 403 }
          );
        }

        return NextResponse.json({
          data: {
            id: customCreature.id,
            name: customCreature.name,
            stats: customCreature.stats,
            sourceType: 'custom',
          },
          error: null,
        });
      }

      // Fetch player character
      if (sourceType === 'pc') {
        const playerCharacter = await prisma.playerCharacter.findUnique({
          where: { id },
        });

        if (!playerCharacter) {
          return NextResponse.json(
            {
              data: null,
              error: { code: "NOT_FOUND", message: "Player character not found" },
            },
            { status: 404 }
          );
        }

        // Authorization check
        if (playerCharacter.userId !== session.user.id) {
          return NextResponse.json(
            {
              data: null,
              error: { code: "FORBIDDEN", message: "Not authorized" },
            },
            { status: 403 }
          );
        }

        return NextResponse.json({
          data: {
            id: playerCharacter.id,
            name: playerCharacter.name,
            stats: playerCharacter.stats,
            sourceType: 'pc',
          },
          error: null,
        });
      }
    }

    // Fetch SRD creature (public, no auth required)
    if (sourceType === 'creature') {
      const creature = await prisma.creature.findUnique({
        where: { id },
      });

      if (!creature) {
        return NextResponse.json(
          {
            data: null,
            error: { code: "NOT_FOUND", message: "Creature not found" },
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        data: {
          id: creature.id,
          name: creature.name,
          stats: creature.stats,
          sourceType: 'creature',
        },
        error: null,
      });
    }

    // Should never reach here
    return NextResponse.json(
      {
        data: null,
        error: { code: "INTERNAL_ERROR", message: "Something went wrong" },
      },
      { status: 500 }
    );
  } catch (error) {
    console.error("Error fetching creature:", error);
    return NextResponse.json(
      {
        data: null,
        error: { code: "INTERNAL_ERROR", message: "Something went wrong" },
      },
      { status: 500 }
    );
  }
}
