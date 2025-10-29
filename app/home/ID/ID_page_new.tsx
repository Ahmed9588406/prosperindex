"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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

function ProductivityIndex() {
  const router = useRouter();
  const { city, country, cityName } = useCity();
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [calculationData, setCalculationData] = useState<any>(null);

  const handleCardClick = (id: number) => {
    if (id === 1) {
      router.push("/home/P/EG");
    } else if (id === 2) {
      router.push("/home/P/EA");
    } else if (id === 3) {
      router.push("/home/P/E");
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
        
        // Find the record for the selected city
        const cityData = history.find(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  const getProductivityData = (): IndicatorData[] => {
    if (!calculationData) return [];

    const data: IndicatorData[] = [];

    // Economic Growth indicators
    if (calculationData.city_product_per_capita !== null && calculationData.city_product_per_capita !== undefined) {
      data.push({
        subDimension: "Economic Growth",
        indicator: "City Product per Capita",
        actual: calculationData.city_product_per_capita?.toFixed(2) || "N/A",
        unit: "USD (PPP)/inhab",
        standardized: calculationData.city_product_per_capita_standardized || 0,
        comment: calculationData.city_product_per_capita_comment || "N/A"
      });
    }

    if (calculationData.mean_household_income !== null && calculationData.mean_household_income !== undefined) {
      data.push({
        subDimension: "Economic Growth",
        indicator: "Mean Household Income",
        actual: calculationData.mean_household_income?.toFixed(2) || "N/A",
        unit: "USD(PPP)",
        standardized: calculationData.mean_household_income_standardized || 0,
        comment: calculationData.mean_household_income_comment || "N/A"
      });
    }

    if (calculationData.old_age_dependency_ratio !== null && calculationData.old_age_dependency_ratio !== undefined) {
      data.push({
        subDimension: "Economic Growth",
        indicator: "Old Age Dependency Ratio",
        actual: calculationData.old_age_dependency_ratio?.toFixed(2) || "N/A",
        unit: "%",
        standardized: calculationData.old_age_dependency_ratio_standardized || 0,
        comment: calculationData.old_age_dependency_ratio_comment || "N/A"
      });
    }

    // Employment indicators
    if (calculationData.employment_to_population_ratio !== null && calculationData.employment_to_population_ratio !== undefined) {
      data.push({
        subDimension: "Employment",
        indicator: "Employment in Population Ratio",
        actual: calculationData.employment_to_population_ratio?.toFixed(2) || "N/A",
        unit: "%",
        standardized: calculationData.employment_to_population_ratio_standardized || 0,
        comment: calculationData.employment_to_population_ratio_comment || "N/A"
      });
    }

    if (calculationData.informal_employment !== null && calculationData.informal_employment !== undefined) {
      data.push({
        subDimension: "Employment",
        indicator: "Informal Employment",
        actual: calculationData.informal_employment?.toFixed(2) || "N/A",
        unit: "%",
        standardized: calculationData.informal_employment_standardized || 0,
        comment: calculationData.informal_employment_comment || "N/A"
      });
    }

    if (calculationData.unemployment_rate !== null && calculationData.unemployment_rate !== undefined) {
      data.push({
        subDimension: "Employment",
        indicator: "Unemployment Rate",
        actual: calculationData.unemployment_rate?.toFixed(2) || "N/A",
        unit: "%",
        standardized: calculationData.unemployment_rate_standardized || 0,
        comment: calculationData.unemployment_rate_comment || "N/A"
      });
    }

    // Economic Agglomeration indicators
    if (calculationData.economic_density !== null && calculationData.economic_density !== undefined) {
      data.push({
        subDimension: "Economic Agglomeration",
        indicator: "Economic Density",
        actual: calculationData.economic_density?.toFixed(2) || "N/A",
        unit: "USD (PPP)/km2",
        standardized: calculationData.economic_density_standardized || 0,
        comment: calculationData.economic_density_comment || "N/A"
      });
    }

    if (calculationData.economic_specialization !== null && calculationData.economic_specialization !== undefined) {
      data.push({
        subDimension: "Economic Agglomeration",
        indicator: "Economic Specialization",
        actual: calculationData.economic_specialization?.toFixed(2) || "N/A",
        unit: "Dimensionless",
        standardized: calculationData.economic_specialization_standardized || 0,
        comment: calculationData.economic_specialization_comment || "N/A"
      });
    }

    return data;
  };

  const productivityData = getProductivityData();

  // Build chart data from productivity data
  const getChartData = () => {
    const colorMap: Record<string, string> = {
      "City Product per Capita": "#FDB462",
      "Mean Household Income": "#FDB462",
      "Old Age Dependency Ratio": "#FDB462",
      "Employment in Population Ratio": "#80CBC4",
      "Informal Employment": "#4FC3F7",
      "Unemployment Rate": "#4DD0E1",
      "Economic Density": "#90CAF9",
      "Economic Specialization": "#81C784"
    };

    return productivityData.map(item => ({
      name: item.indicator,
      value: item.standardized,
      color: colorMap[item.indicator] || "#888888"
    }));
  };

  const chartData = getChartData();

  // Group data by sub-dimension and calculate averages
  const groupedData = productivityData.reduce((acc, item) => {
    if (!acc[item.subDimension]) {
      acc[item.subDimension] = {
        indicators: []
      };
    }
    acc[item.subDimension].indicators.push(item);
    return acc;
  }, {} as Record<string, { indicators: IndicatorData[] }>);

  // Calculate sub-dimension averages
  const getSubDimensionAverage = (subDim: string): number => {
    const indicators = groupedData[subDim]?.indicators || [];
    if (indicators.length === 0) return 0;
    const sum = indicators.reduce((total, item) => total + item.standardized, 0);
    return sum / indicators.length;
  };

  // Calculate overall Productivity Index as simple average of sub-dimensions
  const calculateProductivityIndex = (): number => {
    const subDimensions = ["Economic Growth", "Employment", "Economic Agglomeration"];
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

  const productivityIndex = calculateProductivityIndex();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading productivity data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">The Productivity Index</h1>
          {city && country && (
            <p className="text-lg text-gray-600 mb-4">📍 {cityName || `${city}, ${country}`}</p>
          )}
          <div className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-full shadow-lg">
            <span className="text-3xl font-bold">
              {productivityData.length > 0 ? `${productivityIndex.toFixed(1)}%` : "N/A"}
            </span>
          </div>
        </div>

        {/* Warning if no data */}
        {(!city || !country) && (
          <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg">
            <p className="text-sm text-yellow-800 flex items-center">
              ⚠️ Please select a city from the cities page first
            </p>
          </div>
        )}

        {city && country && productivityData.length === 0 && (
          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
            <p className="text-sm text-blue-800 flex items-center">
              ℹ️ No calculation data available for this city. Please calculate indicators from the sub-dimensions below.
            </p>
          </div>
        )}

        {/* Table Section */}
        {productivityData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
            <h2 className="text-2xl font-bold text-white">
              Table 2: The Productivity Index ({productivityIndex.toFixed(1)}%)
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
                            item.comment.includes('V. Strong') ? 'bg-green-100 text-green-800' :
                            item.comment.includes('M. Strong') ? 'bg-blue-100 text-blue-800' :
                            item.comment.includes('moderate') ? 'bg-yellow-100 text-yellow-800' :
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

        {/* Chart Section */}
        {productivityData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Figure 4: The Productivity Indicators
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
                  tick={{ fontSize: 12, fill: '#666' }}
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

          {/* Legend */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FDB462' }}></div>
              <span className="text-sm text-gray-700">Economic Growth</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#80CBC4' }}></div>
              <span className="text-sm text-gray-700">Employment</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#4FC3F7' }}></div>
              <span className="text-sm text-gray-700">Employment</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#81C784' }}></div>
              <span className="text-sm text-gray-700">Economic Agglomeration</span>
            </div>
          </div>
        </div>
        )}

        {/* Navigation Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Explore Sub-Dimensions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Economic Growth */}
            <div
              className="relative group bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl cursor-pointer"
              onClick={() => handleCardClick(1)}
            >
              <div className="flex flex-col items-center p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full p-4 mb-4 shadow-lg transform transition-all duration-300 group-hover:shadow-xl group-hover:scale-110">
                  <Image 
                    src="/assets/economic_strength.png" 
                    alt="Economic Strength" 
                    width={80}
                    height={80}
                    className="w-full h-full object-contain filter drop-shadow-md"
                  />
                </div>
                <h4 className="text-xl font-bold text-gray-800 mb-2 text-center">Economic Growth</h4>
                <p className="text-sm text-blue-600 font-semibold">
                  {groupedData["Economic Growth"] ? `${getSubDimensionAverage("Economic Growth").toFixed(1)}%` : "71.2%"}
                </p>
              </div>
            </div>

            {/* Economic Agglomeration */}
            <div
              className="relative group bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl cursor-pointer"
              onClick={() => handleCardClick(2)}
            >
              <div className="flex flex-col items-center p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-teal-100 to-teal-200 rounded-full p-4 mb-4 shadow-lg transform transition-all duration-300 group-hover:shadow-xl group-hover:scale-110">
                  <Image 
                    src="/assets/economic_aggregation.png" 
                    alt="Economic Agglomeration" 
                    width={80}
                    height={80}
                    className="w-full h-full object-contain rounded-full filter drop-shadow-md"
                  />
                </div>
                <h4 className="text-xl font-bold text-gray-800 mb-2 text-center">Economic Agglomeration</h4>
                <p className="text-sm text-blue-600 font-semibold">
                  {groupedData["Economic Agglomeration"] ? `${getSubDimensionAverage("Economic Agglomeration").toFixed(1)}%` : "42.1%"}
                </p>
              </div>
            </div>

            {/* Employment */}
            <div
              className="relative group bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl cursor-pointer"
              onClick={() => handleCardClick(3)}
            >
              <div className="flex flex-col items-center p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full p-4 mb-4 shadow-lg transform transition-all duration-300 group-hover:shadow-xl group-hover:scale-110">
                  <Image 
                    src="/assets/Employment-Logo-PNG-HD-Quality.png" 
                    alt="Employment" 
                    width={80}
                    height={80}
                    className="w-full h-full object-contain filter drop-shadow-md"
                  />
                </div>
                <h4 className="text-xl font-bold text-gray-800 mb-2 text-center">Employment</h4>
                <p className="text-sm text-blue-600 font-semibold">
                  {groupedData["Employment"] ? `${getSubDimensionAverage("Employment").toFixed(1)}%` : "75.7%"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductivityIndex;
