"use client";
import React, { useState } from "react";
import { useUser } from '@clerk/nextjs';

const TheftRateStandardization: React.FC = () => {
  const { user, isLoaded } = useUser();
  const [thefts, setThefts] = useState<string>(""); // Input: number of thefts
  const [population, setPopulation] = useState<string>(""); // Input: city population
  const [standardizedRate, setStandardizedRate] = useState<number | null>(null);
  const [decision, setDecision] = useState<string | null>(null); // Decision result
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

  const MIN = 25.45;
  const MAX = 6159.11;
  const ROOT_MIN = Math.pow(MIN, 0.25);
  const ROOT_MAX = Math.pow(MAX, 0.25);

  // Add getComment function for evaluation
  const getComment = (score: number) => {
    if (score >= 80) return "VERY SOLID";
    else if (score >= 70) return "SOLID";
    else if (score >= 60) return "MODERATELY SOLID";
    else if (score >= 50) return "MODERATELY WEAK";
    else if (score >= 40) return "WEAK";
    else return "VERY WEAK";
  };

  const calculateAndSave = async () => {
    if (!isLoaded || !user) {
      alert("User not authenticated. Please log in.");
      return;
    }
    const theftsCount = parseFloat(thefts);
    const populationCount = parseFloat(population);

    if (isNaN(theftsCount) || isNaN(populationCount) || populationCount <= 0) {
      alert("Please provide valid inputs for both fields.");
      return;
    }

    // Theft rate formula
    const theftRate = (100000 * theftsCount) / populationCount;
    const rootTheftRate = Math.pow(theftRate, 0.25);

    // Standardize the theft rate score
    let standardized;
    if (rootTheftRate >= ROOT_MAX) {
      standardized = 0;
    } else if (rootTheftRate <= ROOT_MIN) {
      standardized = 100;
    } else {
      standardized =
        100 * (1 - (rootTheftRate - ROOT_MIN) / (ROOT_MAX - ROOT_MIN));
    }
    setStandardizedRate(standardized);

    // Evaluate the decision based on the standardized score
    const evaluationComment = getComment(standardized);
    setDecision(evaluationComment);

    // Prepare data to send
    const postData = {
      theft_rate: theftRate,
      theft_rate_comment: evaluationComment, // Renamed for consistency
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
      alert("Data calculated and saved successfully!");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Error saving data:', errorMessage);
      alert("Failed to save data. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-5 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">Theft Rate Standardization</h1>

      <div className="mb-6">
        <label className="block mb-3 text-lg font-semibold">
          Number of Thefts:
        </label>
        <input
          type="number"
          value={thefts}
          onChange={(e) => setThefts(e.target.value)}
          className="border rounded p-4 w-full text-lg"
          placeholder="Enter the number of thefts"
        />
      </div>
      <div className="mb-6">
        <label className="block mb-3 text-lg font-semibold">
          City Population:
        </label>
        <input
          type="number"
          value={population}
          onChange={(e) => setPopulation(e.target.value)}
          className="border rounded p-4 w-full text-lg"
          placeholder="Enter the city population"
        />
      </div>
      <button
        onClick={calculateAndSave}
        disabled={isSubmitting}
        className={`p-4 bg-blue-600 text-white rounded-lg w-full text-xl hover:bg-blue-700 transition ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isSubmitting ? 'Calculating and Saving...' : 'Calculate Standardized Rate'}
      </button>
      {standardizedRate !== null && (
        <div className="mt-8 p-6 bg-gray-100 rounded-lg shadow-inner">
          <h2 className="text-xl font-semibold mb-4">
            Standardized Theft Rate: {standardizedRate.toFixed(2)}
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
};

export default TheftRateStandardization;