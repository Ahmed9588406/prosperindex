"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import CardDetails from '@/components/CardDetails';

interface Calculation {
  id: string;
  userId: string;
  city?: string | null;
  country?: string | null;
  cityName?: string | null;
  cpi?: number | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  [key: string]: string | number | Date | null | undefined;
}

export default function CalculationDetailsPage() {
  const params = useParams();
  const [calculation, setCalculation] = useState<Calculation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCalculation = async () => {
      try {
        const response = await fetch(`/api/calculation-history/${params.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch calculation');
        }

        const data = await response.json();
        setCalculation(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchCalculation();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading calculation details...</div>
      </div>
    );
  }

  if (error || !calculation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Error: {error || 'Calculation not found'}</div>
      </div>
    );
  }

  return <CardDetails calculation={calculation} />;
}
