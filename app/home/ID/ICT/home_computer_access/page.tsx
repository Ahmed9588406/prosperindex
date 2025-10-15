"use client";
import React, { useState, useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { useCity } from "../../../../context/CityContext";
import toast from "react-hot-toast";

const HomeComputerAccessForm: React.FC = () => {
  const { user, isLoaded } = useUser();
  const { city, country, cityName } = useCity();
  const [computerHouseholds, setComputerHouseholds] = useState<string>("");
  const [totalHouseholds, setTotalHouseholds] = useState<string>("");
  const [result, setResult] = useState<string | null>(null);
  const [standardizedRate, setStandardizedRate] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

  // Load saved inputs on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedComputer = localStorage.getItem("computerHouseholds");
      const savedTotal = localStorage.getItem("totalHouseholds");

      if (savedComputer) setComputerHouseholds(savedComputer);
      if (savedTotal) setTotalHouseholds(savedTotal);
    }
  }, []);

  // Save inputs to localStorage on change
  const handleComputerChange = (value: string) => {
    setComputerHouseholds(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("computerHouseholds", value);
    }
  };

  const handleTotalChange = (value: string) => {
    setTotalHouseholds(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("totalHouseholds", value);
    }
  };

  // Constants for benchmarks and thresholds
  const MIN = 0; // Min = 0%
  const MAX = 100; // Max = 100%

  // Function to get comment based on standardized score
  const getComment = (score: number) => {
    if (score >= 80) return "VERY SOLID";
    else if (score >= 70) return "SOLID";
    else if (score >= 60) return "MODERATELY SOLID";
    else if (score >= 50) return "MODERATELY WEAK";
    else if (score >= 40) return "WEAK";
    else return "VERY WEAK";
  };

  const calculateAndSave = async () => {
    if (!user) {
      toast.error("Please sign in to save calculations.");
      return;
    }

    if (!city || !country) {
      toast.error("Please select a city from the cities page first.");
      return;
    }

    const numericTotalHouseholds = Number(totalHouseholds);
    if (numericTotalHouseholds <= 0) {
      toast.error("Total households must be greater than zero.");
      return;
    }
    const numericComputerHouseholds = Number(computerHouseholds);
    if (isNaN(numericComputerHouseholds) || isNaN(numericTotalHouseholds)) {
      toast.error("Please enter valid numbers for both fields.");
      return;
    }

    // Calculate home computer access percentage
    const computerAccess =
      (numericComputerHouseholds / numericTotalHouseholds) * 100;

    // Standardized formula with absolute value
    const standardizedValue =
      100 * (1 - Math.abs((computerAccess - MAX) / (MAX - MIN)));

    // Decision logic using getComment function
    const evaluationComment: string = getComment(standardizedValue);

    setResult(computerAccess.toFixed(2));
    setStandardizedRate(standardizedValue.toFixed(2));
    setEvaluation(evaluationComment);

    // Prepare data to send - now includes city and country
    const postData = {
      city,
      country,
      home_computer_access: computerAccess,
      home_computer_access_comment: evaluationComment,
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
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Calculate Home Computer Access
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
          Number of Households with Home Computers:
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="number"
            value={computerHouseholds}
            onChange={(e) => handleComputerChange(e.target.value)}
            required
          />
        </label>
      </div>
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Total Households:
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="number"
            value={totalHouseholds}
            onChange={(e) => handleTotalChange(e.target.value)}
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
      {result !== null && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p className="text-lg">Home Computer Access: {result}%</p>
          <p className="text-lg">Standardized Rate: {standardizedRate}%</p>
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

export default HomeComputerAccessForm;