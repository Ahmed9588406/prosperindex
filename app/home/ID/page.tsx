/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCity } from "../../context/CityContext";
import { useUser } from '@clerk/nextjs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import toast from "react-hot-toast";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

function InfrastructureDevelopmentIndex() {
  const router = useRouter();
  const { city, country, cityName } = useCity();
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [calculationData, setCalculationData] = useState<any>(null);

  const handleCardClick = (id: number) => {
    if (id === 1) {
      router.push("/home/ID/subid");
    } else if (id === 2) {
      router.push("/home/ID/SI");
    } else if (id === 3) {
      router.push("/home/ID/ICT");
    } else if (id === 4) {
      router.push("/home/ID/UM");
    } else if (id === 5) {
      router.push("/home/ID/UF");
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

  const getDetailedInfrastructureData = (): SubDimensionDetail[] => {
    if (!calculationData) return [];
    const data: SubDimensionDetail[] = [];
    
    // Housing Infrastructure - 5 indicators
    const housingIndicators: IndicatorDetail[] = [];
    if (calculationData.improved_shelter !== null && calculationData.improved_shelter !== undefined) {
      housingIndicators.push({
        name: "Improved Shelter",
        actual: calculationData.improved_shelter?.toFixed(2) || "N/A",
        unit: "%",
        standardized: calculationData.improved_shelter_standardized || 0,
        comment: calculationData.improved_shelter_comment || "N/A"
      });
    }
    if (calculationData.improved_water !== null && calculationData.improved_water !== undefined) {
      housingIndicators.push({
        name: "Improved Water",
        actual: calculationData.improved_water?.toFixed(2) || "N/A",
        unit: "%",
        standardized: calculationData.improved_water_standardized || 0,
        comment: calculationData.improved_water_comment || "N/A"
      });
    }
    if (calculationData.improved_sanitation !== null && calculationData.improved_sanitation !== undefined) {
      housingIndicators.push({
        name: "Improved Sanitation",
        actual: calculationData.improved_sanitation?.toFixed(2) || "N/A",
        unit: "%",
        standardized: calculationData.improved_sanitation_standardized || 0,
        comment: calculationData.improved_sanitation_comment || "N/A"
      });
    }
    if (calculationData.electricity !== null && calculationData.electricity !== undefined) {
      housingIndicators.push({
        name: "Electricity",
        actual: calculationData.electricity?.toFixed(2) || "N/A",
        unit: "%",
        standardized: calculationData.electricity_standardized || 0,
        comment: calculationData.electricity_comment || "N/A"
      });
    }
    if (calculationData.sufficient_living_area !== null && calculationData.sufficient_living_area !== undefined) {
      housingIndicators.push({
        name: "Sufficient Living Area",
        actual: calculationData.sufficient_living_area?.toFixed(2) || "N/A",
        unit: "%",
        standardized: calculationData.sufficient_living_area_standardized || 0,
        comment: calculationData.sufficient_living_area_comment || "N/A"
      });
    }
    
    if (housingIndicators.length > 0) {
      const housingAvg = housingIndicators.reduce((sum, item) => sum + item.standardized, 0) / housingIndicators.length;
      const housingComment = housingAvg >= 80 ? "VERY SOLID DATA" : housingAvg >= 60 ? "SOLID DATA" : housingAvg >= 40 ? "MODERATELY SOLID DATA" : housingAvg >= 20 ? "MODERATELY WEAK DATA" : "WEAK DATA";
      data.push({ subDimension: "Housing Infrastructure", average: housingAvg, comment: housingComment, indicators: housingIndicators });
    }
    
    // Social Infrastructure - 2 indicators
    const socialIndicators: IndicatorDetail[] = [];
    if (calculationData.physicians_density !== null && calculationData.physicians_density !== undefined) {
      socialIndicators.push({
        name: "Physicians Density",
        actual: calculationData.physicians_density?.toFixed(2) || "N/A",
        unit: "per 10,000 people",
        standardized: calculationData.physicians_density_standardized || 0,
        comment: calculationData.physicians_density_comment || "N/A"
      });
    }
    if (calculationData.number_of_public_libraries !== null && calculationData.number_of_public_libraries !== undefined) {
      socialIndicators.push({
        name: "Number of Public Libraries",
        actual: calculationData.number_of_public_libraries?.toFixed(2) || "N/A",
        unit: "per 100,000 people",
        standardized: calculationData.number_of_public_libraries_standardized || 0,
        comment: calculationData.number_of_public_libraries_comment || "N/A"
      });
    }
    
    if (socialIndicators.length > 0) {
      const socialAvg = socialIndicators.reduce((sum, item) => sum + item.standardized, 0) / socialIndicators.length;
      const socialComment = socialAvg >= 80 ? "VERY SOLID DATA" : socialAvg >= 60 ? "SOLID DATA" : socialAvg >= 40 ? "MODERATELY SOLID DATA" : socialAvg >= 20 ? "MODERATELY WEAK DATA" : "WEAK DATA";
      data.push({ subDimension: "Social Infrastructure", average: socialAvg, comment: socialComment, indicators: socialIndicators });
    }
    
    // ICT - 3 indicators
    const ictIndicators: IndicatorDetail[] = [];
    if (calculationData.internet_access !== null && calculationData.internet_access !== undefined) {
      ictIndicators.push({
        name: "Internet Access",
        actual: calculationData.internet_access?.toFixed(2) || "N/A",
        unit: "%",
        standardized: calculationData.internet_access_standardized || 0,
        comment: calculationData.internet_access_comment || "N/A"
      });
    }
    if (calculationData.home_computer_access !== null && calculationData.home_computer_access !== undefined) {
      ictIndicators.push({
        name: "Home Computer Access",
        actual: calculationData.home_computer_access?.toFixed(2) || "N/A",
        unit: "%",
        standardized: calculationData.home_computer_access_standardized || 0,
        comment: calculationData.home_computer_access_comment || "N/A"
      });
    }
    if (calculationData.average_broadband_speed !== null && calculationData.average_broadband_speed !== undefined) {
      ictIndicators.push({
        name: "Average Broadband Speed",
        actual: calculationData.average_broadband_speed?.toFixed(2) || "N/A",
        unit: "Mbps",
        standardized: calculationData.average_broadband_speed_standardized || 0,
        comment: calculationData.average_broadband_speed_comment || "N/A"
      });
    }
    
    if (ictIndicators.length > 0) {
      const ictAvg = ictIndicators.reduce((sum, item) => sum + item.standardized, 0) / ictIndicators.length;
      const ictComment = ictAvg >= 80 ? "VERY SOLID DATA" : ictAvg >= 60 ? "SOLID DATA" : ictAvg >= 40 ? "MODERATELY SOLID DATA" : ictAvg >= 20 ? "MODERATELY WEAK DATA" : "WEAK DATA";
      data.push({ subDimension: "Information and Communication Technology", average: ictAvg, comment: ictComment, indicators: ictIndicators });
    }
    
    // Urban Mobility - 5 indicators
    const mobilityIndicators: IndicatorDetail[] = [];
    if (calculationData.use_of_public_transport !== null && calculationData.use_of_public_transport !== undefined) {
      mobilityIndicators.push({
        name: "Use of Public Transport",
        actual: calculationData.use_of_public_transport?.toFixed(2) || "N/A",
        unit: "%",
        standardized: calculationData.use_of_public_transport_standardized || 0,
        comment: calculationData.use_of_public_transport_comment || "N/A"
      });
    }
    if (calculationData.average_daily_travel_time !== null && calculationData.average_daily_travel_time !== undefined) {
      mobilityIndicators.push({
        name: "Average Daily Travel Time",
        actual: calculationData.average_daily_travel_time?.toFixed(2) || "N/A",
        unit: "minutes",
        standardized: calculationData.average_daily_travel_time_standardized || 0,
        comment: calculationData.average_daily_travel_time_comment || "N/A"
      });
    }
    if (calculationData.length_of_mass_transport_network !== null && calculationData.length_of_mass_transport_network !== undefined) {
      mobilityIndicators.push({
        name: "Length of Mass Transport Network",
        actual: calculationData.length_of_mass_transport_network?.toFixed(2) || "N/A",
        unit: "km per 10,000 people",
        standardized: calculationData.length_of_mass_transport_network_standardized || 0,
        comment: calculationData.length_of_mass_transport_network_comment || "N/A"
      });
    }
    if (calculationData.traffic_fatalities !== null && calculationData.traffic_fatalities !== undefined) {
      mobilityIndicators.push({
        name: "Traffic Fatalities",
        actual: calculationData.traffic_fatalities?.toFixed(2) || "N/A",
        unit: "per 100,000 people",
        standardized: calculationData.traffic_fatalities_standardized || 0,
        comment: calculationData.traffic_fatalities_comment || "N/A"
      });
    }
    if (calculationData.affordability_of_public_transport !== null && calculationData.affordability_of_public_transport !== undefined) {
      mobilityIndicators.push({
        name: "Affordability of Public Transport",
        actual: calculationData.affordability_of_public_transport?.toFixed(2) || "N/A",
        unit: "%",
        standardized: calculationData.affordability_of_public_transport_standardized || 0,
        comment: calculationData.affordability_of_public_transport_comment || "N/A"
      });
    }
    
    if (mobilityIndicators.length > 0) {
      const mobilityAvg = mobilityIndicators.reduce((sum, item) => sum + item.standardized, 0) / mobilityIndicators.length;
      const mobilityComment = mobilityAvg >= 80 ? "VERY SOLID DATA" : mobilityAvg >= 60 ? "SOLID DATA" : mobilityAvg >= 40 ? "MODERATELY SOLID DATA" : mobilityAvg >= 20 ? "MODERATELY WEAK DATA" : "WEAK DATA";
      data.push({ subDimension: "Urban Mobility", average: mobilityAvg, comment: mobilityComment, indicators: mobilityIndicators });
    }
    
    // Urban Form - 3 indicators
    const urbanFormIndicators: IndicatorDetail[] = [];
    if (calculationData.street_intersection_density !== null && calculationData.street_intersection_density !== undefined) {
      urbanFormIndicators.push({
        name: "Street Intersection Density",
        actual: calculationData.street_intersection_density?.toFixed(2) || "N/A",
        unit: "per km²",
        standardized: calculationData.street_intersection_density_standardized || 0,
        comment: calculationData.street_intersection_density_comment || "N/A"
      });
    }
    if (calculationData.street_density !== null && calculationData.street_density !== undefined) {
      urbanFormIndicators.push({
        name: "Street Density",
        actual: calculationData.street_density?.toFixed(2) || "N/A",
        unit: "km/km²",
        standardized: calculationData.street_density_standardized || 0,
        comment: calculationData.street_density_comment || "N/A"
      });
    }
    if (calculationData.land_allocated_to_streets !== null && calculationData.land_allocated_to_streets !== undefined) {
      urbanFormIndicators.push({
        name: "Land Allocated to Streets",
        actual: calculationData.land_allocated_to_streets?.toFixed(2) || "N/A",
        unit: "%",
        standardized: calculationData.land_allocated_to_streets_standardized || 0,
        comment: calculationData.land_allocated_to_streets_comment || "N/A"
      });
    }
    
    if (urbanFormIndicators.length > 0) {
      const urbanFormAvg = urbanFormIndicators.reduce((sum, item) => sum + item.standardized, 0) / urbanFormIndicators.length;
      const urbanFormComment = urbanFormAvg >= 80 ? "VERY SOLID DATA" : urbanFormAvg >= 60 ? "SOLID DATA" : urbanFormAvg >= 40 ? "MODERATELY SOLID DATA" : urbanFormAvg >= 20 ? "MODERATELY WEAK DATA" : "WEAK DATA";
      data.push({ subDimension: "Urban Form", average: urbanFormAvg, comment: urbanFormComment, indicators: urbanFormIndicators });
    }
    
    return data;
  };

  const infrastructureData = getDetailedInfrastructureData();
  
  const getChartData = () => {
    return infrastructureData.map((item, index) => ({
      name: item.subDimension,
      value: item.average,
      color: ['#4FC3F7', '#66BB6A', '#9C27B0', '#FFA726', '#EF5350'][index] || '#888888'
    }));
  };

  const chartData = getChartData();

  const calculateInfrastructureIndex = (): number => {
    if (infrastructureData.length === 0) return 0;
    const sum = infrastructureData.reduce((total, item) => total + item.average, 0);
    return sum / infrastructureData.length;
  };

  const infrastructureIndex = calculateInfrastructureIndex();
  
  const getInfrastructureIndexComment = (): string => {
    if (infrastructureIndex >= 80) return "VERY SOLID DATA";
    if (infrastructureIndex >= 60) return "SOLID DATA";
    if (infrastructureIndex >= 40) return "MODERATELY SOLID DATA";
    if (infrastructureIndex >= 20) return "MODERATELY WEAK DATA";
    return "WEAK DATA";
  };
  
  const infrastructureIndexComment = getInfrastructureIndexComment();

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
          <p className="text-gray-600">Loading infrastructure data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Infrastructure Development Index</h1>
          {city && country && (
            <p className="text-lg text-gray-600 mb-4">📍 {cityName || `${city}, ${country}`}</p>
          )}
          <div className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-full shadow-lg">
            <span className="text-3xl font-bold">
              {infrastructureData.length > 0 ? `${infrastructureIndex.toFixed(1)}%` : "N/A"}
            </span>
          </div>
        </div>

        {(!city || !country) && (
          <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg">
            <p className="text-sm text-yellow-800">⚠️ Please select a city from the cities page first</p>
          </div>
        )}

        {city && country && infrastructureData.length === 0 && (
          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
            <p className="text-sm text-blue-800">ℹ️ No calculation data available for this city. Please calculate indicators in the sub-dimensions below.</p>
          </div>
        )}

        {infrastructureData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Infrastructure Development Index - Detailed View</h2>
            <div className="flex items-center gap-3">
              <span className="inline-block px-4 py-2 rounded-full font-bold text-lg bg-white text-blue-600">
                {infrastructureIndex.toFixed(1)}%
              </span>
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                infrastructureIndexComment.includes('VERY SOLID') ? 'bg-green-100 text-green-800' :
                infrastructureIndexComment.includes('SOLID') && !infrastructureIndexComment.includes('MODERATELY') ? 'bg-blue-100 text-blue-800' :
                infrastructureIndexComment.includes('MODERATELY SOLID') ? 'bg-yellow-100 text-yellow-800' :
                infrastructureIndexComment.includes('MODERATELY WEAK') ? 'bg-orange-100 text-orange-800' :
                'bg-red-100 text-red-800'
              }`}>
                {infrastructureIndexComment}
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
                {infrastructureData.map((subDim, subIndex) => (
                  <React.Fragment key={subIndex}>
                    {subDim.indicators.map((indicator, indIndex) => (
                      <tr key={indIndex} className="hover:bg-blue-50 transition-colors">
                        {indIndex === 0 && (
                          <td className="px-4 py-3 text-gray-900 font-bold border border-gray-300 bg-blue-50 align-top" rowSpan={subDim.indicators.length}>
                            <div className="flex flex-col gap-2">
                              <span>{subDim.subDimension}</span>
                              <span className="inline-block px-2 py-1 rounded-full font-bold text-xs bg-blue-600 text-white text-center">
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

        {infrastructureData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Infrastructure Development Sub-Dimensions Chart</h2>
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
          <div className="grid grid-cols-1 gap-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="relative group bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl cursor-pointer" onClick={() => handleCardClick(1)}>
                <div className="flex flex-col items-center p-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-full flex items-center justify-center mb-4 shadow-lg transform transition-all duration-300 group-hover:shadow-xl group-hover:scale-110">
                    <span className="text-3xl">🏠</span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-800 mb-2 text-center">Housing Infrastructure</h4>
                  <p className="text-sm text-cyan-600 font-semibold">
                    {infrastructureData.find(d => d.subDimension === "Housing Infrastructure")?.average.toFixed(1) || "N/A"}%
                  </p>
                </div>
              </div>

              <div className="relative group bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl cursor-pointer" onClick={() => handleCardClick(2)}>
                <div className="flex flex-col items-center p-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mb-4 shadow-lg transform transition-all duration-300 group-hover:shadow-xl group-hover:scale-110">
                    <span className="text-3xl">👨‍⚕️</span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-800 mb-2 text-center">Social Infrastructure</h4>
                  <p className="text-sm text-green-600 font-semibold">
                    {infrastructureData.find(d => d.subDimension === "Social Infrastructure")?.average.toFixed(1) || "N/A"}%
                  </p>
                </div>
              </div>

              <div className="relative group bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl cursor-pointer" onClick={() => handleCardClick(3)}>
                <div className="flex flex-col items-center p-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mb-4 shadow-lg transform transition-all duration-300 group-hover:shadow-xl group-hover:scale-110">
                    <span className="text-3xl">💻</span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-800 mb-2 text-center">Information and Communication Technology</h4>
                  <p className="text-sm text-purple-600 font-semibold">
                    {infrastructureData.find(d => d.subDimension === "Information and Communication Technology")?.average.toFixed(1) || "N/A"}%
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="relative group bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl cursor-pointer" onClick={() => handleCardClick(4)}>
                <div className="flex flex-col items-center p-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mb-4 shadow-lg transform transition-all duration-300 group-hover:shadow-xl group-hover:scale-110">
                    <span className="text-3xl">🚌</span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-800 mb-2 text-center">Urban Mobility</h4>
                  <p className="text-sm text-orange-600 font-semibold">
                    {infrastructureData.find(d => d.subDimension === "Urban Mobility")?.average.toFixed(1) || "N/A"}%
                  </p>
                </div>
              </div>

              <div className="relative group bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl cursor-pointer" onClick={() => handleCardClick(5)}>
                <div className="flex flex-col items-center p-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mb-4 shadow-lg transform transition-all duration-300 group-hover:shadow-xl group-hover:scale-110">
                    <span className="text-3xl">🗺️</span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-800 mb-2 text-center">Urban Form</h4>
                  <p className="text-sm text-red-600 font-semibold">
                    {infrastructureData.find(d => d.subDimension === "Urban Form")?.average.toFixed(1) || "N/A"}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InfrastructureDevelopmentIndex;
