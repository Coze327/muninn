import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ index: string }> }
) {
  try {
    const { index } = await params;

    const spell = await prisma.spell.findUnique({
      where: { index },
    });

    if (!spell) {
      return NextResponse.json({ error: 'Spell not found' }, { status: 404 });
    }

    // Parse the stats JSON and return it
    const spellData = JSON.parse(spell.stats);

    return NextResponse.json(spellData);
  } catch (error) {
    console.error('Error fetching spell:', error);
    return NextResponse.json(
      { error: 'Failed to fetch spell' },
      { status: 500 }
    );
  }
}
