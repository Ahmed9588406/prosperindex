/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCity } from "../../context/CityContext";
import { useUser } from '@clerk/nextjs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import toast from "react-hot-toast";

interface SubDimensionData {
  subDimension: string;
  average: number;
}

interface IndicatorDetail {
  name: string;
  actual: number | string;
  unit: string;
  standardized: number;
  comment: string;
}

interface SubDimensionDetail {
  subDimension: string;
  average: number;
  comment: string;
  indicators: IndicatorDetail[];
}

function UrbanGovernanceAndLegislationIndex() {
  const router = useRouter();
  const { city, country, cityName } = useCity();
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const [calculationData, setCalculationData] = useState<any>(null);

  const handleCardClick = (id: number) => {
    if (id === 1) {
      router.push("/home/UGL/P");
    } else if (id === 2) {
      router.push("/home/UGL/MFIC");
    } else if (id === 3) {
      router.push("/home/UGL/GU");
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

  const getDetailedGovernanceData = (): SubDimensionDetail[] => {
    if (!calculationData) return [];
    const data: SubDimensionDetail[] = [];
    
    // Participation - 3 indicators
    const participationIndicators: IndicatorDetail[] = [];
    if (calculationData.voter_turnout !== null && calculationData.voter_turnout !== undefined) {
      participationIndicators.push({
        name: "Voter Turnout",
        actual: calculationData.voter_turnout?.toFixed(2) || "N/A",
        unit: "%",
        standardized: calculationData.voter_turnout_standardized || 0,
        comment: calculationData.voter_turnout_comment || "N/A"
      });
    }
    if (calculationData.civic_participation !== null && calculationData.civic_participation !== undefined) {
      participationIndicators.push({
        name: "Civic Participation",
        actual: calculationData.civic_participation?.toFixed(2) || "N/A",
        unit: "%",
        standardized: calculationData.civic_participation_standardized || 0,
        comment: calculationData.civic_participation_comment || "N/A"
      });
    }
    if (calculationData.access_to_public_information !== null && calculationData.access_to_public_information !== undefined) {
      participationIndicators.push({
        name: "Access to Public Information",
        actual: calculationData.access_to_public_information?.toFixed(2) || "N/A",
        unit: "%",
        standardized: calculationData.access_to_public_information_standardized || 0,
        comment: calculationData.access_to_public_information_comment || "N/A"
      });
    }
    
    if (participationIndicators.length > 0) {
      const participationAvg = participationIndicators.reduce((sum, item) => sum + item.standardized, 0) / participationIndicators.length;
      const participationComment = participationAvg >= 80 ? "VERY SOLID DATA" : participationAvg >= 60 ? "SOLID DATA" : participationAvg >= 40 ? "MODERATELY SOLID DATA" : participationAvg >= 20 ? "MODERATELY WEAK DATA" : "WEAK DATA";
      data.push({ subDimension: "Participation", average: participationAvg, comment: participationComment, indicators: participationIndicators });
    }
    
    // Municipal Financing and Institutional Capacity - 4 indicators
    const mficIndicators: IndicatorDetail[] = [];
    if (calculationData.own_revenue_collection !== null && calculationData.own_revenue_collection !== undefined) {
      mficIndicators.push({
        name: "Own Revenue Collection",
        actual: calculationData.own_revenue_collection?.toFixed(2) || "N/A",
        unit: "%",
        standardized: calculationData.own_revenue_collection_standardized || 0,
        comment: calculationData.own_revenue_collection_comment || "N/A"
      });
    }
    if (calculationData.subnational_debt !== null && calculationData.subnational_debt !== undefined) {
      mficIndicators.push({
        name: "Subnational Debt",
        actual: calculationData.subnational_debt?.toFixed(2) || "N/A",
        unit: "%",
        standardized: calculationData.subnational_debt_standardized || 0,
        comment: calculationData.subnational_debt_comment || "N/A"
      });
    }
    if (calculationData.days_to_start_a_business !== null && calculationData.days_to_start_a_business !== undefined) {
      mficIndicators.push({
        name: "Days to Start A Business",
        actual: calculationData.days_to_start_a_business?.toFixed(2) || "N/A",
        unit: "days",
        standardized: calculationData.days_to_start_a_business_standardized || 0,
        comment: calculationData.days_to_start_a_business_comment || "N/A"
      });
    }
    if (calculationData.local_expenditure_efficiency !== null && calculationData.local_expenditure_efficiency !== undefined) {
      mficIndicators.push({
        name: "Local Expenditure Efficiency",
        actual: calculationData.local_expenditure_efficiency?.toFixed(2) || "N/A",
        unit: "%",
        standardized: calculationData.local_expenditure_efficiency_standardized || 0,
        comment: calculationData.local_expenditure_efficiency_comment || "N/A"
      });
    }
    
    if (mficIndicators.length > 0) {
      const mficAvg = mficIndicators.reduce((sum, item) => sum + item.standardized, 0) / mficIndicators.length;
      const mficComment = mficAvg >= 80 ? "VERY SOLID DATA" : mficAvg >= 60 ? "SOLID DATA" : mficAvg >= 40 ? "MODERATELY SOLID DATA" : mficAvg >= 20 ? "MODERATELY WEAK DATA" : "WEAK DATA";
      data.push({ subDimension: "Municipal Financing and Institutional Capacity", average: mficAvg, comment: mficComment, indicators: mficIndicators });
    }
    
    // Governance of Urbanization - 1 indicator
    const governanceIndicators: IndicatorDetail[] = [];
    if (calculationData.land_use_efficiency !== null && calculationData.land_use_efficiency !== undefined) {
      governanceIndicators.push({
        name: "Land Use Efficiency",
        actual: calculationData.land_use_efficiency?.toFixed(2) || "N/A",
        unit: "%",
        standardized: calculationData.land_use_efficiency_standardized || 0,
        comment: calculationData.land_use_efficiency_comment || "N/A"
      });
    }
    
    if (governanceIndicators.length > 0) {
      const governanceAvg = governanceIndicators.reduce((sum, item) => sum + item.standardized, 0) / governanceIndicators.length;
      const governanceComment = governanceAvg >= 80 ? "VERY SOLID DATA" : governanceAvg >= 60 ? "SOLID DATA" : governanceAvg >= 40 ? "MODERATELY SOLID DATA" : governanceAvg >= 20 ? "MODERATELY WEAK DATA" : "WEAK DATA";
      data.push({ subDimension: "Governance of Urbanization", average: governanceAvg, comment: governanceComment, indicators: governanceIndicators });
    }
    
    return data;
  };

  const governanceData = getDetailedGovernanceData();
  
  const getChartData = () => {
    return governanceData.map((item, index) => ({
      name: item.subDimension,
      value: item.average,
      color: ['#4FC3F7', '#66BB6A', '#9C27B0'][index] || '#888888'
    }));
  };

  const chartData = getChartData();

  const calculateGovernanceIndex = (): number => {
    if (governanceData.length === 0) return 0;
    const sum = governanceData.reduce((total, item) => total + item.average, 0);
    return sum / governanceData.length;
  };

  const governanceIndex = calculateGovernanceIndex();
  
  const getGovernanceIndexComment = (): string => {
    if (governanceIndex >= 80) return "VERY SOLID DATA";
    if (governanceIndex >= 60) return "SOLID DATA";
    if (governanceIndex >= 40) return "MODERATELY SOLID DATA";
    if (governanceIndex >= 20) return "MODERATELY WEAK DATA";
    return "WEAK DATA";
  };
  
  const governanceIndexComment = getGovernanceIndexComment();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800">{payload[0].payload.name}</p>
          <p className="text-blue-600 font-bold">{payload[0].value.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading governance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Urban Governance and Legislation Index</h1>
          {city && country && (
            <p className="text-lg text-gray-600 mb-4">📍 {cityName || `${city}, ${country}`}</p>
          )}
          <div className="inline-block bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-full shadow-lg">
            <span className="text-3xl font-bold">
              {governanceData.length > 0 ? `${governanceIndex.toFixed(1)}%` : "N/A"}
            </span>
          </div>
        </div>

        {(!city || !country) && (
          <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg">
            <p className="text-sm text-yellow-800">⚠️ Please select a city from the cities page first</p>
          </div>
        )}

        {city && country && governanceData.length === 0 && (
          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
            <p className="text-sm text-blue-800">ℹ️ No calculation data available for this city. Please calculate indicators in the sub-dimensions below.</p>
          </div>
        )}

        {governanceData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Urban Governance and Legislation Index - Detailed View</h2>
            <div className="flex items-center gap-3">
              <span className="inline-block px-4 py-2 rounded-full font-bold text-lg bg-white text-purple-600">
                {governanceIndex.toFixed(1)}%
              </span>
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                governanceIndexComment.includes('VERY SOLID') ? 'bg-green-100 text-green-800' :
                governanceIndexComment.includes('SOLID') && !governanceIndexComment.includes('MODERATELY') ? 'bg-blue-100 text-blue-800' :
                governanceIndexComment.includes('MODERATELY SOLID') ? 'bg-yellow-100 text-yellow-800' :
                governanceIndexComment.includes('MODERATELY WEAK') ? 'bg-orange-100 text-orange-800' :
                'bg-red-100 text-red-800'
              }`}>
                {governanceIndexComment}
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 border border-gray-300">Sub-Dimension</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 border border-gray-300">Indicator</th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-gray-700 border border-gray-300">Actual</th>
                  <th className="px-4 py-3 text-center text-sm font-bold text-gray-700 border border-gray-300">Units</th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-gray-700 border border-gray-300">Standardized</th>
                  <th className="px-4 py-3 text-center text-sm font-bold text-gray-700 border border-gray-300">Comment</th>
                </tr>
              </thead>
              <tbody>
                {governanceData.map((subDim, subIndex) => (
                  <React.Fragment key={subIndex}>
                    {subDim.indicators.map((indicator, indIndex) => (
                      <tr key={indIndex} className="hover:bg-purple-50 transition-colors">
                        {indIndex === 0 && (
                          <td className="px-4 py-3 text-gray-900 font-bold border border-gray-300 bg-purple-50 align-top" rowSpan={subDim.indicators.length}>
                            <div className="flex flex-col gap-2">
                              <span>{subDim.subDimension}</span>
                              <span className="inline-block px-2 py-1 rounded-full font-bold text-xs bg-purple-600 text-white text-center">
                                ({subDim.average.toFixed(1)}%)
                              </span>
                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold text-center ${
                                subDim.comment.includes('VERY SOLID') ? 'bg-green-100 text-green-800' :
                                subDim.comment.includes('SOLID') && !subDim.comment.includes('MODERATELY') ? 'bg-blue-100 text-blue-800' :
                                subDim.comment.includes('MODERATELY SOLID') ? 'bg-yellow-100 text-yellow-800' :
                                subDim.comment.includes('MODERATELY WEAK') ? 'bg-orange-100 text-orange-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {subDim.comment}
                              </span>
                            </div>
                          </td>
                        )}
                        <td className="px-4 py-3 text-gray-700 border border-gray-300">{indicator.name}</td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-800 border border-gray-300">{indicator.actual}</td>
                        <td className="px-4 py-3 text-center text-sm text-gray-600 border border-gray-300">{indicator.unit}</td>
                        <td className="px-4 py-3 text-right border border-gray-300">
                          <span className="inline-block px-2 py-1 rounded text-xs font-semibold"
                            style={{
                              backgroundColor: indicator.standardized >= 80 ? '#E8F5E9' : 
                                               indicator.standardized >= 60 ? '#FFF9C4' : '#FFEBEE',
                              color: indicator.standardized >= 80 ? '#2E7D32' : 
                                     indicator.standardized >= 60 ? '#F57F17' : '#C62828'
                            }}>
                            {indicator.standardized.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center border border-gray-300">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                            indicator.comment.includes('VERY SOLID') ? 'bg-green-100 text-green-800' :
                            indicator.comment.includes('SOLID') && !indicator.comment.includes('MODERATELY') ? 'bg-blue-100 text-blue-800' :
                            indicator.comment.includes('MODERATELY SOLID') ? 'bg-yellow-100 text-yellow-800' :
                            indicator.comment.includes('MODERATELY WEAK') ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {indicator.comment}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {governanceData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Urban Governance and Legislation Sub-Dimensions Chart</h2>
          <div className="w-full" style={{ height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} tick={{ fontSize: 11, fill: '#666' }} interval={0} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#666' }} label={{ value: 'Average Value (%)', angle: -90, position: 'insideLeft', style: { fontSize: 14, fill: '#666' } }} />
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
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Explore Sub-Dimensions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="relative group bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl cursor-pointer" onClick={() => handleCardClick(1)}>
              <div className="flex flex-col items-center p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-full flex items-center justify-center mb-4 shadow-lg transform transition-all duration-300 group-hover:shadow-xl group-hover:scale-110">
                  <span className="text-3xl">🗳️</span>
                </div>
                <h4 className="text-xl font-bold text-gray-800 mb-2 text-center">Participation</h4>
                <p className="text-sm text-cyan-600 font-semibold">
                  {governanceData.find(d => d.subDimension === "Participation")?.average.toFixed(1) || "N/A"}%
                </p>
              </div>
            </div>

            <div className="relative group bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl cursor-pointer" onClick={() => handleCardClick(2)}>
              <div className="flex flex-col items-center p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mb-4 shadow-lg transform transition-all duration-300 group-hover:shadow-xl group-hover:scale-110">
                  <span className="text-3xl">💰</span>
                </div>
                <h4 className="text-xl font-bold text-gray-800 mb-2 text-center">Municipal Financing and Institutional Capacity</h4>
                <p className="text-sm text-green-600 font-semibold">
                  {governanceData.find(d => d.subDimension === "Municipal Financing and Institutional Capacity")?.average.toFixed(1) || "N/A"}%
                </p>
              </div>
            </div>

            <div className="relative group bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl cursor-pointer" onClick={() => handleCardClick(3)}>
              <div className="flex flex-col items-center p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mb-4 shadow-lg transform transition-all duration-300 group-hover:shadow-xl group-hover:scale-110">
                  <span className="text-3xl">🏛️</span>
                </div>
                <h4 className="text-xl font-bold text-gray-800 mb-2 text-center">Governance of Urbanization</h4>
                <p className="text-sm text-purple-600 font-semibold">
                  {governanceData.find(d => d.subDimension === "Governance of Urbanization")?.average.toFixed(1) || "N/A"}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UrbanGovernanceAndLegislationIndex;
