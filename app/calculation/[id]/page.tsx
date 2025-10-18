"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import CardDetails from '@/components/CardDetails';
import Chart from '../../components/chart';

interface Calculation {
  id: string;
  userId?: string;
  city?: string | null;
  country?: string | null;
  cityName?: string | null;
  cpi?: number | null;
  createdAt: string | Date;
  updatedAt: string | Date;

  // Standardized indicator inputs (expected to be 0..1 by default)
  improved_shelter_standardized?: number | null;
  improved_water_standardized?: number | null;
  improved_sanitation_standardized?: number | null;
  sufficient_living_standardized?: number | null;
  population_standardized?: number | null;
  electricity_standardized?: number | null;

  city_product_per_capita_standardized?: number | null;
  old_age_dependency_ratio_standardized?: number | null;
  mean_household_income_standardized?: number | null;
  economic_density_standardized?: number | null;
  economic_specialization_standardized?: number | null;

  unemployment_rate_standardized?: number | null;
  employment_to_population_ratio_standardized?: number | null;
  informal_employment_standardized?: number | null;

  physician_density_standardized?: number | null;
  number_of_public_libraries_standardized?: number | null;

  use_of_public_transport_standardized?: number | null;
  average_daily_travel_time_standardized?: number | null;
  length_of_mass_transport_network_standardized?: number | null;
  traffic_fatalities_standardized?: number | null;
  affordability_of_transport_standardized?: number | null;

  street_intersection_density_standardized?: number | null;
  street_density_standardized?: number | null;
  land_allocated_to_streets_standardized?: number | null;

  life_expectancy_at_birth_standardized?: number | null;
  under_five_mortality_rate_standardized?: number | null;
  vaccination_coverage_standardized?: number | null;
  maternal_mortality_standardized?: number | null;

  literacy_rate_standardized?: number | null;
  mean_years_of_schooling_standardized?: number | null;
  early_childhood_education_standardized?: number | null;
  net_enrollment_rate_in_higher_education_standardized?: number | null;

  homicide_rate_standardized?: number | null;
  theft_rate_standardized?: number | null;

  accessibility_to_open_public_areas_standardized?: number | null;
  green_area_per_capita_standardized?: number | null;

  gini_standardized_score?: number | null;
  poverty_rate_standardized_score?: number | null;

  slums_households_standardized?: number | null;
  youth_unemployment_standardized?: number | null;

  equitable_secondary_school_enrollment_standardized?: number | null;
  women_in_local_government_standardized?: number | null;
  women_in_local_work_force_standardized?: number | null;

  land_use_mix_standardized?: number | null;

  number_of_monitoring_stations_standardized?: number | null;
  pm25_concentration_standardized?: number | null;
  co2_emissions_standardized?: number | null;

  solid_waste_collection_standardized?: number | null;
  waste_water_treatment_standardized?: number | null;
  solid_waste_recycling_share_standardized?: number | null;

  share_of_renewable_energy_standardized?: number | null;

  voter_turnout_standardized?: number | null;
  access_to_public_information_standardized?: number | null;
  civic_participation_standardized?: number | null;

  own_revenue_collection_standardized?: number | null;
  days_to_start_a_business_standardized?: number | null;
  subnational_debt_standardized?: number | null;
  local_expenditure_efficiency_standardized?: number | null;

  land_use_efficiency_standardized?: number | null;

  internet_access_standardized?: number | null;
  home_computer_access_standardized?: number | null;
  average_broadband_speed_standardized?: number | null;

  // Computed numeric sub-indexes and dimensions (0..100)
  house_infrastructure?: number | null;
  economic_strength?: number | null;
  economic_agglomeration?: number | null;
  employment?: number | null;
  social_infrastructure?: number | null;
  urban_mobility?: number | null;
  urban_form?: number | null;
  health?: number | null;
  education?: number | null;
  safety_and_security?: number | null;
  public_space?: number | null;
  economic_equity?: number | null;
  social_inclusion?: number | null;
  gender_inclusion?: number | null;
  urban_diversity?: number | null;
  air_quality?: number | null;
  waste_management?: number | null;
  sustainable_energy?: number | null;
  participation?: number | null;
  municipal_financing_and_institutional_capacity?: number | null;
  governance_of_urbanization?: number | null;
  ict?: number | null;

