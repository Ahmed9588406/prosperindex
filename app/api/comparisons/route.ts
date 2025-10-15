import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

// Get all saved comparisons for a user
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const comparisons = await prisma.cityComparison.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(comparisons);
  } catch (error) {
    console.error('[COMPARISONS_GET]', error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Save a new comparison
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { comparisonName, cities } = await req.json();

    if (!comparisonName || !cities || cities.length === 0) {
      return NextResponse.json(
        { error: "Comparison name and cities are required" },
        { status: 400 }
      );
    }

    const comparison = await prisma.cityComparison.create({
      data: {
        userId,
        comparisonName,
        cities,
      },
    });

    return NextResponse.json(comparison);
  } catch (error) {
    console.error('[COMPARISONS_POST]', error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Delete a comparison
export async function DELETE(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "Comparison ID required" }, { status: 400 });
    }

    await prisma.cityComparison.delete({
      where: { id, userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[COMPARISONS_DELETE]', error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
