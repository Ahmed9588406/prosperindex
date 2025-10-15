"use client";
import React, { useState, useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { useCity } from "../../../../context/CityContext";
import toast from "react-hot-toast";

const PovertyRateStandardization: React.FC = () => {
  const { user, isLoaded } = useUser();
  const { city, country, cityName } = useCity();
  const [povertyPopulation, setPovertyPopulation] = useState<number | string>(""); // Input: population below $1.25 PPP a day
  const [totalPopulation, setTotalPopulation] = useState<number | string>(""); // Input: total population
  const [standardizedRate, setStandardizedRate] = useState<string | null>(null); // Standardized poverty rate
  const [comment, setComment] = useState<string | null>(null); // Comment based on score
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

  // Constants for benchmarks
  const MIN = 0.38; // ⁴√Min = 0.38
  const MAX = 3.00; // ⁴√Max = 3.00

  // Load saved inputs on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPoverty = localStorage.getItem("povertyPopulation");
      const savedTotal = localStorage.getItem("totalPopulation");

      if (savedPoverty) setPovertyPopulation(savedPoverty);
      if (savedTotal) setTotalPopulation(savedTotal);
    }
  }, []);

  // Save inputs to localStorage on change
  const handlePovertyChange = (value: string) => {
    setPovertyPopulation(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("povertyPopulation", value);
    }
  };

  const handleTotalChange = (value: string) => {
    setTotalPopulation(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("totalPopulation", value);
    }
  };

  // Function to get comment based on standardized score
  const getComment = (score: number) => {
    if (score >= 80) return "VERY SOLID";
    else if (score >= 70) return "SOLID";
    else if (score >= 60) return "MODERATELY SOLID";
    else if (score >= 50) return "MODERATELY WEAK";
    else if (score >= 40) return "WEAK";
    else return "VERY WEAK";
  };

  // Function to calculate standardized poverty rate
  const calculateStandardizedPovertyRate = () => {
    const totalPopValue = parseFloat(totalPopulation.toString());
    if (totalPopValue <= 0) {
      toast.error("Total population must be greater than zero.");
      return null;
    }

    const povertyPopValue = parseFloat(povertyPopulation.toString());
    if (isNaN(povertyPopValue) || isNaN(totalPopValue)) {
      toast.error("Please enter valid numbers for both fields.");
      return null;
    }

    // Poverty rate formula
    const povertyRate = (povertyPopValue / totalPopValue) * 100;
    const fourthRootPovertyRate = Math.pow(povertyRate, 0.25); // Calculating the fourth root

    // Standardization formula
    let standardizedRateValue: number;

    if (fourthRootPovertyRate >= MAX) {
      standardizedRateValue = 0;
    } else if (fourthRootPovertyRate > MIN) {
      standardizedRateValue = 100 * (1 - (fourthRootPovertyRate - MIN) / (MAX - MIN));
    } else {
      standardizedRateValue = 100;
    }

    const scoreNum = standardizedRateValue.toFixed(2); // Limit to 2 decimal places
    setStandardizedRate(scoreNum);
    const calculatedComment = getComment(parseFloat(scoreNum));
    setComment(calculatedComment); // Set comment based on score
    console.log('Calculated Score:', scoreNum, 'Calculated Comment:', calculatedComment);
    return { povertyRate, scoreNum, calculatedComment };
  };

  // Function to handle calculation and saving data
  const handleCalculateAndSave = async () => {
    if (!user) {
      toast.error("Please sign in to save calculations.");
      return;
    }

    if (!city || !country) {
      toast.error("Please select a city from the cities page first.");
      return;
    }

    const calculationResult = calculateStandardizedPovertyRate();
    if (calculationResult === null) return; // Exit if calculation fails

    const { povertyRate, calculatedComment } = calculationResult;

    try {
      setIsSubmitting(true); // Start loading
      console.log("Submitting data...");

      const postData = {
        city,
        country,
        poverty_rate: povertyRate, // Post the poverty rate
        poverty_rate_comment: calculatedComment, // Use the calculated comment
        userId: user.id,
      };

      console.log("Post Data:", postData); // Debug: Log the post data

      const response = await fetch('/api/calculation-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      console.log("Response Status:", response.status); // Debug: Log the response status

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Result:", result); // Debug: Log the result

      toast.success("Data calculated and saved successfully!");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Error saving data:', errorMessage);
      toast.error("Failed to save data. Please try again.");
    } finally {
      setIsSubmitting(false); // Stop loading
    }
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-5 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Poverty Rate Standardization</h2>

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
        <label className="block mb-2 font-semibold">
          Population Below $1.25 PPP a Day:
        </label>
        <input
          type="number"
          value={povertyPopulation}
          onChange={(e) => handlePovertyChange(e.target.value)}
          className="border rounded p-2 w-full"
          placeholder="Enter population below $1.25 PPP"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2 font-semibold">Total Population:</label>
        <input
          type="number"
          value={totalPopulation}
          onChange={(e) => handleTotalChange(e.target.value)}
          className="border rounded p-2 w-full"
          placeholder="Enter total population"
        />
      </div>

      <button
        onClick={handleCalculateAndSave}
        disabled={isSubmitting || !city || !country}
        className={`p-2 bg-blue-500 text-white rounded w-full hover:bg-blue-600 transition ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isSubmitting ? 'Calculating and Saving...' : 'Calculate Standardized Rate'}
      </button>

      {standardizedRate !== null && comment !== null && (
        <div className="mt-4">
          <h3 className="text-lg">
            Standardized Poverty Rate: <span className="font-bold">{standardizedRate}%</span>
          </h3>
          {comment && (
            <p
              className={`mt-4 p-2 text-center font-bold text-white rounded-md ${
                comment === "VERY SOLID"
                  ? "bg-green-500"
                  : comment === "SOLID"
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
            >
              {comment}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default PovertyRateStandardization;