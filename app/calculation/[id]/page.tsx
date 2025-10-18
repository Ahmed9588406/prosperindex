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
  // Add display fields for percentages
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

// New normalization function to scale to 0-100
const normalizeTo100 = (value: number, min: number = 0, max: number = 100): number => {
  // Assuming min=0 and max=100 for simplicity; adjust if your data has different ranges
  if (max === min) return 0;
  return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
};

const calculateAllIndexes = (data: Calculation) => {
  // Calculate all sub-indexes using standardized fields
  const houseInfra = calculateAverage(data, ["improved_shelter_standardized", "improved_water_standardized", "improved_sanitation_standardized", "sufficient_living_standardized", "population_standardized", "electricity_standardized"]);
  if (typeof houseInfra === 'number') {
    const normalized = normalizeTo100(houseInfra);
    data.house_Infrastructure = normalized;
    data.house_Infrastructure_comment = getComment(normalized);
    data.house_Infrastructure_display = `${normalized}%`;
  }

  const economicStrength = calculateAverage(data, ["city_product_per_capita_standardized", "old_age_dependency_ratio_standardized", "mean_household_income_standardized"]);
  if (typeof economicStrength === 'number') {
    const normalized = normalizeTo100(economicStrength);
    data.economic_strength = normalized;
    data.economic_strength_comment = getComment(normalized);
    data.economic_strength_display = `${normalized}%`;
  }

  const economicAgglomeration = calculateAverage(data, ["economic_density_standardized", "economic_specialization_standardized"]);
  if (typeof economicAgglomeration === 'number') {
    const normalized = normalizeTo100(economicAgglomeration);
    data.economic_agglomeration = normalized;
    data.economic_agglomeration_comment = getComment(normalized);
    data.economic_agglomeration_display = `${normalized}%`;
  }

  const employment = calculateAverage(data, ["unemployment_rate_standardized", "employment_to_population_ratio_standardized", "informal_employment_standardized"]);
  if (typeof employment === 'number') {
    const normalized = normalizeTo100(employment);
    data.employment = normalized;
    data.employment_comment = getComment(normalized);
    data.employment_display = `${normalized}%`;
  }

  const socialInfra = calculateAverage(data, ["physician_density_standardized", "number_of_public_libraries_standardized"]);
  if (typeof socialInfra === 'number') {
    const normalized = normalizeTo100(socialInfra);
    data.social_infrastructure = normalized;
    data.social_infrastructure_comment = getComment(normalized);
    data.social_infrastructure_display = `${normalized}%`;
  }

  const urbanMobility = calculateAverage(data, ["use_of_public_transport_standardized", "average_daily_travel_time_standardized", "length_of_mass_transport_network_standardized", "traffic_fatalities_standardized", "affordability_of_transport_standardized"]);
  if (typeof urbanMobility === 'number') {
    const normalized = normalizeTo100(urbanMobility);
    data.urban_mobility = normalized;
    data.urban_mobility_comment = getComment(normalized);
    data.urban_mobility_display = `${normalized}%`;
  }

  const urbanForm = calculateAverage(data, ["street_intersection_density_standardized", "street_density_standardized", "land_allocated_to_streets_standardized"]);
  if (typeof urbanForm === 'number') {
    const normalized = normalizeTo100(urbanForm);
    data.urban_form = normalized;
    data.urban_form_comment = getComment(normalized);
    data.urban_form_display = `${normalized}%`;
  }

  const health = calculateAverage(data, ["life_expectancy_at_birth_standardized", "under_five_mortality_rate_standardized", "vaccination_coverage_standardized", "maternal_mortality_standardized"]);
  if (typeof health === 'number') {
    const normalized = normalizeTo100(health);
    data.health = normalized;
    data.health_comment = getComment(normalized);
    data.health_display = `${normalized}%`;
  }

  const education = calculateAverage(data, ["literacy_rate_standardized", "mean_years_of_schooling_standardized", "early_childhood_education_standardized", "net_enrollment_rate_in_higher_education_standardized"]);
  if (typeof education === 'number') {
    const normalized = normalizeTo100(education);
    data.education = normalized;
    data.education_comment = getComment(normalized);
    data.education_display = `${normalized}%`;
  }

  const safety = calculateAverage(data, ["homicide_rate_standardized", "theft_rate_standardized"]);
  if (typeof safety === 'number') {
    const normalized = normalizeTo100(safety);
    data.safety_and_security = normalized;
    data.safety_and_security_comment = getComment(normalized);
    data.safety_and_security_display = `${normalized}%`;
  }

  const publicSpace = calculateAverage(data, ["accessibility_to_open_public_areas_standardized", "green_area_per_capita_standardized"]);
  if (typeof publicSpace === 'number') {
    const normalized = normalizeTo100(publicSpace);
    data.public_space = normalized;
    data.public_space_comment = getComment(normalized);
    data.public_space_display = `${normalized}%`;
  }

  const economicEquity = calculateAverage(data, ["gini_standardized_score", "poverty_rate_standardized_score"]);
  if (typeof economicEquity === 'number') {
    const normalized = normalizeTo100(economicEquity);
    data.economic_equity = normalized;
    data.economic_equity_comment = getComment(normalized);
    data.economic_equity_display = `${normalized}%`;
  }

  const socialInclusion = calculateAverage(data, ["slums_households_standardized", "youth_unemployment_standardized"]);
  if (typeof socialInclusion === 'number') {
    const normalized = normalizeTo100(socialInclusion);
    data.social_inclusion = normalized;
    data.social_inclusion_comment = getComment(normalized);
    data.social_inclusion_display = `${normalized}%`;
  }

  const genderInclusion = calculateAverage(data, ["equitable_secondary_school_enrollment_standardized", "women_in_local_government_standardized", "women_in_local_work_force_standardized"]);
  if (typeof genderInclusion === 'number') {
    const normalized = normalizeTo100(genderInclusion);
    data.gender_inclusion = normalized;
    data.gender_inclusion_comment = getComment(normalized);
    data.gender_inclusion_display = `${normalized}%`;
  }

  const urbanDiversity = calculateAverage(data, ["land_use_mix_standardized"]);
  if (typeof urbanDiversity === 'number') {
    const normalized = normalizeTo100(urbanDiversity);
    data.urban_diversity = normalized;
    data.urban_diversity_comment = getComment(normalized);
    data.urban_diversity_display = `${normalized}%`;
  }

  const airQuality = calculateAverage(data, ["number_of_monitoring_stations_standardized", "pm25_concentration_standardized", "co2_emissions_standardized"]);
  if (typeof airQuality === 'number') {
    const normalized = normalizeTo100(airQuality);
    data.air_quality = normalized;
    data.air_quality_comment = getComment(normalized);
    data.air_quality_display = `${normalized}%`;
  }

  const wasteManagement = calculateAverage(data, ["solid_waste_collection_standardized", "waste_water_treatment_standardized", "solid_waste_recycling_share_standardized"]);
  if (typeof wasteManagement === 'number') {
    const normalized = normalizeTo100(wasteManagement);
    data.waste_management = normalized;
    data.waste_management_comment = getComment(normalized);
    data.waste_management_display = `${normalized}%`;
  }

  const sustainableEnergy = calculateAverage(data, ["share_of_renewable_energy_standardized"]);
  if (typeof sustainableEnergy === 'number') {
    const normalized = normalizeTo100(sustainableEnergy);
    data.sustainable_energy = normalized;
    data.sustainable_energy_comment = getComment(normalized);
    data.sustainable_energy_display = `${normalized}%`;
  }

  const participation = calculateAverage(data, ["voter_turnout_standardized", "access_to_public_information_standardized", "civic_participation_standardized"]);
  if (typeof participation === 'number') {
    const normalized = normalizeTo100(participation);
    data.participation = normalized;
    data.participation_comment = getComment(normalized);
    data.participation_display = `${normalized}%`;
  }

  const municipalFinancing = calculateAverage(data, ["own_revenue_collection_standardized", "days_to_start_a_business_standardized", "subnational_debt_standardized", "local_expenditure_efficiency_standardized"]);
  if (typeof municipalFinancing === 'number') {
    const normalized = normalizeTo100(municipalFinancing);
    data.municipal_financing_and_institutional_capacity = normalized;
    data.municipal_financing_and_institutional_capacity_comment = getComment(normalized);
    data.municipal_financing_and_institutional_capacity_display = `${normalized}%`;
  }

  const governance = calculateAverage(data, ["land_use_efficiency_standardized"]);
  if (typeof governance === 'number') {
    const normalized = normalizeTo100(governance);
    data.governance_of_urbanization = normalized;
    data.governance_of_urbanization_comment = getComment(normalized);
    data.governance_of_urbanization_display = `${normalized}%`;
  }

  const ict = calculateAverage(data, ["internet_access_standardized", "home_computer_access_standardized", "average_broadband_speed_standardized"]);
  if (typeof ict === 'number') {
    const normalized = normalizeTo100(ict);
    data.ict = normalized;
    data.ict_comment = getComment(normalized);
    data.ict_display = `${normalized}%`;
  }

  // Now calculate CPI from all 22 sub-indexes
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
    const normalizedCpi = normalizeTo100(cpi);
    data.cpi = normalizedCpi;
    data.cpi_comment = getComment(normalizedCpi);
    data.cpi_display = `${normalizedCpi}%`;
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
