"use client";
import React, { useState, useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { useCity } from '../../../../context/CityContext';
import toast from 'react-hot-toast';
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

function PublicTransportForm() {
  const { user, isLoaded } = useUser();
  const { city, country, cityName } = useCity();
  const [tripsInPTModes, setTripsInPTModes] = useState<string>("");
  const [totalMotorizedTrips, setTotalMotorizedTrips] = useState<string>("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [usePTRatio, setUsePTRatio] = useState<number | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [standardizedPTRatio, setStandardizedPTRatio] = useState<number | null>(null);
  const [decision, setDecision] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

  // New states for raw public transport ratio and standardized score (for display and charts)
  const [actualPTRatio, setActualPTRatio] = useState<string | null>(null);
  const [standardizedScore, setStandardizedScore] = useState<string | null>(null);

  // New state to toggle the summary/help panel
  const [showSummary, setShowSummary] = useState(false);

  // Constants
  const MIN = 5.95; // Minimum value from benchmark
  const MAX = 62.16; // Maximum value from benchmark

  // Add getComment function for evaluation
  const getComment = (score: number) => {
    if (score >= 80) return "VERY SOLID";
    else if (score >= 70) return "SOLID";
    else if (score >= 60) return "MODERATELY SOLID";
    else if (score >= 50) return "MODERATELY WEAK";
    else if (score >= 40) return "WEAK";
    else return "VERY WEAK";
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

    const numericTotalTrips = Number(totalMotorizedTrips);
    if (numericTotalTrips <= 0) {
      toast.error("Total motorized trips must be greater than zero.");
      return;
    }
    const numericTripsInPTModes = Number(tripsInPTModes);
    if (isNaN(numericTripsInPTModes) || isNaN(numericTotalTrips)) {
      toast.error("Please enter valid numbers for both fields.");
      return;
    }

    // Calculate Use of Public Transport Ratio
    const calculatedPTRatio = (numericTripsInPTModes / numericTotalTrips) * 100;
    setUsePTRatio(calculatedPTRatio);

    // Standardized PT Ratio Calculation
    let standardizedPTRatioValue: number;
    if (calculatedPTRatio >= MAX) {
      standardizedPTRatioValue = 100;
    } else if (calculatedPTRatio < MIN) {
      standardizedPTRatioValue = 0;
    } else {
      standardizedPTRatioValue =
        100 * ((calculatedPTRatio - MIN) / (MAX - MIN));
    }
    setStandardizedPTRatio(standardizedPTRatioValue);

    // Evaluate the decision based on the standardized score
    const evaluationComment = getComment(standardizedPTRatioValue);
    setDecision(evaluationComment);

    // Set new states for display and charts
    setActualPTRatio(calculatedPTRatio.toFixed(2));
    setStandardizedScore(standardizedPTRatioValue.toFixed(2));

    // Prepare data to send
    const postData = {
      city,
      country,
      use_of_public_transport: calculatedPTRatio,
      use_of_public_transport_standardized: parseFloat(standardizedPTRatioValue.toFixed(2)),
      use_of_public_transport_comment: evaluationComment, // Renamed for consistency
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

  // Load saved inputs on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTripsInPTModes = localStorage.getItem("tripsInPTModes");
      const savedTotalMotorizedTrips = localStorage.getItem("totalMotorizedTrips");

      if (savedTripsInPTModes) setTripsInPTModes(savedTripsInPTModes);
      if (savedTotalMotorizedTrips) setTotalMotorizedTrips(savedTotalMotorizedTrips);
    }
  }, []);

  // Save inputs to localStorage on change
  const handleTripsInPTModesChange = (value: string) => {
    setTripsInPTModes(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("tripsInPTModes", value);
    }
  };

  const handleTotalMotorizedTripsChange = (value: string) => {
    setTotalMotorizedTrips(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("totalMotorizedTrips", value);
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
            🚇 Use of Public Transport
          </h2>
          <p className="mt-2 text-blue-100">Assess and save your city&apos;s public transport usage data</p>
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
                  Use of Public Transport measures the percentage of motorized trips made using public transport modes, assessing mobility sustainability.
                  This tool calculates the raw percentage from the inputs you provide and converts it into a standardized 0–100 score using predefined benchmarks.
                </p>
                <p className="font-mono mb-2">Use of Public Transport (raw) = (PT Trips / Total Motorized Trips) * 100%</p>
                <p className="mb-2">
                  Standardized score maps percentage to 100..0 across benchmarks (MIN..MAX) so higher use → higher score.
                </p>

                <h4 className="font-semibold mt-2 mb-1">What to enter</h4>
                <ul className="list-disc list-inside mb-2">
                  <li>Enter the number of trips using public transport modes.</li>
                  <li>Enter the total number of motorized trips (must be greater than zero).</li>
                  <li>Both fields are required for calculation.</li>
                </ul>

                <h4 className="font-semibold mt-2 mb-1">Tips for meaningful results</h4>
                <ul className="list-disc list-inside">
                  <li>Ensure data is sourced consistently (e.g., from the same year and definition).</li>
                  <li>For comparisons, use data from reliable sources like transport surveys.</li>
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
              🚇 Number of Trips in Public Transport Modes:
            </label>
            <input
              className="shadow appearance-none border border-gray-300 rounded-lg w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              type="number"
              value={tripsInPTModes}
              onChange={(e) => handleTripsInPTModesChange(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block mb-3 font-semibold text-gray-700 flex items-center">
              🚗 Total Motorized Trips:
            </label>
            <input
              className="shadow appearance-none border border-gray-300 rounded-lg w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              type="number"
              value={totalMotorizedTrips}
              onChange={(e) => handleTotalMotorizedTripsChange(e.target.value)}
              required
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
          
          {decision && actualPTRatio && standardizedScore && (
            <div className="mt-8 p-6 bg-gray-50 rounded-lg border">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg">Actual Public Transport Use</h3>
                    <p className="text-2xl font-bold text-gray-800">
                      {actualPTRatio}%
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg">Standardized Transport Score</h3>
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
}

export default PublicTransportForm;