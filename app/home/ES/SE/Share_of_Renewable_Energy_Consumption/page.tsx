"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useCity } from "../../../../context/CityContext";
import toast from "react-hot-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ShareOfRenewableEnergy: React.FC = () => {
  const { user, isLoaded } = useUser();
  const { city, country, cityName } = useCity();
  const [shareOfRenewableEnergy, setShareOfRenewableEnergy] = useState<number | string>(""); // Input for SRE
  const [standardizedScore, setStandardizedScore] = useState<string | null>(null); // Final standardized score
  const [comment, setComment] = useState<string | null>(null); // Comment based on score
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [actualCalculation, setActualCalculation] = useState<string | null>(null); // For displaying actual calculation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  const [chartData, setChartData] = useState<any>(null); // For 2D scatter chart
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  const [options, setOptions] = useState<any>(null); // For chart options
  const [mounted, setMounted] = useState(false);

  // Load saved inputs on component mount
  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const savedSRE = localStorage.getItem("shareOfRenewableEnergy");
      if (savedSRE) setShareOfRenewableEnergy(savedSRE);
    }
  }, []);

  // Save inputs to localStorage on change
  const handleSREChange = (value: string) => {
    setShareOfRenewableEnergy(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("shareOfRenewableEnergy", value);
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

  // Function to calculate standardized score
  const calculateScore = () => {
    if (shareOfRenewableEnergy === "" || isNaN(Number(shareOfRenewableEnergy))) {
      toast.error("Please enter a valid Share of Renewable Energy (SRE) percentage.");
      return null;
    }

    const SRE = parseFloat(shareOfRenewableEnergy.toString());

    if (SRE < 0) {
      toast.error("Share of Renewable Energy (SRE) cannot be negative.");
      return null;
    }

    let score: number;

    // Calculate standardized score
    if (SRE >= 20) {
      score = 100;
    } else if (SRE > 0 && SRE < 20) {
      score = (SRE / 20) * 100;
    } else {
      score = 0;
    }

    const scoreNum = score.toFixed(2); // Limit to 2 decimal places
    setStandardizedScore(scoreNum);
    const calculatedComment = getComment(parseFloat(scoreNum));
    setComment(calculatedComment); // Set comment based on score
    console.log('Calculated Score:', scoreNum, 'Calculated Comment:', calculatedComment);
    return { scoreNum, calculatedComment };
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

    const calculationResult = calculateScore();
    if (calculationResult === null) return; // Exit if calculation fails

    const { scoreNum, calculatedComment } = calculationResult;
    const SRE = parseFloat(shareOfRenewableEnergy.toString());

    try {
      setIsSubmitting(true);

      console.log('Before Posting:', 'Score:', scoreNum, 'Comment:', calculatedComment);

      const postData = {
        city,
        country,
        share_of_renewable_energy: SRE, // Post Share of Renewable Energy
        share_of_renewable_energy_standardized: parseFloat(scoreNum), // Add the standardized score
        share_of_renewable_energy_comment: calculatedComment, // Use the calculated comment
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

  if (!isLoaded || !mounted) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-white shadow-2xl rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-emerald-600 p-6 text-white">
          <h2 className="text-3xl font-bold">⚡ Share of Renewable Energy (SRE)</h2>
          <p className="mt-2 text-indigo-100">Calculate, visualize, and save your city&apos;s SRE and standardized score</p>
        </div>

        <div className="p-8">
          {/* Summary Section */}
          <div className="mb-6 p-4 bg-emerald-100 border-l-4 border-emerald-400 rounded-r-lg">
            <h3 className="text-lg font-semibold mb-2">About the Share of Renewable Energy (SRE) Index</h3>
            <p className="text-sm text-gray-700 mb-1">
              The Share of Renewable Energy (SRE) measures the percentage of a country&apos;s or region&apos;s total primary energy consumption derived from renewable sources, such as solar, wind, hydro, geothermal, and bioenergy. It is a key indicator of energy transition progress toward sustainable development goals.
            </p>
            <p className="text-sm text-gray-700 mb-1">
              SRE is calculated as: (Renewable energy consumption / Total primary energy consumption) × 100. This index helps assess reliance on clean energy, reducing greenhouse gas emissions and fossil fuel dependence.
            </p>
            <p className="text-sm text-gray-700 mb-1">
              Globally, SRE has risen from about 18% in 2010 to over 20% in recent years, driven by policies like the Paris Agreement and investments in renewables. However, progress varies by region, with Europe leading at around 23% and some developing countries lagging below 10%.
            </p>
            <p className="text-sm text-gray-700 mb-2">
              This tool standardizes SRE to a 0-100 score: SRE ≥ 20% caps at 100%, while lower values scale proportionally. Enter your city&apos;s or region&apos;s SRE percentage for evaluation.
            </p>
            <p className="text-sm text-gray-700">
              Sources: Our World in Data (ourworldindata.org/energy), International Renewable Energy Agency (IRENA), International Energy Agency (IEA), United Nations Sustainable Development Goals (SDG 7).
            </p>
          </div>

          {/* City info */}
          {city && country ? (
            <div className="mb-6 p-4 bg-indigo-50 border-l-4 border-indigo-400 rounded-r-lg">
              <p className="text-sm text-gray-600">📍 Calculating for:</p>
              <p className="text-lg font-semibold text-indigo-800">{cityName || `${city}, ${country}`}</p>
              <p className="text-xs text-gray-500 mt-1">City: {city} | Country: {country}</p>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
              <p className="text-sm text-yellow-800">⚠️ Please select a city from the cities page first</p>
            </div>
          )}

          {/* Input + actions */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="sre" className="block mb-2 font-semibold text-gray-700">
                🔢 Share of Renewable Energy (SRE) [%]
              </label>
              <input
                id="sre"
                type="number"
                value={shareOfRenewableEnergy}
                onChange={(e) => handleSREChange(e.target.value)}
                className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="Enter SRE percentage (e.g., 12.5)"
                aria-label="Enter Share of Renewable Energy percentage"
                step="any"
                min="0"
              />
            </div>

            <div className="md:col-span-1 flex flex-col gap-3">
              <button
                onClick={calculateScore}
                className="w-full py-3 px-4 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition"
              >
                Calculate
              </button>

              <button
                onClick={handleCalculateAndSave}
                disabled={isSubmitting || !city || !country}
                className={`w-full py-3 px-4 text-white font-semibold rounded-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isSubmitting ? "bg-indigo-400" : "bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700"
                }`}
              >
                {isSubmitting ? "Calculating and Saving..." : "🚀 Calculate and Save"}
              </button>
            </div>
          </div>

          {/* Results */}
          {standardizedScore !== null && comment !== null && (
            <div className="mt-6 space-y-5">
              <div className="p-4 border rounded bg-gray-50">
                <h3 className="text-lg font-semibold mb-2">Inputs & calculation</h3>
                <p className="text-sm">
                  Entered SRE: <span className="font-bold">{parseFloat(shareOfRenewableEnergy.toString()).toFixed(2)}%</span>
                </p>
                {actualCalculation && (
                  <p className="mt-2 text-sm text-gray-700">
                    Calculation: <span className="font-mono">{actualCalculation}</span>
                  </p>
                )}
              </div>

              <div className="p-4 border rounded bg-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Standardized Score</h3>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{standardizedScore}%</div>
                    <div className="text-xs text-gray-500">Standardized to a 0-100 scale</div>
                  </div>
                </div>

                <div className="mt-4">
                  <div
                    className={`inline-block px-4 py-2 rounded-lg font-bold text-white ${
                      comment === "VERY SOLID"
                        ? "bg-gradient-to-r from-green-400 to-green-600"
                        : comment === "SOLID"
                        ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-black"
                        : "bg-gradient-to-r from-red-400 to-red-600"
                    }`}
                  >
                    {comment}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2D Scatter Chart */}
          <div className="mt-6 p-4 rounded-lg bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold">SRE Score Visualization</h3>
                <div className="text-sm text-slate-300">Standardized Score (%)</div>
              </div>
              <div className="text-xs text-slate-400">Target: SRE ≥ 20% → Score = 100%</div>
            </div>

            <div style={{ height: 360 }} className="rounded bg-gradient-to-b from-transparent to-slate-900/60 p-2">
              {standardizedScore && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[{ name: 'SRE Score', score: parseFloat(standardizedScore) }]}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="score" fill="#2196F3" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="mt-3 text-xs text-slate-300">
              The bar chart shows your city&apos;s standardized SRE score. Aim for higher scores by increasing renewable energy share.
            </div>
          </div>

          {/* Short instructions / inputs required */}
          <div className="mt-6 p-4 border rounded bg-indigo-50">
            <h3 className="text-md font-semibold mb-2">What to enter</h3>
            <p className="text-sm text-gray-700">
              You can either:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-700 mt-1">
              <li>Enter the SRE percentage directly (recommended for quick use).</li>
              <li>Or compute SRE as: (renewable energy produced / total primary energy) × 100, then enter that percentage.</li>
            </ul>
            <p className="mt-2 text-xs text-gray-500">Sources: Our World in Data, IRENA, SDG Index dashboards.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareOfRenewableEnergy;