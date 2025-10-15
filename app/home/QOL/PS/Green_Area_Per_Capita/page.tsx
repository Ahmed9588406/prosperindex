"use client";
import React, { useState, useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { useCity } from "../../../../context/CityContext";
import toast from "react-hot-toast";

const GreenAreaPerCapitaStandardization: React.FC = () => {
  const { user, isLoaded } = useUser();
  const { city, country, cityName } = useCity();
  const [totalGreenArea, setTotalGreenArea] = useState<string>(""); // Input: total green area in the city
  const [population, setPopulation] = useState<string>(""); // Input: city population
  const [standardizedRate, setStandardizedRate] = useState<number | null>(null);
  const [decision, setDecision] = useState<string | null>(null); // Decision evaluation
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

  // Load saved inputs on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTotalGreen = localStorage.getItem("totalGreenArea");
      const savedPopulation = localStorage.getItem("population");

      if (savedTotalGreen) setTotalGreenArea(savedTotalGreen);
      if (savedPopulation) setPopulation(savedPopulation);
    }
  }, []);

  // Save inputs to localStorage on change
  const handleTotalGreenChange = (value: string) => {
    setTotalGreenArea(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("totalGreenArea", value);
    }
  };

  const handlePopulationChange = (value: string) => {
    setPopulation(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("population", value);
    }
  };

  const BENCHMARK = 15; // X* = 15 m²/hab based on WHO suggestion

  // Add getComment function for evaluation
  const getComment = (score: number) => {
    if (score >= 80) return "VERY SOLID";
    else if (score >= 70) return "SOLID";
    else if (score >= 60) return "MODERATELY SOLID";
    else if (score >= 50) return "MODERATELY WEAK";
    else if (score >= 40) return "WEAK";
    else return "VERY WEAK";
  };

  const calculateGreenAreaPerCapita = async () => {
    if (!user) {
      toast.error("Please sign in to save calculations.");
      return;
    }

    if (!city || !country) {
      toast.error("Please select a city from the cities page first.");
      return;
    }

    const totalGreenAreaValue = parseFloat(totalGreenArea);
    const populationValue = parseFloat(population);

    if (isNaN(totalGreenAreaValue) || isNaN(populationValue) || populationValue <= 0) {
      toast.error("Please provide valid inputs for both fields.");
      return;
    }

    // Green area per capita formula
    const greenAreaPerCapita = totalGreenAreaValue / populationValue;

    // Standardize the green area per capita score
    let standardized;
    if (greenAreaPerCapita >= BENCHMARK) {
      standardized = 100;
    } else if (greenAreaPerCapita <= 0) {
      standardized = 0;
    } else {
      standardized = 100 * (greenAreaPerCapita / BENCHMARK);
    }
    setStandardizedRate(standardized);

    // Evaluate the decision based on the standardized score
    const evaluationComment = getComment(standardized);
    setDecision(evaluationComment);

    // Prepare data to send - now includes city and country
    const postData = {
      city,
      country,
      green_area_per_capita: greenAreaPerCapita,
      green_area_per_capita_comment: evaluationComment, // Renamed for consistency
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
    <div className="max-w-4xl mx-auto p-5 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Green Area Per Capita Standardization</h1>

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
        <label className="block mb-2 font-semibold">Total Green Area (m²):</label>
        <input
          type="number"
          value={totalGreenArea}
          onChange={(e) => handleTotalGreenChange(e.target.value)}
          className="border rounded p-2 w-full"
          placeholder="Enter total green area in square meters"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2 font-semibold">City Population:</label>
        <input
          type="number"
          value={population}
          onChange={(e) => handlePopulationChange(e.target.value)}
          className="border rounded p-2 w-full"
          placeholder="Enter city population"
        />
      </div>
      <button
        onClick={calculateGreenAreaPerCapita}
        disabled={isSubmitting || !city || !country}
        className={`p-2 bg-blue-500 text-white rounded w-full hover:bg-blue-600 transition ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isSubmitting ? 'Calculating and Saving...' : 'Calculate Standardized Rate'}
      </button>
      {standardizedRate !== null && (
        <div className="mt-4">
          <p className="text-lg">
            <strong>Standardized Green Area Per Capita:</strong> {standardizedRate.toFixed(2)}
          </p>
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
};

export default GreenAreaPerCapitaStandardization;