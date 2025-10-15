"use client";
import React, { useState, useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { useCity } from '../../../../context/CityContext';
import toast from 'react-hot-toast';

function StreetIntersectionDensityForm() {
  const { user, isLoaded } = useUser();
  const { city, country, cityName } = useCity();
  const [intersectionCount, setIntersectionCount] = useState<string>("");
  const [urbanArea, setUrbanArea] = useState<string>("");
  const [density, setDensity] = useState<number | null>(null);
  const [standardizedScore, setStandardizedScore] = useState<number | null>(null);
  const [decision, setDecision] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

  // Constants
  const BENCHMARK = 100; // Benchmark density value (intersections per km²)

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
      const savedIntersectionCount = localStorage.getItem("intersectionCount");
      const savedUrbanArea = localStorage.getItem("urbanArea");

      if (savedIntersectionCount) setIntersectionCount(savedIntersectionCount);
      if (savedUrbanArea) setUrbanArea(savedUrbanArea);
    }
  }, []);

  // Save inputs to localStorage on change
  const handleIntersectionCountChange = (value: string) => {
    setIntersectionCount(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("intersectionCount", value);
    }
  };

  const handleUrbanAreaChange = (value: string) => {
    setUrbanArea(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("urbanArea", value);
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

    const numericIntersectionCount = parseFloat(intersectionCount);
    const numericUrbanArea = parseFloat(urbanArea);
    if (isNaN(numericIntersectionCount) || isNaN(numericUrbanArea)) {
      toast.error("Please enter valid numbers for both fields.");
      return;
    }
    if (numericIntersectionCount <= 0 || numericUrbanArea <= 0) {
      toast.error("Both intersection count and urban area must be positive numbers.");
      return;
    }

    // Calculate Street Intersection Density
    const streetIntersectionDensity =
      numericIntersectionCount / numericUrbanArea;
    setDensity(streetIntersectionDensity);

    // Standardized Score Calculation
    let standardizedScoreValue: number;
    if (streetIntersectionDensity < 0) {
      standardizedScoreValue = 0;
    } else if (streetIntersectionDensity >= BENCHMARK) {
      standardizedScoreValue = 100;
    } else {
      standardizedScoreValue =
        100 *
        (1 -
          Math.abs(
            (streetIntersectionDensity - BENCHMARK) / BENCHMARK
          ));
    }
    setStandardizedScore(standardizedScoreValue);

    // Evaluate the decision based on the standardized score
    const evaluationComment = getComment(standardizedScoreValue);
    setDecision(evaluationComment);

    // Prepare data to send
    const postData = {
      city,
      country,
      street_intersection_density: streetIntersectionDensity,
      street_intersection_density_comment: evaluationComment, // Renamed for consistency
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
        Street Intersection Density Calculator
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
          Total Number of Intersections:
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="number"
            value={intersectionCount}
            onChange={(e) => handleIntersectionCountChange(e.target.value)}
            required
          />
        </label>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Urban Area (in km²):
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="number"
            value={urbanArea}
            onChange={(e) => handleUrbanAreaChange(e.target.value)}
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
      {(density !== null || standardizedScore !== null) && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          {density !== null && (
            <p className="text-lg">
              Street Intersection Density: {density.toFixed(2)} intersections/km²
            </p>
          )}
          {standardizedScore !== null && (
            <p className="text-lg">
              Standardized Score: {standardizedScore.toFixed(2)}%
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

export default StreetIntersectionDensityForm;