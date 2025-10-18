"use client";
import React from 'react';
import { ArrowLeft, MapPin, Calendar, TrendingUp, Info } from 'lucide-react';
import Link from 'next/link';

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

interface CardDetailsProps {
  calculation: Calculation;
}

const CardDetails: React.FC<CardDetailsProps> = ({ calculation }) => {
  const categories = [
    {
      title: 'House Infrastructure',
      fields: [
        { key: 'improved_shelter_standardized', label: 'Improved Shelter' },
        { key: 'improved_water_standardized', label: 'Improved Water' },
        { key: 'improved_sanitation_standardized', label: 'Improved Sanitation' },
        { key: 'sufficient_living_standardized', label: 'Sufficient Living Space' },
        { key: 'population_standardized', label: 'Population Density' },
        { key: 'electricity_standardized', label: 'Electricity Access' },
        { key: 'house_Infrastructure', label: 'Overall Score', highlight: true },
      ]
    },
    {
      title: 'Economic Strength',
      fields: [
        { key: 'city_product_per_capita_standardized', label: 'City Product Per Capita' },
        { key: 'old_age_dependency_ratio_standardized', label: 'Old Age Dependency Ratio' },
        { key: 'mean_household_income_standardized', label: 'Mean Household Income' },
        { key: 'economic_strength', label: 'Overall Score', highlight: true },
      ]
    },
    {
      title: 'Economic Agglomeration',
      fields: [
        { key: 'economic_density_standardized', label: 'Economic Density' },
        { key: 'economic_specialization_standardized', label: 'Economic Specialization' },
        { key: 'economic_agglomeration', label: 'Overall Score', highlight: true },
      ]
    },
    {
      title: 'Employment',
      fields: [
        { key: 'unemployment_rate_standardized', label: 'Unemployment Rate' },
        { key: 'employment_to_population_ratio_standardized', label: 'Employment to Population Ratio' },
        { key: 'informal_employment_standardized', label: 'Informal Employment' },
        { key: 'employment', label: 'Overall Score', highlight: true },
      ]
    },
    {
      title: 'Social Infrastructure',
      fields: [
        { key: 'physician_density_standardized', label: 'Physician Density' },
        { key: 'number_of_public_libraries_standardized', label: 'Number of Public Libraries' },
        { key: 'social_infrastructure', label: 'Overall Score', highlight: true },
      ]
    },
    {
      title: 'Urban Mobility',
      fields: [
        { key: 'use_of_public_transport_standardized', label: 'Use of Public Transport' },
        { key: 'average_daily_travel_time_standardized', label: 'Average Daily Travel Time' },
        { key: 'length_of_mass_transport_network_standardized', label: 'Length of Mass Transport Network' },
        { key: 'traffic_fatalities_standardized', label: 'Traffic Fatalities' },
        { key: 'affordability_of_transport_standardized', label: 'Affordability of Transport' },
        { key: 'urban_mobility', label: 'Overall Score', highlight: true },
      ]
    },
    {
      title: 'Urban Form',
      fields: [
        { key: 'street_intersection_density_standardized', label: 'Street Intersection Density' },
        { key: 'street_density_standardized', label: 'Street Density' },
        { key: 'land_allocated_to_streets_standardized', label: 'Land Allocated to Streets' },
        { key: 'urban_form', label: 'Overall Score', highlight: true },
      ]
    },
    {
      title: 'Health',
      fields: [
        { key: 'life_expectancy_at_birth_standardized', label: 'Life Expectancy at Birth' },
        { key: 'under_five_mortality_rate_standardized', label: 'Under Five Mortality Rate' },
        { key: 'vaccination_coverage_standardized', label: 'Vaccination Coverage' },
        { key: 'maternal_mortality_standardized', label: 'Maternal Mortality' },
        { key: 'health', label: 'Overall Score', highlight: true },
      ]
    },
    {
      title: 'Education',
      fields: [
        { key: 'literacy_rate_standardized', label: 'Literacy Rate' },
        { key: 'mean_years_of_schooling_standardized', label: 'Mean Years of Schooling' },
        { key: 'early_childhood_education_standardized', label: 'Early Childhood Education' },
        { key: 'net_enrollment_rate_in_higher_education_standardized', label: 'Net Enrollment Rate in Higher Education' },
        { key: 'education', label: 'Overall Score', highlight: true },
      ]
    },
    {
      title: 'Safety and Security',
      fields: [
        { key: 'homicide_rate_standardized', label: 'Homicide Rate' },
        { key: 'theft_rate_standardized', label: 'Theft Rate' },
        { key: 'safety_and_security', label: 'Overall Score', highlight: true },
      ]
    },
    {
      title: 'Public Space',
      fields: [
        { key: 'accessibility_to_open_public_areas_standardized', label: 'Accessibility to Open Public Areas' },
        { key: 'green_area_per_capita_standardized', label: 'Green Area Per Capita' },
        { key: 'public_space', label: 'Overall Score', highlight: true },
      ]
    },
    {
      title: 'Economic Equity',
      fields: [
        { key: 'gini_standardized_score', label: 'Gini Coefficient' },
        { key: 'poverty_rate_standardized_score', label: 'Poverty Rate' },
        { key: 'economic_equity', label: 'Overall Score', highlight: true },
      ]
    },
    {
      title: 'Social Inclusion',
      fields: [
        { key: 'slums_households_standardized', label: 'Slums Households' },
        { key: 'youth_unemployment_standardized', label: 'Youth Unemployment' },
        { key: 'social_inclusion', label: 'Overall Score', highlight: true },
      ]
    },
    {
      title: 'Gender Inclusion',
      fields: [
        { key: 'equitable_secondary_school_enrollment_standardized', label: 'Equitable Secondary School Enrollment' },
        { key: 'women_in_local_government_standardized', label: 'Women in Local Government' },
        { key: 'women_in_local_work_force_standardized', label: 'Women in Local Work Force' },
        { key: 'gender_inclusion', label: 'Overall Score', highlight: true },
      ]
    },
    {
      title: 'Urban Diversity',
      fields: [
        { key: 'land_use_mix_standardized', label: 'Land Use Mix' },
        { key: 'urban_diversity', label: 'Overall Score', highlight: true },
      ]
    },
    {
      title: 'Air Quality',
      fields: [
        { key: 'number_of_monitoring_stations_standardized', label: 'Number of Monitoring Stations' },
        { key: 'pm25_concentration_standardized', label: 'PM2.5 Concentration' },
        { key: 'co2_emissions_standardized', label: 'CO2 Emissions' },
        { key: 'air_quality', label: 'Overall Score', highlight: true },
      ]
    },
    {
      title: 'Waste Management',
      fields: [
        { key: 'solid_waste_collection_standardized', label: 'Solid Waste Collection' },
        { key: 'waste_water_treatment_standardized', label: 'Waste Water Treatment' },
        { key: 'solid_waste_recycling_share_standardized', label: 'Solid Waste Recycling Share' },
        { key: 'waste_management', label: 'Overall Score', highlight: true },
      ]
    },
    {
      title: 'Sustainable Energy',
      fields: [
        { key: 'share_of_renewable_energy_standardized', label: 'Share of Renewable Energy' },
        { key: 'sustainable_energy', label: 'Overall Score', highlight: true },
      ]
    },
    {
      title: 'Participation',
      fields: [
        { key: 'voter_turnout_standardized', label: 'Voter Turnout' },
        { key: 'access_to_public_information_standardized', label: 'Access to Public Information' },
        { key: 'civic_participation_standardized', label: 'Civic Participation' },
        { key: 'participation', label: 'Overall Score', highlight: true },
      ]
    },
    {
      title: 'Municipal Financing',
      fields: [
        { key: 'own_revenue_collection_standardized', label: 'Own Revenue Collection' },
        { key: 'days_to_start_a_business_standardized', label: 'Days to Start a Business' },
        { key: 'subnational_debt_standardized', label: 'Subnational Debt' },
        { key: 'local_expenditure_efficiency_standardized', label: 'Local Expenditure Efficiency' },
        { key: 'municipal_financing_and_institutional_capacity', label: 'Overall Score', highlight: true },
      ]
    },
    {
      title: 'Governance',
      fields: [
        { key: 'land_use_efficiency_standardized', label: 'Land Use Efficiency' },
        { key: 'governance_of_urbanization', label: 'Overall Score', highlight: true },
      ]
    },
    {
      title: 'Information and Communications Technology',
      fields: [
        { key: 'internet_access_standardized', label: 'Internet Access' },
        { key: 'home_computer_access_standardized', label: 'Home Computer Access' },
        { key: 'average_broadband_speed_standardized', label: 'Average Broadband Speed' },
        { key: 'ict', label: 'Overall Score', highlight: true },
      ]
    },
  ];

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/history" className="text-white hover:text-purple-300 transition">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Calculation Details</h1>
          <div className="w-6"></div>
        </div>

        {/* City Info Card */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 mb-8 shadow-2xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="w-6 h-6 text-white" />
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  {calculation.cityName || calculation.city}
                </h2>
              </div>
              <p className="text-purple-100">{calculation.country}</p>
            </div>
            <div className="flex flex-col items-start md:items-end gap-2">
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
                <span className="text-2xl font-bold text-white">
                  {calculation.cpi?.toFixed(2) || 'N/A'}
                </span>
                <span className="text-sm text-purple-100">CPI</span>
              </div>
              {calculation.cpi_comment && (
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/30">
                  <p className="text-sm font-bold text-white tracking-wide">
                    {String(calculation.cpi_comment)}
                  </p>
                </div>
              )}
              <div className="flex items-center gap-2 text-purple-100 text-sm">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(calculation.updatedAt || calculation.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {categories.map((category) => (
            <div key={category.title} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
              <h3 className="text-xl font-bold text-white mb-4 pb-3 border-b border-white/20">
                {category.title}
              </h3>
              <div className="space-y-3">
                {category.fields.map((field) => {
                  const value = calculation[field.key];
                  
                  // Get comment from the base field name (without _standardized suffix)
                  const baseFieldKey = field.key.replace('_standardized', '').replace('_score', '');
                  const comment = calculation[`${baseFieldKey}_comment`];
                  
                  if (value === null || value === undefined) return null;

                  // Format value with percentage
                  const formattedValue = typeof value === 'number' 
                    ? `${value.toFixed(2)}%` 
                    : String(value);

                  return (
                    <div 
                      key={field.key} 
                      className={`${
                        field.highlight 
                          ? 'bg-gradient-to-r from-purple-600/30 to-blue-600/30 border border-purple-400/40 rounded-lg p-4 shadow-lg' 
                          : 'bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className={`${field.highlight ? 'font-semibold text-purple-100 text-base' : 'text-gray-300 text-sm'}`}>
                          {field.label}
                        </span>
                        <span className={`${field.highlight ? 'text-2xl font-bold text-white' : 'font-semibold text-white'}`}>
                          {formattedValue}
                        </span>
                      </div>
                      {comment && (
                        <div className="mt-3 flex items-start gap-2 bg-white/10 backdrop-blur-sm rounded-md p-2 border border-white/20">
                          <Info className="w-4 h-4 text-blue-300 flex-shrink-0 mt-0.5" />
                          <p className="text-xs font-medium text-blue-200 leading-relaxed">
                            {String(comment)}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CardDetails;
