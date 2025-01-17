"use client";
import React, { useState } from "react";

function AffordabilityOfTransportForm() {
  const [averageCostPerTrip, setAverageCostPerTrip] = useState("");
  const [averageIncome, setAverageIncome] = useState("");
  const [affordability, setAffordability] = useState<number | null>(null);
  const [standardizedScore, setStandardizedScore] = useState<number | null>(null);
  const [decision, setDecision] = useState<string | null>(null);

  // Constants
  const minBenchmark = 4; // Minimum affordability benchmark in %
  const maxBenchmark = 26; // Maximum affordability benchmark in %
  const tripsPerMonth = 60; // Number of trips per month

  const calculateAffordability = () => {
    const numericCostPerTrip = parseFloat(averageCostPerTrip);
    const numericIncome = parseFloat(averageIncome);

    if (numericCostPerTrip > 0 && numericIncome > 0) {
      // Affordability of Transport
      const affordabilityValue =
        (tripsPerMonth * numericCostPerTrip * 100) / numericIncome;
      setAffordability(affordabilityValue);

      // Standardized Score (S)
      let standardizedScoreValue: number;
      if (affordabilityValue >= maxBenchmark) {
        standardizedScoreValue = 0; // If affordability >= max benchmark
      } else if (affordabilityValue < minBenchmark) {
        standardizedScoreValue = 100; // If affordability < min benchmark
      } else {
        standardizedScoreValue =
          100 * (1 - (affordabilityValue - minBenchmark) / (maxBenchmark - minBenchmark));
      }
      setStandardizedScore(standardizedScoreValue);

      // Decision based on the standardized score
      if (affordabilityValue >= maxBenchmark) {
        setDecision("Transport is Not Affordable");
      } else if (affordabilityValue < minBenchmark) {
        setDecision("Transport is Highly Affordable");
      } else {
        setDecision("Transport is Moderately Affordable");
      }
    } else {
      alert("Both average cost per trip and average income must be positive numbers.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-5 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Affordability of Transport Calculator
      </h1>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Average Cost per Trip (in local currency):
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="number"
            value={averageCostPerTrip}
            onChange={(e) => setAverageCostPerTrip(e.target.value)}
            required
          />
        </label>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Average Per Capita Income of Bottom Quintile (in local currency):
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="number"
            value={averageIncome}
            onChange={(e) => setAverageIncome(e.target.value)}
            required
          />
        </label>
      </div>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        onClick={calculateAffordability}
      >
        Calculate
      </button>
      {(affordability !== null || standardizedScore !== null) && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          {affordability !== null && (
            <p className="text-lg">
              Affordability of Transport: {affordability.toFixed(2)}%
            </p>
          )}
          {standardizedScore !== null && (
            <p className="text-lg">
              Standardized Affordability Score: {standardizedScore.toFixed(2)}%
            </p>
          )}
          {decision && (
            <p
              className={`mt-4 p-2 text-center font-bold text-white rounded-md ${
                decision === "Transport is Not Affordable"
                  ? "bg-red-500"
                  : decision === "Transport is Highly Affordable"
                  ? "bg-green-500"
                  : "bg-yellow-500"
              }`}
            >
              {decision}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default AffordabilityOfTransportForm;
