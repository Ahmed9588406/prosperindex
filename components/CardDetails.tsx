"use client";
import React from 'react';
import { ArrowLeft, MapPin, Calendar, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface CardDetailsProps {
  calculation: any;
}

const CardDetails: React.FC<CardDetailsProps> = ({ calculation }) => {
  const categories = [
    {
      title: 'House Infrastructure',
      fields: [
        { key: 'improved_shelter', label: 'Improved Shelter' },
        { key: 'improved_water', label: 'Improved Water' },
        { key: 'improved_sanitation', label: 'Improved Sanitation' },
        { key: 'sufficient_living', label: 'Sufficient Living Space' },
        { key: 'population', label: 'Population Density' },
        { key: 'electricity', label: 'Electricity Access' },
        { key: 'house_Infrastructure', label: 'Overall Score', highlight: true },
      ]
    },
    {
      title: 'Economic Strength',
      fields: [
        { key: 'city_product_per_capita', label: 'City Product Per Capita' },
        { key: 'old_age_dependency_ratio', label: 'Old Age Dependency Ratio' },
        { key: 'mean_household_income', label: 'Mean Household Income' },
        { key: 'economic_strength', label: 'Overall Score', highlight: true },
      ]
    },
    {
      title: 'Economic Agglomeration',
      fields: [
        { key: 'economic_density', label: 'Economic Density' },
        { key: 'economic_specialization', label: 'Economic Specialization' },
        { key: 'economic_agglomeration', label: 'Overall Score', highlight: true },
      ]
    },
    {
      title: 'Employment',
      fields: [
        { key: 'unemployment_rate', label: 'Unemployment Rate' },
        { key: 'employment_to_population_ratio', label: 'Employment to Population Ratio' },
        { key: 'informal_employment', label: 'Informal Employment' },
        { key: 'employment', label: 'Overall Score', highlight: true },
      ]
    },
    {
      title: 'Social Infrastructure',
      fields: [
        { key: 'physician_density', label: 'Physician Density' },
        { key: 'number_of_public_libraries', label: 'Number of Public Libraries' },
        { key: 'social_infrastructure', label: 'Overall Score', highlight: true },
      ]
    },
    {
      title: 'Urban Mobility',
      fields: [
        { key: 'use_of_public_transport', label: 'Use of Public Transport' },
        { key: 'average_daily_travel_time', label: 'Average Daily Travel Time' },
        { key: 'length_of_mass_transport_network', label: 'Length of Mass Transport Network' },
        { key: 'traffic_fatalities', label: 'Traffic Fatalities' },
        { key: 'affordability_of_transport', label: 'Affordability of Transport' },
        { key: 'urban_mobility', label: 'Overall Score', highlight: true },
      ]
    },
    {
      title: 'Urban Form',
      fields: [
        { key: 'street_intersection_density', label: 'Street Intersection Density' },
        { key: 'street_density', label: 'Street Density' },
        { key: 'land_allocated_to_streets', label: 'Land Allocated to Streets' },
        { key: 'urban_form', label: 'Overall Score', highlight: true },
      ]
    },
    {
      title: 'Health',
      fields: [
        { key: 'life_expectancy_at_birth', label: 'Life Expectancy at Birth' },
        { key: 'under_five_mortality_rate', label: 'Under Five Mortality Rate' },
        { key: 'vaccination_coverage', label: 'Vaccination Coverage' },
        { key: 'maternal_mortality', label: 'Maternal Mortality' },
        { key: 'health', label: 'Overall Score', highlight: true },
      ]
    },
    {
      title: 'Education',
      fields: [
        { key: 'literacy_rate', label: 'Literacy Rate' },
        { key: 'mean_years_of_schooling', label: 'Mean Years of Schooling' },
        { key: 'early_childhood_education', label: 'Early Childhood Education' },
        { key: 'net_enrollment_rate_in_higher_education', label: 'Net Enrollment Rate in Higher Education' },
        { key: 'education', label: 'Overall Score', highlight: true },
      ]
    },
    {
      title: 'Safety and Security',
      fields: [
        { key: 'homicide_rate', label: 'Homicide Rate' },
        { key: 'theft_rate', label: 'Theft Rate' },
        { key: 'safety_and_security', label: 'Overall Score', highlight: true },
      ]
    },
    {
      title: 'Public Space',
      fields: [
        { key: 'accessibility_to_open_public_areas', label: 'Accessibility to Open Public Areas' },
        { key: 'green_area_per_capita', label: 'Green Area Per Capita' },
        { key: 'public_space', label: 'Overall Score', highlight: true },
      ]
    },
    {
      title: 'Economic Equity',
      fields: [
        { key: 'gini_coefficient', label: 'Gini Coefficient' },
        { key: 'poverty_rate', label: 'Poverty Rate' },
        { key: 'economic_equity', label: 'Overall Score', highlight: true },
      ]
    },
    {
      title: 'Social Inclusion',
      fields: [
        { key: 'slums_households', label: 'Slums Households' },
        { key: 'youth_unemployment', label: 'Youth Unemployment' },
        { key: 'social_inclusion', label: 'Overall Score', highlight: true },
      ]
    },
    {
      title: 'Gender Inclusion',
      fields: [
        { key: 'equitable_secondary_school_enrollment', label: 'Equitable Secondary School Enrollment' },
        { key: 'women_in_local_government', label: 'Women in Local Government' },
        { key: 'women_in_local_work_force', label: 'Women in Local Work Force' },
        { key: 'gender_inclusion', label: 'Overall Score', highlight: true },
      ]
    },
    {
      title: 'Urban Diversity',
      fields: [
        { key: 'land_use_mix', label: 'Land Use Mix' },
        { key: 'urban_diversity', label: 'Overall Score', highlight: true },
      ]
    },
    {
      title: 'Air Quality',
      fields: [
        { key: 'number_of_monitoring_stations', label: 'Number of Monitoring Stations' },
        { key: 'pm25_concentration', label: 'PM2.5 Concentration' },
        { key: 'co2_emissions', label: 'CO2 Emissions' },
        { key: 'air_quality', label: 'Overall Score', highlight: true },
      ]
    },
    {
      title: 'Waste Management',
      fields: [
        { key: 'solid_waste_collection', label: 'Solid Waste Collection' },
        { key: 'waste_water_treatment', label: 'Waste Water Treatment' },
        { key: 'solid_waste_recycling_share', label: 'Solid Waste Recycling Share' },
        { key: 'waste_management', label: 'Overall Score', highlight: true },
      ]
    },
    {
      title: 'Sustainable Energy',
      fields: [
        { key: 'share_of_renewable_energy', label: 'Share of Renewable Energy' },
        { key: 'sustainable_energy', label: 'Overall Score', highlight: true },
      ]
    },
    {
      title: 'Participation',
      fields: [
        { key: 'voter_turnout', label: 'Voter Turnout' },
        { key: 'access_to_public_information', label: 'Access to Public Information' },
        { key: 'civic_participation', label: 'Civic Participation' },
        { key: 'participation', label: 'Overall Score', highlight: true },
      ]
    },
    {
      title: 'Municipal Financing',
      fields: [
        { key: 'own_revenue_collection', label: 'Own Revenue Collection' },
        { key: 'days_to_start_a_business', label: 'Days to Start a Business' },
        { key: 'subnational_debt', label: 'Subnational Debt' },
        { key: 'local_expenditure_efficiency', label: 'Local Expenditure Efficiency' },
        { key: 'municipal_financing_and_institutional_capacity', label: 'Overall Score', highlight: true },
      ]
    },
    {
      title: 'Governance',
      fields: [
        { key: 'land_use_efficiency', label: 'Land Use Efficiency' },
        { key: 'governance_of_urbanization', label: 'Overall Score', highlight: true },
      ]
    },
    {
      title: 'Information and Communications Technology',
      fields: [
        { key: 'internet_access', label: 'Internet Access' },
        { key: 'home_computer_access', label: 'Home Computer Access' },
        { key: 'average_broadband_speed', label: 'Average Broadband Speed' },
        { key: 'ict', label: 'Overall Score', highlight: true },
      ]
    },
  ];

  const formatDate = (dateString: string) => {
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
            <div key={category.title} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 pb-3 border-b border-white/20">
                {category.title}
              </h3>
              <div className="space-y-3">
                {category.fields.map((field) => {
                  const value = calculation[field.key];
                  const comment = calculation[`${field.key}_comment`];
                  
                  if (value === null || value === undefined) return null;

                  return (
                    <div key={field.key} className={`${field.highlight ? 'bg-purple-600/20 border border-purple-500/30 rounded-lg p-3' : ''}`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className={`${field.highlight ? 'font-semibold text-purple-200' : 'text-gray-300'}`}>
                          {field.label}
                        </span>
                        <span className={`${field.highlight ? 'text-xl font-bold text-white' : 'font-medium text-white'}`}>
                          {typeof value === 'number' ? value.toFixed(2) : value}
                        </span>
                      </div>
                      {comment && (
                        <p className="text-sm text-gray-400 mt-1 italic">
                          {comment}
                        </p>
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
