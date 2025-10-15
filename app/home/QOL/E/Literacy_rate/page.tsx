"use client";
import React, { useState, useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { useCity } from '../../../../context/CityContext';
import toast from 'react-hot-toast';

function LiteracyRateCalculator() {
  const { user, isLoaded } = useUser();
  const { city, country, cityName } = useCity();
  const [literatePopulation, setLiteratePopulation] = useState<string>("");
  const [totalPopulation, setTotalPopulation] = useState<string>("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [literacyRate, setLiteracyRate] = useState<number | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [standardizedRate, setStandardizedRate] = useState<number | null>(null);
  const [decision, setDecision] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

  const minBenchmark = 15.0; // Minimum benchmark
  const maxBenchmark = 99.9; // Maximum benchmark

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
      const savedLiteratePopulation = localStorage.getItem("literatePopulation");
      const savedTotalPopulation = localStorage.getItem("totalPopulation");

      if (savedLiteratePopulation) setLiteratePopulation(savedLiteratePopulation);
      if (savedTotalPopulation) setTotalPopulation(savedTotalPopulation);
    }
  }, []);

  // Save inputs to localStorage on change
  const handleLiteratePopulationChange = (value: string) => {
    setLiteratePopulation(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("literatePopulation", value);
    }
  };

  const handleTotalPopulationChange = (value: string) => {
    setTotalPopulation(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("totalPopulation", value);
    }
  };

  const calculateAndSave = async () => {
    if (!isLoaded || !user) {
      toast.error("User not authenticated. Please log in.");
      return;
    }

    if (!city || !country) {
      toast.error("Please select a city from the cities page first.");
      return;
    }

    const literate = parseFloat(literatePopulation);
    const total = parseFloat(totalPopulation);

    if (isNaN(literate) || isNaN(total) || total <= 0) {
      toast.error("Please provide valid inputs for both fields.");
      return;
    }

    // Calculate Literacy Rate
    const rate = (literate / total) * 100;
    setLiteracyRate(rate);

    // Standardize Literacy Rate
    let standardized;
    if (rate >= maxBenchmark) {
      standardized = 100;
    } else if (rate <= minBenchmark) {
      standardized = 0;
    } else {
      standardized = 100 * ((rate - minBenchmark) / (maxBenchmark - minBenchmark));
    }
    setStandardizedRate(standardized);

    // Evaluate the decision based on the standardized score
    const evaluationComment = getComment(standardized);
    setDecision(evaluationComment);

    // Prepare data to send
    const postData = {
      city,
      country,
      literacy_rate: rate,
      literacy_rate_comment: evaluationComment, // Renamed for consistency
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white shadow-2xl rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-green-600 p-6 text-white">
          <h2 className="text-3xl font-bold flex items-center">
            📚 Literacy Rate
          </h2>
          <p className="mt-2 text-blue-100">Assess and save your city&apos;s literacy data</p>
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
              📚 Literate Population (15 years and over):
            </label>
            <input
              type="number"
              value={literatePopulation}
              onChange={(e) => handleLiteratePopulationChange(e.target.value)}
              className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Enter literate population"
            />
          </div>

          <div className="mb-6">
            <label className="block mb-3 font-semibold text-gray-700 flex items-center">
              👥 Total Population (15 years and over):
            </label>
            <input
              type="number"
              value={totalPopulation}
              onChange={(e) => handleTotalPopulationChange(e.target.value)}
              className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Enter total population"
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
}

export default LiteracyRateCalculator;