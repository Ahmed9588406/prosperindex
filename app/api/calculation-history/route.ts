// api/calculation-history/route.ts

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

// Reusable function for handling POST requests
const handlePostRequest = async (req: Request) => {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    console.log('Received data:', data); // Debug log

    // Validate the data
    if (!data || Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No data provided" }, { status: 400 });
    }

    const { city, country, ...calculationData } = data;

    if (!city || !country) {
      return NextResponse.json({ error: "City and country are required" }, { status: 400 });
    }

    // Find existing record by userId AND city/country
    const existingRecord = await prisma.calculationHistory.findFirst({
      where: {
        userId,
        city,
        country,
      },
    });

    const updateData = {
      ...calculationData,
      city,
      country,
      userId,
      updatedAt: new Date(),
    };
    delete updateData.id; // Remove id if present

    let result;
    try {
      if (existingRecord) {
        result = await prisma.calculationHistory.update({
          where: { id: existingRecord.id },
          data: updateData,
        });
      } else {
        result = await prisma.calculationHistory.create({
          data: updateData,
        });
      }
      console.log('Stored result:', result); // Debug log
      return NextResponse.json(result);
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: "Database operation failed", details: dbError instanceof Error ? dbError.message : String(dbError) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[POST_REQUEST]', error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

export async function GET() {
  console.log('GET /api/calculation-history called');
  
  try {
    console.log('Starting auth check...');
    const authResult = await auth();
    const userId = authResult?.userId;
    console.log('Auth result - userId:', userId);
    
    if (!userId) {
      console.log('No userId found - returning 401');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log('Fetching calculations for userId:', userId);

    try {
      const history = await prisma.calculationHistory.findMany({
        where: {
          userId: userId,
          city: { not: null },
          country: { not: null },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });

      console.log('Found calculations:', history?.length ?? 0);

      return NextResponse.json(history || [], { status: 200 });
    } catch (dbError) {
      const errorMessage = dbError instanceof Error ? dbError.message : 'Database query failed';
      console.error('[CALCULATION_HISTORY_GET] Database error:', errorMessage);
      return NextResponse.json(
        { error: "Database error", details: errorMessage },
        { status: 500 }
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[CALCULATION_HISTORY_GET] Error:', errorMessage);
    return NextResponse.json(
      { error: "Internal Server Error", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  return handlePostRequest(req);
}

export async function DELETE(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    // Verify ownership before deleting
    const calculation = await prisma.calculationHistory.findUnique({
      where: { id },
    });

    if (!calculation || calculation.userId !== userId) {
      return NextResponse.json({ error: "Calculation not found" }, { status: 404 });
    }

    await prisma.calculationHistory.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[CALCULATION_HISTORY_DELETE]', error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}