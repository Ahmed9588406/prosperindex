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

const COLORS = ["#8884d8", "#e6e6e6"];

const WastewaterTreatment: React.FC = () => {
  const { user, isLoaded } = useUser();
  const { city, country, cityName } = useCity();
  const [sewageTreated, setSewageTreated] = useState<number | string>(""); // Volume of sewage treated
  const [sewageProduced, setSewageProduced] = useState<number | string>(""); // Total volume of sewage produced
  const [actualScore, setActualScore] = useState<string | null>(null); // Actual score
  const [standardizedScore, setStandardizedScore] = useState<string | null>(null); // Standardized score
  const [comment, setComment] = useState<string | null>(null); // Comment based on score
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

  // New state to toggle the summary/help panel
  const [showSummary, setShowSummary] = useState(false);

  // Load saved inputs on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTreated = localStorage.getItem("sewageTreated");
      const savedProduced = localStorage.getItem("sewageProduced");

      if (savedTreated) setSewageTreated(savedTreated);
      if (savedProduced) setSewageProduced(savedProduced);
    }
  }, []);

  // Save inputs to localStorage on change
  const handleTreatedChange = (value: string) => {
    setSewageTreated(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("sewageTreated", value);
    }
  };

  const handleProducedChange = (value: string) => {
    setSewageProduced(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("sewageProduced", value);
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

  // Function to calculate wastewater treatment score
  const calculateWastewaterTreatment = () => {
    if (!sewageTreated || !sewageProduced) {
      toast.error("Please enter both the sewage treated and sewage produced values.");
      return null;
    }

    const treated = parseFloat(sewageTreated.toString());
    const produced = parseFloat(sewageProduced.toString());

    if (isNaN(treated) || isNaN(produced)) {
      toast.error("Please enter valid numeric values.");
      return null;
    }

    if (treated < 0 || produced <= 0) {
      toast.error("Please ensure sewage treated is >= 0 and sewage produced is > 0.");
      return null;
    }

    if (treated > produced) {
      toast.error("Sewage treated cannot exceed sewage produced.");
      return null;
    }

    // Formula: Wastewater treatment (%) = (sewage treated / sewage produced) * 100
    const actual = (treated / produced) * 100;
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
  
      const calculationResult = calculateWastewaterTreatment();
      if (calculationResult === null) return; // Exit if calculation fails
  
      const { actualNum, standardizedNum, calculatedComment } = calculationResult;
  
      try {
        setIsSubmitting(true); // Start loading
        console.log("Submitting data...");
  
        const postData = {
          city,
          country,
          waste_water_treatment: parseFloat(actualNum), // Post the actual score
          waste_water_treatment_standardized: parseFloat(standardizedNum), // Add the standardized score
          waste_water_treatment_comment: calculatedComment, // Use the calculated comment
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
      <h2 className="text-2xl font-bold mb-4">Wastewater Treatment Evaluation</h2>

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
              The Wastewater Treatment index measures the share of produced sewage that is actually treated within a defined area and period.
              It is generally expressed as a percentage:
            </p>
            <p className="font-mono mb-2">(Sewage Treated / Sewage Produced) × 100</p>
            <p className="mb-2">
              A higher percentage indicates better treatment coverage. This component also converts the raw percentage into a standardized score (0–100) for comparison and shows a short qualitative comment (e.g., VERY SOLID, WEAK).
            </p>

            <h4 className="font-semibold mt-2 mb-1">What to enter</h4>
            <ul className="list-disc list-inside mb-2">
              <li>Sewage Treated — the amount actually treated (same units as below).</li>
              <li>Sewage Produced — total sewage generated in the same area and time period (must be &gt; 0).</li>
              <li>Use consistent units for both (m³/year, m³/day, etc.). Example: 500,000 m³ treated of 600,000 m³ produced → 83.33%.</li>
            </ul>

            <h4 className="font-semibold mt-2 mb-1">Tips for meaningful results</h4>
            <ul className="list-disc list-inside">
              <li>Specify the time window (year/month) so comparisons are valid.</li>
              <li>Decide whether industrial/greywater streams are included and document that choice.</li>
              <li>For operational insights, gather additional KPIs such as treatment capacity, treatment levels (primary/secondary), and population served.</li>
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
        <label htmlFor="sewageTreated" className="block mb-2 font-semibold">
          Sewage Treated (m³/year):
        </label>
        <input
          id="sewageTreated"
          type="number"
          value={sewageTreated}
          onChange={(e) => handleTreatedChange(e.target.value)}
          className="border rounded p-2 w-full"
          placeholder="Enter sewage treated"
          aria-label="Enter volume of sewage treated"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="sewageProduced" className="block mb-2 font-semibold">
          Sewage Produced (m³/year):
        </label>
        <input
          id="sewageProduced"
          type="number"
          value={sewageProduced}
          onChange={(e) => handleProducedChange(e.target.value)}
          className="border rounded p-2 w-full"
          placeholder="Enter sewage produced"
          aria-label="Enter total volume of sewage produced"
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
            Actual Wastewater Treatment Score: <span className="font-bold">{actualScore}%</span>
          </h3>
          <h3 className="text-lg">
            Standardized Wastewater Treatment Score: <span className="font-bold">{standardizedScore}%</span>
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
                  <Bar dataKey="value" fill="#8884d8" />
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

export default WastewaterTreatment;