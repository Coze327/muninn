import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

// Validation schema for creating a campaign
const createCampaignSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  gameSystem: z.enum(["5E", "DAGGERHEART"], {
    message: "Invalid game system",
  }),
});

// GET /api/campaigns - List all campaigns for the authenticated user
export async function GET() {
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

    const campaigns = await prisma.campaign.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        _count: {
          select: { combats: true },
        },
      },
    });

    return NextResponse.json({
      data: campaigns,
      error: null,
    });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json(
      {
        data: null,
        error: { code: "INTERNAL_ERROR", message: "Something went wrong" },
      },
      { status: 500 }
    );
  }
}

// POST /api/campaigns - Create a new campaign
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
    const result = createCampaignSchema.safeParse(body);
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

    const { name, gameSystem } = result.data;

    // Create the campaign
    const campaign = await prisma.campaign.create({
      data: {
        name,
        gameSystem,
        userId: session.user.id,
      },
    });

    return NextResponse.json(
      {
        data: campaign,
        error: null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating campaign:", error);
    return NextResponse.json(
      {
        data: null,
        error: { code: "INTERNAL_ERROR", message: "Something went wrong" },
      },
      { status: 500 }
    );
  }
}
