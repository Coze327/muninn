import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

// GET /api/custom-creatures?gameSystem=5E
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

    const where: {
      userId: string;
      gameSystem?: string;
    } = {
      userId: session.user.id,
    };

    if (gameSystem) {
      where.gameSystem = gameSystem;
    }

    const customCreatures = await prisma.customCreature.findMany({
      where,
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      data: customCreatures,
      error: null,
    });
  } catch (error) {
    console.error("Error fetching custom creatures:", error);
    return NextResponse.json(
      {
        data: null,
        error: { code: "INTERNAL_ERROR", message: "Something went wrong" },
      },
      { status: 500 }
    );
  }
}

// POST /api/custom-creatures
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
    const { name, gameSystem, stats, imageUrl } = body;

    // Validation
    if (!name || !gameSystem || !stats) {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: "Name, game system, and stats are required",
          },
        },
        { status: 400 }
      );
    }

    // Ensure stats is a valid JSON string
    const statsString = typeof stats === 'string' ? stats : JSON.stringify(stats);

    const customCreature = await prisma.customCreature.create({
      data: {
        name,
        gameSystem,
        stats: statsString,
        imageUrl: imageUrl || null,
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      data: customCreature,
      error: null,
    });
  } catch (error) {
    console.error("Error creating custom creature:", error);
    return NextResponse.json(
      {
        data: null,
        error: { code: "INTERNAL_ERROR", message: "Something went wrong" },
      },
      { status: 500 }
    );
  }
}
