import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

// Validation schema for creating a combat
const createCombatSchema = z.object({
  campaignId: z.string().min(1, "Campaign ID is required"),
  name: z.string().max(100, "Name too long").nullable().optional(),
});

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

    const { campaignId, name } = result.data;

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

    // Create the combat
    const combat = await prisma.combat.create({
      data: {
        name: name || null,
        campaignId,
        status: "PREP",
        round: 1,
        turnIndex: 0,
      },
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
