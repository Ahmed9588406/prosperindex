"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import CardDetails from '@/components/CardDetails';

interface Calculation {
  id: string;
  userId: string;
  city?: string | null;
  country?: string | null;
  cityName?: string | null;
  cpi?: number | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  // Only standardized values and display fields
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
  // Display fields for percentages
  house_Infrastructure_display?: string;
  economic_strength_display?: string;
  economic_agglomeration_display?: string;
  employment_display?: string;
  social_infrastructure_display?: string;
  urban_mobility_display?: string;
  urban_form_display?: string;
  health_display?: string;
  education_display?: string;
  safety_and_security_display?: string;
  public_space_display?: string;
  economic_equity_display?: string;
  social_inclusion_display?: string;
  gender_inclusion_display?: string;
  urban_diversity_display?: string;
  air_quality_display?: string;
  waste_management_display?: string;
  sustainable_energy_display?: string;
  participation_display?: string;
  municipal_financing_and_institutional_capacity_display?: string;
  governance_of_urbanization_display?: string;
  ict_display?: string;
  cpi_display?: string;
  [key: string]: string | number | Date | null | undefined;
}

const getComment = (score: number | string): string => {
  if (score === '-' || typeof score !== 'number') return '-';
  
  if (score >= 80) return "VERY SOLID";
  else if (score >= 70) return "SOLID";
  else if (score >= 60) return "MODERATELY SOLID";
  else if (score >= 50) return "MODERATELY WEAK";
  else if (score >= 40) return "WEAK";
  else return "VERY WEAK";
};

const calculateAverage = (data: Calculation, fields: string[]): number | string => {
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
  return Number((sum / count).toFixed(2));
};

