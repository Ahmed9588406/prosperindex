"use client";
import React, { useState, useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { useCity } from '../../../../context/CityContext';
import toast from 'react-hot-toast';

function AffordabilityOfTransportForm() {
  const { user, isLoaded } = useUser();
  const { city, country, cityName } = useCity();
  const [averageCostPerTrip, setAverageCostPerTrip] = useState<string>("");
  const [averageIncome, setAverageIncome] = useState<string>("");
  const [affordability, setAffordability] = useState<number | null>(null);
  const [standardizedScore, setStandardizedScore] = useState<number | null>(null);
  const [decision, setDecision] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

  // Constants
  const minBenchmark = 4; // Minimum affordability benchmark in %
  const maxBenchmark = 26; // Maximum affordability benchmark in %
  const tripsPerMonth = 60; // Number of trips per month

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
      const savedAverageCostPerTrip = localStorage.getItem("averageCostPerTrip");
      const savedAverageIncome = localStorage.getItem("averageIncome");

      if (savedAverageCostPerTrip) setAverageCostPerTrip(savedAverageCostPerTrip);
      if (savedAverageIncome) setAverageIncome(savedAverageIncome);
    }
  }, []);

  // Save inputs to localStorage on change
  const handleAverageCostPerTripChange = (value: string) => {
    setAverageCostPerTrip(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("averageCostPerTrip", value);
    }
  };

  const handleAverageIncomeChange = (value: string) => {
    setAverageIncome(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("averageIncome", value);
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

    const numericCostPerTrip = parseFloat(averageCostPerTrip);
    const numericIncome = parseFloat(averageIncome);
    if (isNaN(numericCostPerTrip) || isNaN(numericIncome)) {
      toast.error("Please enter valid numbers for both fields.");
      return;
    }
    if (numericCostPerTrip <= 0 || numericIncome <= 0) {
      toast.error("Both average cost per trip and average income must be positive numbers.");
      return;
    }

    // Affordability of Transport
    const affordabilityValue =
      (tripsPerMonth * numericCostPerTrip * 100) / numericIncome;
    setAffordability(affordabilityValue);

    // Standardized Score (S)
    let standardizedScoreValue: number;
    if (affordabilityValue >= maxBenchmark) {
      standardizedScoreValue = 0; // If affordability >= max benchmark
    } else if (affordabilityValue < minBenchmark) {
      standardizedScoreValue = 100; // If affordability < min benchmark
    } else {
      standardizedScoreValue =
        100 * (1 - (affordabilityValue - minBenchmark) / (maxBenchmark - minBenchmark));
    }
    setStandardizedScore(standardizedScoreValue);

    // Evaluate the decision based on the standardized score
    const evaluationComment = getComment(standardizedScoreValue);
    setDecision(evaluationComment);

    // Prepare data to send
    const postData = {
      city,
      country,
      affordability_of_transport: affordabilityValue,
      affordability_of_transport_comment: evaluationComment, // Renamed for consistency
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
    <div className="max-w-4xl mx-auto p-5 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Affordability of Transport Calculator
      </h1>

      {/* Display selected city and country */}
      {city && country && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-gray-600">Calculating for:</p>
          <p className="text-lg font-semibold text-blue-800">
            {cityName || `${city}, ${country}`}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            City: {city} | Country: {country}
          </p>
        </div>
      )}

      {!city || !country && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ Please select a city from the cities page first
          </p>
        </div>
      )}

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Average Cost per Trip (in local currency):
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="number"
            value={averageCostPerTrip}
            onChange={(e) => handleAverageCostPerTripChange(e.target.value)}
            required
          />
        </label>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Average Per Capita Income of Bottom Quintile (in local currency):
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="number"
            value={averageIncome}
            onChange={(e) => handleAverageIncomeChange(e.target.value)}
            required
          />
        </label>
      </div>
      <button
        onClick={calculateAndSave}
        disabled={isSubmitting || !city || !country}
        className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isSubmitting ? 'Calculating and Saving...' : 'Calculate'}
      </button>
      {(affordability !== null || standardizedScore !== null) && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          {affordability !== null && (
            <p className="text-lg">
              Affordability of Transport: {affordability.toFixed(2)}%
            </p>
          )}
          {standardizedScore !== null && (
            <p className="text-lg">
              Standardized Affordability Score: {standardizedScore.toFixed(2)}%
            </p>
          )}
          {decision && (
            <p
              className={`mt-4 p-2 text-center font-bold text-white rounded-md ${
                decision === "VERY SOLID"
                  ? "bg-green-500"
                  : decision === "SOLID"
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
            >
              {decision}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default AffordabilityOfTransportForm;