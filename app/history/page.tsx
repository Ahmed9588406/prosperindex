'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { 
  Building2, 
  TrendingUp, 
  Briefcase, 
  Users, 
  Bus, 
  MapPin, 
  Heart, 
  GraduationCap, 
  Shield, 
  Trees, 
  Scale, 
  Leaf, 
  Vote, 
  Landmark, 
  Wifi,
  ChevronDown,
  ChevronUp,
  Calendar,
  Globe,
  Loader2,
  BarChart3,
  Info
} from 'lucide-react';

interface CalculationHistory {
  id: string;
  city: string;
  country: string;
  cityName?: string;
  
  // All the metrics from your schema
  improved_shelter?: number;
  improved_shelter_comment?: string;
  improved_water?: number;
  improved_water_comment?: string;
  improved_sanitation?: number;
  improved_sanitation_comment?: string;
  sufficient_living?: number;
  sufficient_living_comment?: string;
  population?: number;
  population_comment?: string;
  electricity?: number;
  electricity_comment?: string;
  house_Infrastructure?: number;
  house_Infrastructure_comment?: string;

  city_product_per_capita?: number;
  city_product_per_capita_comment?: string;
  old_age_dependency_ratio?: number;
  old_age_dependency_ratio_comment?: string;
  mean_household_income?: number;
  mean_household_income_comment?: string;
  economic_strength?: number;
  economic_strength_comment?: string;

  economic_density?: number;
  economic_density_comment?: string;
  economic_specialization?: number;
  economic_specialization_comment?: string;
  economic_agglomeration?: number;
  economic_agglomeration_comment?: string;

  unemployment_rate?: number;
  unemployment_rate_comment?: string;
  employment_to_population_ratio?: number;
  employment_to_population_ratio_comment?: string;
  informal_employment?: number;
  informal_employment_comment?: string;
  employment?: number;
  employment_comment?: string;

  physician_density?: number;
  physician_density_comment?: string;
  number_of_public_libraries?: number;
  number_of_public_libraries_comment?: string;
  social_infrastructure?: number;
  social_infrastructure_comment?: string;

  use_of_public_transport?: number;
  use_of_public_transport_comment?: string;
  average_daily_travel_time?: number;
  average_daily_travel_time_comment?: string;
  length_of_mass_transport_network?: number;
  length_of_mass_transport_network_comment?: string;
  traffic_fatalities?: number;
  traffic_fatalities_comment?: string;
  affordability_of_transport?: number;
  affordability_of_transport_comment?: string;
  urban_mobility?: number;
  urban_mobility_comment?: string;

  street_intersection_density?: number;
  street_intersection_density_comment?: string;
  street_density?: number;
  street_density_comment?: string;
  land_allocated_to_streets?: number;
  land_allocated_to_streets_comment?: string;
  urban_form?: number;
  urban_form_comment?: string;

  life_expectancy_at_birth?: number;
  life_expectancy_at_birth_comment?: string;
  under_five_mortality_rate?: number;
  under_five_mortality_rate_comment?: string;
  vaccination_coverage?: number;
  vaccination_coverage_comment?: string;
  maternal_mortality?: number;
  maternal_mortality_comment?: string;
  health?: number;
  health_comment?: string;

  literacy_rate?: number;
  literacy_rate_comment?: string;
  mean_years_of_schooling?: number;
  mean_years_of_schooling_comment?: string;
  early_childhood_education?: number;
  early_childhood_education_comment?: string;
  net_enrollment_rate_in_higher_education?: number;
  net_enrollment_rate_in_higher_education_comment?: string;
  education?: number;
  education_comment?: string;

  homicide_rate?: number;
  homicide_rate_comment?: string;
  theft_rate?: number;
  theft_rate_comment?: string;
  safety_and_security?: number;
  safety_and_security_comment?: string;

  accessibility_to_open_public_areas?: number;
  accessibility_to_open_public_areas_comment?: string;
  green_area_per_capita?: number;
  green_area_per_capita_comment?: string;
  public_space?: number;
  public_space_comment?: string;

