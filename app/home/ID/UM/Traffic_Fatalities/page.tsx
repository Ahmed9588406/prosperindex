"use client";
import React, { useState, useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { useCity } from '../../../../context/CityContext';
import toast from 'react-hot-toast';

function TrafficFatalitiesForm() {
  const { user, isLoaded } = useUser();
  const { city, country, cityName } = useCity();
  const [totalFatalities, setTotalFatalities] = useState<string>("");
  const [cityPopulation, setCityPopulation] = useState<string>("");
  const [fatalitiesPer100k, setFatalitiesPer100k] = useState<number | null>(null);
  const [standardizedScore, setStandardizedScore] = useState<number | null>(null);
  const [decision, setDecision] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

  // Constants
  const minBenchmark = 1; // Min fatalities per 100,000 people
  const maxBenchmark = 31; // Max fatalities per 100,000 people

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
      const savedTotalFatalities = localStorage.getItem("totalFatalities");
      const savedCityPopulation = localStorage.getItem("cityPopulation");

      if (savedTotalFatalities) setTotalFatalities(savedTotalFatalities);
      if (savedCityPopulation) setCityPopulation(savedCityPopulation);
    }
  }, []);

  // Save inputs to localStorage on change
  const handleTotalFatalitiesChange = (value: string) => {
    setTotalFatalities(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("totalFatalities", value);
    }
  };

  const handleCityPopulationChange = (value: string) => {
    setCityPopulation(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("cityPopulation", value);
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

    const numericTotalFatalities = parseFloat(totalFatalities);
    const numericCityPopulation = parseFloat(cityPopulation);
    if (isNaN(numericTotalFatalities) || isNaN(numericCityPopulation)) {
      toast.error("Please enter valid numbers for both fields.");
      return;
    }
    if (numericTotalFatalities <= 0 || numericCityPopulation <= 0) {
      toast.error("Both total fatalities and city population must be positive numbers.");
      return;
    }

    // Traffic Fatalities per 100,000 People
    const fatalitiesPer100kValue =
      (numericTotalFatalities / numericCityPopulation) * 100000;
    setFatalitiesPer100k(fatalitiesPer100kValue);

    // Standardized Score (S)
    let standardizedScoreValue: number;
    if (fatalitiesPer100kValue >= maxBenchmark) {
      standardizedScoreValue = 0; // If fatalities >= max benchmark
    } else if (fatalitiesPer100kValue < minBenchmark) {
      standardizedScoreValue = 100; // If fatalities < min benchmark
    } else {
      standardizedScoreValue =
        100 * (1 - (fatalitiesPer100kValue - minBenchmark) / (maxBenchmark - minBenchmark));
    }
    setStandardizedScore(standardizedScoreValue);

    // Evaluate the decision based on the standardized score
    const evaluationComment = getComment(standardizedScoreValue);
    setDecision(evaluationComment);

    // Prepare data to send
    const postData = {
      city,
      country,
      traffic_fatalities: fatalitiesPer100kValue,
      traffic_fatalities_comment: evaluationComment, // Renamed for consistency
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
        Traffic Fatalities Calculator
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
          Total Traffic Fatalities per Year:
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="number"
            value={totalFatalities}
            onChange={(e) => handleTotalFatalitiesChange(e.target.value)}
            required
          />
        </label>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          City Population:
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="number"
            value={cityPopulation}
            onChange={(e) => handleCityPopulationChange(e.target.value)}
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
      {(fatalitiesPer100k !== null || standardizedScore !== null) && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          {fatalitiesPer100k !== null && (
            <p className="text-lg">
              Traffic Fatalities per 100,000 People: {fatalitiesPer100k.toFixed(2)}
            </p>
          )}
          {standardizedScore !== null && (
            <p className="text-lg">
              Standardized Traffic Fatalities Score: {standardizedScore.toFixed(2)}%
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

export default TrafficFatalitiesForm;