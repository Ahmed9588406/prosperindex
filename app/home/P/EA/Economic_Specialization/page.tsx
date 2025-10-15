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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white shadow-2xl rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-green-600 p-6 text-white">
          <h2 className="text-3xl font-bold flex items-center">
            📊 Economic Specialization
          </h2>
          <p className="mt-2 text-blue-100">Assess and save your city's economic specialization data</p>
        </div>
        
        <div className="p-8">
          {/* Display selected city and country */}
          {city && country && (
            <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
              <p className="text-sm text-gray-600 flex items-center">
                📍 Calculating for:
              </p>
              <p className="text-lg font-semibold text-blue-800">
                {cityName || `${city}, ${country}`}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                City: {city} | Country: {country}
              </p>
            </div>
          )}

          {!city || !country && (
            <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg">
              <p className="text-sm text-yellow-800 flex items-center">
                ⚠️ Please select a city from the cities page first
              </p>
            </div>
          )}

          <div className="mb-6">
            <label className="block mb-3 font-semibold text-gray-700 flex items-center">
              🏭 Number of Industries (N):
            </label>
            <input
              type="number"
              value={numberOfIndustries !== undefined ? numberOfIndustries : ""}
              onChange={(e) => handleNumberOfIndustriesChange(Number(e.target.value) || undefined)}
              className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Enter the number of industries"
            />
          </div>

          <div className="mb-6">
            <label className="block mb-3 font-semibold text-gray-700 flex items-center">
              📈 Industry Shares (comma-separated, e.g., 0.2, 0.3, 0.5):
            </label>
            <input
              type="text"
              value={industryShares}
              onChange={(e) => handleIndustrySharesChange(e.target.value)}
              className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Enter shares as decimals"
            />
          </div>
          
          <button
            onClick={calculateAndSave}
            disabled={isSubmitting || !city || !country}
            className={`w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-green-600 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Calculating and Saving...
              </>
            ) : (
              <>🚀 Calculate and Save</>
            )}
          </button>
          
          {decision && (
            <div className="mt-8 p-6 bg-gray-50 rounded-lg border">
              <div className={`p-4 text-center font-bold text-white rounded-lg transition ${
                decision === "VERY SOLID"
                  ? "bg-gradient-to-r from-green-400 to-green-600"
                  : decision === "SOLID"
                  ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                  : "bg-gradient-to-r from-red-400 to-red-600"
              }`}>
                {decision}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HerfindahlHirschmanIndex;