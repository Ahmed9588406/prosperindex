"use client";
import React, { useState, useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { useCity } from '../../../../context/CityContext';
import toast from 'react-hot-toast';

function LandAllocatedToStreetsCalculator() {
  const { user, isLoaded } = useUser();
  const { city, country, cityName } = useCity();
  const [urbanSurfaceStreets, setUrbanSurfaceStreets] = useState<string>("");
  const [totalUrbanArea, setTotalUrbanArea] = useState<string>("");
  const [allocatedPercentage, setAllocatedPercentage] = useState<number | null>(null);
  const [standardizedScore, setStandardizedScore] = useState<number | null>(null);
  const [decision, setDecision] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

  // Constants
  const MIN = 6; // Minimum benchmark percentage
  const MAX = 36; // Maximum benchmark percentage

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
      const savedUrbanSurfaceStreets = localStorage.getItem("urbanSurfaceStreets");
      const savedTotalUrbanArea = localStorage.getItem("totalUrbanArea");

      if (savedUrbanSurfaceStreets) setUrbanSurfaceStreets(savedUrbanSurfaceStreets);
      if (savedTotalUrbanArea) setTotalUrbanArea(savedTotalUrbanArea);
    }
  }, []);

  // Save inputs to localStorage on change
  const handleUrbanSurfaceStreetsChange = (value: string) => {
    setUrbanSurfaceStreets(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("urbanSurfaceStreets", value);
    }
  };

  const handleTotalUrbanAreaChange = (value: string) => {
    setTotalUrbanArea(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("totalUrbanArea", value);
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

    const numericUrbanSurfaceStreets = parseFloat(urbanSurfaceStreets);
    const numericTotalUrbanArea = parseFloat(totalUrbanArea);
    if (isNaN(numericUrbanSurfaceStreets) || isNaN(numericTotalUrbanArea)) {
      toast.error("Please enter valid numbers for both fields.");
      return;
    }
    if (numericUrbanSurfaceStreets <= 0 || numericTotalUrbanArea <= 0) {
      toast.error(
        "Both urban surface allocated to streets and total urban area must be positive numbers."
      );
      return;
    }

    // Calculate Land Allocated to Streets (%)
    const landAllocated =
      (numericUrbanSurfaceStreets / numericTotalUrbanArea) * 100;
    setAllocatedPercentage(landAllocated);

    // Standardized Score Calculation
    let standardizedScoreValue: number;
    if (landAllocated <= MIN) {
      standardizedScoreValue = 0;
    } else if (landAllocated >= MAX) {
      standardizedScoreValue = 100;
    } else {
      standardizedScoreValue =
        100 * ((landAllocated - MIN) / (MAX - MIN));
    }
    setStandardizedScore(standardizedScoreValue);

    // Evaluate the decision based on the standardized score
    const evaluationComment = getComment(standardizedScoreValue);
    setDecision(evaluationComment);

    // Prepare data to send
    const postData = {
      city,
      country,
      land_allocated_to_streets: landAllocated,
      land_allocated_to_streets_comment: evaluationComment, // Renamed for consistency
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
            🛣️ Land Allocated to Streets
          </h2>
          <p className="mt-2 text-blue-100">Assess and save your city's land allocation data</p>
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
              🛣️ Total Surface of Urban Streets (in km²):
            </label>
            <input
              className="shadow appearance-none border border-gray-300 rounded-lg w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              type="number"
              value={urbanSurfaceStreets}
              onChange={(e) => handleUrbanSurfaceStreetsChange(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block mb-3 font-semibold text-gray-700 flex items-center">
              🌍 Total Urban Area (in km²):
            </label>
            <input
              className="shadow appearance-none border border-gray-300 rounded-lg w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              type="number"
              value={totalUrbanArea}
              onChange={(e) => handleTotalUrbanAreaChange(e.target.value)}
              required
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

export default LandAllocatedToStreetsCalculator;