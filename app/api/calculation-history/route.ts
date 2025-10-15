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
        { error: "Database operation failed", details: dbError },
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
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const history = await prisma.calculationHistory.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    if (!history || history.length === 0) {
      return NextResponse.json([], { status: 200 }); // Return empty array instead of 404
    }

    return NextResponse.json(history);
  } catch (error) {
    console.error('[CALCULATION_HISTORY_GET]', error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  return handlePostRequest(req);
}