import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

// GET /api/creatures/search?q=goblin&gameSystem=DND5E
export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const gameSystem = searchParams.get("gameSystem") || "DND5E";
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

    // Search SRD creatures
    const creatures = await prisma.creature.findMany({
      where: {
        gameSystem,
        name: {
          contains: query,
        },
      },
      select: {
        id: true,
        index: true,
        name: true,
        size: true,
        creatureType: true,
        challengeRating: true,
        stats: true,
      },
      orderBy: [
        { name: "asc" },
      ],
      take: limit,
    });

    // Search custom creatures owned by user
    const customCreatures = await prisma.customCreature.findMany({
      where: {
        userId: session.user.id,
        gameSystem,
        name: {
          contains: query,
        },
      },
      select: {
        id: true,
        name: true,
        stats: true,
      },
      orderBy: { name: "asc" },
      take: limit,
    });

    // Search player characters owned by user
    const playerCharacters = await prisma.playerCharacter.findMany({
      where: {
        userId: session.user.id,
        gameSystem,
        name: {
          contains: query,
        },
      },
      select: {
        id: true,
        name: true,
        stats: true,
      },
      orderBy: { name: "asc" },
      take: limit,
    });

    // Format results
    const results = [
      ...creatures.map((c) => ({
        id: c.id,
        index: c.index,
        name: c.name,
        size: c.size,
        type: c.creatureType,
        challengeRating: c.challengeRating,
        sourceType: "creature" as const,
        stats: c.stats,
      })),
      ...customCreatures.map((c) => {
        let stats: Record<string, unknown> = {};
        try {
          stats = JSON.parse(c.stats);
        } catch {
          stats = {};
        }
        return {
          id: c.id,
          index: null,
          name: c.name,
          size: stats.size as string | null,
          type: stats.type as string | null,
          challengeRating: stats.challenge_rating as number | null,
          sourceType: "custom" as const,
          stats: c.stats,
        };
      }),
      ...playerCharacters.map((c) => {
        let stats: Record<string, unknown> = {};
        try {
          stats = JSON.parse(c.stats);
        } catch {
          stats = {};
        }
        return {
          id: c.id,
          index: null,
          name: c.name,
          size: stats.size as string | null,
          type: "Player Character",
          challengeRating: null,
          sourceType: "pc" as const,
          stats: c.stats,
        };
      }),
    ];

    // Sort combined results by name
    results.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({
      data: results.slice(0, limit),
      error: null,
    });
  } catch (error) {
    console.error("Error searching creatures:", error);
    return NextResponse.json(
      {
        data: null,
        error: { code: "INTERNAL_ERROR", message: "Something went wrong" },
      },
      { status: 500 }
    );
  }
}
