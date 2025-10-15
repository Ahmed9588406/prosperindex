"use client";
import React, { useState, useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { useCity } from '../../../../context/CityContext';
import toast from 'react-hot-toast';

function EarlyChildhoodEducationCalculator() {
  const { user, isLoaded } = useUser();
  const { city, country, cityName } = useCity();
  const [childrenInECEP, setChildrenInECEP] = useState<string>("");
  const [totalChildren, setTotalChildren] = useState<string>("");
  const [participationRate, setParticipationRate] = useState<number | null>(null);
  const [standardizedRate, setStandardizedRate] = useState<number | null>(null);
  const [decision, setDecision] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

  const minBenchmark = 20; // Minimum benchmark
  const maxBenchmark = 80; // Maximum benchmark

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
      const savedChildrenInECEP = localStorage.getItem("childrenInECEP");
      const savedTotalChildren = localStorage.getItem("totalChildren");

      if (savedChildrenInECEP) setChildrenInECEP(savedChildrenInECEP);
      if (savedTotalChildren) setTotalChildren(savedTotalChildren);
    }
  }, []);

  // Save inputs to localStorage on change
  const handleChildrenInECEPChange = (value: string) => {
    setChildrenInECEP(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("childrenInECEP", value);
    }
  };

  const handleTotalChildrenChange = (value: string) => {
    setTotalChildren(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("totalChildren", value);
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

    const childrenECEP = parseFloat(childrenInECEP);
    const total = parseFloat(totalChildren);

    if (isNaN(childrenECEP) || isNaN(total) || total <= 0) {
      toast.error("Please provide valid inputs for the calculation.");
      return;
    }

    // Calculate Participation Rate
    const rate = (childrenECEP / total) * 100;
    setParticipationRate(rate);

    // Standardize Participation Rate
    let standardized =
      100 * ((rate - minBenchmark) / (maxBenchmark - minBenchmark));
    if (standardized > 100) standardized = 100;
    if (standardized < 0) standardized = 0;
    setStandardizedRate(standardized);

    // Evaluate the decision based on the standardized score
    const evaluationComment = getComment(standardized);
    setDecision(evaluationComment);

    // Prepare data to send
    const postData = {
      city,
      country,
      early_childhood_education: rate,
      early_childhood_education_comment: evaluationComment, // Renamed for consistency
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
      <h1 className="text-2xl font-bold mb-6 text-center">
        Under-Six Participation in Early Childhood Education Programme Calculator
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
        <label className="block mb-2 text-gray-700 text-sm font-bold">
          Children under 6 in ECEP:
          <input
            type="number"
            value={childrenInECEP}
            onChange={(e) => handleChildrenInECEPChange(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </label>
      </div>
      <div className="mb-4">
        <label className="block mb-2 text-gray-700 text-sm font-bold">
          Total children under 6:
          <input
            type="number"
            value={totalChildren}
            onChange={(e) => handleTotalChildrenChange(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
        {isSubmitting ? 'Calculating and Saving...' : 'Calculate Participation Rate'}
      </button>
      {participationRate !== null && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p className="text-lg">Participation Rate: {participationRate.toFixed(2)}%</p>
          <p className="text-lg">Standardized Rate: {standardizedRate?.toFixed(2)}</p>
          {decision && (
            <p className="text-lg">
              Decision:{" "}
              <span
                className={`font-bold ${
                  decision === "VERY SOLID"
                    ? "text-green-600"
                    : decision === "SOLID"
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {decision}
              </span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default EarlyChildhoodEducationCalculator;