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
  const [literacyRate, setLiteracyRate] = useState<number | null>(null);
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
    <div className="max-w-4xl mx-auto p-5 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">Literacy Rate Calculator</h1>

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

      <div className="mb-6">
        <label className="block mb-3 text-lg font-semibold">
          Literate Population (15 years and over):
        </label>
        <input
          type="number"
          value={literatePopulation}
          onChange={(e) => handleLiteratePopulationChange(e.target.value)}
          className="border rounded-lg p-4 w-full text-lg"
          placeholder="Enter literate population"
        />
      </div>
      <div className="mb-6">
        <label className="block mb-3 text-lg font-semibold">
          Total Population (15 years and over):
        </label>
        <input
          type="number"
          value={totalPopulation}
          onChange={(e) => handleTotalPopulationChange(e.target.value)}
          className="border rounded-lg p-4 w-full text-lg"
          placeholder="Enter total population"
        />
      </div>
      <button
        onClick={calculateAndSave}
        disabled={isSubmitting || !city || !country}
        className={`p-4 bg-blue-600 text-white rounded-lg w-full text-xl hover:bg-blue-700 transition ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isSubmitting ? 'Calculating and Saving...' : 'Calculate Literacy Rate'}
      </button>
      {literacyRate !== null && (
        <div className="mt-8 p-6 bg-gray-100 rounded-lg shadow-inner">
          <h2 className="text-xl font-semibold mb-4">
            Literacy Rate: {literacyRate.toFixed(2)}%
          </h2>
          <h2 className="text-xl font-semibold mb-4">
            Standardized Literacy Rate: {standardizedRate?.toFixed(2)}
          </h2>
          {decision && (
            <h2 className="text-xl font-semibold">
              Decision:{" "}
              <span
                className={`${
                  decision === "VERY SOLID"
                    ? "text-green-600"
                    : decision === "SOLID"
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {decision}
              </span>
            </h2>
          )}
        </div>
      )}
    </div>
  );
}

export default LiteracyRateCalculator;