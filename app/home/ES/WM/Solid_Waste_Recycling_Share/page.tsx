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

const COLORS = ["#82ca9d", "#e6e6e6"];

const SolidWasteRecyclingShare: React.FC = () => {
  const { user, isLoaded } = useUser();
  const { city, country, cityName } = useCity();
  const [wasteRecycled, setWasteRecycled] = useState<number | string>(""); // Volume of waste recycled
  const [wasteCollected, setWasteCollected] = useState<number | string>(""); // Total volume of waste collected
  const [actualScore, setActualScore] = useState<string | null>(null); // Actual score
  const [standardizedScore, setStandardizedScore] = useState<string | null>(null); // Standardized score
  const [comment, setComment] = useState<string | null>(null); // Comment based on score
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

  // New state to toggle the summary/help panel
  const [showSummary, setShowSummary] = useState(false);

  // Load saved inputs on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedRecycled = localStorage.getItem("wasteRecycled");
      const savedCollected = localStorage.getItem("wasteCollected");

      if (savedRecycled) setWasteRecycled(savedRecycled);
      if (savedCollected) setWasteCollected(savedCollected);
    }
  }, []);

  // Save inputs to localStorage on change
  const handleRecycledChange = (value: string) => {
    setWasteRecycled(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("wasteRecycled", value);
    }
  };

  const handleCollectedChange = (value: string) => {
    setWasteCollected(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("wasteCollected", value);
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

  // Function to calculate recycling share
  const calculateRecyclingShare = () => {
    if (!wasteRecycled || !wasteCollected) {
      toast.error("Please enter both the volume of waste recycled and waste collected.");
      return null;
    }

    const recycled = parseFloat(wasteRecycled.toString());
    const collected = parseFloat(wasteCollected.toString());

    if (isNaN(recycled) || isNaN(collected)) {
      toast.error("Please enter valid numeric values.");
      return null;
    }

    if (recycled < 0 || collected <= 0) {
      toast.error("Please ensure waste recycled is >= 0 and waste collected is > 0.");
      return null;
    }

    if (recycled > collected) {
      toast.error("Waste recycled cannot exceed waste collected.");
      return null;
    }

    // Calculate the initial recycling share percentage
    const actual = (recycled / collected) * 100;
    const actualNum = actual.toFixed(2); // Limit to 2 decimal places

    let standardized: number;

    // Apply the standardization formula
    if (actual >= 50) {
      standardized = 100;
    } else {
      standardized = 100 * (1 - Math.abs(actual - 50) / 50);
    }

    const standardizedNum = standardized.toFixed(2); // Limit to 2 decimal places
    setActualScore(actualNum);
    setStandardizedScore(standardizedNum);
    const calculatedComment = getComment(parseFloat(standardizedNum));
    setComment(calculatedComment); // Set comment based on standardized score
    console.log('Actual Score:', actualNum, 'Standardized Score:', standardizedNum, 'Calculated Comment:', calculatedComment);
    return { actualNum, standardizedNum, calculatedComment };
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

    const calculationResult = calculateRecyclingShare();
    if (calculationResult === null) return; // Exit if calculation fails

    const { actualNum, standardizedNum, calculatedComment } = calculationResult;

    try {
      setIsSubmitting(true); // Start loading
      console.log("Submitting data...");

      const postData = {
        city,
        country,
        solid_waste_recycling_share: parseFloat(actualNum), // Post the actual score
        solid_waste_recycling_share_standardized: parseFloat(standardizedNum), // Add the standardized score
        solid_waste_recycling_share_comment: calculatedComment, // Use the calculated comment
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

  // Prepare pie data (standardized value + remainder)
  const standardizedValue = standardizedScore ? parseFloat(standardizedScore) : 0;
  const pieData = [
    { name: 'Standardized', value: Number(standardizedValue.toFixed(2)) },
    { name: 'Remaining', value: Number((100 - standardizedValue).toFixed(2)) }
  ];

  return (
    <div className="max-w-4xl mx-auto p-5 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Solid Waste Recycling Share</h2>

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
              The Solid Waste Recycling Share measures the proportion of collected waste that gets recycled in a defined area and period.
              It is usually expressed as a percentage:
            </p>
            <p className="font-mono mb-2">(Waste Recycled / Waste Collected) × 100</p>
            <p className="mb-2">
              A higher percentage means more of the collected waste is being diverted to recycling. This component also converts the raw percentage into a standardized score (0–100) for benchmarking and displays a short qualitative comment.
            </p>

            <h4 className="font-semibold mt-2 mb-1">What to enter</h4>
            <ul className="list-disc list-inside mb-2">
              <li>Waste Recycled — the amount actually recycled (same units as below).</li>
              <li>Waste Collected — the total amount collected in the same area and time period (must be &gt; 0).</li>
              <li>Use consistent units for both (kg, tonnes, or m³). Example: 300 tonnes recycled of 1000 tonnes collected → 30%.</li>
            </ul>

            <h4 className="font-semibold mt-2 mb-1">Tips for meaningful results</h4>
            <ul className="list-disc list-inside">
              <li>Specify the time window (day/week/month) so comparisons are valid.</li>
              <li>Decide whether the figures include all waste streams or specific ones (e.g., household only) and document that choice.</li>
              <li>For operational insights, gather additional KPIs such as diversion rate, service frequency, and households served.</li>
            </ul>
          </div>
        )}
      </div>

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
        <label htmlFor="wasteRecycled" className="block mb-2 font-semibold">
          Volume of Waste Recycled (tons):
        </label>
        <input
          id="wasteRecycled"
          type="number"
          value={wasteRecycled}
          onChange={(e) => handleRecycledChange(e.target.value)}
          className="border rounded p-2 w-full"
          placeholder="Enter waste recycled"
          aria-label="Enter volume of waste recycled"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="wasteCollected" className="block mb-2 font-semibold">
          Total Volume of Waste Collected (tons):
        </label>
        <input
          id="wasteCollected"
          type="number"
          value={wasteCollected}
          onChange={(e) => handleCollectedChange(e.target.value)}
          className="border rounded p-2 w-full"
          placeholder="Enter waste collected"
          aria-label="Enter total volume of waste collected"
        />
      </div>

      <button
        onClick={handleCalculateAndSave}
        disabled={isSubmitting || !city || !country}
        className={`p-2 bg-blue-500 text-white rounded w-full hover:bg-blue-600 transition ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        aria-label="Calculate and Save"
      >
        {isSubmitting ? 'Calculating and Saving...' : 'Calculate and Save'}
      </button>

      {actualScore !== null && standardizedScore !== null && comment !== null && (
        <div className="mt-4">
          <h3 className="text-lg">
            Actual Solid Waste Recycling Share: <span className="font-bold">{actualScore}%</span>
          </h3>
          <h3 className="text-lg">
            Standardized Solid Waste Recycling Share: <span className="font-bold">{standardizedScore}%</span>
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

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Standardized', value: parseFloat(standardizedScore) }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full h-72 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={90}
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
      )}
    </div>
  );
};

export default SolidWasteRecyclingShare;