  productivity?: number | null;
  infrastructure_development?: number | null;
  quality_of_life?: number | null;
  equity_social_inclusion?: number | null;
  environmental_sustainability?: number | null;
  urban_governance_legislation?: number | null;

  // Display & comment fields
  house_infrastructure_display?: string;
  house_infrastructure_comment?: string;
  economic_strength_display?: string;
  economic_strength_comment?: string;
  economic_agglomeration_display?: string;
  economic_agglomeration_comment?: string;
  employment_display?: string;
  employment_comment?: string;
  social_infrastructure_display?: string;
  social_infrastructure_comment?: string;
  urban_mobility_display?: string;
  urban_mobility_comment?: string;
  urban_form_display?: string;
  urban_form_comment?: string;
  health_display?: string;
  health_comment?: string;
  education_display?: string;
  education_comment?: string;
  safety_and_security_display?: string;
  safety_and_security_comment?: string;
  public_space_display?: string;
  public_space_comment?: string;
  economic_equity_display?: string;
  economic_equity_comment?: string;
  social_inclusion_display?: string;
  social_inclusion_comment?: string;
  gender_inclusion_display?: string;
  gender_inclusion_comment?: string;
  urban_diversity_display?: string;
  urban_diversity_comment?: string;
  air_quality_display?: string;
  air_quality_comment?: string;
  waste_management_display?: string;
  waste_management_comment?: string;
  sustainable_energy_display?: string;
  sustainable_energy_comment?: string;
  participation_display?: string;
  participation_comment?: string;
  municipal_financing_and_institutional_capacity_display?: string;
  municipal_financing_and_institutional_capacity_comment?: string;
  governance_of_urbanization_display?: string;
  governance_of_urbanization_comment?: string;
  ict_display?: string;
  ict_comment?: string;

  productivity_display?: string;
  productivity_comment?: string;
  infrastructure_development_display?: string;
  infrastructure_development_comment?: string;
  quality_of_life_display?: string;
  quality_of_life_comment?: string;
  equity_social_inclusion_display?: string;
  equity_social_inclusion_comment?: string;
  environmental_sustainability_display?: string;
  environmental_sustainability_comment?: string;
  urban_governance_legislation_display?: string;
  urban_governance_legislation_comment?: string;

  cpi_display?: string;
  cpi_comment?: string;

