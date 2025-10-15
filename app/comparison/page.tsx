"use client";
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Trash2, BarChart3, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import Link from 'next/link';
import { useCalculations } from '../context/CalculationsContext';
import { useSearchParams } from 'next/navigation';

interface CityData {
  id: string;
  city: string;
  country: string;
  cityName?: string;
  cpi?: number;
  updatedAt?: string;
  // All metrics from schema
  [key: string]: unknown;
}

interface SavedComparison {
  id: string;
  comparisonName: string;
  cities: string[];
  createdAt: string;
}

interface MetricCategory {
  title: string;
  mainIndex: string;
  color: string;
  subMetrics: Array<{
    key: string;
    label: string;
  }>;
}

export default function ComparisonPage() {
  const searchParams = useSearchParams();
  const { calculations: availableCities, loading, deleteCalculation } = useCalculations();
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [comparisonData, setComparisonData] = useState<CityData[]>([]);
  const [savedComparisons, setSavedComparisons] = useState<SavedComparison[]>([]);
  const [comparisonName, setComparisonName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  // Define all metric categories with their sub-indices
  const metricCategories: MetricCategory[] = [
    {
      title: 'City Prosperity Index',
      mainIndex: 'cpi',
      color: 'bg-gradient-to-r from-purple-600 to-pink-600',
      subMetrics: []
    },
    {
      title: 'House Infrastructure',
      mainIndex: 'house_Infrastructure',
      color: 'bg-blue-600',
      subMetrics: [
        { key: 'improved_shelter', label: 'Improved Shelter' },
        { key: 'improved_water', label: 'Improved Water' },
        { key: 'improved_sanitation', label: 'Improved Sanitation' },
        { key: 'sufficient_living', label: 'Sufficient Living Space' },
        { key: 'population', label: 'Population' },
        { key: 'electricity', label: 'Electricity Access' }
      ]
    },
    {
      title: 'Economic Strength',
      mainIndex: 'economic_strength',
      color: 'bg-green-600',
      subMetrics: [
        { key: 'city_product_per_capita', label: 'City Product Per Capita' },
        { key: 'old_age_dependency_ratio', label: 'Old Age Dependency Ratio' },
        { key: 'mean_household_income', label: 'Mean Household Income' }
      ]
    },
    {
      title: 'Economic Agglomeration',
      mainIndex: 'economic_agglomeration',
      color: 'bg-teal-600',
      subMetrics: [
        { key: 'economic_density', label: 'Economic Density' },
        { key: 'economic_specialization', label: 'Economic Specialization' }
      ]
    },
    {
      title: 'Employment',
      mainIndex: 'employment',
      color: 'bg-yellow-600',
      subMetrics: [
        { key: 'unemployment_rate', label: 'Unemployment Rate' },
        { key: 'employment_to_population_ratio', label: 'Employment to Population Ratio' },
        { key: 'informal_employment', label: 'Informal Employment' }
      ]
    },
    {
      title: 'Social Infrastructure',
      mainIndex: 'social_infrastructure',
      color: 'bg-cyan-600',
      subMetrics: [
        { key: 'physician_density', label: 'Physician Density' },
        { key: 'number_of_public_libraries', label: 'Number of Public Libraries' }
      ]
    },
    {
      title: 'Urban Mobility',
      mainIndex: 'urban_mobility',
      color: 'bg-indigo-600',
      subMetrics: [
        { key: 'use_of_public_transport', label: 'Use of Public Transport' },
        { key: 'average_daily_travel_time', label: 'Average Daily Travel Time' },
        { key: 'length_of_mass_transport_network', label: 'Mass Transport Network Length' },
        { key: 'traffic_fatalities', label: 'Traffic Fatalities' },
        { key: 'affordability_of_transport', label: 'Transport Affordability' }
      ]
    },
    {
      title: 'Urban Form',
      mainIndex: 'urban_form',
      color: 'bg-violet-600',
      subMetrics: [
        { key: 'street_intersection_density', label: 'Street Intersection Density' },
        { key: 'street_density', label: 'Street Density' },
        { key: 'land_allocated_to_streets', label: 'Land Allocated to Streets' }
      ]
    },
    {
      title: 'Health',
      mainIndex: 'health',
      color: 'bg-red-600',
      subMetrics: [
        { key: 'life_expectancy_at_birth', label: 'Life Expectancy at Birth' },
        { key: 'under_five_mortality_rate', label: 'Under-5 Mortality Rate' },
        { key: 'vaccination_coverage', label: 'Vaccination Coverage' },
        { key: 'maternal_mortality', label: 'Maternal Mortality' }
      ]
    },
    {
      title: 'Education',
      mainIndex: 'education',
      color: 'bg-pink-600',
      subMetrics: [
        { key: 'literacy_rate', label: 'Literacy Rate' },
        { key: 'mean_years_of_schooling', label: 'Mean Years of Schooling' },
        { key: 'early_childhood_education', label: 'Early Childhood Education' },
        { key: 'net_enrollment_rate_in_higher_education', label: 'Higher Education Enrollment' }
      ]
    },
    {
      title: 'Safety and Security',
      mainIndex: 'safety_and_security',
      color: 'bg-orange-600',
      subMetrics: [
        { key: 'homicide_rate', label: 'Homicide Rate' },
        { key: 'theft_rate', label: 'Theft Rate' }
      ]
    },
    {
      title: 'Public Space',
      mainIndex: 'public_space',
      color: 'bg-lime-600',
      subMetrics: [
        { key: 'accessibility_to_open_public_areas', label: 'Accessibility to Open Public Areas' },
        { key: 'green_area_per_capita', label: 'Green Area Per Capita' }
      ]
    },
    {
      title: 'Economic Equity',
      mainIndex: 'economic_equity',
      color: 'bg-emerald-600',
      subMetrics: [
        { key: 'gini_coefficient', label: 'Gini Coefficient' },
        { key: 'poverty_rate', label: 'Poverty Rate' }
      ]
    },
    {
      title: 'Social Inclusion',
      mainIndex: 'social_inclusion',
      color: 'bg-sky-600',
      subMetrics: [
        { key: 'slums_households', label: 'Slums Households' },
        { key: 'youth_unemployment', label: 'Youth Unemployment' }
      ]
    },
    {
      title: 'Gender Inclusion',
      mainIndex: 'gender_inclusion',
      color: 'bg-fuchsia-600',
      subMetrics: [
        { key: 'equitable_secondary_school_enrollment', label: 'Equitable Secondary School Enrollment' },
        { key: 'women_in_local_government', label: 'Women in Local Government' },
        { key: 'women_in_local_work_force', label: 'Women in Local Work Force' }
      ]
    },
    {
      title: 'Urban Diversity',
      mainIndex: 'urban_diversity',
      color: 'bg-rose-600',
      subMetrics: [
        { key: 'land_use_mix', label: 'Land Use Mix' }
      ]
    },
    {
      title: 'Air Quality',
      mainIndex: 'air_quality',
      color: 'bg-slate-600',
      subMetrics: [
        { key: 'number_of_monitoring_stations', label: 'Monitoring Stations' },
        { key: 'pm25_concentration', label: 'PM2.5 Concentration' },
        { key: 'co2_emissions', label: 'CO2 Emissions' }
      ]
    },
    {
      title: 'Waste Management',
      mainIndex: 'waste_management',
      color: 'bg-amber-600',
      subMetrics: [
        { key: 'solid_waste_collection', label: 'Solid Waste Collection' },
        { key: 'waste_water_treatment', label: 'Waste Water Treatment' },
        { key: 'solid_waste_recycling_share', label: 'Solid Waste Recycling Share' }
      ]
    },
    {
      title: 'Sustainable Energy',
      mainIndex: 'sustainable_energy',
      color: 'bg-green-700',
      subMetrics: [
        { key: 'share_of_renewable_energy', label: 'Share of Renewable Energy' }
      ]
    },
    {
      title: 'Participation',
      mainIndex: 'participation',
      color: 'bg-blue-700',
      subMetrics: [
        { key: 'voter_turnout', label: 'Voter Turnout' },
        { key: 'access_to_public_information', label: 'Access to Public Information' },
        { key: 'civic_participation', label: 'Civic Participation' }
      ]
    },
    {
      title: 'Municipal Financing',
      mainIndex: 'municipal_financing_and_institutional_capacity',
      color: 'bg-purple-700',
      subMetrics: [
        { key: 'own_revenue_collection', label: 'Own Revenue Collection' },
        { key: 'days_to_start_a_business', label: 'Days to Start a Business' },
        { key: 'subnational_debt', label: 'Subnational Debt' },
        { key: 'local_expenditure_efficiency', label: 'Local Expenditure Efficiency' }
      ]
    },
    {
      title: 'Governance',
      mainIndex: 'governance_of_urbanization',
      color: 'bg-gray-700',
      subMetrics: [
        { key: 'land_use_efficiency', label: 'Land Use Efficiency' }
      ]
    },
    {
      title: 'ICT',
      mainIndex: 'ict',
      color: 'bg-indigo-700',
      subMetrics: [
        { key: 'internet_access', label: 'Internet Access' },
        { key: 'home_computer_access', label: 'Home Computer Access' },
        { key: 'average_broadband_speed', label: 'Average Broadband Speed' }
      ]
    }
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && availableCities.length > 0) {
      fetchSavedComparisons();
      
      // Load pre-selected cities from URL
      const preSelected = searchParams.get('selected');
      if (preSelected) {
        const cityIds = preSelected.split(',').filter(id => 
          availableCities.some(city => city.id === id)
        );
        if (cityIds.length > 0) {
          setSelectedCities(cityIds);
        }
      }
    }
  }, [mounted, searchParams, availableCities]);

  const fetchSavedComparisons = async () => {
    try {
      const response = await fetch('/api/comparisons');
      if (response.ok) {
        const data = await response.json();
        setSavedComparisons(data);
      }
    } catch (error) {
      console.error('Error fetching saved comparisons:', error);
    }
  };

  const handleCityToggle = (cityId: string) => {
    setSelectedCities(prev => {
      if (prev.includes(cityId)) {
        return prev.filter(id => id !== cityId);
      } else if (prev.length < 5) {
        return [...prev, cityId];
      }
      return prev;
    });
  };

  const compareSelectedCities = async () => {
    if (selectedCities.length < 2) return;

    const citiesParam = selectedCities
      .map(id => {
        const city = availableCities.find(c => c.id === id);
        return city ? `${city.city}:${city.country}` : '';
      })
      .filter(Boolean)
      .join(',');

    try {
      const response = await fetch(`/api/calculation-history/compare?cities=${citiesParam}`);
      if (response.ok) {
        const data = await response.json();
        // Ensure data has id field from Prisma
        const transformedData = data.map((item: any) => ({
          ...item,
          id: item.id,
        }));
        setComparisonData(transformedData);
      }
    } catch (error) {
      console.error('Error comparing cities:', error);
    }
  };

  const saveComparison = async () => {
    if (!comparisonName.trim() || selectedCities.length === 0) return;

    const cities = selectedCities.map(id => {
      const city = availableCities.find(c => c.id === id);
      return city ? `${city.city}:${city.country}` : '';
    }).filter(Boolean);

    try {
      const response = await fetch('/api/comparisons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comparisonName, cities }),
      });

      if (response.ok) {
        setShowSaveDialog(false);
        setComparisonName('');
        fetchSavedComparisons();
      }
    } catch (error) {
      console.error('Error saving comparison:', error);
    }
  };

  const loadSavedComparison = async (comparison: SavedComparison) => {
    const cityIds = comparison.cities.map(cityCountry => {
      const [city, country] = cityCountry.split(':');
      return availableCities.find(c => c.city === city && c.country === country)?.id;
    }).filter(Boolean) as string[];

    setSelectedCities(cityIds);
    
    try {
      const response = await fetch(`/api/calculation-history/compare?cities=${comparison.cities.join(',')}`);
      if (response.ok) {
        const data = await response.json();
        setComparisonData(data);
      }
    } catch (error) {
      console.error('Error loading comparison:', error);
    }
  };

  const deleteComparison = async (id: string) => {
    try {
      await fetch(`/api/comparisons?id=${id}`, { method: 'DELETE' });
      fetchSavedComparisons();
    } catch (error) {
      console.error('Error deleting comparison:', error);
    }
  };

  const deleteCityCalculation = async (cityId: string) => {
    if (!window.confirm('Are you sure you want to delete this city calculation? This action cannot be undone.')) {
      return;
    }

    const success = await deleteCalculation(cityId);
    if (success) {
      setSelectedCities(prev => prev.filter(id => id !== cityId));
    }
  };

  const toggleCategory = (categoryTitle: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryTitle)) {
        newSet.delete(categoryTitle);
      } else {
        newSet.add(categoryTitle);
      }
      return newSet;
    });
  };

  const getComparison = (value1?: number, value2?: number) => {
    if (!value1 || !value2) return null;
    const diff = value1 - value2;
    if (Math.abs(diff) < 0.01) return { icon: Minus, color: 'text-gray-400', text: 'Equal' };
    if (diff > 0) return { icon: TrendingUp, color: 'text-green-500', text: `+${diff.toFixed(2)}` };
    return { icon: TrendingDown, color: 'text-red-500', text: diff.toFixed(2) };
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  useEffect(() => {
    if (selectedCities.length >= 2) {
      compareSelectedCities();
    } else {
      setComparisonData([]);
    }
  }, [selectedCities]);

  if (loading || !mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/home" className="text-white hover:text-purple-300 transition">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
            <BarChart3 className="w-8 h-8" />
            City Comparison
          </h1>
          <Link 
            href="/cities"
            className="text-white hover:text-purple-300 transition bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add City</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* City Selection - Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-white mb-4">Select Cities</h2>
              <p className="text-sm text-gray-300 mb-4">Choose 2-5 cities to compare</p>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {availableCities.map((city) => (
                  <div key={city.id} className="relative group">
                    <button
                      onClick={() => handleCityToggle(city.id)}
                      disabled={!selectedCities.includes(city.id) && selectedCities.length >= 5}
                      className={`w-full p-3 rounded-lg text-left transition ${
                        selectedCities.includes(city.id)
                          ? 'bg-purple-600 text-white'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <div className="font-medium">{city.city}</div>
                      <div className="text-sm opacity-75">{city.country}</div>
                      {city.updatedAt && (
                        <div className="text-xs opacity-50 mt-1">
                          Updated: {formatDate(city.updatedAt)}
                        </div>
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCityCalculation(city.id);
                      }}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition bg-red-500 hover:bg-red-600 p-1.5 rounded"
                      title="Delete this city"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>

              {selectedCities.length >= 2 && (
                <button
                  onClick={() => setShowSaveDialog(true)}
                  className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition"
                >
                  <Save className="w-4 h-4" />
                  Save Comparison
                </button>
              )}

              {/* Saved Comparisons */}
              {savedComparisons.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Saved Comparisons</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {savedComparisons.map((comp) => (
                      <div
                        key={comp.id}
                        className="bg-white/5 p-3 rounded-lg flex items-center justify-between"
                      >
                        <button
                          onClick={() => loadSavedComparison(comp)}
                          className="flex-1 text-left text-white hover:text-purple-300 transition"
                        >
                          <div className="font-medium text-sm">{comp.comparisonName}</div>
                          <div className="text-xs text-gray-400">{comp.cities.length} cities</div>
                        </button>
                        <button
                          onClick={() => deleteComparison(comp.id)}
                          className="text-red-400 hover:text-red-300 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Comparison Results - Main Content */}
          <div className="lg:col-span-2">
            {comparisonData.length >= 2 ? (
              <div className="space-y-4">
                {metricCategories.map((category) => {
                  const isExpanded = expandedCategories.has(category.title);
                  
                  return (
                    <div key={category.title} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden">
                      {/* Category Header */}
                      <button
                        onClick={() => toggleCategory(category.title)}
                        className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-2 h-12 rounded-full ${category.color}`} />
                          <h3 className="text-xl font-semibold text-white">{category.title}</h3>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-6 h-6 text-white" />
                        ) : (
                          <ChevronDown className="w-6 h-6 text-white" />
                        )}
                      </button>

                      {/* Main Index Comparison */}
                      <div className="px-6 pb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {comparisonData.map((city, index) => {
                            const value = city[category.mainIndex] as number | undefined;
                            const comparison = index > 0 ? getComparison(value, comparisonData[0][category.mainIndex] as number) : null;
                            const ComparisonIcon = comparison?.icon;

                            return (
                              <div key={city.id} className="bg-white/5 rounded-lg p-4">
                                <div className="text-white font-medium mb-2 text-sm">
                                  {city.city}, {city.country}
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="text-3xl font-bold text-white">
                                    {value?.toFixed(2) || 'N/A'}
                                  </div>
                                  {comparison && ComparisonIcon && (
                                    <div className={`flex items-center gap-1 ${comparison.color}`}>
                                      <ComparisonIcon className="w-5 h-5" />
                                      <span className="text-sm font-medium">{comparison.text}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${category.color}`}
                                    style={{ width: `${Math.min((value || 0) * 10, 100)}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Sub-Metrics */}
                      {isExpanded && category.subMetrics.length > 0 && (
                        <div className="px-6 pb-6 space-y-4 border-t border-white/10 pt-4">
                          {category.subMetrics.map((subMetric) => (
                            <div key={subMetric.key} className="bg-white/5 rounded-lg p-4">
                              <h4 className="text-sm font-medium text-gray-300 mb-3">{subMetric.label}</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {comparisonData.map((city, index) => {
                                  const value = city[subMetric.key] as number | undefined;
                                  const comparison = index > 0 ? getComparison(value, comparisonData[0][subMetric.key] as number) : null;
                                  const ComparisonIcon = comparison?.icon;

                                  return (
                                    <div key={city.id} className="bg-white/5 rounded-lg p-3">
                                      <div className="text-xs text-gray-400 mb-1">
                                        {city.city}
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <div className="text-lg font-semibold text-white">
                                          {value?.toFixed(2) || 'N/A'}
                                        </div>
                                        {comparison && ComparisonIcon && (
                                          <div className={`flex items-center gap-1 ${comparison.color}`}>
                                            <ComparisonIcon className="w-4 h-4" />
                                            <span className="text-xs">{comparison.text}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-12 text-center">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Comparison Yet</h3>
                <p className="text-gray-300">Select at least 2 cities to start comparing</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-white mb-4">Save Comparison</h3>
            <input
              type="text"
              value={comparisonName}
              onChange={(e) => setComparisonName(e.target.value)}
              placeholder="Enter comparison name..."
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 outline-none focus:border-purple-500 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={saveComparison}
                disabled={!comparisonName.trim()}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-2 rounded-lg transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}