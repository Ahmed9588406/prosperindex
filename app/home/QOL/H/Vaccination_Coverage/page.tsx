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

function VaccinationCoverageCalculator() {
  const { user, isLoaded } = useUser();
  const { city, country, cityName } = useCity();
  const [immunizedPopulation, setImmunizedPopulation] = useState<string>("");
  const [eligiblePopulation, setEligiblePopulation] = useState<string>("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [vaccinationCoverage, setVaccinationCoverage] = useState<number | null>(null);
  const [decision, setDecision] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

  // New states for raw vaccination coverage and standardized score (for display and charts)
  const [actualVaccination, setActualVaccination] = useState<string | null>(null);
  const [standardizedScore, setStandardizedScore] = useState<number | null>(null);

  // New state to toggle the summary/help panel
  const [showSummary, setShowSummary] = useState(false);

  const MIN_COVERAGE = 50; // Minimum benchmark
  const MAX_COVERAGE = 100; // Maximum benchmark

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
      const savedImmunizedPopulation = localStorage.getItem("immunizedPopulation");
      const savedEligiblePopulation = localStorage.getItem("eligiblePopulation");

      if (savedImmunizedPopulation) setImmunizedPopulation(savedImmunizedPopulation);
      if (savedEligiblePopulation) setEligiblePopulation(savedEligiblePopulation);
    }
  }, []);

  // Save inputs to localStorage on change
  const handleImmunizedPopulationChange = (value: string) => {
    setImmunizedPopulation(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("immunizedPopulation", value);
    }
  };

  const handleEligiblePopulationChange = (value: string) => {
    setEligiblePopulation(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("eligiblePopulation", value);
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

    const immunized = parseFloat(immunizedPopulation);
    const eligible = parseFloat(eligiblePopulation);

    if (isNaN(immunized) || isNaN(eligible) || eligible <= 0) {
      toast.error("Please provide valid inputs for both fields.");
      return;
    }

    let coverage = (immunized / eligible) * 100;
    if (coverage > 100) {
      coverage = 100;
    }
    setVaccinationCoverage(coverage);

    // Standardize the vaccination coverage score
    let standardized;
    if (coverage >= MAX_COVERAGE) {
      standardized = 100;
    } else if (coverage <= MIN_COVERAGE) {
      standardized = 0;
    } else {
      standardized =
        100 * ((coverage - MIN_COVERAGE) / (MAX_COVERAGE - MIN_COVERAGE));
    }
    setStandardizedScore(standardized);

    // Evaluate the decision based on the standardized score
    const evaluationComment = getComment(standardized);
    setDecision(evaluationComment);

    // Set new states for display and charts
    setActualVaccination(coverage.toFixed(2));
    setStandardizedScore(parseFloat(standardized.toFixed(2)));

    // Prepare data to send
    const postData = {
      city,
      country,
      vaccination_coverage: coverage,
      vaccination_coverage_standardized: parseFloat(standardized.toFixed(2)),
      vaccination_coverage_comment: evaluationComment, // Renamed for consistency
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
  const standardizedValue = standardizedScore !== null ? standardizedScore : 0;
  const pieData = [
    { name: 'Standardized', value: Number(standardizedValue.toFixed(2)) },
    { name: 'Remaining', value: Number((100 - standardizedValue).toFixed(2)) }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-white shadow-2xl rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-green-600 p-6 text-white">
          <h2 className="text-3xl font-bold flex items-center">
            💉 Vaccination Coverage
          </h2>
          <p className="mt-2 text-blue-100">Assess and save your city&apos;s vaccination coverage data</p>
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
                  Vaccination Coverage measures the percentage of the eligible population vaccinated according to national policies.
                  This tool calculates the raw coverage rate from the inputs you provide and converts it into a standardized 0–100 score using predefined benchmarks.
                </p>
                <p className="font-mono mb-2">Vaccination Coverage (raw) = (Immunized / Eligible) * 100%</p>
                <p className="mb-2">
                  Standardized score maps coverage to 100..0 across benchmarks (MIN..MAX) so higher coverage → higher score.
                </p>

                <h4 className="font-semibold mt-2 mb-1">What to enter</h4>
                <ul className="list-disc list-inside mb-2">
                  <li>Enter the number of people immunized according to national policies.</li>
                  <li>Enter the total eligible population (must be greater than zero).</li>
                  <li>Both fields are required for calculation.</li>
                </ul>

                <h4 className="font-semibold mt-2 mb-1">Tips for meaningful results</h4>
                <ul className="list-disc list-inside">
                  <li>Ensure data is sourced consistently (e.g., from the same year and definition).</li>
                  <li>For comparisons, use data from reliable sources like health ministries.</li>
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
              💉 Population Immunized (according to national policies):
            </label>
            <input
              type="number"
              value={immunizedPopulation}
              onChange={(e) => handleImmunizedPopulationChange(e.target.value)}
              className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Enter immunized population"
            />
          </div>

          <div className="mb-6">
            <label className="block mb-3 font-semibold text-gray-700 flex items-center">
              👥 Eligible Population (according to national policies):
            </label>
            <input
              type="number"
              value={eligiblePopulation}
              onChange={(e) => handleEligiblePopulationChange(e.target.value)}
              className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Enter eligible population"
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
          
          {decision && actualVaccination && standardizedScore !== null && (
            <div className="mt-8 p-6 bg-gray-50 rounded-lg border">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg">Actual Vaccination Coverage</h3>
                    <p className="text-2xl font-bold text-gray-800">
                      {actualVaccination}%
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg">Standardized Vaccination Score</h3>
                    <p className="text-2xl font-bold text-gray-800">
                      {standardizedScore !== null ? `${standardizedScore.toFixed(2)}%` : ''}
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
                        { name: 'Standardized', value: standardizedScore ?? 0 }
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

export default VaccinationCoverageCalculator;