const calculateAllIndexes = (data: Calculation) => {
  // Calculate all sub-indexes using standardized fields
  const houseInfra = calculateAverage(data, ["improved_shelter_standardized", "improved_water_standardized", "improved_sanitation_standardized", "sufficient_living_standardized", "population_standardized", "electricity_standardized"]);
  if (typeof houseInfra === 'number') {
    data.house_Infrastructure = houseInfra;
    data.house_Infrastructure_comment = getComment(houseInfra);
    data.house_Infrastructure_display = `${houseInfra.toFixed(2)}%`;
  }

  const economicStrength = calculateAverage(data, ["city_product_per_capita_standardized", "old_age_dependency_ratio_standardized", "mean_household_income_standardized"]);
  if (typeof economicStrength === 'number') {
    data.economic_strength = economicStrength;
    data.economic_strength_comment = getComment(economicStrength);
    data.economic_strength_display = `${economicStrength.toFixed(2)}%`;
  }

  const economicAgglomeration = calculateAverage(data, ["economic_density_standardized", "economic_specialization_standardized"]);
  if (typeof economicAgglomeration === 'number') {
    data.economic_agglomeration = economicAgglomeration;
    data.economic_agglomeration_comment = getComment(economicAgglomeration);
    data.economic_agglomeration_display = `${economicAgglomeration.toFixed(2)}%`;
  }

  const employment = calculateAverage(data, ["unemployment_rate_standardized", "employment_to_population_ratio_standardized", "informal_employment_standardized"]);
  if (typeof employment === 'number') {
    data.employment = employment;
    data.employment_comment = getComment(employment);
    data.employment_display = `${employment.toFixed(2)}%`;
  }

  const socialInfra = calculateAverage(data, ["physician_density_standardized", "number_of_public_libraries_standardized"]);
  if (typeof socialInfra === 'number') {
    data.social_infrastructure = socialInfra;
    data.social_infrastructure_comment = getComment(socialInfra);
    data.social_infrastructure_display = `${socialInfra.toFixed(2)}%`;
  }

  const urbanMobility = calculateAverage(data, ["use_of_public_transport_standardized", "average_daily_travel_time_standardized", "length_of_mass_transport_network_standardized", "traffic_fatalities_standardized", "affordability_of_transport_standardized"]);
  if (typeof urbanMobility === 'number') {
    data.urban_mobility = urbanMobility;
    data.urban_mobility_comment = getComment(urbanMobility);
    data.urban_mobility_display = `${urbanMobility.toFixed(2)}%`;
  }

  const urbanForm = calculateAverage(data, ["street_intersection_density_standardized", "street_density_standardized", "land_allocated_to_streets_standardized"]);
  if (typeof urbanForm === 'number') {
    data.urban_form = urbanForm;
    data.urban_form_comment = getComment(urbanForm);
    data.urban_form_display = `${urbanForm.toFixed(2)}%`;
  }

  const health = calculateAverage(data, ["life_expectancy_at_birth_standardized", "under_five_mortality_rate_standardized", "vaccination_coverage_standardized", "maternal_mortality_standardized"]);
  if (typeof health === 'number') {
    data.health = health;
    data.health_comment = getComment(health);
    data.health_display = `${health.toFixed(2)}%`;
  }

  const education = calculateAverage(data, ["literacy_rate_standardized", "mean_years_of_schooling_standardized", "early_childhood_education_standardized", "net_enrollment_rate_in_higher_education_standardized"]);
  if (typeof education === 'number') {
    data.education = education;
    data.education_comment = getComment(education);
    data.education_display = `${education.toFixed(2)}%`;
  }

  const safety = calculateAverage(data, ["homicide_rate_standardized", "theft_rate_standardized"]);
  if (typeof safety === 'number') {
    data.safety_and_security = safety;
    data.safety_and_security_comment = getComment(safety);
    data.safety_and_security_display = `${safety.toFixed(2)}%`;
  }

  const publicSpace = calculateAverage(data, ["accessibility_to_open_public_areas_standardized", "green_area_per_capita_standardized"]);
  if (typeof publicSpace === 'number') {
    data.public_space = publicSpace;
    data.public_space_comment = getComment(publicSpace);
    data.public_space_display = `${publicSpace.toFixed(2)}%`;
  }

  const economicEquity = calculateAverage(data, ["gini_standardized_score", "poverty_rate_standardized_score"]);
  if (typeof economicEquity === 'number') {
    data.economic_equity = economicEquity;
    data.economic_equity_comment = getComment(economicEquity);
    data.economic_equity_display = `${economicEquity.toFixed(2)}%`;
  }

  const socialInclusion = calculateAverage(data, ["slums_households_standardized", "youth_unemployment_standardized"]);
  if (typeof socialInclusion === 'number') {
    data.social_inclusion = socialInclusion;
    data.social_inclusion_comment = getComment(socialInclusion);
    data.social_inclusion_display = `${socialInclusion.toFixed(2)}%`;
  }

  const genderInclusion = calculateAverage(data, ["equitable_secondary_school_enrollment_standardized", "women_in_local_government_standardized", "women_in_local_work_force_standardized"]);
  if (typeof genderInclusion === 'number') {
    data.gender_inclusion = genderInclusion;
    data.gender_inclusion_comment = getComment(genderInclusion);
    data.gender_inclusion_display = `${genderInclusion.toFixed(2)}%`;
  }

  const urbanDiversity = calculateAverage(data, ["land_use_mix_standardized"]);
  if (typeof urbanDiversity === 'number') {
    data.urban_diversity = urbanDiversity;
    data.urban_diversity_comment = getComment(urbanDiversity);
    data.urban_diversity_display = `${urbanDiversity.toFixed(2)}%`;
  }

  const airQuality = calculateAverage(data, ["number_of_monitoring_stations_standardized", "pm25_concentration_standardized", "co2_emissions_standardized"]);
  if (typeof airQuality === 'number') {
    data.air_quality = airQuality;
    data.air_quality_comment = getComment(airQuality);
    data.air_quality_display = `${airQuality.toFixed(2)}%`;
  }

  const wasteManagement = calculateAverage(data, ["solid_waste_collection_standardized", "waste_water_treatment_standardized", "solid_waste_recycling_share_standardized"]);
  if (typeof wasteManagement === 'number') {
    data.waste_management = wasteManagement;
    data.waste_management_comment = getComment(wasteManagement);
    data.waste_management_display = `${wasteManagement.toFixed(2)}%`;
  }

  const sustainableEnergy = calculateAverage(data, ["share_of_renewable_energy_standardized"]);
  if (typeof sustainableEnergy === 'number') {
    data.sustainable_energy = sustainableEnergy;
    data.sustainable_energy_comment = getComment(sustainableEnergy);
    data.sustainable_energy_display = `${sustainableEnergy.toFixed(2)}%`;
  }

  const participation = calculateAverage(data, ["voter_turnout_standardized", "access_to_public_information_standardized", "civic_participation_standardized"]);
  if (typeof participation === 'number') {
    data.participation = participation;
    data.participation_comment = getComment(participation);
    data.participation_display = `${participation.toFixed(2)}%`;
  }

  const municipalFinancing = calculateAverage(data, ["own_revenue_collection_standardized", "days_to_start_a_business_standardized", "subnational_debt_standardized", "local_expenditure_efficiency_standardized"]);
  if (typeof municipalFinancing === 'number') {
    data.municipal_financing_and_institutional_capacity = municipalFinancing;
    data.municipal_financing_and_institutional_capacity_comment = getComment(municipalFinancing);
    data.municipal_financing_and_institutional_capacity_display = `${municipalFinancing.toFixed(2)}%`;
  }

  const governance = calculateAverage(data, ["land_use_efficiency_standardized"]);
  if (typeof governance === 'number') {
    data.governance_of_urbanization = governance;
    data.governance_of_urbanization_comment = getComment(governance);
    data.governance_of_urbanization_display = `${governance.toFixed(2)}%`;
  }

  const ict = calculateAverage(data, ["internet_access_standardized", "home_computer_access_standardized", "average_broadband_speed_standardized"]);
  if (typeof ict === 'number') {
    data.ict = ict;
    data.ict_comment = getComment(ict);
    data.ict_display = `${ict.toFixed(2)}%`;
  }

  // Calculate CPI from all 22 sub-indexes (same as table page)
  const cpiFields = [
    "house_Infrastructure",
    "economic_agglomeration",
    "economic_strength",
    "employment",
    "social_infrastructure",
    "urban_mobility",
    "urban_form",
    "health",
    "education",
    "safety_and_security",
    "public_space",
    "economic_equity", 
    "social_inclusion",
    "gender_inclusion",
    "urban_diversity",
    "air_quality",
    "waste_management",
    "sustainable_energy",
    "participation",
    "municipal_financing_and_institutional_capacity",
    "governance_of_urbanization",
    "ict"
  ];

  const cpi = calculateAverage(data, cpiFields);
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

        const data = await response.json();
        
        // Calculate all indexes and CPI
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

  return <CardDetails calculation={calculation} />;
}