  gini_coefficient?: number;
  gini_coefficient_comment?: string;
  poverty_rate?: number;
  poverty_rate_comment?: string;
  economic_equity?: number;
  economic_equity_comment?: string;

  slums_households?: number;
  slums_households_comment?: string;
  youth_unemployment?: number;
  youth_unemployment_comment?: string;
  social_inclusion?: number;
  social_inclusion_comment?: string;

  equitable_secondary_school_enrollment?: number;
  equitable_secondary_school_enrollment_comment?: string;
  women_in_local_government?: number;
  women_in_local_government_comment?: string;
  women_in_local_work_force?: number;
  women_in_local_work_force_comment?: string;
  gender_inclusion?: number;
  gender_inclusion_comment?: string;

  land_use_mix?: number;
  land_use_mix_comment?: string;
  urban_diversity?: number;
  urban_diversity_comment?: string;

  number_of_monitoring_stations?: number;
  number_of_monitoring_stations_comment?: string;
  pm25_concentration?: number;
  pm25_concentration_comment?: string;
  co2_emissions?: number;
  co2_emissions_comment?: string;
  air_quality?: number;
  air_quality_comment?: string;

  solid_waste_collection?: number;
  solid_waste_collection_comment?: string;
  waste_water_treatment?: number;
  waste_water_treatment_comment?: string;
  solid_waste_recycling_share?: number;
  solid_waste_recycling_share_comment?: string;
  waste_management?: number;
  waste_management_comment?: string;

  share_of_renewable_energy?: number;
  share_of_renewable_energy_comment?: string;
  sustainable_energy?: number;
  sustainable_energy_comment?: string;

  voter_turnout?: number;
  voter_turnout_comment?: string;
  access_to_public_information?: number;
  access_to_public_information_comment?: string;
  civic_participation?: number;
  civic_participation_comment?: string;
  participation?: number;
  participation_comment?: string;

  own_revenue_collection?: number;
  own_revenue_collection_comment?: string;
  days_to_start_a_business?: number;
  days_to_start_a_business_comment?: string;
  subnational_debt?: number;
  subnational_debt_comment?: string;
  local_expenditure_efficiency?: number;
  local_expenditure_efficiency_comment?: string;
  municipal_financing_and_institutional_capacity?: number;
  municipal_financing_and_institutional_capacity_comment?: string;

  land_use_efficiency?: number;
  land_use_efficiency_comment?: string;
  governance_of_urbanization?: number;
  governance_of_urbanization_comment?: string;

  internet_access?: number;
  internet_access_comment?: string;
  home_computer_access?: number;
  home_computer_access_comment?: string;
  average_broadband_speed?: number;
  average_broadband_speed_comment?: string;
  ict?: number;
  ict_comment?: string;

  cpi?: number;
  cpi_comment?: string;

  createdAt: string;
  updatedAt: string;
}

