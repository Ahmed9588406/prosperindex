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

const calculateAverage = (data: any, fields: string[]): number | string => {
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
  // Calculate all sub-indexes
  const houseInfra = calculateAverage(data, ["improved_shelter", "improved_water", "improved_sanitation", "sufficient_living", "population", "electricity"]);
  if (typeof houseInfra === 'number') {
    data.house_Infrastructure = houseInfra;
    data.house_Infrastructure_comment = getComment(houseInfra);
  }

  const economicStrength = calculateAverage(data, ["city_product_per_capita", "old_age_dependency_ratio", "mean_household_income"]);
  if (typeof economicStrength === 'number') {
    data.economic_strength = economicStrength;
    data.economic_strength_comment = getComment(economicStrength);
  }

  const economicAgglomeration = calculateAverage(data, ["economic_density", "economic_specialization"]);
  if (typeof economicAgglomeration === 'number') {
    data.economic_agglomeration = economicAgglomeration;
    data.economic_agglomeration_comment = getComment(economicAgglomeration);
  }

  const employment = calculateAverage(data, ["unemployment_rate", "employment_to_population_ratio", "informal_employment"]);
  if (typeof employment === 'number') {
    data.employment = employment;
    data.employment_comment = getComment(employment);
  }

  const socialInfra = calculateAverage(data, ["physician_density", "number_of_public_libraries"]);
  if (typeof socialInfra === 'number') {
    data.social_infrastructure = socialInfra;
    data.social_infrastructure_comment = getComment(socialInfra);
  }

  const urbanMobility = calculateAverage(data, ["use_of_public_transport", "average_daily_travel_time", "length_of_mass_transport_network", "traffic_fatalities", "affordability_of_transport"]);
  if (typeof urbanMobility === 'number') {
    data.urban_mobility = urbanMobility;
    data.urban_mobility_comment = getComment(urbanMobility);
  }

  const urbanForm = calculateAverage(data, ["street_intersection_density", "street_density", "land_allocated_to_streets"]);
  if (typeof urbanForm === 'number') {
    data.urban_form = urbanForm;
    data.urban_form_comment = getComment(urbanForm);
  }

  const health = calculateAverage(data, ["life_expectancy_at_birth", "under_five_mortality_rate", "vaccination_coverage", "maternal_mortality"]);
  if (typeof health === 'number') {
    data.health = health;
    data.health_comment = getComment(health);
  }

  const education = calculateAverage(data, ["literacy_rate", "mean_years_of_schooling", "early_childhood_education", "net_enrollment_rate_in_higher_education"]);
  if (typeof education === 'number') {
    data.education = education;
    data.education_comment = getComment(education);
  }

  const safety = calculateAverage(data, ["homicide_rate", "theft_rate"]);
  if (typeof safety === 'number') {
    data.safety_and_security = safety;
    data.safety_and_security_comment = getComment(safety);
  }

  const publicSpace = calculateAverage(data, ["accessibility_to_open_public_areas", "green_area_per_capita"]);
  if (typeof publicSpace === 'number') {
    data.public_space = publicSpace;
    data.public_space_comment = getComment(publicSpace);
  }

  const economicEquity = calculateAverage(data, ["gini_coefficient", "poverty_rate"]);
  if (typeof economicEquity === 'number') {
    data.economic_equity = economicEquity;
    data.economic_equity_comment = getComment(economicEquity);
  }

  const socialInclusion = calculateAverage(data, ["slums_households", "youth_unemployment"]);
  if (typeof socialInclusion === 'number') {
    data.social_inclusion = socialInclusion;
    data.social_inclusion_comment = getComment(socialInclusion);
  }

  const genderInclusion = calculateAverage(data, ["equitable_secondary_school_enrollment", "women_in_local_government", "women_in_local_work_force"]);
  if (typeof genderInclusion === 'number') {
    data.gender_inclusion = genderInclusion;
    data.gender_inclusion_comment = getComment(genderInclusion);
  }

  const urbanDiversity = calculateAverage(data, ["land_use_mix"]);
  if (typeof urbanDiversity === 'number') {
    data.urban_diversity = urbanDiversity;
    data.urban_diversity_comment = getComment(urbanDiversity);
  }

  const airQuality = calculateAverage(data, ["number_of_monitoring_stations", "pm25_concentration", "co2_emissions"]);
  if (typeof airQuality === 'number') {
    data.air_quality = airQuality;
    data.air_quality_comment = getComment(airQuality);
  }

  const wasteManagement = calculateAverage(data, ["solid_waste_collection", "waste_water_treatment", "solid_waste_recycling_share"]);
  if (typeof wasteManagement === 'number') {
    data.waste_management = wasteManagement;
    data.waste_management_comment = getComment(wasteManagement);
  }

  const sustainableEnergy = calculateAverage(data, ["share_of_renewable_energy"]);
  if (typeof sustainableEnergy === 'number') {
    data.sustainable_energy = sustainableEnergy;
    data.sustainable_energy_comment = getComment(sustainableEnergy);
  }

  const participation = calculateAverage(data, ["voter_turnout", "access_to_public_information", "civic_participation"]);
  if (typeof participation === 'number') {
    data.participation = participation;
    data.participation_comment = getComment(participation);
  }

  const municipalFinancing = calculateAverage(data, ["own_revenue_collection", "days_to_start_a_business", "subnational_debt", "local_expenditure_efficiency"]);
  if (typeof municipalFinancing === 'number') {
    data.municipal_financing_and_institutional_capacity = municipalFinancing;
    data.municipal_financing_and_institutional_capacity_comment = getComment(municipalFinancing);
  }

  const governance = calculateAverage(data, ["land_use_efficiency"]);
  if (typeof governance === 'number') {
    data.governance_of_urbanization = governance;
    data.governance_of_urbanization_comment = getComment(governance);
  }

  const ict = calculateAverage(data, ["internet_access", "home_computer_access", "average_broadband_speed"]);
  if (typeof ict === 'number') {
    data.ict = ict;
    data.ict_comment = getComment(ict);
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
    data.cpi = cpi;
    data.cpi_comment = getComment(cpi);
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
