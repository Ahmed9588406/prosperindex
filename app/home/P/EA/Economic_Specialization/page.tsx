"use client";
import React, { useState, useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { useCity } from "../../../../context/CityContext";
import toast from "react-hot-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ["#6ee7b7", "#e6e6e6"];

const HerfindahlHirschmanIndex: React.FC = () => {
  const { user, isLoaded } = useUser();
  const { city, country, cityName } = useCity();
  const [industryShares, setIndustryShares] = useState<string>(""); // Comma-separated values
  const [numberOfIndustries, setNumberOfIndustries] = useState<number | undefined>();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [hIndex, setHIndex] = useState<number>(0); // H Index
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [normalizedHIndex, setNormalizedHIndex] = useState<number>(0); // Normalized H*
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [standardizedHIndex, setStandardizedHIndex] = useState<number>(0); // Standardized H(S)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [benchmark, setBenchmark] = useState<number>(0); // X*
  const [decision, setDecision] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

  // New states for raw economic specialization and standardized score (for display and charts)
  const [actualEconomicSpecialization, setActualEconomicSpecialization] = useState<string | null>(null);
  const [standardizedScore, setStandardizedScore] = useState<string | null>(null);

  // New state to toggle the summary/help panel
  const [showSummary, setShowSummary] = useState(false);

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

    // Set new states for display and charts
    setActualEconomicSpecialization(h.toFixed(2));
    setStandardizedScore(standardizedH.toFixed(2));

    // Prepare data to send - now includes city and country
    const postData = {
      city,
      country,
      economic_specialization: h,
      economic_specialization_standardized: parseFloat(standardizedH.toFixed(2)),
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

  // Prepare pie data (standardized value + remainder)
  const standardizedValue = standardizedScore ? parseFloat(standardizedScore) : 0;
  const pieData = [
    { name: 'Standardized', value: Number(standardizedValue.toFixed(2)) },
    { name: 'Remaining', value: Number((100 - standardizedValue).toFixed(2)) }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-white shadow-2xl rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-green-600 p-6 text-white">
          <h2 className="text-3xl font-bold flex items-center">
            📊 Economic Specialization
          </h2>
          <p className="mt-2 text-blue-100">Assess and save your city&apos;s economic specialization data</p>
        </div>
        
        <div className="p-8">
          {/* Summary / About this index section (collapsible) */}
          <div className="mb-4">
            <button
              onClick={() => setShowSummary(!showSummary)}
              className="text-left w-full p-3 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition flex justify-between items-center"
              aria-expanded={showSummary}
              aria-controls="summary-panel"
            >
              <span className="font-semibold">What is this index?</span>
              <span className="text-sm text-gray-600">{showSummary ? 'Hide' : 'Show'}</span>
            </button>

            {showSummary && (
              <div id="summary-panel" className="mt-3 p-4 bg-blue-50 border border-blue-100 rounded-md text-sm text-gray-700">
                <p className="mb-2">
                  Economic Specialization measures the concentration of economic activity across industries using the Herfindahl-Hirschman Index (HHI).
                  This tool calculates the raw HHI from the inputs you provide and converts it into a standardized 0–100 score using predefined benchmarks.
                </p>
                <p className="font-mono mb-2">HHI (raw) = Sum of (share_i)^2 for each industry</p>
                <p className="mb-2">
                  Standardized score maps HHI to 100..0 with benchmark X* so balanced specialization → higher score.
                </p>

                <h4 className="font-semibold mt-2 mb-1">What to enter</h4>
                <ul className="list-disc list-inside mb-2">
                  <li>Enter the number of industries (N).</li>
                  <li>Enter industry shares as comma-separated decimals (e.g., 0.2,0.3,0.5) that sum to 1.</li>
                  <li>Both fields are required for calculation.</li>
                </ul>

                <h4 className="font-semibold mt-2 mb-1">Tips for meaningful results</h4>
                <ul className="list-disc list-inside">
                  <li>Ensure shares are accurate and sum to 1 for the economy.</li>
                  <li>For comparisons, use consistent industry classifications.</li>
                  <li>You can save the result to your calculation history (requires sign in and selected city).</li>
                </ul>
              </div>
            )}
          </div>

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
          
          {decision && actualEconomicSpecialization && standardizedScore && (
            <div className="mt-8 p-6 bg-gray-50 rounded-lg border">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg">Actual Economic Specialization</h3>
                    <p className="text-2xl font-bold text-gray-800">
                      {actualEconomicSpecialization}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg">Standardized Specialization Score</h3>
                    <p className="text-2xl font-bold text-gray-800">
                      {standardizedScore}%
                    </p>
                  </div>
                </div>

                <div className={`p-4 text-center font-bold text-white rounded-lg transition ${
                  decision === "VERY SOLID"
                    ? "bg-gradient-to-r from-green-400 to-green-600"
                    : decision === "SOLID"
                    ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                    : "bg-gradient-to-r from-red-400 to-red-600"
                }`}>
                  {decision}
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Standardized', value: parseFloat(standardizedScore) }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill={COLORS[0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="w-full h-64 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                          label={(entry) => `${entry.name}: ${entry.value}%`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HerfindahlHirschmanIndex;