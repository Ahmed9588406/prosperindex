"use client";
import React, { useState, useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { useCity } from "../../../../context/CityContext";
import toast from "react-hot-toast"; // Import the toast function

const EmploymentToPopulationRatioCalculator: React.FC = () => {
  const { user, isLoaded } = useUser();
  const { city, country, cityName } = useCity();
  const [employed, setEmployed] = useState<number | undefined>();
  const [workingAgePopulation, setWorkingAgePopulation] = useState<number | undefined>();
  const [epr, setEpr] = useState<number>(0); // Employment to Population Ratio
  const [standardizedEpr, setStandardizedEpr] = useState<number>(0); // Standardized EPR
  const [decision, setDecision] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

  // Constants
  const min = 30.5; // Minimum benchmark
  const max = 75.0; // Maximum benchmark

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
      const savedEmployed = localStorage.getItem("employed");
      const savedWorkingAgePopulation = localStorage.getItem("workingAgePopulation");

      if (savedEmployed) setEmployed(Number(savedEmployed));
      if (savedWorkingAgePopulation) setWorkingAgePopulation(Number(savedWorkingAgePopulation));
    }
  }, []);

  // Save inputs to localStorage on change
  const handleEmployedChange = (value: number | undefined) => {
    setEmployed(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("employed", value?.toString() || "");
    }
  };

  const handleWorkingAgePopulationChange = (value: number | undefined) => {
    setWorkingAgePopulation(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("workingAgePopulation", value?.toString() || "");
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

    if (!workingAgePopulation || workingAgePopulation === 0) {
      toast.error("Working age population cannot be zero.");
      return;
    }
    if (!employed || employed < 0) {
      toast.error("Please enter a valid number of employed people.");
      return;
    }

    // Calculate Employment to Population Ratio (EPR)
    const ratio = (employed / workingAgePopulation) * 100;
    setEpr(ratio);

    // Standardized EPR Formula
    let standardized = 100 * ((ratio - min) / (max - min));
    if (standardized > 100) {
      standardized = 100;
    } else if (standardized < 0) {
      standardized = 0;
    }
    setStandardizedEpr(standardized);

    // Evaluate the decision based on the standardized score
    const evaluationComment = getComment(standardized);
    setDecision(evaluationComment);

    // Prepare data to send - now includes city and country
    const postData = {
      city,
      country,
      employment_to_population_ratio: ratio,
      employment_to_population_ratio_comment: evaluationComment,
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
    <div className="max-w-lg mx-auto p-10 bg-white shadow-lg rounded-2xl">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Employment to Population Ratio (EPR) Calculator
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

      {!city || (!country && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ Please select a city from the cities page first
          </p>
        </div>
      ))}

      <div className="mb-6">
        <label className="block mb-3 text-lg font-semibold">
          Total Number of Employed People:
        </label>
        <input
          type="number"
          value={employed !== undefined ? employed : ""}
          onChange={(e) => handleEmployedChange(Number(e.target.value) || undefined)}
          className="border rounded-lg p-4 w-full text-lg"
          placeholder="Enter number of employed people"
        />
      </div>
      <div className="mb-6">
        <label className="block mb-3 text-lg font-semibold">
          Working Age Population:
        </label>
        <input
          type="number"
          value={workingAgePopulation !== undefined ? workingAgePopulation : ""}
          onChange={(e) => handleWorkingAgePopulationChange(Number(e.target.value) || undefined)}
          className="border rounded-lg p-4 w-full text-lg"
          placeholder="Enter working age population"
        />
      </div>
      <button
        onClick={calculateAndSave}
        disabled={isSubmitting || !city || !country}
        className={`p-4 bg-blue-600 text-white rounded-lg w-full text-xl hover:bg-blue-700 transition ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isSubmitting ? 'Calculating and Saving...' : 'Calculate EPR'}
      </button>
      {decision && (
        <div className="mt-8 p-6 bg-gray-100 rounded-lg shadow-inner">
          <h2 className="text-xl font-semibold mb-4">
            Employment to Population Ratio (EPR): {epr.toFixed(2)}%
          </h2>
          <h2 className="text-xl font-semibold mb-4">
            Standardized EPR: {standardizedEpr.toFixed(2)}
          </h2>
          <h2 className="text-xl font-semibold">
            Decision:{" "}
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
          </h2>
        </div>
      )}
    </div>
  );
};

export default EmploymentToPopulationRatioCalculator;