const categories = [
  {
    name: 'House Infrastructure',
    icon: Building2,
    color: 'bg-blue-500',
    metrics: [
      { key: 'improved_shelter', label: 'Improved Shelter' },
      { key: 'improved_water', label: 'Improved Water' },
      { key: 'improved_sanitation', label: 'Improved Sanitation' },
      { key: 'sufficient_living', label: 'Sufficient Living' },
      { key: 'population', label: 'Population' },
      { key: 'electricity', label: 'Electricity' },
      { key: 'house_Infrastructure', label: 'Overall House Infrastructure' }
    ]
  },
  {
    name: 'Economic Strength',
    icon: TrendingUp,
    color: 'bg-green-500',
    metrics: [
      { key: 'city_product_per_capita', label: 'City Product Per Capita' },
      { key: 'old_age_dependency_ratio', label: 'Old Age Dependency Ratio' },
      { key: 'mean_household_income', label: 'Mean Household Income' },
      { key: 'economic_strength', label: 'Overall Economic Strength' }
    ]
  },
  {
    name: 'Economic Agglomeration',
    icon: BarChart3,
    color: 'bg-purple-500',
    metrics: [
      { key: 'economic_density', label: 'Economic Density' },
      { key: 'economic_specialization', label: 'Economic Specialization' },
      { key: 'economic_agglomeration', label: 'Overall Economic Agglomeration' }
    ]
  },
  {
    name: 'Employment',
    icon: Briefcase,
    color: 'bg-orange-500',
    metrics: [
      { key: 'unemployment_rate', label: 'Unemployment Rate' },
      { key: 'employment_to_population_ratio', label: 'Employment to Population Ratio' },
      { key: 'informal_employment', label: 'Informal Employment' },
      { key: 'employment', label: 'Overall Employment' }
    ]
  },
  {
    name: 'Social Infrastructure',
    icon: Users,
    color: 'bg-pink-500',
    metrics: [
      { key: 'physician_density', label: 'Physician Density' },
      { key: 'number_of_public_libraries', label: 'Number of Public Libraries' },
      { key: 'social_infrastructure', label: 'Overall Social Infrastructure' }
    ]
  },
  {
    name: 'Urban Mobility',
    icon: Bus,
    color: 'bg-indigo-500',
    metrics: [
      { key: 'use_of_public_transport', label: 'Use of Public Transport' },
      { key: 'average_daily_travel_time', label: 'Average Daily Travel Time' },
      { key: 'length_of_mass_transport_network', label: 'Length of Mass Transport Network' },
      { key: 'traffic_fatalities', label: 'Traffic Fatalities' },
      { key: 'affordability_of_transport', label: 'Affordability of Transport' },
      { key: 'urban_mobility', label: 'Overall Urban Mobility' }
    ]
  },
  {
    name: 'Urban Form',
    icon: MapPin,
    color: 'bg-cyan-500',
    metrics: [
      { key: 'street_intersection_density', label: 'Street Intersection Density' },
      { key: 'street_density', label: 'Street Density' },
      { key: 'land_allocated_to_streets', label: 'Land Allocated to Streets' },
      { key: 'urban_form', label: 'Overall Urban Form' }
    ]
  },
  {
    name: 'Health',
    icon: Heart,
    color: 'bg-red-500',
    metrics: [
      { key: 'life_expectancy_at_birth', label: 'Life Expectancy at Birth' },
      { key: 'under_five_mortality_rate', label: 'Under Five Mortality Rate' },
      { key: 'vaccination_coverage', label: 'Vaccination Coverage' },
      { key: 'maternal_mortality', label: 'Maternal Mortality' },
      { key: 'health', label: 'Overall Health' }
    ]
  },
  {
    name: 'Education',
    icon: GraduationCap,
    color: 'bg-yellow-500',
    metrics: [
      { key: 'literacy_rate', label: 'Literacy Rate' },
      { key: 'mean_years_of_schooling', label: 'Mean Years of Schooling' },
      { key: 'early_childhood_education', label: 'Early Childhood Education' },
      { key: 'net_enrollment_rate_in_higher_education', label: 'Net Enrollment Rate in Higher Education' },
      { key: 'education', label: 'Overall Education' }
    ]
  },
  {
    name: 'Safety & Security',
    icon: Shield,
    color: 'bg-slate-500',
    metrics: [
      { key: 'homicide_rate', label: 'Homicide Rate' },
      { key: 'theft_rate', label: 'Theft Rate' },
      { key: 'safety_and_security', label: 'Overall Safety & Security' }
    ]
  },
  {
    name: 'Public Space',
    icon: Trees,
    color: 'bg-emerald-500',
    metrics: [
      { key: 'accessibility_to_open_public_areas', label: 'Accessibility to Open Public Areas' },
      { key: 'green_area_per_capita', label: 'Green Area Per Capita' },
      { key: 'public_space', label: 'Overall Public Space' }
    ]
  },
  {
    name: 'Economic Equity',
    icon: Scale,
    color: 'bg-amber-500',
    metrics: [
      { key: 'gini_coefficient', label: 'Gini Coefficient' },
      { key: 'poverty_rate', label: 'Poverty Rate' },
      { key: 'economic_equity', label: 'Overall Economic Equity' }
    ]
  },
  {
    name: 'Social Inclusion',
    icon: Users,
    color: 'bg-teal-500',
    metrics: [
      { key: 'slums_households', label: 'Slums Households' },
      { key: 'youth_unemployment', label: 'Youth Unemployment' },
      { key: 'social_inclusion', label: 'Overall Social Inclusion' }
    ]
  },
  {
    name: 'Gender Inclusion',
    icon: Users,
    color: 'bg-fuchsia-500',
    metrics: [
      { key: 'equitable_secondary_school_enrollment', label: 'Equitable Secondary School Enrollment' },
      { key: 'women_in_local_government', label: 'Women in Local Government' },
      { key: 'women_in_local_work_force', label: 'Women in Local Work Force' },
      { key: 'gender_inclusion', label: 'Overall Gender Inclusion' }
    ]
  },
  {
    name: 'Urban Diversity',
    icon: MapPin,
    color: 'bg-violet-500',
    metrics: [
      { key: 'land_use_mix', label: 'Land Use Mix' },
      { key: 'urban_diversity', label: 'Overall Urban Diversity' }
    ]
  },
  {
    name: 'Air Quality',
    icon: Leaf,
    color: 'bg-lime-500',
    metrics: [
      { key: 'number_of_monitoring_stations', label: 'Number of Monitoring Stations' },
      { key: 'pm25_concentration', label: 'PM2.5 Concentration' },
      { key: 'co2_emissions', label: 'CO2 Emissions' },
      { key: 'air_quality', label: 'Overall Air Quality' }
    ]
  },
  {
    name: 'Waste Management',
    icon: Leaf,
    color: 'bg-green-600',
    metrics: [
      { key: 'solid_waste_collection', label: 'Solid Waste Collection' },
      { key: 'waste_water_treatment', label: 'Waste Water Treatment' },
      { key: 'solid_waste_recycling_share', label: 'Solid Waste Recycling Share' },
      { key: 'waste_management', label: 'Overall Waste Management' }
    ]
  },
  {
    name: 'Sustainable Energy',
    icon: Leaf,
    color: 'bg-emerald-600',
    metrics: [
      { key: 'share_of_renewable_energy', label: 'Share of Renewable Energy' },
      { key: 'sustainable_energy', label: 'Overall Sustainable Energy' }
    ]
  },
  {
    name: 'Participation',
    icon: Vote,
    color: 'bg-blue-600',
    metrics: [
      { key: 'voter_turnout', label: 'Voter Turnout' },
      { key: 'access_to_public_information', label: 'Access to Public Information' },
      { key: 'civic_participation', label: 'Civic Participation' },
      { key: 'participation', label: 'Overall Participation' }
    ]
  },
  {
    name: 'Municipal Financing',
    icon: Landmark,
    color: 'bg-purple-600',
    metrics: [
      { key: 'own_revenue_collection', label: 'Own Revenue Collection' },
      { key: 'days_to_start_a_business', label: 'Days to Start a Business' },
      { key: 'subnational_debt', label: 'Subnational Debt' },
      { key: 'local_expenditure_efficiency', label: 'Local Expenditure Efficiency' },
      { key: 'municipal_financing_and_institutional_capacity', label: 'Municipal Financing & Institutional Capacity' }
    ]
  },
  {
    name: 'Governance',
    icon: Landmark,
    color: 'bg-indigo-600',
    metrics: [
      { key: 'land_use_efficiency', label: 'Land Use Efficiency' },
      { key: 'governance_of_urbanization', label: 'Governance of Urbanization' }
    ]
  },
  {
    name: 'ICT',
    icon: Wifi,
    color: 'bg-sky-500',
    metrics: [
      { key: 'internet_access', label: 'Internet Access' },
      { key: 'home_computer_access', label: 'Home Computer Access' },
      { key: 'average_broadband_speed', label: 'Average Broadband Speed' },
      { key: 'ict', label: 'Overall ICT' }
    ]
  },
  {
    name: 'CPI',
    icon: BarChart3,
    color: 'bg-rose-500',
    metrics: [
      { key: 'cpi', label: 'CPI' }
    ]
  }
];

