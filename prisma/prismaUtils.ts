import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Define the type for the data object
type CalculationHistoryData = {
  userId: string;
  city: string;  // Changed from optional to required
  country: string; // Changed from optional to required
  cityName?: string; // Optional field
  // House Infrastructure
  improved_shelter?: number;
  improved_water?: number;
  improved_sanitation?: number;
  sufficient_living?: number;
  population?: number;
  electricity?: number;
  house_Infrastructure?: number;
  // Economic Strength
  city_product_per_capita?: number;
  old_age_dependency_ratio?: number;
  mean_household_income?: number;
  economic_strength?: number;
  // Economic Agglomeration
  economic_density?: number;
  economic_specialization?: number;
  economic_agglomeration?: number;
  // Employment
  unemployment_rate?: number;
  employment_to_population_ratio?: number;
  informal_employment?: number;
  employment?: number;
  // Social Infrastructure
  physician_density?: number;
  number_of_public_libraries?: number;
  social_infrastructure?: number;
  // Urban Mobility
  use_of_public_transport?: number;
  average_daily_travel_time?: number;
  length_of_mass_transport_network?: number;
  traffic_fatalities?: number;
  affordability_of_transport?: number;
  urban_mobility?: number;
  // Urban Form
  street_intersection_density?: number;
  street_density?: number;
  land_allocated_to_streets?: number;
  urban_form?: number;
  // Health
  life_expectancy_at_birth?: number;
  under_five_mortality_rate?: number;
  vaccination_coverage?: number;
  maternal_mortality?: number;
  health?: number;
  // Education
  literacy_rate?: number;
  mean_years_of_schooling?: number;
  early_childhood_education?: number;
  net_enrollment_rate_in_higher_education?: number;
  education?: number;
  // Safety and Security
  homicide_rate?: number;
  theft_rate?: number;
  safety_and_security?: number;
  // Public Space
  accessibility_to_open_public_areas?: number;
  green_area_per_capita?: number;
  public_space?: number;
  // Economic Equity
  gini_coefficient?: number;
  poverty_rate?: number;
  economic_equity?: number;
  // Social Inclusion
  slums_households?: number;
  youth_unemployment?: number;
  social_inclusion?: number;
  // Gender Inclusion
  equitable_secondary_school_enrollment?: number;
  women_in_local_government?: number;
  women_in_local_work_force?: number;
  gender_inclusion?: number;
  // Urban Diversity
  land_use_mix?: number;
  urban_diversity?: number;
  // Air Quality
  number_of_monitoring_stations?: number;
  pm25_concentration?: number;
  co2_emissions?: number;
  air_quality?: number;
  // Waste Management
  solid_waste_collection?: number;
  waste_water_treatment?: number;
  solid_waste_recycling_share?: number;
  waste_management?: number;
  // Sustainable Energy
  share_of_renewable_energy?: number;
  sustainable_energy?: number;
  // Participation
  voter_turnout?: number;
  access_to_public_information?: number;
  civic_participation?: number;
  participation?: number;
  // Municipal Financing
  own_revenue_collection?: number;
  days_to_start_a_business?: number;
  subnational_debt?: number;
  local_expenditure_efficiency?: number;
  municipal_financing_and_institutional_capacity?: number;
  // Governance
  land_use_efficiency?: number;
  governance_of_urbanization?: number;
};

// Function to post data to the CalculationHistory table
export const postCalculationHistory = async (data: CalculationHistoryData) => {
  try {
    const newRecord = await prisma.calculationHistory.create({
      data,
    });
    return newRecord;
  } catch (error) {
    console.error('Error posting data to Prisma:', error);
    throw error;
  }
};