"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCity } from "../../context/CityContext";
import { useUser } from '@clerk/nextjs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import toast from "react-hot-toast";

interface SubDimensionData {
  city: string;
  country: string;
  [key: string]: number | string | undefined;
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

function EnvironmentalSustainabilityIndex() {
  const router = useRouter();
  const { city, country, cityName } = useCity();
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const [calculationData, setCalculationData] = useState<SubDimensionData | null>(null);

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
          (record: SubDimensionData) => record.city === city && record.country === country
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

  const getDetailedEnvironmentalData = (): SubDimensionDetail[] => {
    if (!calculationData) return [];
    const data: SubDimensionDetail[] = [];

    // Air Quality (AQ)
    const aqIndicators: IndicatorDetail[] = [];
    if (calculationData.number_of_monitoring_stations !== null && calculationData.number_of_monitoring_stations !== undefined) {
      const value = Number(calculationData.number_of_monitoring_stations);
      const standardized = Number(calculationData.number_of_monitoring_stations_standardized) || 0;
      const comment = standardized >= 80 ? "VERY SOLID DATA" : standardized >= 60 ? "SOLID DATA" : standardized >= 40 ? "MODERATELY SOLID DATA" : standardized >= 20 ? "MODERATELY WEAK DATA" : "WEAK DATA";
      aqIndicators.push({ name: "Number of Monitoring Stations", actual: value.toFixed(2), unit: "per million people", standardized, comment });
    }
    if (calculationData.pm25_concentration !== null && calculationData.pm25_concentration !== undefined) {
      const value = Number(calculationData.pm25_concentration);
      const standardized = Number(calculationData.pm25_concentration_standardized) || 0;
      const comment = standardized >= 80 ? "VERY SOLID DATA" : standardized >= 60 ? "SOLID DATA" : standardized >= 40 ? "MODERATELY SOLID DATA" : standardized >= 20 ? "MODERATELY WEAK DATA" : "WEAK DATA";
      aqIndicators.push({ name: "PM2.5 Concentration", actual: value.toFixed(2), unit: "μg/m³", standardized, comment });
    }
    if (calculationData.co2_emissions !== null && calculationData.co2_emissions !== undefined) {
      const value = Number(calculationData.co2_emissions);
      const standardized = Number(calculationData.co2_emissions_standardized) || 0;
      const comment = standardized >= 80 ? "VERY SOLID DATA" : standardized >= 60 ? "SOLID DATA" : standardized >= 40 ? "MODERATELY SOLID DATA" : standardized >= 20 ? "MODERATELY WEAK DATA" : "WEAK DATA";
      aqIndicators.push({ name: "CO2 Emissions", actual: value.toFixed(2), unit: "tonnes per capita", standardized, comment });
    }
    if (aqIndicators.length > 0) {
      const aqAvg = aqIndicators.reduce((sum, item) => sum + item.standardized, 0) / aqIndicators.length;
      const aqComment = aqAvg >= 80 ? "VERY SOLID DATA" : aqAvg >= 60 ? "SOLID DATA" : aqAvg >= 40 ? "MODERATELY SOLID DATA" : aqAvg >= 20 ? "MODERATELY WEAK DATA" : "WEAK DATA";
      data.push({ subDimension: "Air Quality", average: aqAvg, comment: aqComment, indicators: aqIndicators });
    }

    // Waste Management (WM)
    const wmIndicators: IndicatorDetail[] = [];
    if (calculationData.solid_waste_collection !== null && calculationData.solid_waste_collection !== undefined) {
      const value = Number(calculationData.solid_waste_collection);
      const standardized = Number(calculationData.solid_waste_collection_standardized) || 0;
      const comment = standardized >= 80 ? "VERY SOLID DATA" : standardized >= 60 ? "SOLID DATA" : standardized >= 40 ? "MODERATELY SOLID DATA" : standardized >= 20 ? "MODERATELY WEAK DATA" : "WEAK DATA";
      wmIndicators.push({ name: "Solid Waste Collection", actual: value.toFixed(2), unit: "%", standardized, comment });
    }
    if (calculationData.waste_water_treatment !== null && calculationData.waste_water_treatment !== undefined) {
      const value = Number(calculationData.waste_water_treatment);
      const standardized = Number(calculationData.waste_water_treatment_standardized) || 0;
      const comment = standardized >= 80 ? "VERY SOLID DATA" : standardized >= 60 ? "SOLID DATA" : standardized >= 40 ? "MODERATELY SOLID DATA" : standardized >= 20 ? "MODERATELY WEAK DATA" : "WEAK DATA";
      wmIndicators.push({ name: "Waste Water Treatment", actual: value.toFixed(2), unit: "%", standardized, comment });
    }
    if (calculationData.solid_waste_recycling_share !== null && calculationData.solid_waste_recycling_share !== undefined) {
      const value = Number(calculationData.solid_waste_recycling_share);
      const standardized = Number(calculationData.solid_waste_recycling_share_standardized) || 0;
      const comment = standardized >= 80 ? "VERY SOLID DATA" : standardized >= 60 ? "SOLID DATA" : standardized >= 40 ? "MODERATELY SOLID DATA" : standardized >= 20 ? "MODERATELY WEAK DATA" : "WEAK DATA";
      wmIndicators.push({ name: "Solid Waste Recycling Share", actual: value.toFixed(2), unit: "%", standardized, comment });
    }
    if (wmIndicators.length > 0) {
      const wmAvg = wmIndicators.reduce((sum, item) => sum + item.standardized, 0) / wmIndicators.length;
      const wmComment = wmAvg >= 80 ? "VERY SOLID DATA" : wmAvg >= 60 ? "SOLID DATA" : wmAvg >= 40 ? "MODERATELY SOLID DATA" : wmAvg >= 20 ? "MODERATELY WEAK DATA" : "WEAK DATA";
      data.push({ subDimension: "Waste Management", average: wmAvg, comment: wmComment, indicators: wmIndicators });
    }

    // Sustainable Energy (SE)
    const seIndicators: IndicatorDetail[] = [];
    if (calculationData.share_of_renewable_energy !== null && calculationData.share_of_renewable_energy !== undefined) {
      const value = Number(calculationData.share_of_renewable_energy);
      const standardized = Number(calculationData.share_of_renewable_energy_standardized) || 0;
      const comment = standardized >= 80 ? "VERY SOLID DATA" : standardized >= 60 ? "SOLID DATA" : standardized >= 40 ? "MODERATELY SOLID DATA" : standardized >= 20 ? "MODERATELY WEAK DATA" : "WEAK DATA";
      seIndicators.push({ name: "Share of Renewable Energy", actual: value.toFixed(2), unit: "%", standardized, comment });
    }
    if (seIndicators.length > 0) {
      const seAvg = seIndicators.reduce((sum, item) => sum + item.standardized, 0) / seIndicators.length;
      const seComment = seAvg >= 80 ? "VERY SOLID DATA" : seAvg >= 60 ? "SOLID DATA" : seAvg >= 40 ? "MODERATELY SOLID DATA" : seAvg >= 20 ? "MODERATELY WEAK DATA" : "WEAK DATA";
      data.push({ subDimension: "Sustainable Energy", average: seAvg, comment: seComment, indicators: seIndicators });
    }

    return data;
  };

  const getChartData = () => {
    const environmentalData = getDetailedEnvironmentalData();
    return environmentalData.map(subDim => ({
      name: subDim.subDimension,
      score: Number(subDim.average.toFixed(1))
    }));
  };

  const calculateEnvironmentalIndex = (): number => {
    const environmentalData = getDetailedEnvironmentalData();
    if (environmentalData.length === 0) return 0;
    const sum = environmentalData.reduce((acc, subDim) => acc + subDim.average, 0);
    return sum / environmentalData.length;
  };

  const getEnvironmentalIndexComment = (): string => {
    const index = calculateEnvironmentalIndex();
    if (index >= 80) return "VERY SOLID DATA";
    if (index >= 60) return "SOLID DATA";
    if (index >= 40) return "MODERATELY SOLID DATA";
    if (index >= 20) return "MODERATELY WEAK DATA";
    return "WEAK DATA";
  };

  const handleCardClick = (id: number) => {
    if (id === 1) {
      router.push("/home/ES/AQ");
    } else if (id === 2) {
      router.push("/home/ES/WM");
    } else if (id === 3) {
      router.push("/home/ES/SE");
    }
  };

  const environmentalData = getDetailedEnvironmentalData();
  const chartData = getChartData();
  const environmentalIndex = calculateEnvironmentalIndex();
  const environmentalIndexComment = getEnvironmentalIndexComment();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Environmental Sustainability data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🌱 Environmental Sustainability Index</h1>
          {city && country && (
            <p className="text-lg text-gray-600 mb-4">📍 {cityName || `${city}, ${country}`}</p>
          )}
        </div>

        {(!city || !country) && (
          <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg">
            <p className="text-sm text-yellow-800">⚠️ Please select a city from the cities page first</p>
          </div>
        )}

        {city && country && !calculationData && (
          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
            <p className="text-sm text-blue-800">ℹ️ No calculation data available for this city yet.</p>
          </div>
        )}

        {/* Detailed Table */}
        {calculationData && environmentalData.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-green-600 to-teal-600 p-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Environmental Sustainability Index - Detailed View</h2>
              <div className="flex items-center gap-3">
                <span className="inline-block px-4 py-2 rounded-full font-bold text-lg bg-white text-green-600">
                  {environmentalIndex.toFixed(1)}%
                </span>
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                  environmentalIndexComment.includes('VERY SOLID') ? 'bg-green-100 text-green-800' :
                  environmentalIndexComment.includes('SOLID') && !environmentalIndexComment.includes('MODERATELY') ? 'bg-blue-100 text-blue-800' :
                  environmentalIndexComment.includes('MODERATELY SOLID') ? 'bg-yellow-100 text-yellow-800' :
                  environmentalIndexComment.includes('MODERATELY WEAK') ? 'bg-orange-100 text-orange-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {environmentalIndexComment}
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
                  {environmentalData.map((subDim, subIndex) => (
                    <React.Fragment key={subIndex}>
                      {subDim.indicators.map((indicator, indIndex) => (
                        <tr key={indIndex} className="hover:bg-green-50 transition-colors">
                          {indIndex === 0 && (
                            <td className="px-4 py-3 text-gray-900 font-bold border border-gray-300 bg-green-50 align-top" rowSpan={subDim.indicators.length}>
                              <div className="flex flex-col gap-2">
                                <span>{subDim.subDimension}</span>
                                <span className="inline-block px-2 py-1 rounded-full font-bold text-xs bg-green-600 text-white text-center">
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

        {/* Bar Chart */}
        {calculationData && chartData.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Sub-Dimension Scores</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-15} textAnchor="end" height={100} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="score" name="Score (%)" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : index === 1 ? '#14b8a6' : '#06b6d4'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Navigation Cards */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">🔍 Explore Sub-Dimensions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Air Quality */}
            <div
              className="relative group bg-gradient-to-br from-green-50 to-green-100 shadow-lg rounded-xl overflow-hidden transition-all transform hover:scale-105 hover:shadow-2xl cursor-pointer border-2 border-green-200"
              onClick={() => handleCardClick(1)}
            >
              <div className="flex flex-col items-center p-6">
                <div className="text-5xl mb-3">🌫️</div>
                <h4 className="text-lg font-bold text-gray-800 mb-2">Air Quality</h4>
                {calculationData && environmentalData[0] && (
                  <div className="mt-2">
                    <span className="inline-block px-3 py-1 bg-green-600 text-white text-sm font-bold rounded-full">
                      {environmentalData[0].average.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Waste Management */}
            <div
              className="relative group bg-gradient-to-br from-teal-50 to-teal-100 shadow-lg rounded-xl overflow-hidden transition-all transform hover:scale-105 hover:shadow-2xl cursor-pointer border-2 border-teal-200"
              onClick={() => handleCardClick(2)}
            >
              <div className="flex flex-col items-center p-6">
                <div className="text-5xl mb-3">♻️</div>
                <h4 className="text-lg font-bold text-gray-800 mb-2">Waste Management</h4>
                {calculationData && environmentalData[1] && (
                  <div className="mt-2">
                    <span className="inline-block px-3 py-1 bg-teal-600 text-white text-sm font-bold rounded-full">
                      {environmentalData[1].average.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Sustainable Energy */}
            <div
              className="relative group bg-gradient-to-br from-cyan-50 to-cyan-100 shadow-lg rounded-xl overflow-hidden transition-all transform hover:scale-105 hover:shadow-2xl cursor-pointer border-2 border-cyan-200"
              onClick={() => handleCardClick(3)}
            >
              <div className="flex flex-col items-center p-6">
                <div className="text-5xl mb-3">⚡</div>
                <h4 className="text-lg font-bold text-gray-800 mb-2">Sustainable Energy</h4>
                {calculationData && environmentalData[2] && (
                  <div className="mt-2">
                    <span className="inline-block px-3 py-1 bg-cyan-600 text-white text-sm font-bold rounded-full">
                      {environmentalData[2].average.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnvironmentalSustainabilityIndex;
