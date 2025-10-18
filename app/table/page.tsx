'use client';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import Image from 'next/image';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

type Category = {
  name: string;
  fields: { name: string; description: string }[];
};

type CalculationData = Record<string, number | string | undefined>;

const categories: Category[] = [
  {
    name: "House Infrastructure",
    fields: [
      { name: "improved_shelter", description: "Improved Shelter Rating" },
      { name: "improved_water", description: "Improved Water Access" },
      { name: "improved_sanitation", description: "Improved Sanitation" },
      { name: "sufficient_living", description: "Sufficient Living Space" },
      { name: "population", description: "Population" },
      { name: "electricity", description: "Electricity Access" },
      { name: "house_Infrastructure", description: "Overall House Infrastructure Score" },
    ]
  },
  {
    name: "Economic Strength",
    fields: [
      { name: "city_product_per_capita", description: "City Product Per Capita" },
      { name: "old_age_dependency_ratio", description: "Old Age Dependency Ratio" },
      { name: "mean_household_income", description: "Mean Household Income" },
      { name: "economic_strength", description: "Overall Economic Strength Score" },
    ]
  },
  {
    name: "Economic Agglomeration",
    fields: [
      { name: "economic_density", description: "Economic Density" },
      { name: "economic_specialization", description: "Economic Specialization" },
      { name: "economic_agglomeration", description: "Overall Economic Agglomeration Score" },
    ]
  },
  {
    name: "Employment",
    fields: [
      { name: "unemployment_rate", description: "Unemployment Rate" },
      { name: "employment_to_population_ratio", description: "Employment to Population Ratio" },
      { name: "informal_employment", description: "Informal Employment" },
      { name: "employment", description: "Overall Employment Score" },
    ]
  },
  {
    name: "Social Infrastructure",
    fields: [
      { name: "physician_density", description: "Physician Density" },
      { name: "number_of_public_libraries", description: "Number of Public Libraries" },
      { name: "social_infrastructure", description: "Overall Social Infrastructure Score" },
    ]
  },
  {
    name: "Urban Mobility",
    fields: [
      { name: "use_of_public_transport", description: "Use of Public Transport" },
      { name: "average_daily_travel_time", description: "Average Daily Travel Time" },
      { name: "length_of_mass_transport_network", description: "Length of Mass Transport Network" },
      { name: "traffic_fatalities", description: "Traffic Fatalities" },
      { name: "affordability_of_transport", description: "Affordability of Transport" },
      { name: "urban_mobility", description: "Overall Urban Mobility Score" },
    ]
  },
  {
    name: "Urban Form",
    fields: [
      { name: "street_intersection_density", description: "Street Intersection Density" },
      { name: "street_density", description: "Street Density" },
      { name: "land_allocated_to_streets", description: "Land Allocated to Streets" },
      { name: "urban_form", description: "Overall Urban Form Score" },
    ]
  },
  {
    name: "Health",
    fields: [
      { name: "life_expectancy_at_birth", description: "Life Expectancy at Birth" },
      { name: "under_five_mortality_rate", description: "Under Five Mortality Rate" },
      { name: "vaccination_coverage", description: "Vaccination Coverage" },
      { name: "maternal_mortality", description: "Maternal Mortality" },
      { name: "health", description: "Overall Health Score" },
    ]
  },
  {
    name: "Education",
    fields: [
      { name: "literacy_rate", description: "Literacy Rate" },
      { name: "mean_years_of_schooling", description: "Mean Years of Schooling" },
      { name: "early_childhood_education", description: "Early Childhood Education" },
      { name: "net_enrollment_rate_in_higher_education", description: "Net Enrollment Rate in Higher Education" },
      { name: "education", description: "Overall Education Score" },
    ]
  },
  {
    name: "Safety and Security",
    fields: [
      { name: "homicide_rate", description: "Homicide Rate" },
      { name: "theft_rate", description: "Theft Rate" },
      { name: "safety_and_security", description: "Overall Safety and Security Score" },
    ]
  },
  {
    name: "Public Space",
    fields: [
      { name: "accessibility_to_open_public_areas", description: "Accessibility to Open Public Areas" },
      { name: "green_area_per_capita", description: "Green Area Per Capita" },
      { name: "public_space", description: "Overall Public Space Score" },
    ]
  },
  {
    name: "Economic Equity",
    fields: [
      { name: "gini_coefficient", description: "Gini Coefficient" },
      { name: "poverty_rate", description: "Poverty Rate" },
      { name: "economic_equity", description: "Overall Economic Equity Score" },
    ]
  },
  {
    name: "Social Inclusion",
    fields: [
      { name: "slums_households", description: "Slums Households" },
      { name: "youth_unemployment", description: "Youth Unemployment" },
      { name: "social_inclusion", description: "Overall Social Inclusion Score" },
    ]
  },
  {
    name: "Gender Inclusion",
    fields: [
      { name: "equitable_secondary_school_enrollment", description: "Equitable Secondary School Enrollment" },
      { name: "women_in_local_government", description: "Women in Local Government" },
      { name: "women_in_local_work_force", description: "Women in Local Work Force" },
      { name: "gender_inclusion", description: "Overall Gender Inclusion Score" },
    ]
  },
  {
    name: "Urban Diversity",
    fields: [
      { name: "land_use_mix", description: "Land Use Mix" },
      { name: "urban_diversity", description: "Overall Urban Diversity Score" },
    ]
  },
  {
    name: "Air Quality",
    fields: [
      { name: "number_of_monitoring_stations", description: "Number of Monitoring Stations" },
      { name: "pm25_concentration", description: "PM2.5 Concentration" },
      { name: "co2_emissions", description: "CO2 Emissions" },
      { name: "air_quality", description: "Overall Air Quality Score" },
    ]
  },
  {
    name: "Waste Management",
    fields: [
      { name: "solid_waste_collection", description: "Solid Waste Collection" },
      { name: "waste_water_treatment", description: "Waste Water Treatment" },
      { name: "solid_waste_recycling_share", description: "Solid Waste Recycling Share" },
      { name: "waste_management", description: "Overall Waste Management Score" },
    ]
  },
  {
    name: "Sustainable Energy",
    fields: [
      { name: "share_of_renewable_energy", description: "Share of Renewable Energy" },
      { name: "sustainable_energy", description: "Overall Sustainable Energy Score" },
    ]
  },
  {
    name: "Participation",
    fields: [
      { name: "voter_turnout", description: "Voter Turnout" },
      { name: "access_to_public_information", description: "Access to Public Information" },
      { name: "civic_participation", description: "Civic Participation" },
      { name: "participation", description: "Overall Participation Score" },
    ]
  },
  {
    name: "Municipal Financing",
    fields: [
      { name: "own_revenue_collection", description: "Own Revenue Collection" },
      { name: "days_to_start_a_business", description: "Days to Start a Business" },
      { name: "subnational_debt", description: "Subnational Debt" },
      { name: "local_expenditure_efficiency", description: "Local Expenditure Efficiency" },
      { name: "municipal_financing_and_institutional_capacity", description: "Overall Municipal Financing Score" },
    ]
  },
  {
    name: "Governance",
    fields: [
      { name: "land_use_efficiency", description: "Land Use Efficiency" },
      { name: "governance_of_urbanization", description: "Governance of Urbanization" },
    ]
  },
  {
    name: "ICT",
    fields: [
      { name: "internet_access", description: "Internet Access" },
      { name: "home_computer_access", description: "Home Computer Access" },
      { name: "average_broadband_speed", description: "Average Broadband Speed" },
      { name: "ict", description: "Overall ICT Score" },
    ]
  },
  {
    name: "Overall CPI",
    fields: [
      { name: "cpi", description: "City Prosperity Index" },
    ]
  }
];

