type Category = {
  name: string;
  fields: { name: string; description: string; path?: string }[];
};

const categories: Category[] = [
  {
    name: "House Infrastructure",
    fields: [
      { name: "improved_shelter", description: "Improved Shelter Rating", path: "/home/ID/subid/Improved_Shelter" },
      { name: "improved_water", description: "Improved Water Access", path: "/home/ID/subid/Improved_Water" },
      { name: "improved_sanitation", description: "Improved Sanitation", path: "/home/ID/subid/Improved_Sanitation" },
      { name: "sufficient_living", description: "Sufficient Living Space", path: "/home/ID/subid/Sufficient_Living" },
      { name: "population", description: "Population", path: "/home/ID/subid/Population" },
      { name: "electricity", description: "Electricity Access", path: "/home/ID/subid/Electricity" },
      { name: "house_Infrastructure", description: "Overall House Infrastructure Score", path: "/home/ID" },
    ]
  },
  {
    name: "Economic Strength",
    fields: [
      { name: "city_product_per_capita", description: "City Product Per Capita", path: "/home/P/EG/City_Product_per_capita" },
      { name: "old_age_dependency_ratio", description: "Old Age Dependency Ratio", path: "/home/P/EG/Old_Age_Dependency_Ratio" },
      { name: "mean_household_income", description: "Mean Household Income", path: "/home/P/EG/Mean_Household_Income" },
      { name: "economic_strength", description: "Overall Economic Strength Score", path: "/home/P/EG" },
    ]
  },
  {
    name: "Economic Agglomeration",
    fields: [
      { name: "economic_density", description: "Economic Density", path: "/home/P/EA/Economic_Density" },
      { name: "economic_specialization", description: "Economic Specialization", path: "/home/P/EA/Economic_Specialization" },
      { name: "economic_agglomeration", description: "Overall Economic Agglomeration Score", path: "/home/P/EA" },
    ]
  },
  {
    name: "Employment",
    fields: [
      { name: "unemployment_rate", description: "Unemployment Rate", path: "/home/P/E/Unemployment_Rate" },
      { name: "employment_to_population_ratio", description: "Employment to Population Ratio", path: "/home/P/E/Employment_to_Population_Ratio" },
      { name: "informal_employment", description: "Informal Employment", path: "/home/P/E/Informal_Employment" },
      { name: "employment", description: "Overall Employment Score", path: "/home/P/E" },
    ]
  },
  {
    name: "Social Infrastructure",
    fields: [
      { name: "physician_density", description: "Physician Density", path: "/home/ID/SI/Physiscian_Density" },
      { name: "number_of_public_libraries", description: "Number of Public Libraries", path: "/home/ID/SI/Number_of_libraries" },
      { name: "social_infrastructure", description: "Overall Social Infrastructure Score", path: "/home/ID/SI" },
    ]
  },
  {
    name: "Urban Mobility",
    fields: [
      { name: "use_of_public_transport", description: "Use of Public Transport", path: "/home/ID/UM/Use_Public_Transport" },
      { name: "average_daily_travel_time", description: "Average Daily Travel Time", path: "/home/ID/UM/Average_Daily_Travel_Time" },
      { name: "length_of_mass_transport_network", description: "Length of Mass Transport Network", path: "/home/ID/UM/Length_of_Mass_Transport_Network" },
      { name: "traffic_fatalities", description: "Traffic Fatalities", path: "/home/ID/UM/Traffic_Fatalities" },
      { name: "affordability_of_transport", description: "Affordability of Transport", path: "/home/ID/UM/Affordability_of_Transport" },
      { name: "urban_mobility", description: "Overall Urban Mobility Score", path: "/home/ID/UM" },
    ]
  },
  {
    name: "Urban Form",
    fields: [
      { name: "street_intersection_density", description: "Street Intersection Density", path: "/home/ID/UF/Street_Intersection_Density" },
      { name: "street_density", description: "Street Density", path: "/home/ID/UF/Street_Density" },
      { name: "land_allocated_to_streets", description: "Land Allocated to Streets", path: "/home/ID/UF/Land_Allocated_to_Streets" },
      { name: "urban_form", description: "Overall Urban Form Score", path: "/home/ID/UF" },
    ]
  },
  {
    name: "Health",
    fields: [
      { name: "life_expectancy_at_birth", description: "Life Expectancy at Birth", path: "/home/QOL/H/Life_Expectancy_at_Birth" },
      { name: "under_five_mortality_rate", description: "Under Five Mortality Rate", path: "/home/QOL/H/Under_Five_Mortality_Rate" },
      { name: "vaccination_coverage", description: "Vaccination Coverage", path: "/home/QOL/H/Vaccination_Coverage" },
      { name: "maternal_mortality", description: "Maternal Mortality", path: "/home/QOL/H/Maternal_Mortality" },
      { name: "health", description: "Overall Health Score", path: "/home/QOL/H" },
    ]
  },
  {
    name: "Education",
    fields: [
      { name: "literacy_rate", description: "Literacy Rate", path: "/home/QOL/E/Literacy_rate" },
      { name: "mean_years_of_schooling", description: "Mean Years of Schooling", path: "/home/QOL/E/Mean_Years_of_Schooling" },
      { name: "early_childhood_education", description: "Early Childhood Education", path: "/home/QOL/E/Early_Childhood_Education" },
      { name: "net_enrollment_rate_in_higher_education", description: "Net Enrollment Rate in Higher Education", path: "/home/QOL/E/Net_Enrollment_Rate_In_Higher_Education" },
      { name: "education", description: "Overall Education Score", path: "/home/QOL/E" },
    ]
  },
  {
    name: "Safety and Security",
    fields: [
      { name: "homicide_rate", description: "Homicide Rate", path: "/home/QOL/SS/Homicide_Rate" },
      { name: "theft_rate", description: "Theft Rate", path: "/home/QOL/SS/Theft_Rate" },
      { name: "safety_and_security", description: "Overall Safety and Security Score", path: "/home/QOL/SS" },
    ]
  },
  {
    name: "Public Space",
    fields: [
      { name: "accessibility_to_open_public_areas", description: "Accessibility to Open Public Areas", path: "/home/QOL/PS/Accessibility_To_Open_Public_Area" },
      { name: "green_area_per_capita", description: "Green Area Per Capita", path: "/home/QOL/PS/Green_Area_Per_Capita" },
      { name: "public_space", description: "Overall Public Space Score", path: "/home/QOL/PS" },
    ]
  },
  {
    name: "Economic Equity",
    fields: [
      { name: "gini_coefficient", description: "Gini Coefficient", path: "/home/ESI/EE/Gini_Coeffcient" },
      { name: "poverty_rate", description: "Poverty Rate", path: "/home/ESI/EE/Poverty_Rate" },
      { name: "economic_equity", description: "Overall Economic Equity Score", path: "/home/ESI/EE" },
    ]
  },
  {
    name: "Social Inclusion",
    fields: [
      { name: "slums_households", description: "Slums Households", path: "/home/ESI/SI/Slum_Housholds" },
      { name: "youth_unemployment", description: "Youth Unemployment", path: "/home/ESI/SI/Youth_Unemployment" },
      { name: "social_inclusion", description: "Overall Social Inclusion Score", path: "/home/ESI/SI" },
    ]
  },
  {
    name: "Gender Inclusion",
    fields: [
      { name: "equitable_secondary_school_enrollment", description: "Equitable Secondary School Enrollment", path: "/home/ESI/GI/Equitable_Secondary_School_Enrolment" },
      { name: "women_in_local_government", description: "Women in Local Government", path: "/home/ESI/GI/Women_in_Local_Government" },
      { name: "women_in_local_work_force", description: "Women in Local Work Force", path: "/home/ESI/GI/Women_in_the_Work_Force" },
      { name: "gender_inclusion", description: "Overall Gender Inclusion Score", path: "/home/ESI/GI" },
    ]
  },
  {
    name: "Urban Diversity",
    fields: [
      { name: "land_use_mix", description: "Land Use Mix", path: "/home/ESI/UD/Land_Use_Mix" },
      { name: "urban_diversity", description: "Overall Urban Diversity Score", path: "/home/ESI/UD" },
    ]
  },
  {
    name: "Air Quality",
    fields: [
      { name: "number_of_monitoring_stations", description: "Number of Monitoring Stations", path: "/home/ES/AQ/Number_of_Monitoring_Stations" },
      { name: "pm25_concentration", description: "PM2.5 Concentration", path: "/home/ES/AQ/PM2.5_Concentration" },
      { name: "co2_emissions", description: "CO2 Emissions", path: "/home/ES/AQ/CO2_Emissions" },
      { name: "air_quality", description: "Overall Air Quality Score", path: "/home/ES/AQ" },
    ]
  },
  {
    name: "Waste Management",
    fields: [
      { name: "solid_waste_collection", description: "Solid Waste Collection", path: "/home/ES/WM/Solid_Waste_Collection" },
      { name: "waste_water_treatment", description: "Waste Water Treatment", path: "/home/ES/WM/Waste_Water_Treatment" },
      { name: "solid_waste_recycling_share", description: "Solid Waste Recycling Share", path: "/home/ES/WM/Solid_Waste_Recycling_Share" },
      { name: "waste_management", description: "Overall Waste Management Score", path: "/home/ES/WM" },
    ]
  },
  {
    name: "Sustainable Energy",
    fields: [
      { name: "share_of_renewable_energy", description: "Share of Renewable Energy", path: "/home/ES/SE/Share_of_Renewable_Energy_Consumption" },
      { name: "sustainable_energy", description: "Overall Sustainable Energy Score", path: "/home/ES/SE" },
    ]
  },
  {
    name: "Participation",
    fields: [
      { name: "voter_turnout", description: "Voter Turnout", path: "/home/UGL/P/Voter_Turnout" },
      { name: "access_to_public_information", description: "Access to Public Information", path: "/home/UGL/P/Access_to_Public_Information" },
      { name: "civic_participation", description: "Civic Participation", path: "/home/UGL/P/Civic_Participation" },
      { name: "participation", description: "Overall Participation Score", path: "/home/UGL/P" },
    ]
  },
  {
    name: "Municipal Financing",
    fields: [
      { name: "own_revenue_collection", description: "Own Revenue Collection", path: "/home/UGL/MFIC/Own_Revenue_Collection" },
      { name: "days_to_start_a_business", description: "Days to Start a Business", path: "/home/UGL/MFIC/Days_to_Start_A_Business" },
      { name: "subnational_debt", description: "Subnational Debt", path: "/home/UGL/MFIC/Subnational_Debt" },
      { name: "local_expenditure_efficiency", description: "Local Expenditure Efficiency", path: "/home/UGL/MFIC/Local_Expenditure_Efficiency" },
      { name: "municipal_financing_and_institutional_capacity", description: "Overall Municipal Financing Score", path: "/home/UGL/MFIC" },
    ]
  },
  {
    name: "Governance",
    fields: [
      { name: "land_use_efficiency", description: "Land Use Efficiency", path: "/home/UGL/GU/Land_Use_Efficiency" },
      { name: "governance_of_urbanization", description: "Governance of Urbanization", path: "/home/UGL/GU" },
    ]
  },
  {
    name: "ICT",
    fields: [
      { name: "internet_access", description: "Internet Access", path: "/home/ID/ICT/internet_access" },
      { name: "home_computer_access", description: "Home Computer Access", path: "/home/ID/ICT/home_computer_access" },
      { name: "average_broadband_speed", description: "Average Broadband Speed", path: "/home/ID/ICT/average_broadband_speed" },
      { name: "ict", description: "Overall ICT Score", path: "/home/ID/ICT" },
    ]
  },
  {
    name: "Overall CPI",
    fields: [
      { name: "cpi", description: "City Prosperity Index", path: "/table" },
    ]
  }
];

export default categories;