function MetricCard({ label, value, comment }: { label: string; value?: number; comment?: string }) {
  const getScoreColor = (score?: number) => {
    if (score === undefined || score === null) return 'bg-gray-100 text-gray-400';
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 60) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {value !== undefined && value !== null ? (
          <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getScoreColor(value)}`}>
            {value.toFixed(1)}
          </span>
        ) : (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-400">
            N/A
          </span>
        )}
      </div>
      {comment && (
        <div className="mt-2 flex items-start gap-2">
          <Info className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-gray-500">{comment}</p>
        </div>
      )}
    </div>
  );
}

function CategorySection({ 
  category, 
  data, 
  isExpanded, 
  onToggle 
}: { 
  category: typeof categories[0]; 
  data: CalculationHistory; 
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const Icon = category.icon;
  
  // Calculate average score for the category
  const scores = category.metrics
    .map(m => data[m.key as keyof CalculationHistory] as number)
    .filter(v => v !== undefined && v !== null);
  const avgScore = scores.length > 0 
    ? scores.reduce((a, b) => a + b, 0) / scores.length 
    : null;

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'bg-gray-500';
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg ${category.color} bg-opacity-10`}>
            <Icon className={`w-6 h-6 ${category.color.replace('bg-', 'text-')}`} />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
            <p className="text-sm text-gray-500">{category.metrics.length} metrics</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {avgScore !== null && (
            <div className="flex items-center gap-2">
              <span className={`px-4 py-2 rounded-full text-white font-semibold ${getScoreColor(avgScore)}`}>
                {avgScore.toFixed(1)}
              </span>
            </div>
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>
      
      {isExpanded && (
        <div className="px-6 pb-6 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {category.metrics.map((metric) => (
              <MetricCard
                key={metric.key}
                label={metric.label}
                value={data[metric.key as keyof CalculationHistory] as number}
                comment={data[`${metric.key}_comment` as keyof CalculationHistory] as string}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CalculationHistoryPage() {
  const { user, isLoaded } = useUser();
  const [histories, setHistories] = useState<CalculationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [selectedHistory, setSelectedHistory] = useState<number>(0);

  useEffect(() => {
    if (isLoaded && user) {
      fetchHistories();
    }
  }, [isLoaded, user]);

  const fetchHistories = async () => {
    try {
      const response = await fetch('/api/calculation-history');
      if (response.ok) {
        const data = await response.json();
        setHistories(data);
      }
    } catch (error) {
      console.error('Error fetching histories:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  const expandAll = () => {
    const allExpanded = categories.reduce((acc, cat) => {
      acc[cat.name] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setExpandedCategories(allExpanded);
  };

  const collapseAll = () => {
    setExpandedCategories({});
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading your calculation history...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please sign in</h2>
          <p className="text-gray-600">You need to be signed in to view your calculation history.</p>
        </div>
      </div>
    );
  }

  if (histories.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No calculations yet</h2>
          <p className="text-gray-600">Start by creating your first city calculation!</p>
        </div>
      </div>
    );
  }

  const currentHistory = histories[selectedHistory];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            City Calculation History
          </h1>
          <p className="text-gray-600">
            Welcome back, {user.firstName || user.username}! View and analyze your city calculations.
          </p>
        </div>

        {/* History Selector */}
        {histories.length > 1 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Calculation
            </label>
            <select
              value={selectedHistory}
              onChange={(e) => setSelectedHistory(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {histories.map((history, index) => (
                <option key={history.id} value={index}>
                  {history.cityName || history.city}, {history.country} - {new Date(history.createdAt).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Current City Info */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-8 mb-8 text-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Globe className="w-8 h-8" />
                <h2 className="text-3xl font-bold">
                  {currentHistory.cityName || currentHistory.city}, {currentHistory.country}
                </h2>
              </div>
              <div className="flex items-center gap-6 text-indigo-100">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    Created: {new Date(currentHistory.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    Updated: {new Date(currentHistory.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={expandAll}
                className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors text-sm font-medium"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors text-sm font-medium"
              >
                Collapse All
              </button>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-4">
          {categories.map((category) => (
            <CategorySection
              key={category.name}
              category={category}
              data={currentHistory}
              isExpanded={expandedCategories[category.name] || false}
              onToggle={() => toggleCategory(category.name)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}