const getComment = (score: number | string): string => {
  if (score === '-' || typeof score !== 'number') return '-';
  
  if (score >= 80) return "VERY SOLID";
  else if (score >= 70) return "SOLID";
  else if (score >= 60) return "MODERATELY SOLID";
  else if (score >= 50) return "MODERATELY WEAK";
  else if (score >= 40) return "WEAK";
  else return "VERY WEAK";
};

const calculateAverage = (data: CalculationData, fields: string[]): number | string => {
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

const calculateAllIndexes = (data: CalculationData) => {
  // Calculate all sub-indexes using standardized fields
  const houseInfra = calculateAverage(data, ["improved_shelter_standardized", "improved_water_standardized", "improved_sanitation_standardized", "sufficient_living_standardized", "population_standardized", "electricity_standardized"]);
  if (typeof houseInfra === 'number') {
    data.house_Infrastructure = houseInfra;
    data.house_Infrastructure_comment = getComment(houseInfra);
  }

  const economicStrength = calculateAverage(data, ["city_product_per_capita_standardized", "old_age_dependency_ratio_standardized", "mean_household_income_standardized"]);
  if (typeof economicStrength === 'number') {
    data.economic_strength = economicStrength;
    data.economic_strength_comment = getComment(economicStrength);
  }

  const economicAgglomeration = calculateAverage(data, ["economic_density_standardized", "economic_specialization_standardized"]);
  if (typeof economicAgglomeration === 'number') {
    data.economic_agglomeration = economicAgglomeration;
    data.economic_agglomeration_comment = getComment(economicAgglomeration);
  }

  const employment = calculateAverage(data, ["unemployment_rate_standardized", "employment_to_population_ratio_standardized", "informal_employment_standardized"]);
  if (typeof employment === 'number') {
    data.employment = employment;
    data.employment_comment = getComment(employment);
  }

  const socialInfra = calculateAverage(data, ["physician_density_standardized", "number_of_public_libraries_standardized"]);
  if (typeof socialInfra === 'number') {
    data.social_infrastructure = socialInfra;
    data.social_infrastructure_comment = getComment(socialInfra);
  }

  const urbanMobility = calculateAverage(data, ["use_of_public_transport_standardized", "average_daily_travel_time_standardized", "length_of_mass_transport_network_standardized", "traffic_fatalities_standardized", "affordability_of_transport_standardized"]);
  if (typeof urbanMobility === 'number') {
    data.urban_mobility = urbanMobility;
    data.urban_mobility_comment = getComment(urbanMobility);
  }

  const urbanForm = calculateAverage(data, ["street_intersection_density_standardized", "street_density_standardized", "land_allocated_to_streets_standardized"]);
  if (typeof urbanForm === 'number') {
    data.urban_form = urbanForm;
    data.urban_form_comment = getComment(urbanForm);
  }

  const health = calculateAverage(data, ["life_expectancy_at_birth_standardized", "under_five_mortality_rate_standardized", "vaccination_coverage_standardized", "maternal_mortality_standardized"]);
  if (typeof health === 'number') {
    data.health = health;
    data.health_comment = getComment(health);
  }

  const education = calculateAverage(data, ["literacy_rate_standardized", "mean_years_of_schooling_standardized", "early_childhood_education_standardized", "net_enrollment_rate_in_higher_education_standardized"]);
  if (typeof education === 'number') {
    data.education = education;
    data.education_comment = getComment(education);
  }

  const safety = calculateAverage(data, ["homicide_rate_standardized", "theft_rate_standardized"]);
  if (typeof safety === 'number') {
    data.safety_and_security = safety;
    data.safety_and_security_comment = getComment(safety);
  }

  const publicSpace = calculateAverage(data, ["accessibility_to_open_public_areas_standardized", "green_area_per_capita_standardized"]);
  if (typeof publicSpace === 'number') {
    data.public_space = publicSpace;
    data.public_space_comment = getComment(publicSpace);
  }

  const economicEquity = calculateAverage(data, ["gini_standardized_score", "poverty_rate_standardized_score"]);
  if (typeof economicEquity === 'number') {
    data.economic_equity = economicEquity;
    data.economic_equity_comment = getComment(economicEquity);
  }

  const socialInclusion = calculateAverage(data, ["slums_households_standardized", "youth_unemployment_standardized"]);
  if (typeof socialInclusion === 'number') {
    data.social_inclusion = socialInclusion;
    data.social_inclusion_comment = getComment(socialInclusion);
  }

  const genderInclusion = calculateAverage(data, ["equitable_secondary_school_enrollment_standardized", "women_in_local_government_standardized", "women_in_local_work_force_standardized"]);
  if (typeof genderInclusion === 'number') {
    data.gender_inclusion = genderInclusion;
    data.gender_inclusion_comment = getComment(genderInclusion);
  }

  const urbanDiversity = calculateAverage(data, ["land_use_mix_standardized"]);
  if (typeof urbanDiversity === 'number') {
    data.urban_diversity = urbanDiversity;
    data.urban_diversity_comment = getComment(urbanDiversity);
  }

  const airQuality = calculateAverage(data, ["number_of_monitoring_stations_standardized", "pm25_concentration_standardized", "co2_emissions_standardized"]);
  if (typeof airQuality === 'number') {
    data.air_quality = airQuality;
    data.air_quality_comment = getComment(airQuality);
  }

  const wasteManagement = calculateAverage(data, ["solid_waste_collection_standardized", "waste_water_treatment_standardized", "solid_waste_recycling_share_standardized"]);
  if (typeof wasteManagement === 'number') {
    data.waste_management = wasteManagement;
    data.waste_management_comment = getComment(wasteManagement);
  }

  const sustainableEnergy = calculateAverage(data, ["share_of_renewable_energy_standardized"]);
  if (typeof sustainableEnergy === 'number') {
    data.sustainable_energy = sustainableEnergy;
    data.sustainable_energy_comment = getComment(sustainableEnergy);
  }

  const participation = calculateAverage(data, ["voter_turnout_standardized", "access_to_public_information_standardized", "civic_participation_standardized"]);
  if (typeof participation === 'number') {
    data.participation = participation;
    data.participation_comment = getComment(participation);
  }

  const municipalFinancing = calculateAverage(data, ["own_revenue_collection_standardized", "days_to_start_a_business_standardized", "subnational_debt_standardized", "local_expenditure_efficiency_standardized"]);
  if (typeof municipalFinancing === 'number') {
    data.municipal_financing_and_institutional_capacity = municipalFinancing;
    data.municipal_financing_and_institutional_capacity_comment = getComment(municipalFinancing);
  }

  const governance = calculateAverage(data, ["land_use_efficiency_standardized"]);
  if (typeof governance === 'number') {
    data.governance_of_urbanization = governance;
    data.governance_of_urbanization_comment = getComment(governance);
  }

  const ict = calculateAverage(data, ["internet_access_standardized", "home_computer_access_standardized", "average_broadband_speed_standardized"]);
  if (typeof ict === 'number') {
    data.ict = ict;
    data.ict_comment = getComment(ict);
  }

  // Calculate dimension indexes as averages of their sub-indexes
  const productivity = calculateAverage(data, ["economic_strength", "economic_agglomeration", "employment"]);
  if (typeof productivity === 'number') {
    data.productivity = productivity;
    data.productivity_comment = getComment(productivity);
  }

  const infrastructureDevelopment = calculateAverage(data, ["house_Infrastructure", "social_infrastructure", "ict", "urban_mobility", "urban_form"]);
  if (typeof infrastructureDevelopment === 'number') {
    data.infrastructure_development = infrastructureDevelopment;
    data.infrastructure_development_comment = getComment(infrastructureDevelopment);
  }

  const qualityOfLife = calculateAverage(data, ["health", "education", "safety_and_security", "public_space"]);
  if (typeof qualityOfLife === 'number') {
    data.quality_of_life = qualityOfLife;
    data.quality_of_life_comment = getComment(qualityOfLife);
  }

  const equitySocialInclusion = calculateAverage(data, ["economic_equity", "social_inclusion", "gender_inclusion", "urban_diversity"]);
  if (typeof equitySocialInclusion === 'number') {
    data.equity_social_inclusion = equitySocialInclusion;
    data.equity_social_inclusion_comment = getComment(equitySocialInclusion);
  }

  const environmentalSustainability = calculateAverage(data, ["air_quality", "waste_management", "sustainable_energy"]);
  if (typeof environmentalSustainability === 'number') {
    data.environmental_sustainability = environmentalSustainability;
    data.environmental_sustainability_comment = getComment(environmentalSustainability);
  }

  const urbanGovernanceLegislation = calculateAverage(data, ["participation", "municipal_financing_and_institutional_capacity", "governance_of_urbanization"]);
  if (typeof urbanGovernanceLegislation === 'number') {
    data.urban_governance_legislation = urbanGovernanceLegislation;
    data.urban_governance_legislation_comment = getComment(urbanGovernanceLegislation);
  }

  // Calculate CPI from the 6 dimensions (updated to match schema)
  const cpiFields = [
    "productivity",
    "infrastructure_development",
    "quality_of_life",
    "equity_social_inclusion",
    "environmental_sustainability",
    "urban_governance_legislation"
  ];

  const cpi = calculateAverage(data, cpiFields);
  if (typeof cpi === 'number') {
    data.cpi = cpi;
    data.cpi_comment = getComment(cpi);
  }
};

export default function ContentTable() {
  // CalculationData type moved to module scope

  const [calculationData, setCalculationData] = useState<Record<string, number | string | undefined> | null>(null);
  const { isLoaded, userId } = useAuth();

  useEffect(() => {
    const fetchCalculationHistory = async () => {
      if (!isLoaded || !userId) return;

      try {
        const response = await fetch('/api/calculation-history', {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data[0]) {
            // Calculate all indexes
            calculateAllIndexes(data[0]);
            
            setCalculationData(data[0]);

            // Save the updated values to the database
            await fetch('/api/calculation-history', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data[0]),
            });
          } else {
            setCalculationData(null);
          }
        } else {
          console.error('Failed to fetch calculation history');
        }
      } catch (error) {
        console.error('Error fetching calculation history:', error);
      }
    };

    fetchCalculationHistory();
  }, [
    isLoaded, 
    userId,
    calculateAllIndexes
  ]);

  const formatValue = (value: string | number | null | undefined) => {
    if (value === null || value === undefined) return '-';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return typeof numValue === 'number' && !isNaN(numValue) ? numValue.toFixed(2) : '-';
  };

  const formatPercentageDisplay = (value: string | number | null | undefined) => {
    return formatValue(value) + '%';
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Category", "Fields", "Description", "Value", "Standardized", "Evaluation"];
    const tableRows: (string | number | null)[][] = [];

    // Add circular logo and title to first page only
    const logoSize = 25;
    doc.setFillColor(255, 255, 255);
    doc.circle(25, 20, logoSize/2, 'F'); // Create white circular background
    doc.addImage('/assets/AI_PAT.jpg', 'JPEG', 15, 10, logoSize, logoSize);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);

    categories.forEach(category => {
      category.fields.forEach(field => {
        let standardizedKey = `${field.name}_standardized`;
        if (field.name === 'poverty_rate') {
          standardizedKey = 'poverty_rate_standardized_score';
        }
        if (field.name === 'gini_coefficient') {
          standardizedKey = 'gini_standardized_score';
        }
        const standardizedValue = field.name === 'cpi' ? '-' : (calculationData ? formatPercentageDisplay(calculationData[standardizedKey]) : '-');
        const rowData = [
          category.name,
          field.name,
          field.description,
          calculationData ? formatValue(calculationData[field.name]) : '-',
          standardizedValue,
          calculationData ? calculationData[`${field.name}_comment`] || '-' : '-'
        ];
        tableRows.push(rowData);
      });
    });

    autoTable(doc, { 
      head: [tableColumn], 
      body: tableRows, 
      startY: 40,
      styles: {
        font: "helvetica",
        fontSize: 8
      },
      // Highlight CPI row
      didParseCell: (data) => {
        // Check if the cell is in a row that belongs to Overall CPI category
        if (Array.isArray(data.row.raw) && data.row.raw.length > 0 && data.row.raw[0] === "Overall CPI") {
          data.cell.styles.fillColor = [230, 240, 255];
          data.cell.styles.textColor = [0, 0, 128];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });

    doc.save('city_prosperity_index.pdf');
  };

  const exportToExcel = () => {
    const worksheetData = categories.map(category => 
      category.fields.map(field => {
        const standardizedValue = field.name === 'cpi' ? '-' : (calculationData ? formatPercentageDisplay(calculationData[`${field.name}_standardized`]) : '-');
        return {
          Category: category.name,
          Fields: field.name,
          Description: field.description,
          Value: calculationData ? formatValue(calculationData[field.name]) : '-',
          Standardized: standardizedValue,
          Evaluation: calculationData ? calculationData[`${field.name}_comment`] || '-' : '-'
        };
      })
    ).flat();

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "City Prosperity Index");
    XLSX.writeFile(workbook, 'city_prosperity_index.xlsx');
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!userId) {
    return <div>Please sign in to view your calculation history.</div>;
  }

  return (
    <div className="flex flex-col items-center w-full">
      {/* Hero Section with Image */}
      <div className="w-full relative mb-8 bg-gradient-to-b from-gray-900 to-gray-800 p-8">
        <div className="max-w-6xl mx-auto flex flex-col items-center">
          <h1 className="text-3xl font-bold text-white mb-4 text-center">
            City Prosperity Index Calculations
          </h1>
          <div className="relative w-full max-w-2xl h-[300px] mx-auto">
            <Image
              src="/assets/major.png"
              alt="CPI Major Diagram"
              fill
              style={{ objectFit: 'contain' }}
              className="transition-transform duration-300 hover:scale-105"
              priority
            />
          </div>
          <p className="text-gray-300 text-center mt-4 max-w-2xl">
            This comprehensive dashboard displays the calculated values across all major categories
            of the City Prosperity Index, providing insights into urban development and sustainability metrics.
          </p>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="flex flex-col items-center gap-4 mb-4">
        
        <div className="flex gap-4">
          <button 
            onClick={exportToPDF}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Export to PDF
          </button>
          <button 
            onClick={exportToExcel}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Export to Excel
          </button>
        </div>
      </div>

      {/* Existing Table Section */}
      <div className="w-full p-4 overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-lg">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                Fields
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                Value
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                Standardized
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                Evaluation
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {categories.map((category) => (
              <React.Fragment key={category.name}>
                {category.fields.map((field, fieldIndex) => {
                  const isCPI = category.name === "Overall CPI";
                  let standardizedKey = `${field.name}_standardized`;
                  if (field.name === 'poverty_rate') {
                    standardizedKey = 'poverty_rate_standardized_score';
                  }
                  if (field.name === 'gini_coefficient') {
                    standardizedKey = 'gini_standardized_score';
                  }
                  const standardizedValue = field.name === 'cpi' ? '-' : (calculationData ? formatPercentageDisplay(calculationData[standardizedKey]) : '-');
                  return (
                    <tr 
                      key={`${category.name}-${field.name}`}
                      className={
                        isCPI
                          ? "bg-gradient-to-r from-blue-50 to-blue-100 shadow-md hover:shadow-lg transition-all duration-300"
                          : fieldIndex % 2 === 0
                          ? "bg-gray-50"
                          : "bg-white"
                      }
                    >
                      {fieldIndex === 0 && (
                        <td 
                          className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                            isCPI
                              ? "text-blue-800 text-xl font-bold"
                              : "text-gray-900"
                          }`}
                          rowSpan={category.fields.length}
                        >
                          {category.name}
                        </td>
                      )}
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        isCPI
                          ? "text-blue-800 font-semibold text-lg"
                          : "text-gray-500"
                      }`}>
                        {field.name}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        isCPI
                          ? "text-blue-800 font-semibold text-lg"
                          : "text-gray-500"
                      }`}>
                        {field.description}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        isCPI
                          ? "text-blue-800 font-bold text-xl"
                          : "text-gray-500"
                      }`}>
                        {calculationData ? formatValue(calculationData[field.name]) : '-'}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        isCPI
                          ? "text-blue-800 font-bold text-lg bg-blue-50 rounded-lg shadow-inner"
                          : "text-gray-500"
                      }`}>
                        {standardizedValue}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        isCPI
                          ? "text-blue-800 font-bold text-lg bg-blue-50 rounded-lg shadow-inner"
                          : "text-gray-500"
                      }`}>
                        {calculationData ? calculationData[`${field.name}_comment`] || '-' : '-'}
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}