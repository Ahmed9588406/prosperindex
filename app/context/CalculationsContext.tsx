"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface CityCalculation {
  id: string;
  city: string;
  country: string;
  cityName?: string | null;
  cpi?: number | null;
  updatedAt?: string;
  createdAt?: string;
  userId?: string;
  [key: string]: unknown;
}

interface CalculationsContextType {
  calculations: CityCalculation[];
  loading: boolean;
  refreshCalculations: () => Promise<void>;
  addCalculation: (calculation: CityCalculation) => void;
  deleteCalculation: (id: string) => Promise<boolean>;
}

const CalculationsContext = createContext<CalculationsContextType | undefined>(undefined);

export function CalculationsProvider({ children }: { children: React.ReactNode }) {
  const [calculations, setCalculations] = useState<CityCalculation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCalculations = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching calculations from /api/calculation-history');
      const response = await fetch('/api/calculation-history', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });
      
      console.log('Response status:', response.status, response.statusText);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log('Received data:', data);
        console.log('Data type:', Array.isArray(data) ? 'array' : typeof data);
        console.log('Data length:', Array.isArray(data) ? data.length : 'N/A');
        
        // Ensure data is an array
        const dataArray = Array.isArray(data) ? data : [];
        
        // Transform Prisma data to match our interface
        const transformedData = dataArray.map((item: CityCalculation) => ({
          ...item,
          updatedAt: item.updatedAt || item.createdAt,
        }));
        
        console.log('Setting calculations:', transformedData);
        setCalculations(transformedData);
      } else {
        // Try to get response text first
        const responseText = await response.text();
        console.error('Failed to fetch calculations:', {
          status: response.status,
          statusText: response.statusText,
          responseText: responseText,
        });
        
        // Try to parse as JSON
        try {
          const errorData = JSON.parse(responseText);
          console.error('Error data:', errorData);
        } catch (parseError) {
          console.error('Response is not JSON:', parseError);
        }
        
        setCalculations([]);
      }
    } catch (error) {
      console.error('Error fetching calculations:', error);
      console.error('Error details:', error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error);
      setCalculations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCalculations();
  }, [fetchCalculations]);

  const refreshCalculations = useCallback(async () => {
    await fetchCalculations();
  }, [fetchCalculations]);

  const addCalculation = useCallback((calculation: CityCalculation) => {
    setCalculations(prev => {
      const existing = prev.find(c => c.id === calculation.id);
      if (existing) {
        return prev.map(c => c.id === calculation.id ? calculation : c);
      }
      return [...prev, calculation];
    });
  }, []);

  const deleteCalculation = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/calculation-history?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCalculations(prev => prev.filter(c => c.id !== id));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting calculation:', error);
      return false;
    }
  }, []);

  return (
    <CalculationsContext.Provider
      value={{
        calculations,
        loading,
        refreshCalculations,
        addCalculation,
        deleteCalculation,
      }}
    >
      {children}
    </CalculationsContext.Provider>
  );
}

export function useCalculations() {
  const context = useContext(CalculationsContext);
  if (context === undefined) {
    throw new Error('useCalculations must be used within a CalculationsProvider');
  }
  return context;
}
