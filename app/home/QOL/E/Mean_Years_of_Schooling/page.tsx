"use client";
import React, { useState, useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { useCity } from '../../../../context/CityContext';
import toast from 'react-hot-toast';

function MeanYearsOfSchoolingCalculator() {
  const { user, isLoaded } = useUser();
  const { city, country, cityName } = useCity();
  const [proportions, setProportions] = useState<number[]>([]); // HS (proportion of population)
  const [durations, setDurations] = useState<number[]>([]); // YS (official duration of education)
  const [meanResult, setMeanResult] = useState<number | null>(null);
  const [standardizedResult, setStandardizedResult] = useState<number | null>(null);
  const [decision, setDecision] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

  const maxYears = 14; // Maximum benchmark

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
      const savedProportions = localStorage.getItem("proportions");
      const savedDurations = localStorage.getItem("durations");

      if (savedProportions) setProportions(JSON.parse(savedProportions));
      if (savedDurations) setDurations(JSON.parse(savedDurations));
    }
  }, []);

  const calculateAndSave = async () => {
    if (!isLoaded || !user) {
      toast.error("User not authenticated. Please log in.");
      return;
    }

    if (!city || !country) {
      toast.error("Please select a city from the cities page first.");
      return;
    }

    // Validate inputs
    if (proportions.length !== durations.length || proportions.length === 0) {
      toast.error("Please provide valid proportions and durations for each education level.");
      return;
    }

    // Calculate mean years of schooling
    let meanYearsOfSchooling = 0;
    for (let i = 0; i < proportions.length; i++) {
      meanYearsOfSchooling += proportions[i] * durations[i];
    }
    setMeanResult(meanYearsOfSchooling);

    // Standardization logic
    let standardized;
    if (meanYearsOfSchooling >= maxYears) {
      standardized = 100;
    } else if (meanYearsOfSchooling <= 0) {
      standardized = 0;
    } else {
      standardized = 100 * (Math.abs(1 - (maxYears - meanYearsOfSchooling) / maxYears));
    }
    setStandardizedResult(standardized);

    // Evaluate the decision based on the standardized score
    const evaluationComment = getComment(standardized);
    setDecision(evaluationComment);

    // Prepare data to send
    const postData = {
      city,
      country,
      mean_years_of_schooling: meanYearsOfSchooling,
      mean_years_of_schooling_comment: evaluationComment, // Renamed for consistency
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
      <h1 className="text-2xl font-bold mb-6 text-center">Mean Years of Schooling Calculator</h1>

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
          Proportion of Population (%):
        </label>
        <input
          type="text"
          value={proportions.join(", ")}
          onChange={(e) => {
            const values = e.target.value.split(',').map(Number);
            setProportions(values);
            if (typeof window !== "undefined") {
              localStorage.setItem("proportions", JSON.stringify(values));
            }
          }}
          className="border rounded-lg p-4 w-full text-lg"
          placeholder="Enter proportions separated by commas"
        />
      </div>
      <div className="mb-6">
        <label className="block mb-3 text-lg font-semibold">
          Official Duration of Education (Years):
        </label>
        <input
          type="text"
          value={durations.join(", ")}
          onChange={(e) => {
            const values = e.target.value.split(',').map(Number);
            setDurations(values);
            if (typeof window !== "undefined") {
              localStorage.setItem("durations", JSON.stringify(values));
            }
          }}
          className="border rounded-lg p-4 w-full text-lg"
          placeholder="Enter durations separated by commas"
        />
      </div>
      <button
        onClick={calculateAndSave}
        disabled={isSubmitting || !city || !country}
        className={`p-4 bg-blue-600 text-white rounded-lg w-full text-xl hover:bg-blue-700 transition ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isSubmitting ? 'Calculating and Saving...' : 'Calculate Mean Years of Schooling'}
      </button>
      {meanResult !== null && (
        <div className="mt-8 p-6 bg-gray-100 rounded-lg shadow-inner">
          <h2 className="text-xl font-semibold mb-4">
            Mean Years of Schooling: {meanResult.toFixed(2)}
          </h2>
          <h2 className="text-xl font-semibold mb-4">
            Standardized Mean Years of Schooling: {standardizedResult?.toFixed(2)}
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

export default MeanYearsOfSchoolingCalculator;