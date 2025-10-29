/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import { useCity } from "../context/CityContext";
import { useUser } from '@clerk/nextjs';
import toast from "react-hot-toast";

export default function CityProsperityIndexComprehensiveTable() {
  const { city, country, cityName } = useCity();
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const [calculationData, setCalculationData] = useState<any>(null);

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

  // Structure for the comprehensive table based on UN-Habitat CPI framework
  const cpiStructure = [
    {
      dimension: "PRODUCTIVITY (P)",
      subDimensions: [
        {
          name: "1. Economic Growth (EG)",
          indicators: [
            { name: "1.1 City Product per Capita", key: "city_product_per_capita", unit: "USD (PPP)/inhab" },
            { name: "1.2 Old Age Dependency Ratio", key: "old_age_dependency_ratio", unit: "%" },
            { name: "Mean Household Income", key: "mean_household_income", unit: "USD (PPP)" }
          ]
        },
        {
          name: "2. Economic Agglomeration (EA)",
          indicators: [
            { name: "2.1 Economic Density", key: "economic_density", unit: "USD" },
            { name: "2.2 Economic Specialization", key: "economic_specialization", unit: "Dimensionless" }
          ]
        },
        {
          name: "3. Employment (E)",
          indicators: [
            { name: "3.1 Unemployment Rate", key: "unemployment_rate", unit: "%" },
            { name: "3.2 Employment to Population Ratio", key: "employment_to_population_ratio", unit: "%" },
            { name: "3.3 Informal Employment", key: "informal_employment", unit: "%" }
          ]
        }
      ]
    },
    {
      dimension: "INFRASTRUCTURE DEVELOPMENT (ID)",
      subDimensions: [
        {
          name: "1. Housing Infrastructure (HI)",
          indicators: [
            { name: "1.1 Improved Shelter", key: "improved_shelter", unit: "%" },
            { name: "1.2 Access to Improved Water", key: "improved_water", unit: "%" },
            { name: "1.3 Access to Improved Sanitation", key: "improved_sanitation", unit: "%" },
            { name: "1.4 Electricity", key: "electricity", unit: "%" },
            { name: "1.5 Sufficient Living Area", key: "sufficient_living_area", unit: "%" },
            { name: "1.6 Population Density", key: "population_density", unit: "people/km²" }
          ]
        },
        {
          name: "2. Social Infrastructure (SI)",
          indicators: [
            { name: "2.1 Physicians Density", key: "physicians_density", unit: "per 10,000 people" },
            { name: "2.2 Number of Public Libraries", key: "number_of_public_libraries", unit: "per 100,000 people" }
          ]
        },
        {
          name: "3. Information and Communication Technology (ICT)",
          indicators: [
            { name: "3.1 Internet Access", key: "internet_access", unit: "%" },
            { name: "3.2 Home Computer Access", key: "home_computer_access", unit: "%" },
            { name: "3.3 Average Broadband Speed", key: "average_broadband_speed", unit: "Mbps" }
          ]
        },
        {
          name: "4. Urban Mobility (UM)",
          indicators: [
            { name: "4.1 Use of Public Transport", key: "use_of_public_transport", unit: "%" },
            { name: "4.2 Average Daily Travel Time", key: "average_daily_travel_time", unit: "minutes" },
            { name: "4.3 Length of Mass Transport Network", key: "length_of_mass_transport_network", unit: "km per 10,000 people" },
            { name: "4.4 Traffic Fatalities", key: "traffic_fatalities", unit: "per 100,000 people" },
            { name: "4.5 Affordability of Transport", key: "affordability_of_public_transport", unit: "%" }
          ]
        },
        {
          name: "5. Urban Form (UF)",
          indicators: [
            { name: "5.1 Street Intersection Density", key: "street_intersection_density", unit: "per km²" },
            { name: "5.2 Street Density", key: "street_density", unit: "km/km²" },
            { name: "5.3 Land Allocated to Streets", key: "land_allocated_to_streets", unit: "%" }
          ]
        }
      ]
    },
    {
      dimension: "QUALITY OF LIFE (QOL)",
      subDimensions: [
        {
          name: "1. Health (H)",
          indicators: [
            { name: "1.1 Life Expectancy at Birth", key: "life_expectancy_at_birth", unit: "years" },
            { name: "1.2 Under-Five Mortality Rate", key: "under_five_mortality_rate", unit: "per 1,000 live births" },
            { name: "1.3 Vaccination Coverage", key: "vaccination_coverage", unit: "%" },
            { name: "1.4 Maternal Mortality", key: "maternal_mortality", unit: "per 100,000 live births" }
          ]
        },
        {
          name: "2. Education (E)",
          indicators: [
            { name: "2.1 Literacy Rate", key: "literacy_rate", unit: "%" },
            { name: "2.2 Mean years of Schooling", key: "mean_years_of_schooling", unit: "years" },
            { name: "2.3 Early Childhood Education", key: "early_childhood_education", unit: "%" },
            { name: "2.4 Net enrollment rate in higher education", key: "net_enrollment_rate_in_higher_education", unit: "%" }
          ]
        },
        {
          name: "3. Safety and Security (SS)",
          indicators: [
            { name: "3.1 Homicide rate", key: "homicide_rate", unit: "per 100,000 people" },
            { name: "3.2 Theft rate", key: "theft_rate", unit: "per 100,000 people" }
          ]
        },
        {
          name: "4. Public Space (PS)",
          indicators: [
            { name: "4.1 Accessibility to Open Public Areas", key: "accessibility_to_open_public_areas", unit: "%" },
            { name: "4.2 Green Area per Capita", key: "green_area_per_capita", unit: "m²/person" }
          ]
        }
      ]
    },
    {
      dimension: "EQUITY AND SOCIAL INCLUSION (ESI)",
      subDimensions: [
        {
          name: "1. Economic Equity (EE)",
          indicators: [
            { name: "1.1 Gini Coefficient", key: "gini_coefficient", unit: "0-1 scale" },
            { name: "1.2 Poverty Rate", key: "poverty_rate", unit: "%" }
          ]
        },
        {
          name: "2. Social Inclusion (SI)",
          indicators: [
            { name: "2.1 Slums Households", key: "slums_households", unit: "%" },
            { name: "2.2 Youth Unemployment", key: "youth_unemployment", unit: "%" }
          ]
        },
        {
          name: "3. Gender Inclusion (GI)",
          indicators: [
            { name: "3.1 Equitable Secondary School Enrollment", key: "equitable_secondary_school_enrollment", unit: "ratio" },
            { name: "3.2 Women in local government", key: "women_in_local_government", unit: "%" },
            { name: "3.3 Women in the workforce", key: "women_in_local_work_force", unit: "%" }
          ]
        },
        {
          name: "4. Urban Diversity (UD)",
          indicators: [
            { name: "4.1 Land Use Mix", key: "land_use_mix", unit: "0-1 scale" }
          ]
        }
      ]
    },
    {
      dimension: "ENVIRONMENTAL SUSTAINABILITY (ES)",
      subDimensions: [
        {
          name: "1. Air Quality (AQ)",
          indicators: [
            { name: "1.1 Number of Monitoring stations", key: "number_of_monitoring_stations", unit: "per million people" },
            { name: "1.2 PM 2.5 Concentration", key: "pm25_concentration", unit: "μg/m³" },
            { name: "1.3 CO2 Emissions", key: "co2_emissions", unit: "tonnes per capita" }
          ]
        },
        {
          name: "2. Waste Management (WM)",
          indicators: [
            { name: "2.1 Solid Waste Collection", key: "solid_waste_collection", unit: "%" },
            { name: "2.2 Waste Water Treatment", key: "waste_water_treatment", unit: "%" },
            { name: "2.3 Solid Waste Recycling Share", key: "solid_waste_recycling_share", unit: "%" },
            { name: "2.4 Share of Renewable Energy", key: "share_of_renewable_energy", unit: "%" }
          ]
        },
        {
          name: "3. Sustainable Energy (SE)",
          indicators: [
            { name: "3.1 Renewable Energy", key: "share_of_renewable_energy", unit: "%" }
          ]
        }
      ]
    },
    {
      dimension: "URBAN GOVERNANCE AND LEGISLATION (UGL)",
      subDimensions: [
        {
          name: "1. Participation (P)",
          indicators: [
            { name: "1.1 Voter Turnout", key: "voter_turnout", unit: "%" },
            { name: "1.2 Access to Public Information", key: "access_to_public_information", unit: "%" },
            { name: "1.3 Civic Participation", key: "civic_participation", unit: "%" }
          ]
        },
        {
          name: "2. Municipal Financing and Institutional Capacity (MFIC)",
          indicators: [
            { name: "2.1 Own Revenue Collection", key: "own_revenue_collection", unit: "%" },
            { name: "2.2 Days to Start a Business", key: "days_to_start_a_business", unit: "days" },
            { name: "2.3 Subnational Debt", key: "subnational_debt", unit: "%" },
            { name: "2.4 Local Expenditure Efficiency", key: "local_expenditure_efficiency", unit: "%" }
          ]
        },
        {
          name: "3. Governance of Urbanization (GU)",
          indicators: [
            { name: "3.1 Land Use Efficiency", key: "land_use_efficiency", unit: "%" }
          ]
        }
      ]
    }
  ];

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "number") return value.toFixed(2);
    return String(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading comprehensive CPI data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">City Prosperity Index Indicators</h1>
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
            <p className="text-sm text-blue-800">ℹ️ No calculation data available for this city.</p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-bold border border-gray-600">DIMENSION</th>
                  <th className="px-4 py-3 text-left text-sm font-bold border border-gray-600">SUB-DIMENSION</th>
                  <th className="px-4 py-3 text-left text-sm font-bold border border-gray-600">INDICATOR</th>
                  <th className="px-4 py-3 text-right text-sm font-bold border border-gray-600">Actual</th>
                  <th className="px-4 py-3 text-center text-sm font-bold border border-gray-600">Units</th>
                  <th className="px-4 py-3 text-right text-sm font-bold border border-gray-600">Standardized</th>
                  <th className="px-4 py-3 text-center text-sm font-bold border border-gray-600">Comment</th>
                </tr>
              </thead>
              <tbody>
                {cpiStructure.map((dim, dimIndex) => {
                  let dimensionRowCount = 0;
                  dim.subDimensions.forEach(subDim => {
                    dimensionRowCount += subDim.indicators.length;
                  });

                  return (
                    <React.Fragment key={dimIndex}>
                      {dim.subDimensions.map((subDim, subDimIndex) => {
                        const subDimRowCount = subDim.indicators.length;
                        return (
                          <React.Fragment key={subDimIndex}>
                            {subDim.indicators.map((indicator, indIndex) => (
                              <tr key={indIndex} className="hover:bg-blue-50 transition-colors">
                                {subDimIndex === 0 && indIndex === 0 && (
                                  <td className="px-4 py-3 text-gray-900 font-bold border border-gray-300 bg-blue-100 align-top text-center" rowSpan={dimensionRowCount}>
                                    {dim.dimension}
                                  </td>
                                )}
                                {indIndex === 0 && (
                                  <td className="px-4 py-3 text-gray-800 font-semibold border border-gray-300 bg-gray-50 align-top" rowSpan={subDimRowCount}>
                                    {subDim.name}
                                  </td>
                                )}
                                <td className="px-4 py-3 text-gray-700 border border-gray-300">{indicator.name}</td>
                                <td className="px-4 py-3 text-right font-semibold text-gray-800 border border-gray-300">
                                  {calculationData ? formatValue(calculationData[indicator.key]) : "N/A"}
                                </td>
                                <td className="px-4 py-3 text-center text-sm text-gray-600 border border-gray-300">{indicator.unit}</td>
                                <td className="px-4 py-3 text-right border border-gray-300">
                                  <span className="inline-block px-2 py-1 rounded text-xs font-semibold"
                                    style={{
                                      backgroundColor: (calculationData && calculationData[`${indicator.key}_standardized`] >= 80) ? '#E8F5E9' : 
                                                       (calculationData && calculationData[`${indicator.key}_standardized`] >= 60) ? '#FFF9C4' : '#FFEBEE',
                                      color: (calculationData && calculationData[`${indicator.key}_standardized`] >= 80) ? '#2E7D32' : 
                                             (calculationData && calculationData[`${indicator.key}_standardized`] >= 60) ? '#F57F17' : '#C62828'
                                    }}>
                                    {calculationData && calculationData[`${indicator.key}_standardized`] !== null && calculationData[`${indicator.key}_standardized`] !== undefined
                                      ? `${calculationData[`${indicator.key}_standardized`].toFixed(1)}%`
                                      : "N/A"}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-center border border-gray-300">
                                  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                                    (calculationData && calculationData[`${indicator.key}_comment`]?.includes('VERY SOLID')) ? 'bg-green-100 text-green-800' :
                                    (calculationData && calculationData[`${indicator.key}_comment`]?.includes('SOLID') && !calculationData[`${indicator.key}_comment`]?.includes('MODERATELY')) ? 'bg-blue-100 text-blue-800' :
                                    (calculationData && calculationData[`${indicator.key}_comment`]?.includes('MODERATELY SOLID')) ? 'bg-yellow-100 text-yellow-800' :
                                    (calculationData && calculationData[`${indicator.key}_comment`]?.includes('MODERATELY WEAK')) ? 'bg-orange-100 text-orange-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {calculationData ? (calculationData[`${indicator.key}_comment`] || "N/A") : "N/A"}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </React.Fragment>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
