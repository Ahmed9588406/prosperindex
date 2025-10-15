"use client";
import React, { useState, useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { useCity } from "../../../../context/CityContext";
import toast from "react-hot-toast";

const GiniIndexStandardization: React.FC = () => {
  const { user, isLoaded } = useUser();
  const { city, country, cityName } = useCity();
  const [incomes, setIncomes] = useState<string>(""); // Input: comma-separated list of incomes
  // Removed unused giniCoefficient state
  const [comment, setComment] = useState<string | null>(null); // Comment based on score
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state
  // Constants for benchmarks
  const MIN = 0.24; // Minimum Gini coefficient
  const MAX = 0.63; // Maximum Gini coefficient

  // Load saved inputs on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedIncomes = localStorage.getItem("incomes");
      if (savedIncomes) setIncomes(savedIncomes);
    }
  }, []);

  // Save inputs to localStorage on change
  const handleIncomesChange = (value: string) => {
    setIncomes(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("incomes", value);
    }
  };

  // Function to calculate Gini coefficient from an array of incomes
  const calculateGiniCoefficient = (incomeArray: number[]): number => {
    if (incomeArray.length < 2) return 0;
    const sortedIncomes = [...incomeArray].sort((a, b) => a - b);
    const n = incomeArray.length;
    const sum = sortedIncomes.reduce((acc, val) => acc + val, 0);
    const mean = sum / n;

    let giniSum = 0;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        giniSum += Math.abs(sortedIncomes[i] - sortedIncomes[j]);
      }
    }

    return giniSum / (2 * n * n * mean);
  };

  // Function to get comment based on standardized score
  const getComment = (score: number) => {
    if (score >= 80) return "VERY SOLID";
    else if (score >= 70) return "SOLID";
    else if (score >= 60) return "MODERATELY SOLID";
    else if (score >= 50) return "MODERATELY WEAK";
    else if (score >= 40) return "WEAK";
    else return "VERY WEAK";
  };

  // Function to calculate standardized Gini index and raw Gini coefficient
  const calculateStandardizedGini = () => {
    if (!incomes || incomes.trim() === "") {
      toast.error("Please enter valid incomes.");
      return null;
    }
    const incomeArray = incomes.split(',').map(Number).filter(Boolean);
    if (incomeArray.length < 2) {
      toast.error("Please enter at least two valid incomes.");
      return null;
    }
    const giniValue = calculateGiniCoefficient(incomeArray);
    if (giniValue < 0) {
      toast.error("Gini coefficient cannot be negative.");
      return null;
    }
    let standardized: number;

    // Standardization formula
    if (giniValue >= MAX) {
      standardized = 0;
    } else if (giniValue > MIN) {
      standardized = 100 * (1 - (giniValue - MIN) / (MAX - MIN));
    } else {
      standardized = 100;
    }

    const scoreNum = standardized.toFixed(2); // Limit to 2 decimal places
    // Removed setting giniCoefficient as it is unused
    console.log('Standardized Score:', scoreNum); // Log the score to the console
    const calculatedComment = getComment(parseFloat(scoreNum));
    setComment(calculatedComment); // Set comment based on score
    console.log('Calculated Comment:', calculatedComment);
    return { giniValue, scoreNum, calculatedComment };
  };

  // Function to handle calculation and saving data
  const handleCalculateAndSave = async () => {
    if (!user) {
      toast.error("Please sign in to save calculations.");
      return;
    }

    if (!city || !country) {
      toast.error("Please select a city from the cities page first.");
      return;
    }

    const calculationResult = calculateStandardizedGini();
    if (calculationResult === null) return; // Exit if calculation fails

    const { giniValue, calculatedComment } = calculationResult;

    try {
      setIsSubmitting(true); // Start loading
      console.log("Submitting data...");

      const postData = {
        city,
        country,
        gini_coefficient: giniValue, // Post the raw Gini coefficient
        gini_coefficient_comment: calculatedComment, // Use the calculated comment
        userId: user.id,
      };

      console.log("Post Data:", postData); // Debug: Log the post data

      const response = await fetch('/api/calculation-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      console.log("Response Status:", response.status); // Debug: Log the response status

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Result:", result); // Debug: Log the result

      toast.success("Data calculated and saved successfully!");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Error saving data:', errorMessage);
      toast.error("Failed to save data. Please try again.");
    } finally {
      setIsSubmitting(false); // Stop loading
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
            📊 Gini Index Standardization
          </h2>
          <p className="mt-2 text-blue-100">Assess and save your city&apos;s Gini coefficient data</p>
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
            <label htmlFor="incomes" className="block mb-3 font-semibold text-gray-700 flex items-center">
              💰 Enter Incomes (comma-separated):
            </label>
            <input
              id="incomes"
              type="text"
              value={incomes}
              onChange={(e) => handleIncomesChange(e.target.value)}
              className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Enter incomes, e.g., 1000,2000,3000"
              aria-label="Enter incomes"
            />
          </div>
          
          <button
            onClick={handleCalculateAndSave}
            disabled={isSubmitting || !city || !country}
            className={`w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-green-600 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center`}
            aria-label="Calculate and Save"
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
          
          {comment && (
            <div className="mt-8 p-6 bg-gray-50 rounded-lg border">
              <div className={`p-4 text-center font-bold text-white rounded-lg transition ${
                comment === "VERY SOLID"
                  ? "bg-gradient-to-r from-green-400 to-green-600"
                  : comment === "SOLID"
                  ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                  : "bg-gradient-to-r from-red-400 to-red-600"
              }`}>
                {comment}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GiniIndexStandardization;