"use client";
import React, { useState, useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { useCity } from "../../../../context/CityContext";
import toast from "react-hot-toast";

const LandUseEfficiencyIndicator: React.FC = () => {
  const { user, isLoaded } = useUser();
  const { city, country, cityName } = useCity();
  const [urbInit, setUrbInit] = useState<number | string>(""); // Built-up area in the initial year
  const [urbFinal, setUrbFinal] = useState<number | string>(""); // Built-up area in the final year
  const [popInit, setPopInit] = useState<number | string>(""); // Population in the initial year
  const [popFinal, setPopFinal] = useState<number | string>(""); // Population in the final year
  const [years, setYears] = useState<number | string>(""); // Number of years between initial and final year
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [landUseEfficiency, setLandUseEfficiency] = useState<number | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [standardizedEfficiency, setStandardizedEfficiency] = useState<number | null>(null);
  const [decision, setDecision] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

  const MIN_EFFICIENCY = 0; // Minimum benchmark
  const MAX_EFFICIENCY = 3; // Maximum benchmark

  // Add getComment function for evaluation
  const getComment = (score: number) => {
    if (score >= 80) return "VERY SOLID";
    else if (score >= 70) return "SOLID";
    else if (score >= 60) return "MODERATELY SOLID";
    else if (score >= 50) return "MODERATELY WEAK";
    else if (score >= 40) return "WEAK";
    else return "VERY WEAK";
  };

  // Load saved inputs on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUrbInit = localStorage.getItem("urbInit");
      const savedUrbFinal = localStorage.getItem("urbFinal");
      const savedPopInit = localStorage.getItem("popInit");
      const savedPopFinal = localStorage.getItem("popFinal");
      const savedYears = localStorage.getItem("years");

      if (savedUrbInit) setUrbInit(savedUrbInit);
      if (savedUrbFinal) setUrbFinal(savedUrbFinal);
      if (savedPopInit) setPopInit(savedPopInit);
      if (savedPopFinal) setPopFinal(savedPopFinal);
      if (savedYears) setYears(savedYears);
    }
  }, []);

  // Save inputs to localStorage on change
  const handleUrbInitChange = (value: string) => {
    setUrbInit(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("urbInit", value);
    }
  };

  const handleUrbFinalChange = (value: string) => {
    setUrbFinal(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("urbFinal", value);
    }
  };

  const handlePopInitChange = (value: string) => {
    setPopInit(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("popInit", value);
    }
  };

  const handlePopFinalChange = (value: string) => {
    setPopFinal(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("popFinal", value);
    }
  };

  const handleYearsChange = (value: string) => {
    setYears(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("years", value);
    }
  };

  const calculateAndSave = async () => {
    if (!user) {
      toast.error("Please sign in to save calculations.");
      return;
    }

    if (!city || !country) {
      toast.error("Please select a city from the cities page first.");
      return;
    }

    const urb_t = parseFloat(urbInit.toString());
    const urb_tn = parseFloat(urbFinal.toString());
    const pop_t = parseFloat(popInit.toString());
    const pop_tn = parseFloat(popFinal.toString());
    const y = parseFloat(years.toString());

    if (
      isNaN(urb_t) ||
      isNaN(urb_tn) ||
      isNaN(pop_t) ||
      isNaN(pop_tn) ||
      isNaN(y) ||
      urb_t <= 0 ||
      urb_tn <= 0 ||
      pop_t <= 0 ||
      pop_tn <= 0 ||
      y <= 0
    ) {
      toast.error("Please provide valid inputs for all fields.");
      return;
    }

    // Calculate Urban Expansion Growth Rate
    const urbanGrowthRate = Math.pow((urb_tn - urb_t) / urb_t, 1 / y);

    // Calculate Population Annual Growth Rate
    const populationGrowthRate = Math.pow((pop_tn - pop_t) / pop_t, 1 / y);

    // Calculate Land Use Efficiency
    const efficiency = urbanGrowthRate / populationGrowthRate;
    setLandUseEfficiency(efficiency);

    // Standardize the land use efficiency score
    let standardized;
    if (efficiency >= MAX_EFFICIENCY) {
      standardized = 0;
    } else if (efficiency <= MIN_EFFICIENCY) {
      standardized = 100;
    } else {
      standardized =
        100 * ((MAX_EFFICIENCY - efficiency) / (MAX_EFFICIENCY - MIN_EFFICIENCY));
    }
    setStandardizedEfficiency(standardized);

    // Evaluate the decision based on the standardized score
    const evaluationComment = getComment(standardized);
    setDecision(evaluationComment);

    // Prepare data to send - now includes city and country
    const postData = {
      city,
      country,
      land_use_efficiency: efficiency,
      land_use_efficiency_comment: evaluationComment, // Renamed for consistency
      userId: user.id,
    };

    try {
      setIsSubmitting(true);
      const response = await fetch('/api/calculation-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Result:', result);
      toast.success("Data calculated and saved successfully!");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Error saving data:', errorMessage);
      toast.error("Failed to save data. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white shadow-2xl rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-green-600 p-6 text-white">
          <h2 className="text-3xl font-bold flex items-center">
            🏗️ Land Use Efficiency
          </h2>
          <p className="mt-2 text-blue-100">Assess and save your city&apos;s land use efficiency data</p>
        </div>
        
        <div className="p-8">
          {/* Display selected city and country */}
          {city && country && (
            <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
              <p className="text-sm text-gray-600 flex items-center">
                📍 Calculating for:
              </p>
              <p className="text-lg font-semibold text-blue-800">
                {cityName || `${city}, ${country}`}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                City: {city} | Country: {country}
              </p>
            </div>
          )}

          {!city || !country && (
            <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg">
              <p className="text-sm text-yellow-800 flex items-center">
                ⚠️ Please select a city from the cities page first
              </p>
            </div>
          )}

          <div className="mb-6">
            <label className="block mb-3 font-semibold text-gray-700 flex items-center">
              🏗️ Built-up Area (Initial Year):
            </label>
            <input
              type="number"
              value={urbInit}
              onChange={(e) => handleUrbInitChange(e.target.value)}
              className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Enter initial built-up area (km²)"
            />
          </div>

          <div className="mb-6">
            <label className="block mb-3 font-semibold text-gray-700 flex items-center">
              🏗️ Built-up Area (Final Year):
            </label>
            <input
              type="number"
              value={urbFinal}
              onChange={(e) => handleUrbFinalChange(e.target.value)}
              className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Enter final built-up area (km²)"
            />
          </div>

          <div className="mb-6">
            <label className="block mb-3 font-semibold text-gray-700 flex items-center">
              👥 Population (Initial Year):
            </label>
            <input
              type="number"
              value={popInit}
              onChange={(e) => handlePopInitChange(e.target.value)}
              className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Enter initial population"
            />
          </div>

          <div className="mb-6">
            <label className="block mb-3 font-semibold text-gray-700 flex items-center">
              👥 Population (Final Year):
            </label>
            <input
              type="number"
              value={popFinal}
              onChange={(e) => handlePopFinalChange(e.target.value)}
              className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Enter final population"
            />
          </div>

          <div className="mb-6">
            <label className="block mb-3 font-semibold text-gray-700 flex items-center">
              📅 Number of Years:
            </label>
            <input
              type="number"
              value={years}
              onChange={(e) => handleYearsChange(e.target.value)}
              className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Enter number of years"
            />
          </div>
          
          <button
            onClick={calculateAndSave}
            disabled={isSubmitting || !city || !country}
            className={`w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-green-600 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Calculating and Saving...
              </>
            ) : (
              <>🚀 Calculate and Save</>
            )}
          </button>
          
          {decision && (
            <div className="mt-8 p-6 bg-gray-50 rounded-lg border">
              <div className={`p-4 text-center font-bold text-white rounded-lg transition ${
                decision === "VERY SOLID"
                  ? "bg-gradient-to-r from-green-400 to-green-600"
                  : decision === "SOLID"
                  ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                  : "bg-gradient-to-r from-red-400 to-red-600"
              }`}>
                {decision}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandUseEfficiencyIndicator;