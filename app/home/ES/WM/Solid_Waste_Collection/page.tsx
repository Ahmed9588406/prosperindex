"use client";

import React, { useState, useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { useCity } from "../../../../context/CityContext";
import toast from "react-hot-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SolidWasteCollection: React.FC = () => {
  const { user, isLoaded } = useUser();
  const { city, country, cityName } = useCity();
  const [wasteCollected, setWasteCollected] = useState<number | string>(""); // Volume of waste collected
  const [wasteGenerated, setWasteGenerated] = useState<number | string>(""); // Total volume of waste generated
  const [actualScore, setActualScore] = useState<string | null>(null); // Actual score
  const [standardizedScore, setStandardizedScore] = useState<string | null>(null); // Standardized score
  const [comment, setComment] = useState<string | null>(null); // Comment based on score
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

  // New state to toggle the summary/help panel
  const [showSummary, setShowSummary] = useState(false);

  // Load saved inputs on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCollected = localStorage.getItem("wasteCollected");
      const savedGenerated = localStorage.getItem("wasteGenerated");

      if (savedCollected) setWasteCollected(savedCollected);
      if (savedGenerated) setWasteGenerated(savedGenerated);
    }
  }, []);

  // Save inputs to localStorage on change
  const handleCollectedChange = (value: string) => {
    setWasteCollected(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("wasteCollected", value);
    }
  };

  const handleGeneratedChange = (value: string) => {
    setWasteGenerated(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("wasteGenerated", value);
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

  // Function to calculate solid waste collection score
  const calculateSolidWasteCollection = () => {
    if (!wasteCollected || !wasteGenerated) {
      toast.error("Please enter both the waste collected and waste generated values.");
      return null;
    }

    const collected = parseFloat(wasteCollected.toString());
    const generated = parseFloat(wasteGenerated.toString());

    if (collected < 0 || generated <= 0) {
      toast.error("Please ensure waste collected is >= 0 and waste generated is > 0.");
      return null;
    }

    if (collected > generated) {
      toast.error("Waste collected cannot exceed waste generated.");
      return null;
    }

    // Formula: Solid waste collection (%) = (Volume of waste collected / Total volume of waste generated) * 100
    const actual = (collected / generated) * 100;
    const actualNum = actual.toFixed(2); // Limit to 2 decimal places

    let standardized: number;
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

    const calculationResult = calculateSolidWasteCollection();
    if (calculationResult === null) return; // Exit if calculation fails

    const { actualNum, standardizedNum, calculatedComment } = calculationResult;

    try {
      setIsSubmitting(true);

      console.log('Before Posting:', 'Score:', standardizedNum, 'Comment:', calculatedComment);

      const postData = {
        city,
        country,
        solid_waste_collection: parseFloat(actualNum), // Post the actual score
        solid_waste_collection_standardized: parseFloat(standardizedNum), // Post the standardized score
        solid_waste_collection_comment: calculatedComment, // Use the calculated comment
        userId: user.id,
      };

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
      toast.success("Data calculated and saved successfully!");
      console.log('Result:', result);
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
      <h2 className="text-2xl font-bold mb-4">Solid Waste Collection Evaluation</h2>

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
              The Solid Waste Collection Index measures how effectively waste collection services pick up the total waste generated in a defined area and period.
              It is usually expressed as a percentage:
            </p>
            <p className="font-mono mb-2">(Waste Collected / Waste Generated) × 100</p>
            <p className="mb-2">
              A higher percentage means better coverage and collection performance. This component also converts the raw percentage into a standardized score used for benchmarking (0–100) and shows a short qualitative comment (e.g., VERY SOLID, WEAK).
            </p>

            <h4 className="font-semibold mt-2 mb-1">What to enter</h4>
            <ul className="list-disc list-inside mb-2">
              <li>Waste Collected — the amount actually collected (same units as below).</li>
              <li>Waste Generated — the total amount produced in the same area and time period (must be &gt; 0).</li>
              <li>Use consistent units for both (kg, tonnes, or m³). Example: 1200 kg collected of 1500 kg generated → 80%.</li>
            </ul>

            <h4 className="font-semibold mt-2 mb-1">Tips for meaningful results</h4>
            <ul className="list-disc list-inside">
              <li>Specify the time window (day/week/month) so comparisons are valid.</li>
              <li>Decide whether the figures include recyclables and organics, and document that choice.</li>
              <li>For operational insights, collect additional KPIs such as service frequency, households served, or diversion (recycling/compost) rate.</li>
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
        <label htmlFor="wasteCollected" className="block mb-2 font-semibold">
          Volume of Waste Collected (units):
        </label>
        <input
          id="wasteCollected"
          type="number"
          value={wasteCollected}
          onChange={(e) => handleCollectedChange(e.target.value)}
          className="border rounded p-2 w-full"
          placeholder="Enter waste collected"
          aria-label="Enter volume of waste collected"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="wasteGenerated" className="block mb-2 font-semibold">
          Total Volume of Waste Generated (units):
        </label>
        <input
          id="wasteGenerated"
          type="number"
          value={wasteGenerated}
          onChange={(e) => handleGeneratedChange(e.target.value)}
          className="border rounded p-2 w-full"
          placeholder="Enter waste generated"
          aria-label="Enter total volume of waste generated"
        />
      </div>

      <button
        onClick={handleCalculateAndSave}
        disabled={isSubmitting || !city || !country}
        className={`p-2 bg-green-500 text-white rounded w-full hover:bg-green-600 transition ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        aria-label="Calculate and Save"
      >
        {isSubmitting ? 'Calculating and Saving...' : 'Calculate and Save'}
      </button>

      {actualScore !== null && standardizedScore !== null && comment !== null && (
        <div className="mt-4">
          <h3 className="text-lg">
            Actual Solid Waste Collection Score: <span className="font-bold">{actualScore}%</span>
          </h3>
          <h3 className="text-lg">
            Standardized Solid Waste Collection Score: <span className="font-bold">{standardizedScore}%</span>
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
          <div className="mt-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { name: 'Standardized', value: parseFloat(standardizedScore) }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default SolidWasteCollection;