/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCity } from "../../../context/CityContext";
import { useUser } from '@clerk/nextjs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import toast from "react-hot-toast";

interface IndicatorData {
  indicator: string;
  actual: number | string;
  unit: string;
  standardized: number;
  comment: string;
}

function SocialInfrastructureSubDimension() {
    const router = useRouter();
    const { city, country, cityName } = useCity();
    const { user, isLoaded } = useUser();
    const [loading, setLoading] = useState(true);
    const [calculationData, setCalculationData] = useState<any>(null);

    const handleCardClick = (id: number) => {
      if (id === 1) {
        router.push("/home/ID/SI/Physiscian_Density");
      } else if (id === 2) {
        router.push("/home/ID/SI/Number_of_libraries");
      }
    };

    useEffect(() => {
      const fetchData = async () => {
        if (!isLoaded || !user) {
          setLoading(false);
          return;
        }
        if (!city || !country) {
          setLoading(false);
          return;
        }
        try {
          setLoading(true);
          const response = await fetch('/api/calculation-history');
          if (!response.ok) throw new Error('Failed to fetch data');
          const history = await response.json();
          const cityData = history.find(
            (record: any) => record.city === city && record.country === country
          );
          if (cityData) {
            setCalculationData(cityData);
          } else {
            setCalculationData(null);
          }
        } catch (error) {
          console.error('Error fetching calculation data:', error);
          toast.error('Failed to load calculation data');
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }, [city, country, user, isLoaded]);

    const getSocialInfrastructureData = (): IndicatorData[] => {
      if (!calculationData) return [];
      const data: IndicatorData[] = [];
      if (calculationData.physicians_density !== null && calculationData.physicians_density !== undefined) {
        data.push({
          indicator: "Physicians Density",
          actual: calculationData.physicians_density?.toFixed(2) || "N/A",
          unit: "per 10,000 people",
          standardized: calculationData.physicians_density_standardized || 0,
          comment: calculationData.physicians_density_comment || "N/A"
        });
      }
      if (calculationData.number_of_public_libraries !== null && calculationData.number_of_public_libraries !== undefined) {
        data.push({
          indicator: "Number of Public Libraries",
          actual: calculationData.number_of_public_libraries?.toFixed(2) || "N/A",
          unit: "per 100,000 people",
          standardized: calculationData.number_of_public_libraries_standardized || 0,
          comment: calculationData.number_of_public_libraries_comment || "N/A"
        });
      }
      return data;
    };

    const siData = getSocialInfrastructureData();
    const chartData = siData.map((item, index) => ({
      name: item.indicator,
      value: item.standardized,
      color: ['#66BB6A', '#4CAF50'][index] || '#888888'
    }));

    const calculateAverage = (): number => {
      if (siData.length === 0) return 0;
      const sum = siData.reduce((total, item) => total + item.standardized, 0);
      return sum / siData.length;
    };

    const siAverage = calculateAverage();

    const CustomTooltip = ({ active, payload }: any) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
            <p className="font-semibold text-gray-800">{payload[0].payload.name}</p>
            <p className="text-green-600 font-bold">{payload[0].value.toFixed(1)}%</p>
          </div>
        );
      }
      return null;
    };

    if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading social infrastructure data...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Social Infrastructure</h1>
            {city && country && (
              <p className="text-lg text-gray-600 mb-4"> {cityName || `${city}, ${country}`}</p>
            )}
            <div className="inline-block bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-full shadow-lg">
              <span className="text-3xl font-bold">
                {siData.length > 0 ? `${siAverage.toFixed(1)}%` : "N/A"}
              </span>
            </div>
          </div>

          {(!city || !country) && (
            <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg">
              <p className="text-sm text-yellow-800"> Please select a city from the cities page first</p>
            </div>
          )}

          {city && country && siData.length === 0 && (
            <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
              <p className="text-sm text-blue-800"> No calculation data available for this city. Please calculate indicators below.</p>
            </div>
          )}

          {siData.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4">
                <h2 className="text-2xl font-bold text-white">Social Infrastructure Sub-Dimension ({siAverage.toFixed(1)}%)</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 border-b-2 border-gray-300">Indicator</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 border-b-2 border-gray-300">Actual</th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 border-b-2 border-gray-300">Units</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 border-b-2 border-gray-300">Standardized</th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 border-b-2 border-gray-300">Comment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {siData.map((item, index) => (
                      <tr key={index} className="hover:bg-green-50 transition-colors border-b border-gray-200">
                        <td className="px-6 py-4 text-gray-700 font-medium">{item.indicator}</td>
                        <td className="px-6 py-4 text-right font-semibold text-gray-800">{item.actual}</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">{item.unit}</td>
                        <td className="px-6 py-4 text-right">
                          <span className="inline-block px-3 py-1 rounded-full font-semibold text-sm"
                            style={{
                              backgroundColor: item.standardized >= 80 ? '#E8F5E9' : 
                                               item.standardized >= 60 ? '#FFF9C4' : '#FFEBEE',
                              color: item.standardized >= 80 ? '#2E7D32' : 
                                     item.standardized >= 60 ? '#F57F17' : '#C62828'
                            }}>
                            {item.standardized.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                            item.comment.includes('VERY SOLID') ? 'bg-green-100 text-green-800' :
                            item.comment.includes('SOLID') ? 'bg-blue-100 text-blue-800' :
                            item.comment.includes('MODERATELY SOLID') ? 'bg-yellow-100 text-yellow-800' :
                            item.comment.includes('MODERATELY WEAK') ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {item.comment}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {siData.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Social Infrastructure Indicators Chart</h2>
              <div className="w-full" style={{ height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 11, fill: '#666' }} interval={0} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#666' }} label={{ value: 'Standardized Value (%)', angle: -90, position: 'insideLeft', style: { fontSize: 14, fill: '#666' } }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Calculate Indicators</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="relative group bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl cursor-pointer" onClick={() => handleCardClick(1)}>
                <div className="flex flex-col items-center p-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mb-4 shadow-lg transform transition-all duration-300 group-hover:shadow-xl group-hover:scale-110">
                    <span className="text-3xl">👨‍⚕️</span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-800 mb-2 text-center">Physicians Density</h4>
                  <p className="text-sm text-green-600 font-semibold">
                    {siData.find(d => d.indicator === "Physicians Density")?.standardized.toFixed(1) || "N/A"}%
                  </p>
                </div>
              </div>

              <div className="relative group bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl cursor-pointer" onClick={() => handleCardClick(2)}>
                <div className="flex flex-col items-center p-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mb-4 shadow-lg transform transition-all duration-300 group-hover:shadow-xl group-hover:scale-110">
                    <span className="text-3xl">📚</span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-800 mb-2 text-center">Number of Public Libraries</h4>
                  <p className="text-sm text-green-600 font-semibold">
                    {siData.find(d => d.indicator === "Number of Public Libraries")?.standardized.toFixed(1) || "N/A"}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  export default SocialInfrastructureSubDimension;