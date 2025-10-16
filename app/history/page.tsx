"use client";
import React, { useState, useEffect } from 'react';
import { ArrowLeft, History, Search, GitCompare, Plus, Trash2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCalculations } from '../context/CalculationsContext';
import CalculationCard from '@/components/CalculationCard';



export default function HistoryPage() {
  const router = useRouter();
  const { calculations, loading, deleteCalculation, refreshCalculations } = useCalculations();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCalculations, setSelectedCalculations] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredCalculations = calculations.filter(calc =>
    calc.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    calc.country?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshCalculations();
    setRefreshing(false);
  };

  const handleSelectCalculation = (id: string) => {
    setSelectedCalculations(prev => {
      if (prev.includes(id)) {
        return prev.filter(calcId => calcId !== id);
      } else if (prev.length < 5) {
        return [...prev, id];
      }
      return prev;
    });
  };

  const handleCompareSelected = () => {
    if (selectedCalculations.length >= 2) {
      // Navigate to comparison page with pre-selected cities
      router.push(`/comparison?selected=${selectedCalculations.join(',')}`);
    }
  };

  const handleDeleteCalculation = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this calculation?')) {
      return;
    }

    const success = await deleteCalculation(id);
    if (success) {
      setSelectedCalculations(prev => prev.filter(calcId => calcId !== id));
    }
  };

  const clearSelection = () => {
    setSelectedCalculations([]);
  };

  if (loading || !mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading calculations...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/home" className="text-white hover:text-purple-300 transition">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
            <History className="w-8 h-8" />
            Calculation History
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="text-white hover:text-purple-300 transition p-2"
              title="Refresh calculations"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <Link
              href="/cities"
              className="text-white hover:text-purple-300 transition bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">New Calculation</span>
            </Link>
          </div>
        </div>

        {/* Search and Actions Bar */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 w-full md:w-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by city or country..."
                className="w-full bg-white/10 border border-white/20 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-400 outline-none focus:border-purple-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 w-full md:w-auto">
              {selectedCalculations.length > 0 && (
                <>
                  <button
                    onClick={clearSelection}
                    className="flex-1 md:flex-initial bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-lg transition"
                  >
                    Clear ({selectedCalculations.length})
                  </button>
                  <button
                    onClick={handleCompareSelected}
                    disabled={selectedCalculations.length < 2}
                    className="flex-1 md:flex-initial bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg flex items-center gap-2 transition"
                  >
                    <GitCompare className="w-5 h-5" />
                    Compare {selectedCalculations.length >= 2 ? `(${selectedCalculations.length})` : ''}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Selection Info */}
          {selectedCalculations.length > 0 && (
            <div className="mt-4 p-3 bg-purple-600/20 border border-purple-500/30 rounded-lg">
              <p className="text-sm text-purple-200">
                {selectedCalculations.length} calculation{selectedCalculations.length !== 1 ? 's' : ''} selected
                {selectedCalculations.length >= 2 && selectedCalculations.length <= 5
                  ? ' - Click Compare to view side-by-side'
                  : selectedCalculations.length === 1
                  ? ' - Select at least one more to compare'
                  : selectedCalculations.length > 5
                  ? ' - Maximum 5 calculations can be compared'
                  : ''}
              </p>
            </div>
          )}

          {/* Total Count */}
          <div className="mt-4 text-sm text-gray-400">
            Total calculations: {calculations.length}
          </div>
        </div>

        {/* Calculations Grid */}
        {filteredCalculations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCalculations.map((calc) => (
              <div key={calc.id} className="relative group">
                <CalculationCard
                  {...calc}
                  cpi={calc.cpi ?? undefined}
                  selected={selectedCalculations.includes(calc.id)}
                  onSelect={handleSelectCalculation}
                  onClick={() => {
                    if (selectedCalculations.length === 0) {
                      router.push(`/comparison?selected=${calc.id}`);
                    }
                  }}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCalculation(calc.id);
                  }}
                  className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition bg-red-500 hover:bg-red-600 p-2 rounded-full shadow-lg z-10"
                  title="Delete this calculation"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-12 text-center">
            <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchQuery ? 'No Results Found' : 'No Calculations Yet'}
            </h3>
            <p className="text-gray-300 mb-6">
              {searchQuery
                ? 'Try adjusting your search terms'
                : 'Start by calculating city prosperity indices'}
            </p>
            {!searchQuery && (
              <Link
                href="/cities"
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition"
              >
                <Plus className="w-5 h-5" />
                Create New Calculation
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}