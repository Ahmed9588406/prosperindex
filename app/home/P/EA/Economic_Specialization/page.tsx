"use client";
import React, { useState, useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { useCity } from "../../../../context/CityContext";
import toast from "react-hot-toast"; // Import the toast function

const HerfindahlHirschmanIndex: React.FC = () => {
  const { user, isLoaded } = useUser();
  const { city, country, cityName } = useCity();
  const [industryShares, setIndustryShares] = useState<string>(""); // Comma-separated values
  const [numberOfIndustries, setNumberOfIndustries] = useState<number | undefined>();
  const [hIndex, setHIndex] = useState<number>(0); // H Index
  const [normalizedHIndex, setNormalizedHIndex] = useState<number>(0); // Normalized H*
  const [standardizedHIndex, setStandardizedHIndex] = useState<number>(0); // Standardized H(S)
  const [benchmark, setBenchmark] = useState<number>(0); // X*
  const [decision, setDecision] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

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
      const savedNumberOfIndustries = localStorage.getItem("numberOfIndustries");
      const savedIndustryShares = localStorage.getItem("industryShares");

      if (savedNumberOfIndustries) setNumberOfIndustries(Number(savedNumberOfIndustries));
      if (savedIndustryShares) setIndustryShares(savedIndustryShares);
    }
  }, []);

  // Save inputs to localStorage on change
  const handleNumberOfIndustriesChange = (value: number | undefined) => {
    setNumberOfIndustries(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("numberOfIndustries", value?.toString() || "");
    }
  };

  const handleIndustrySharesChange = (value: string) => {
    setIndustryShares(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("industryShares", value);
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

    if (!numberOfIndustries || numberOfIndustries <= 0) {
      toast.error("Please enter a valid number of industries.");
      return;
    }
    // Parse industry shares
    const shares = industryShares
      .split(",")
      .map((share) => parseFloat(share.trim()))
      .filter((share) => !isNaN(share));
    if (shares.length !== numberOfIndustries) {
      toast.error("Number of industries must match the number of shares entered.");
      return;
    }
    // Calculate H Index
    const h = shares.reduce((sum, share) => sum + Math.pow(share, 2), 0);
    setHIndex(h);
    // Calculate Normalized H*
    const normalizedH = (h - 1 / numberOfIndustries) / (1 - 1 / numberOfIndustries);
    setNormalizedHIndex(normalizedH);
    // Calculate Benchmark X*
    const xStar =
      (0.25 - 1 / numberOfIndustries) / (1 - 1 / numberOfIndustries);
    setBenchmark(xStar);
    // Calculate Standardized H(S) with absolute value in both numerator and denominator
    let standardizedH =
      100 *
      (1 -
        Math.abs(normalizedH - xStar) /
          Math.abs(xStar));
    if (standardizedH < 0) standardizedH = 0; // Ensure the value is not negative
    if (standardizedH > 100) standardizedH = 100; // Cap the value at 100
    setStandardizedHIndex(standardizedH);

    // Evaluate the decision based on the standardized score
    const evaluationComment = getComment(standardizedH);
    setDecision(evaluationComment);

    // Prepare data to send - now includes city and country
    const postData = {
      city,
      country,
      economic_specialization: h,
      economic_specialization_comment: evaluationComment,
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
        Herfindahl-Hirschman Index Calculator
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
          Number of Industries (N):
        </label>
        <input
          type="number"
          value={numberOfIndustries !== undefined ? numberOfIndustries : ""}
          onChange={(e) => handleNumberOfIndustriesChange(Number(e.target.value) || undefined)}
          className="border rounded-lg p-4 w-full text-lg"
          placeholder="Enter the number of industries"
        />
      </div>
      <div className="mb-6">
        <label className="block mb-3 text-lg font-semibold">
          Industry Shares (comma-separated, e.g., 0.2, 0.3, 0.5):
        </label>
        <input
          type="text"
          value={industryShares}
          onChange={(e) => handleIndustrySharesChange(e.target.value)}
          className="border rounded-lg p-4 w-full text-lg"
          placeholder="Enter shares as decimals"
        />
      </div>
      <button
        onClick={calculateAndSave}
        disabled={isSubmitting || !city || !country}
        className={`p-4 bg-blue-600 text-white rounded-lg w-full text-xl hover:bg-blue-700 transition ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isSubmitting ? 'Calculating and Saving...' : 'Calculate H Index'}
      </button>
      {decision && (
        <div className="mt-8 p-6 bg-gray-100 rounded-lg shadow-inner">
          <h2 className="text-xl font-semibold mb-4">
            H Index: {hIndex.toFixed(4)}
          </h2>
          <h2 className="text-xl font-semibold mb-4">
            Normalized H* Index: {normalizedHIndex.toFixed(4)}
          </h2>
          <h2 className="text-xl font-semibold mb-4">
            Benchmark X*: {benchmark.toFixed(4)}
          </h2>
          <h2 className="text-xl font-semibold mb-4">
            Standardized H(S): {standardizedHIndex.toFixed(4)}
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

export default HerfindahlHirschmanIndex;