  // allow additional dynamic properties
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

const getComment = (score: number | string): string => {
  // score must be 0..100
  if (score === '-' || typeof score !== 'number' || isNaN(score)) return '-';

  if (score >= 80) return "VERY SOLID";
  else if (score >= 70) return "SOLID";
  else if (score >= 60) return "MODERATELY SOLID";
  else if (score >= 50) return "MODERATELY WEAK";
  else if (score >= 40) return "WEAK";
  else return "VERY WEAK";
};

/**
 * calculateAverage:
 * - data: the Calculation-like object
 * - fields: array of keys to average (expected to point to standardized indicator values)
 * - inputIsFraction: true if the standardized indicator values are 0..1 (fraction). If true the returned mean is scaled to 0..100.
 * Returns number (0..100) or '-' if no valid inputs.
 */
const calculateAverage = (data: Calculation, fields: string[], inputIsFraction = true): number | string => {
  let sum = 0;
  let count = 0;

  fields.forEach(field => {
    const value = data[field];
    if (typeof value === 'number' && !isNaN(value)) {
      sum += value;
      count++;
    }
  });

  if (count === 0) return '-';
  const mean = sum / count;
  const factor = inputIsFraction ? 100 : 1;
  return Number((mean * factor).toFixed(2));
};

const calculateAllIndexes = (data: Calculation) => {
  // IMPORTANT: we assume standardized indicator inputs are 0..100 (not 0..1).
  // If your API returns 0..1 already, call calculateAverage with inputIsFraction = true.

  const houseInfra = calculateAverage(data, [
    "improved_shelter_standardized",
    "improved_water_standardized",
    "improved_sanitation_standardized",
    "sufficient_living_standardized",
    "population_standardized",
    "electricity_standardized"
  ], false);
  if (typeof houseInfra === 'number') {
    data.house_infrastructure = houseInfra;
    data.house_infrastructure_comment = getComment(houseInfra);
    data.house_infrastructure_display = `${houseInfra.toFixed(2)}%`;
  }

  const economicStrength = calculateAverage(data, [
    "city_product_per_capita_standardized",
    "old_age_dependency_ratio_standardized",
    "mean_household_income_standardized"
  ], false);
  if (typeof economicStrength === 'number') {
    data.economic_strength = economicStrength;
    data.economic_strength_comment = getComment(economicStrength);
    data.economic_strength_display = `${economicStrength.toFixed(2)}%`;
  }

  const economicAgglomeration = calculateAverage(data, [
    "economic_density_standardized",
    "economic_specialization_standardized"
  ], false);
  if (typeof economicAgglomeration === 'number') {
    data.economic_agglomeration = economicAgglomeration;
    data.economic_agglomeration_comment = getComment(economicAgglomeration);
    data.economic_agglomeration_display = `${economicAgglomeration.toFixed(2)}%`;
  }

  const employment = calculateAverage(data, [
    "unemployment_rate_standardized",
    "employment_to_population_ratio_standardized",
    "informal_employment_standardized"
  ], false);
  if (typeof employment === 'number') {
    data.employment = employment;
    data.employment_comment = getComment(employment);
    data.employment_display = `${employment.toFixed(2)}%`;
  }

  const socialInfra = calculateAverage(data, [
    "physician_density_standardized",
    "number_of_public_libraries_standardized"
  ], false);
  if (typeof socialInfra === 'number') {
    data.social_infrastructure = socialInfra;
    data.social_infrastructure_comment = getComment(socialInfra);
    data.social_infrastructure_display = `${socialInfra.toFixed(2)}%`;
  }

  const urbanMobility = calculateAverage(data, [
    "use_of_public_transport_standardized",
    "average_daily_travel_time_standardized",
    "length_of_mass_transport_network_standardized",
    "traffic_fatalities_standardized",
    "affordability_of_transport_standardized"
  ], false);
  if (typeof urbanMobility === 'number') {
    data.urban_mobility = urbanMobility;
    data.urban_mobility_comment = getComment(urbanMobility);
    data.urban_mobility_display = `${urbanMobility.toFixed(2)}%`;
  }

  const urbanForm = calculateAverage(data, [
    "street_intersection_density_standardized",
    "street_density_standardized",
    "land_allocated_to_streets_standardized"
  ], false);
  if (typeof urbanForm === 'number') {
    data.urban_form = urbanForm;
    data.urban_form_comment = getComment(urbanForm);
    data.urban_form_display = `${urbanForm.toFixed(2)}%`;
  }

  const health = calculateAverage(data, [
    "life_expectancy_at_birth_standardized",
    "under_five_mortality_rate_standardized",
    "vaccination_coverage_standardized",
    "maternal_mortality_standardized"
  ], false);
  if (typeof health === 'number') {
    data.health = health;
    data.health_comment = getComment(health);
    data.health_display = `${health.toFixed(2)}%`;
  }

  const education = calculateAverage(data, [
    "literacy_rate_standardized",
    "mean_years_of_schooling_standardized",
    "early_childhood_education_standardized",
    "net_enrollment_rate_in_higher_education_standardized"
  ], false);
  if (typeof education === 'number') {
    data.education = education;
    data.education_comment = getComment(education);
    data.education_display = `${education.toFixed(2)}%`;
  }

  const safety = calculateAverage(data, [
    "homicide_rate_standardized",
    "theft_rate_standardized"
  ], false);
  if (typeof safety === 'number') {
    data.safety_and_security = safety;
    data.safety_and_security_comment = getComment(safety);
    data.safety_and_security_display = `${safety.toFixed(2)}%`;
  }

  const publicSpace = calculateAverage(data, [
    "accessibility_to_open_public_areas_standardized",
    "green_area_per_capita_standardized"
  ], false);
  if (typeof publicSpace === 'number') {
    data.public_space = publicSpace;
    data.public_space_comment = getComment(publicSpace);
    data.public_space_display = `${publicSpace.toFixed(2)}%`;
  }

  const economicEquity = calculateAverage(data, [
    "gini_standardized_score",
    "poverty_rate_standardized_score"
  ], false);
  if (typeof economicEquity === 'number') {
    data.economic_equity = economicEquity;
    data.economic_equity_comment = getComment(economicEquity);
    data.economic_equity_display = `${economicEquity.toFixed(2)}%`;
  }

  const socialInclusion = calculateAverage(data, [
    "slums_households_standardized",
    "youth_unemployment_standardized"
  ], false);
  if (typeof socialInclusion === 'number') {
    data.social_inclusion = socialInclusion;
    data.social_inclusion_comment = getComment(socialInclusion);
    data.social_inclusion_display = `${socialInclusion.toFixed(2)}%`;
  }

  const genderInclusion = calculateAverage(data, [
    "equitable_secondary_school_enrollment_standardized",
    "women_in_local_government_standardized",
    "women_in_local_work_force_standardized"
  ], false);
  if (typeof genderInclusion === 'number') {
    data.gender_inclusion = genderInclusion;
    data.gender_inclusion_comment = getComment(genderInclusion);
    data.gender_inclusion_display = `${genderInclusion.toFixed(2)}%`;
  }

  const urbanDiversity = calculateAverage(data, [
    "land_use_mix_standardized"
  ], false);
  if (typeof urbanDiversity === 'number') {
    data.urban_diversity = urbanDiversity;
    data.urban_diversity_comment = getComment(urbanDiversity);
    data.urban_diversity_display = `${urbanDiversity.toFixed(2)}%`;
  }

  const airQuality = calculateAverage(data, [
    "number_of_monitoring_stations_standardized",
    "pm25_concentration_standardized",
    "co2_emissions_standardized"
  ], false);
  if (typeof airQuality === 'number') {
    data.air_quality = airQuality;
    data.air_quality_comment = getComment(airQuality);
    data.air_quality_display = `${airQuality.toFixed(2)}%`;
  }

  const wasteManagement = calculateAverage(data, [
    "solid_waste_collection_standardized",
    "waste_water_treatment_standardized",
    "solid_waste_recycling_share_standardized"
  ], false);
  if (typeof wasteManagement === 'number') {
    data.waste_management = wasteManagement;
    data.waste_management_comment = getComment(wasteManagement);
    data.waste_management_display = `${wasteManagement.toFixed(2)}%`;
  }

  const sustainableEnergy = calculateAverage(data, [
    "share_of_renewable_energy_standardized"
  ], false);
  if (typeof sustainableEnergy === 'number') {
    data.sustainable_energy = sustainableEnergy;
    data.sustainable_energy_comment = getComment(sustainableEnergy);
    data.sustainable_energy_display = `${sustainableEnergy.toFixed(2)}%`;
  }

  const participation = calculateAverage(data, [
    "voter_turnout_standardized",
    "access_to_public_information_standardized",
    "civic_participation_standardized"
  ], false);
  if (typeof participation === 'number') {
    data.participation = participation;
    data.participation_comment = getComment(participation);
    data.participation_display = `${participation.toFixed(2)}%`;
  }

  const municipalFinancing = calculateAverage(data, [
    "own_revenue_collection_standardized",
    "days_to_start_a_business_standardized",
    "subnational_debt_standardized",
    "local_expenditure_efficiency_standardized"
  ], false);
  if (typeof municipalFinancing === 'number') {
    data.municipal_financing_and_institutional_capacity = municipalFinancing;
    data.municipal_financing_and_institutional_capacity_comment = getComment(municipalFinancing);
    data.municipal_financing_and_institutional_capacity_display = `${municipalFinancing.toFixed(2)}%`;
  }

  const governance = calculateAverage(data, [
    "land_use_efficiency_standardized"
  ], false);
  if (typeof governance === 'number') {
    data.governance_of_urbanization = governance;
    data.governance_of_urbanization_comment = getComment(governance);
    data.governance_of_urbanization_display = `${governance.toFixed(2)}%`;
  }

  const ict = calculateAverage(data, [
    "internet_access_standardized",
    "home_computer_access_standardized",
    "average_broadband_speed_standardized"
  ], false);
  if (typeof ict === 'number') {
    data.ict = ict;
    data.ict_comment = getComment(ict);
    data.ict_display = `${ict.toFixed(2)}%`;
  }

  // Calculate dimension indexes as averages of their sub-indexes (sub-indexes are already 0..100)
  const productivity = calculateAverage(data, ["economic_strength", "economic_agglomeration", "employment"], false);
  if (typeof productivity === 'number') {
    data.productivity = productivity;
    data.productivity_comment = getComment(productivity);
    data.productivity_display = `${productivity.toFixed(2)}%`;
  }

  const infrastructureDevelopment = calculateAverage(data, ["house_infrastructure", "social_infrastructure", "ict", "urban_mobility", "urban_form"], false);
  if (typeof infrastructureDevelopment === 'number') {
    data.infrastructure_development = infrastructureDevelopment;
    data.infrastructure_development_comment = getComment(infrastructureDevelopment);
    data.infrastructure_development_display = `${infrastructureDevelopment.toFixed(2)}%`;
  }

  const qualityOfLife = calculateAverage(data, ["health", "education", "safety_and_security", "public_space"], false);
  if (typeof qualityOfLife === 'number') {
    data.quality_of_life = qualityOfLife;
    data.quality_of_life_comment = getComment(qualityOfLife);
    data.quality_of_life_display = `${qualityOfLife.toFixed(2)}%`;
  }

  const equitySocialInclusion = calculateAverage(data, ["economic_equity", "social_inclusion", "gender_inclusion", "urban_diversity"], false);
  if (typeof equitySocialInclusion === 'number') {
    data.equity_social_inclusion = equitySocialInclusion;
    data.equity_social_inclusion_comment = getComment(equitySocialInclusion);
    data.equity_social_inclusion_display = `${equitySocialInclusion.toFixed(2)}%`;
  }

  const environmentalSustainability = calculateAverage(data, ["air_quality", "waste_management", "sustainable_energy"], false);
  if (typeof environmentalSustainability === 'number') {
    data.environmental_sustainability = environmentalSustainability;
    data.environmental_sustainability_comment = getComment(environmentalSustainability);
    data.environmental_sustainability_display = `${environmentalSustainability.toFixed(2)}%`;
  }

  const urbanGovernanceLegislation = calculateAverage(data, ["participation", "municipal_financing_and_institutional_capacity", "governance_of_urbanization"], false);
  if (typeof urbanGovernanceLegislation === 'number') {
    data.urban_governance_legislation = urbanGovernanceLegislation;
    data.urban_governance_legislation_comment = getComment(urbanGovernanceLegislation);
    data.urban_governance_legislation_display = `${urbanGovernanceLegislation.toFixed(2)}%`;
  }

  // CPI = average of the 6 dimensions (already 0..100)
  const cpiFields = [
    "productivity",
    "infrastructure_development",
    "quality_of_life",
    "equity_social_inclusion",
    "environmental_sustainability",
    "urban_governance_legislation"
  ];

  const cpi = calculateAverage(data, cpiFields, false);
  if (typeof cpi === 'number') {
    data.cpi = cpi;
    data.cpi_comment = getComment(cpi);
    data.cpi_display = `${cpi.toFixed(2)}%`;
  }
};

export default function CalculationDetailsPage() {
  const params = useParams();
  const [calculation, setCalculation] = useState<Calculation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCalculation = async () => {
      try {
        const response = await fetch(`/api/calculation-history/${params.id}`);

        if (!response.ok) {
          throw new Error('Failed to fetch calculation');
        }

        const data: Calculation = await response.json();

        // Calculate all indexes and CPI (mutates "data")
        calculateAllIndexes(data);

        setCalculation(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchCalculation();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading calculation details...</div>
      </div>
    );
  }

  if (error || !calculation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Error: {error || 'Calculation not found'}</div>
      </div>
    );
  }

  // Prepare chart data from the 6 dimensions (labels and numeric values are separate)
  const chartData = [
    { subject: 'Productivity', value: typeof calculation.productivity === 'number' ? calculation.productivity : 0, display: calculation.productivity_display ?? '0.00%' },
    { subject: 'Infra Development', value: typeof calculation.infrastructure_development === 'number' ? calculation.infrastructure_development : 0, display: calculation.infrastructure_development_display ?? '0.00%' },
    { subject: 'Quality of Life', value: typeof calculation.quality_of_life === 'number' ? calculation.quality_of_life : 0, display: calculation.quality_of_life_display ?? '0.00%' },
    { subject: 'Equity & Inclusion', value: typeof calculation.equity_social_inclusion === 'number' ? calculation.equity_social_inclusion : 0, display: calculation.equity_social_inclusion_display ?? '0.00%' },
    { subject: 'Env Sustainability', value: typeof calculation.environmental_sustainability === 'number' ? calculation.environmental_sustainability : 0, display: calculation.environmental_sustainability_display ?? '0.00%' },
    { subject: 'Urban Governance', value: typeof calculation.urban_governance_legislation === 'number' ? calculation.urban_governance_legislation : 0, display: calculation.urban_governance_legislation_display ?? '0.00%' },
  ];

  return (
    <div>
      <div className="px-4 mb-8">
        <Chart data={chartData} />
      </div>

      {/* Section for dimension and CPI cards */}
      <div className="mt-8 px-4">
        <h2 className="text-2xl font-bold text-center text-white mb-6">City Prosperity Dimensions & Index</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Example: render dimension cards */}
          {[
            { name: 'Productivity', value: calculation.productivity, comment: calculation.productivity_comment, display: calculation.productivity_display },
            { name: 'Infrastructure Development', value: calculation.infrastructure_development, comment: calculation.infrastructure_development_comment, display: calculation.infrastructure_development_display },
            { name: 'Quality of Life', value: calculation.quality_of_life, comment: calculation.quality_of_life_comment, display: calculation.quality_of_life_display },
            { name: 'Equity and Social Inclusion', value: calculation.equity_social_inclusion, comment: calculation.equity_social_inclusion_comment, display: calculation.equity_social_inclusion_display },
            { name: 'Environmental Sustainability', value: calculation.environmental_sustainability, comment: calculation.environmental_sustainability_comment, display: calculation.environmental_sustainability_display },
            { name: 'Urban Governance & Legislation', value: calculation.urban_governance_legislation, comment: calculation.urban_governance_legislation_comment, display: calculation.urban_governance_legislation_display },
            { name: 'City Prosperity Index (CPI)', value: calculation.cpi, comment: calculation.cpi_comment, display: calculation.cpi_display }
          ].map((dimension, index) => (
            <div key={index} className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 border border-slate-600">
              <h3 className="text-lg font-semibold text-white mb-2">{dimension.name}</h3>
              <p className="text-3xl font-bold text-blue-400 mb-1">{typeof dimension.value === 'number' ? (dimension.display ?? `${dimension.value.toFixed(2)}%`) : '0.00%'}</p>
              <p className="text-sm text-gray-300">{dimension.comment || '-'}</p>
            </div>
          ))}
        </div>
      </div>

      <CardDetails calculation={calculation} />
    </div>
  );
}