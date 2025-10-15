import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupNullCities() {
  try {
    // Find records with null city or country
    const recordsWithNulls = await prisma.$runCommandRaw({
      find: 'CalculationHistory',
      filter: {
        $or: [
          { city: null },
          { country: null }
        ]
      }
    });

    console.log('Found records with null values:', recordsWithNulls);

    // Option 1: Delete them
    // await prisma.calculationHistory.deleteMany({
    //   where: {
    //     OR: [
    //       { city: null },
    //       { country: null }
    //     ]
    //   }
    // });

    // Option 2: Update them with default values
    // You'll need to use raw MongoDB commands for this
    
    console.log('Cleanup complete');
  } catch (error) {
    console.error('Cleanup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupNullCities();
