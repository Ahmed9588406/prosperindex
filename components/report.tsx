/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useRef } from 'react';
import { Download, BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { CPIGauge } from './charts';

interface CityData {
  id: string;
  city: string;
  country: string;
  cpi?: number;
  updatedAt?: string;
  [key: string]: unknown;
}

interface MetricCategory {
  title: string;
  mainIndex: string;
  color: string;
  subMetrics: Array<{
    key: string;
    label: string;
  }>;
}

interface ReportProps {
  comparisonData: CityData[];
  metricCategories: MetricCategory[];
}

export default function Report({ comparisonData, metricCategories }: ReportProps) {
  const reportRef = useRef<HTMLDivElement>(null);

  const getComparison = (value1?: number, value2?: number) => {
    if (!value1 || !value2) return null;
    const diff = value1 - value2;
    if (Math.abs(diff) < 0.01) return { icon: Minus, color: 'text-gray-400', text: 'Equal' };
    if (diff > 0) return { icon: TrendingUp, color: 'text-green-500', text: `+${diff.toFixed(2)}` };
    return { icon: TrendingDown, color: 'text-red-500', text: diff.toFixed(2) };
  };

  const getComment = (score: number | string): string => {
    if (score === '-' || typeof score !== 'number') return '-';
    
    if (score >= 80) return "VERY SOLID";
    else if (score >= 70) return "SOLID";
    else if (score >= 60) return "MODERATELY SOLID";
    else if (score >= 50) return "MODERATELY WEAK";
    else if (score >= 40) return "WEAK";
    else return "VERY WEAK";
  };

  const getCommentColor = (comment: string): string => {
    switch (comment) {
      case "VERY SOLID": return "bg-green-500/20 text-green-700 border-green-500/30";
      case "SOLID": return "bg-blue-500/20 text-blue-700 border-blue-500/30";
      case "MODERATELY SOLID": return "bg-cyan-500/20 text-cyan-700 border-cyan-500/30";
      case "MODERATELY WEAK": return "bg-yellow-500/20 text-yellow-700 border-yellow-500/30";
      case "WEAK": return "bg-orange-500/20 text-orange-700 border-orange-500/30";
      case "VERY WEAK": return "bg-red-500/20 text-red-700 border-red-500/30";
      default: return "bg-gray-500/20 text-gray-700 border-gray-500/30";
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const downloadPDF = async () => {
    if (!reportRef.current) return;

    // Dynamic imports for client-side only
    const html2canvas = (await import('html2canvas')).default;
    const jsPDF = (await import('jspdf')).default;

    const element = reportRef.current;
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#0f172a'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const fileName = `city-comparison-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
  };

  if (comparisonData.length < 2) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Download Button */}
      <div className="flex justify-end">
        <button
          onClick={downloadPDF}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition shadow-lg"
        >
          <Download className="w-5 h-5" />
          Download PDF Report
        </button>
      </div>

      {/* Report Content */}
      <div ref={reportRef} className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 pb-8 border-b border-white/20">
          <h1 className="text-4xl font-bold text-white flex items-center justify-center gap-3">
            <BarChart3 className="w-10 h-10" />
            City Prosperity Index Comparison Report
          </h1>
          <p className="text-gray-300 text-lg">
            Generated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            {comparisonData.map((city) => (
              <div key={city.id} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg px-4 py-2">
                <p className="text-white font-semibold">{city.city}, {city.country}</p>
                <p className="text-gray-400 text-sm">Updated: {formatDate(city.updatedAt)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CPI Overview */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
          <h2 className="text-3xl font-semibold text-white mb-8 flex items-center gap-3">
            <BarChart3 className="w-8 h-8" />
            City Prosperity Index Overview
          </h2>
          <div className={`grid ${comparisonData.length === 2 ? 'grid-cols-2' : comparisonData.length === 3 ? 'grid-cols-3' : 'grid-cols-2'} gap-8`}>
            {comparisonData.map((city) => {
              const cpiValue = city.cpi as number | undefined;
              const comment = getComment(cpiValue || 0);
              return (
                <div key={city.id} className="flex flex-col items-center space-y-4">
                  <h3 className="text-xl font-semibold text-white text-center">
                    {city.city}, {city.country}
                  </h3>
                  <div className="bg-white rounded-xl p-6 shadow-xl">
                    <CPIGauge 
                      value={cpiValue || 0} 
                      width={250}
                      height={450}
                      showLabels={true}
                      animated={false}
                      size="medium"
                    />
                  </div>
                  {comment !== '-' && (
                    <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold border ${getCommentColor(comment)}`}>
                      {comment}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Metrics */}
        {metricCategories.map((category, catIndex) => (
          <div key={category.title} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 page-break-inside-avoid">
            {/* Category Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-2 h-12 rounded-full ${category.color}`} />
              <h3 className="text-2xl font-semibold text-white">{category.title}</h3>
            </div>

            {/* Main Index Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {comparisonData.map((city, index) => {
                const value = city[category.mainIndex] as number | undefined;
                const comment = getComment(value || 0);
                const comparison = index > 0 ? getComparison(value, comparisonData[0][category.mainIndex] as number) : null;
                const ComparisonIcon = comparison?.icon;

                return (
                  <div key={city.id} className="bg-white/5 rounded-lg p-4">
                    <div className="text-white font-medium mb-2">
                      {city.city}, {city.country}
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-3xl font-bold text-white">
                        {value?.toFixed(2) || 'N/A'}
                      </div>
                      {comparison && ComparisonIcon && (
                        <div className={`flex items-center gap-1 ${comparison.color}`}>
                          <ComparisonIcon className="w-5 h-5" />
                          <span className="text-sm font-medium">{comparison.text}</span>
                        </div>
                      )}
                    </div>
                    {comment !== '-' && (
                      <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getCommentColor(comment)} mb-2`}>
                        {comment}
                      </div>
                    )}
                    <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${category.color}`}
                        style={{ width: `${Math.min((value || 0) * 10, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sub-Metrics */}
            {category.subMetrics.length > 0 && (
              <div className="space-y-4 border-t border-white/10 pt-6">
                <h4 className="text-lg font-semibold text-gray-300 mb-4">Detailed Metrics</h4>
                {category.subMetrics.map((subMetric) => (
                  <div key={subMetric.key} className="bg-white/5 rounded-lg p-4">
                    <h5 className="text-sm font-medium text-gray-300 mb-3">{subMetric.label}</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {comparisonData.map((city, index) => {
                        const value = city[subMetric.key] as number | undefined;
                        const comparison = index > 0 ? getComparison(value, comparisonData[0][subMetric.key] as number) : null;
                        const ComparisonIcon = comparison?.icon;

                        return (
                          <div key={city.id} className="bg-white/5 rounded-lg p-3">
                            <div className="text-xs text-gray-400 mb-1">
                              {city.city}
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-lg font-semibold text-white">
                                {value?.toFixed(2) || 'N/A'}
                              </div>
                              {comparison && ComparisonIcon && (
                                <div className={`flex items-center gap-1 ${comparison.color}`}>
                                  <ComparisonIcon className="w-4 h-4" />
                                  <span className="text-xs">{comparison.text}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Footer */}
        <div className="text-center pt-8 border-t border-white/20">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} City Prosperity Index | Generated by ProsperIndex Platform
          </p>
        </div>
      </div>
    </div>
  );
}
