import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

// GET /api/player-characters?gameSystem=DND5E&campaignId=xxx
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
    const gameSystem = searchParams.get("gameSystem");
    const campaignId = searchParams.get("campaignId");

    const where: {
      userId: string;
      gameSystem?: string;
      campaignId?: string;
    } = {
      userId: session.user.id,
    };

    if (gameSystem) {
      where.gameSystem = gameSystem;
    }

    if (campaignId) {
      where.campaignId = campaignId;
    }

    const playerCharacters = await prisma.playerCharacter.findMany({
      where,
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      data: playerCharacters,
      error: null,
    });
  } catch (error) {
    console.error("Error fetching player characters:", error);
    return NextResponse.json(
      {
        data: null,
        error: { code: "INTERNAL_ERROR", message: "Something went wrong" },
      },
      { status: 500 }
    );
  }
}

// POST /api/player-characters
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
    const { name, gameSystem, stats, imageUrl, campaignId } = body;

    // Validation
    if (!name || !gameSystem) {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: "Name and game system are required",
          },
        },
        { status: 400 }
      );
    }

    // Ensure stats is a valid JSON string
    const statsString = typeof stats === 'string' ? stats : JSON.stringify(stats || {});

    const playerCharacter = await prisma.playerCharacter.create({
      data: {
        name,
        gameSystem,
        stats: statsString,
        imageUrl: imageUrl || null,
        campaignId: campaignId || null,
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      data: playerCharacter,
      error: null,
    });
  } catch (error) {
    console.error("Error creating player character:", error);
    return NextResponse.json(
      {
        data: null,
        error: { code: "INTERNAL_ERROR", message: "Something went wrong" },
      },
      { status: 500 }
    );
  }
}
