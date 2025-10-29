/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCity } from "../../context/CityContext";
import { useUser } from '@clerk/nextjs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import toast from "react-hot-toast";

interface IndicatorData {
  indicator: string;
  actual: number | string;
  unit: string;
  standardized: number;
  comment: string;
  subDimension: string;
}

function QualityOfLifeIndex() {
  const router = useRouter();
  const { city, country, cityName } = useCity();
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const [calculationData, setCalculationData] = useState<any>(null);

  const handleCardClick = (id: number) => {
    if (id === 1) {
      router.push("/home/QOL/H");
    } else if (id === 2) {
      router.push("/home/QOL/E");
    } else if (id === 3) {
      router.push("/home/QOL/SS");
    } else if (id === 4) {
      router.push("/home/QOL/PS");
    }
  };

  // Fetch calculation data from the database
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
        
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

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

  // Build dynamic data structure from database
  const getQualityOfLifeData = (): IndicatorData[] => {
    if (!calculationData) return [];
    const data: IndicatorData[] = [];

    // Health indicators
    if (calculationData.life_expectancy_at_birth !== null && calculationData.life_expectancy_at_birth !== undefined) {
      data.push({
        subDimension: "Health",
        indicator: "Life Expectancy at Birth",
        actual: calculationData.life_expectancy_at_birth?.toFixed(2) || "N/A",
        unit: "years",
        standardized: calculationData.life_expectancy_at_birth_standardized || 0,
        comment: calculationData.life_expectancy_at_birth_comment || "N/A"
      });
    }
    if (calculationData.under_five_mortality_rate !== null && calculationData.under_five_mortality_rate !== undefined) {
      data.push({
        subDimension: "Health",
        indicator: "Under Five Mortality Rate",
        actual: calculationData.under_five_mortality_rate?.toFixed(2) || "N/A",
        unit: "per 1,000 live births",
        standardized: calculationData.under_five_mortality_rate_standardized || 0,
        comment: calculationData.under_five_mortality_rate_comment || "N/A"
      });
    }
    if (calculationData.vaccination_coverage !== null && calculationData.vaccination_coverage !== undefined) {
      data.push({
        subDimension: "Health",
        indicator: "Vaccination Coverage",
        actual: calculationData.vaccination_coverage?.toFixed(2) || "N/A",
        unit: "%",
        standardized: calculationData.vaccination_coverage_standardized || 0,
        comment: calculationData.vaccination_coverage_comment || "N/A"
      });
    }
    if (calculationData.maternal_mortality !== null && calculationData.maternal_mortality !== undefined) {
      data.push({
        subDimension: "Health",
        indicator: "Maternal Mortality",
        actual: calculationData.maternal_mortality?.toFixed(2) || "N/A",
        unit: "per 100,000 live births",
        standardized: calculationData.maternal_mortality_standardized || 0,
        comment: calculationData.maternal_mortality_comment || "N/A"
      });
    }

    // Education indicators
    if (calculationData.literacy_rate !== null && calculationData.literacy_rate !== undefined) {
      data.push({
        subDimension: "Education",
        indicator: "Literacy Rate",
        actual: calculationData.literacy_rate?.toFixed(2) || "N/A",
        unit: "%",
        standardized: calculationData.literacy_rate_standardized || 0,
        comment: calculationData.literacy_rate_comment || "N/A"
      });
    }
    if (calculationData.mean_years_of_schooling !== null && calculationData.mean_years_of_schooling !== undefined) {
      data.push({
        subDimension: "Education",
        indicator: "Mean Years of Schooling",
        actual: calculationData.mean_years_of_schooling?.toFixed(2) || "N/A",
        unit: "years",
        standardized: calculationData.mean_years_of_schooling_standardized || 0,
        comment: calculationData.mean_years_of_schooling_comment || "N/A"
      });
    }
    if (calculationData.early_childhood_education !== null && calculationData.early_childhood_education !== undefined) {
      data.push({
        subDimension: "Education",
        indicator: "Early Childhood Education",
        actual: calculationData.early_childhood_education?.toFixed(2) || "N/A",
        unit: "%",
        standardized: calculationData.early_childhood_education_standardized || 0,
        comment: calculationData.early_childhood_education_comment || "N/A"
      });
    }
    if (calculationData.net_enrollment_rate_in_higher_education !== null && calculationData.net_enrollment_rate_in_higher_education !== undefined) {
      data.push({
        subDimension: "Education",
        indicator: "Net Enrollment Rate in Higher Education",
        actual: calculationData.net_enrollment_rate_in_higher_education?.toFixed(2) || "N/A",
        unit: "%",
        standardized: calculationData.net_enrollment_rate_in_higher_education_standardized || 0,
        comment: calculationData.net_enrollment_rate_in_higher_education_comment || "N/A"
      });
    }

    // Safety and Security indicators
    if (calculationData.homicide_rate !== null && calculationData.homicide_rate !== undefined) {
      data.push({
        subDimension: "Safety and Security",
        indicator: "Homicide Rate",
        actual: calculationData.homicide_rate?.toFixed(2) || "N/A",
        unit: "per 100,000 inhabitants",
        standardized: calculationData.homicide_rate_standardized || 0,
        comment: calculationData.homicide_rate_comment || "N/A"
      });
    }
    if (calculationData.theft_rate !== null && calculationData.theft_rate !== undefined) {
      data.push({
        subDimension: "Safety and Security",
        indicator: "Theft Rate",
        actual: calculationData.theft_rate?.toFixed(2) || "N/A",
        unit: "per 100,000 inhabitants",
        standardized: calculationData.theft_rate_standardized || 0,
        comment: calculationData.theft_rate_comment || "N/A"
      });
    }

    // Public Space indicators
    if (calculationData.accessibility_to_open_public_areas !== null && calculationData.accessibility_to_open_public_areas !== undefined) {
      data.push({
        subDimension: "Public Space",
        indicator: "Accessibility to Open Public Areas",
        actual: calculationData.accessibility_to_open_public_areas?.toFixed(2) || "N/A",
        unit: "%",
        standardized: calculationData.accessibility_to_open_public_areas_standardized || 0,
        comment: calculationData.accessibility_to_open_public_areas_comment || "N/A"
      });
    }
    if (calculationData.green_area_per_capita !== null && calculationData.green_area_per_capita !== undefined) {
      data.push({
        subDimension: "Public Space",
        indicator: "Green Area Per Capita",
        actual: calculationData.green_area_per_capita?.toFixed(2) || "N/A",
        unit: "m²/person",
        standardized: calculationData.green_area_per_capita_standardized || 0,
        comment: calculationData.green_area_per_capita_comment || "N/A"
      });
    }

    return data;
  };

  const qualityOfLifeData = getQualityOfLifeData();

  const getChartData = () => {
    const colorMap: Record<string, string> = {
      "Life Expectancy at Birth": "#81C784",
      "Under Five Mortality Rate": "#66BB6A",
      "Vaccination Coverage": "#4CAF50",
      "Maternal Mortality": "#43A047",
      "Literacy Rate": "#64B5F6",
      "Mean Years of Schooling": "#42A5F5",
      "Early Childhood Education": "#2196F3",
      "Net Enrollment Rate in Higher Education": "#1E88E5",
      "Homicide Rate": "#FFB74D",
      "Theft Rate": "#FFA726",
      "Accessibility to Open Public Areas": "#BA68C8",
      "Green Area Per Capita": "#AB47BC"
    };
    return qualityOfLifeData.map(item => ({
      name: item.indicator,
      value: item.standardized,
      color: colorMap[item.indicator] || "#888888"
    }));
  };

  const chartData = getChartData();

  const groupedData = qualityOfLifeData.reduce((acc, item) => {
    if (!acc[item.subDimension]) {
      acc[item.subDimension] = { indicators: [] };
    }
    acc[item.subDimension].indicators.push(item);
    return acc;
  }, {} as Record<string, { indicators: IndicatorData[] }>);

  const getSubDimensionAverage = (subDim: string): number => {
    const indicators = groupedData[subDim]?.indicators || [];
    if (indicators.length === 0) return 0;
    const sum = indicators.reduce((total, item) => total + item.standardized, 0);
    return sum / indicators.length;
  };

  const calculateQualityOfLifeIndex = (): number => {
    const subDimensions = ["Health", "Education", "Safety and Security", "Public Space"];
    const availableAverages: number[] = [];
    subDimensions.forEach(subDim => {
      const avg = getSubDimensionAverage(subDim);
      if (avg > 0 && groupedData[subDim]) {
        availableAverages.push(avg);
      }
    });
    if (availableAverages.length === 0) return 0;
    const sum = availableAverages.reduce((total, val) => total + val, 0);
    return sum / availableAverages.length;
  };

  const qualityOfLifeIndex = calculateQualityOfLifeIndex();

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
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quality of life data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">The Quality of Life Index</h1>
          {city && country && (
            <p className="text-lg text-gray-600 mb-4">📍 {cityName || `${city}, ${country}`}</p>
          )}
          <div className="inline-block bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-3 rounded-full shadow-lg">
            <span className="text-3xl font-bold">
              {qualityOfLifeData.length > 0 ? `${qualityOfLifeIndex.toFixed(1)}%` : "N/A"}
            </span>
          </div>
        </div>

        {(!city || !country) && (
          <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg">
            <p className="text-sm text-yellow-800 flex items-center">
              ⚠️ Please select a city from the cities page first
            </p>
          </div>
        )}

        {city && country && qualityOfLifeData.length === 0 && (
          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
            <p className="text-sm text-blue-800 flex items-center">
              ℹ️ No calculation data available for this city. Please calculate indicators from the sub-dimensions below.
            </p>
          </div>
        )}

        {qualityOfLifeData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 p-4">
            <h2 className="text-2xl font-bold text-white">
              Quality of Life Index ({qualityOfLifeIndex.toFixed(1)}%)
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 border-b-2 border-gray-300">Sub-Dimension</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 border-b-2 border-gray-300">Indicator</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 border-b-2 border-gray-300">Actual</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 border-b-2 border-gray-300">Units</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 border-b-2 border-gray-300">Standardized</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 border-b-2 border-gray-300">Comment</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(groupedData).map(([subDim, data], subDimIndex) => (
                  <React.Fragment key={subDim}>
                    {data.indicators.map((item, index) => (
                      <tr 
                        key={`${subDim}-${index}`}
                        className={`hover:bg-blue-50 transition-colors ${
                          index === data.indicators.length - 1 && subDimIndex !== Object.keys(groupedData).length - 1
                            ? "border-b-2 border-gray-300"
                            : "border-b border-gray-200"
                        }`}
                      >
                        {index === 0 ? (
                          <td 
                            rowSpan={data.indicators.length} 
                            className="px-6 py-4 font-bold text-gray-800 bg-blue-50 border-r border-gray-200"
                          >
                            <div>
                              <div className="text-base">{subDim}</div>
                              <div className="text-sm text-blue-600 font-semibold mt-1">
                                ({getSubDimensionAverage(subDim).toFixed(1)}%)
                              </div>
                            </div>
                          </td>
                        ) : null}
                        <td className="px-6 py-4 text-gray-700">{item.indicator}</td>
                        <td className="px-6 py-4 text-right font-semibold text-gray-800">{item.actual}</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">{item.unit}</td>
                        <td className="px-6 py-4 text-right">
                          <span className="inline-block px-3 py-1 rounded-full font-semibold text-sm"
                            style={{
                              backgroundColor: item.standardized >= 80 ? '#E8F5E9' : 
                                               item.standardized >= 60 ? '#FFF9C4' : 
                                               '#FFEBEE',
                              color: item.standardized >= 80 ? '#2E7D32' : 
                                     item.standardized >= 60 ? '#F57F17' : 
                                     '#C62828'
                            }}
                          >
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
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {qualityOfLifeData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Quality of Life Indicators
          </h2>
          
          <div className="w-full" style={{ height: '500px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={chartData} 
                margin={{ top: 20, right: 30, left: 20, bottom: 120 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={150}
                  tick={{ fontSize: 11, fill: '#666' }}
                  interval={0}
                />
                <YAxis 
                  domain={[0, 100]}
                  tick={{ fontSize: 12, fill: '#666' }}
                  label={{ value: 'Standardized Value (%)', angle: -90, position: 'insideLeft', style: { fontSize: 14, fill: '#666' } }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#81C784' }}></div>
              <span className="text-sm text-gray-700">Health</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#64B5F6' }}></div>
              <span className="text-sm text-gray-700">Education</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FFB74D' }}></div>
              <span className="text-sm text-gray-700">Safety and Security</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#BA68C8' }}></div>
              <span className="text-sm text-gray-700">Public Space</span>
            </div>
          </div>
        </div>
        )}

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Explore Sub-Dimensions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div
              className="relative group bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl cursor-pointer"
              onClick={() => handleCardClick(1)}
            >
              <div className="flex flex-col items-center p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mb-4 shadow-lg transform transition-all duration-300 group-hover:shadow-xl group-hover:scale-110">
                  <span className="text-3xl">🏥</span>
                </div>
                <h4 className="text-xl font-bold text-gray-800 mb-2 text-center">Health</h4>
                <p className="text-sm text-green-600 font-semibold">
                  {groupedData["Health"] ? `${getSubDimensionAverage("Health").toFixed(1)}%` : "N/A"}
                </p>
              </div>
            </div>

            <div
              className="relative group bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl cursor-pointer"
              onClick={() => handleCardClick(2)}
            >
              <div className="flex flex-col items-center p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-4 shadow-lg transform transition-all duration-300 group-hover:shadow-xl group-hover:scale-110">
                  <span className="text-3xl">📚</span>
                </div>
                <h4 className="text-xl font-bold text-gray-800 mb-2 text-center">Education</h4>
                <p className="text-sm text-blue-600 font-semibold">
                  {groupedData["Education"] ? `${getSubDimensionAverage("Education").toFixed(1)}%` : "N/A"}
                </p>
              </div>
            </div>

            <div
              className="relative group bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl cursor-pointer"
              onClick={() => handleCardClick(3)}
            >
              <div className="flex flex-col items-center p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mb-4 shadow-lg transform transition-all duration-300 group-hover:shadow-xl group-hover:scale-110">
                  <span className="text-3xl">🛡️</span>
                </div>
                <h4 className="text-xl font-bold text-gray-800 mb-2 text-center">Safety & Security</h4>
                <p className="text-sm text-orange-600 font-semibold">
                  {groupedData["Safety and Security"] ? `${getSubDimensionAverage("Safety and Security").toFixed(1)}%` : "N/A"}
                </p>
              </div>
            </div>

            <div
              className="relative group bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl cursor-pointer"
              onClick={() => handleCardClick(4)}
            >
              <div className="flex flex-col items-center p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mb-4 shadow-lg transform transition-all duration-300 group-hover:shadow-xl group-hover:scale-110">
                  <span className="text-3xl">🌳</span>
                </div>
                <h4 className="text-xl font-bold text-gray-800 mb-2 text-center">Public Space</h4>
                <p className="text-sm text-purple-600 font-semibold">
                  {groupedData["Public Space"] ? `${getSubDimensionAverage("Public Space").toFixed(1)}%` : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QualityOfLifeIndex;
