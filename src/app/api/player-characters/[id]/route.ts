import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

// GET /api/player-characters/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

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
      data: playerCharacter,
      error: null,
    });
  } catch (error) {
    console.error("Error fetching player character:", error);
    return NextResponse.json(
      {
        data: null,
        error: { code: "INTERNAL_ERROR", message: "Something went wrong" },
      },
      { status: 500 }
    );
  }
}

// PUT /api/player-characters/[id]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

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

    const body = await request.json();
    const { name, stats, imageUrl, campaignId } = body;

    // Ensure stats is a valid JSON string if provided
    const updateData: {
      name?: string;
      stats?: string;
      imageUrl?: string | null;
      campaignId?: string | null;
    } = {};

    if (name !== undefined) {
      updateData.name = name;
    }

    if (stats !== undefined) {
      updateData.stats = typeof stats === 'string' ? stats : JSON.stringify(stats);
    }

    if (imageUrl !== undefined) {
      updateData.imageUrl = imageUrl || null;
    }

    if (campaignId !== undefined) {
      updateData.campaignId = campaignId || null;
    }

    const updated = await prisma.playerCharacter.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      data: updated,
      error: null,
    });
  } catch (error) {
    console.error("Error updating player character:", error);
    return NextResponse.json(
      {
        data: null,
        error: { code: "INTERNAL_ERROR", message: "Something went wrong" },
      },
      { status: 500 }
    );
  }
}

// DELETE /api/player-characters/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

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

    await prisma.playerCharacter.delete({
      where: { id },
    });

    return NextResponse.json({
      data: { success: true },
      error: null,
    });
  } catch (error) {
    console.error("Error deleting player character:", error);
    return NextResponse.json(
      {
        data: null,
        error: { code: "INTERNAL_ERROR", message: "Something went wrong" },
      },
      { status: 500 }
    );
  }
}
