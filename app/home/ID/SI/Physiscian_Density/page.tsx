"use client";
import React, { useState, useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { useCity } from "../../../../context/CityContext";
import toast from "react-hot-toast"; // Import the toast function

const PhysicianDensityForm: React.FC = () => {
  const { user, isLoaded } = useUser();
  const { city, country, cityName } = useCity();
  const [physicians, setPhysicians] = useState<string>("");
  const [totalPopulation, setTotalPopulation] = useState<string>("");
  const [physicianDensity, setPhysicianDensity] = useState<string | null>(null);
  const [standardizedDensity, setStandardizedDensity] = useState<number | null>(null);
  const [evaluation, setEvaluation] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

  // Constants for benchmarking
  const MIN = 0.01;
  const MAX = 7.74;

  // Function to get comment based on standardized score
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
      const savedPhysicians = localStorage.getItem("physicians");
      const savedPopulation = localStorage.getItem("totalPopulation");

      if (savedPhysicians) setPhysicians(savedPhysicians);
      if (savedPopulation) setTotalPopulation(savedPopulation);
    }
  }, []);

  // Save inputs to localStorage on change
  const handlePhysiciansChange = (value: string) => {
    setPhysicians(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("physicians", value);
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

    const numericPopulation = Number(totalPopulation);
    if (numericPopulation <= 0) {
      toast.error("Total population must be greater than zero.");
      return;
    }
    const numericPhysicians = Number(physicians);
    if (isNaN(numericPhysicians) || isNaN(numericPopulation)) {
      toast.error("Please enter valid numbers for both fields.");
      return;
    }

    const density = (numericPhysicians / numericPopulation) * 1000;
    setPhysicianDensity(density.toFixed(2));

    let standardized = 1000 * ((Math.sqrt(density) - Math.sqrt(MIN)) / (Math.sqrt(MAX) - Math.sqrt(MIN)));
    if (standardized > 100) {
      standardized = 100;
    } else if (standardized < 0) {
      standardized = 0;
    }
    setStandardizedDensity(standardized);

    // Decision logic using getComment function
    const evaluationComment: string = getComment(standardized);

    setEvaluation(evaluationComment);

    // Prepare data to send - now includes city and country
    const postData = {
      city,
      country,
      physician_density: density,
      physician_density_comment: evaluationComment,
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
        Calculate Physician Density
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

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Number of Physicians:
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="number"
            value={physicians}
            onChange={(e) => handlePhysiciansChange(e.target.value)}
            required
          />
        </label>
      </div>
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Total Population:
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="number"
            value={totalPopulation}
            onChange={(e) => handleTotalPopulationChange(e.target.value)}
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
      {physicianDensity !== null && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p className="text-lg">Physician Density: {physicianDensity} per 1,000 people</p>
          <p className="text-sm text-gray-600">Standardized Physician Density:</p>
          <ul className="list-disc pl-5">
            <li>Standardized Value: {standardizedDensity?.toFixed(2)}%</li>
          </ul>
          {evaluation && (
            <p
              className={`mt-4 p-2 text-center font-bold text-white rounded-md ${
                evaluation === "VERY SOLID"
                  ? "bg-green-500"
                  : evaluation === "SOLID"
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
            >
              {evaluation}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default PhysicianDensityForm;