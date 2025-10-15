import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const cities = searchParams.get('cities')?.split(',') || [];
    
    if (cities.length === 0) {
      return NextResponse.json({ error: "No cities specified" }, { status: 400 });
    }

    // Parse city,country pairs
    const cityQueries = cities.map(item => {
      const [city, country] = item.split(':');
      return { city, country };
    });

    const history = await prisma.calculationHistory.findMany({
      where: {
        userId,
        OR: cityQueries.map(({ city, country }) => ({
          city,
          country,
        })),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error('[CALCULATION_HISTORY_COMPARE]', error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
