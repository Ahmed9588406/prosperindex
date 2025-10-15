"use client";
import React from 'react';
import { MapPin, Calendar, TrendingUp, CheckCircle2, Eye } from 'lucide-react';
import Link from 'next/link';

interface CalculationCardProps {
  id: string;
  city: string;
  country: string;
  cpi?: number;
  updatedAt?: string;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onClick?: () => void;
}

export default function CalculationCard({
  id,
  city,
  country,
  cpi,
  updatedAt,
  selected = false,
  onSelect,
  onClick,
}: CalculationCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCPIColor = (value?: number | null) => {
    if (!value) return 'bg-gray-500';
    if (value >= 8) return 'bg-green-500';
    if (value >= 6) return 'bg-yellow-500';
    if (value >= 4) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`relative bg-white/10 backdrop-blur-xl border-2 rounded-2xl p-6 transition-all duration-300 cursor-pointer group hover:scale-105 hover:shadow-2xl ${
        selected
          ? 'border-purple-500 bg-purple-500/20'
          : 'border-white/20 hover:border-purple-400'
      }`}
    >
      {/* Selection Checkbox */}
      {onSelect && (
        <button
          onClick={handleSelect}
          className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 transition-all ${
            selected
              ? 'bg-purple-600 border-purple-600'
              : 'border-white/40 hover:border-purple-400'
          }`}
        >
          {selected && <CheckCircle2 className="w-6 h-6 text-white" />}
        </button>
      )}

      {/* City Info */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-5 h-5 text-purple-400" />
          <h3 className="text-xl font-bold text-white">{city}</h3>
        </div>
        <p className="text-gray-300 text-sm">{country}</p>
      </div>

      {/* CPI Score */}
      {cpi !== undefined && cpi !== null && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">CPI Score</span>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span className="text-2xl font-bold text-white">{cpi.toFixed(2)}</span>
            </div>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full ${getCPIColor(cpi)} transition-all duration-500`}
              style={{ width: `${Math.min((cpi / 10) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Updated Date */}
      <div className="flex items-center gap-2 text-gray-400 text-sm">
        <Calendar className="w-4 h-4" />
        <span>Updated: {formatDate(updatedAt)}</span>
      </div>

      {/* View Details Button */}
      <Link
        href={`/calculation/${id}`}
        className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition"
        onClick={(e) => e.stopPropagation()}
      >
        <Eye className="w-4 h-4" />
        View Details
      </Link>

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-pink-600/0 group-hover:from-purple-600/10 group-hover:to-pink-600/10 rounded-2xl transition-all duration-300 pointer-events-none" />
    </div>
  );
}
