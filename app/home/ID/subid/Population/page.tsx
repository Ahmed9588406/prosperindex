"use client";
import React, { useState } from "react";

function ImprovedWaterForm() {
  const [durableHouseholds, setDurableHouseholds] = useState("");
  const [totalHouseholds, setTotalHouseholds] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [improvedWaterS, setImprovedWaterS] = useState<number | null>(null);
  const [decision, setDecision] = useState<string | null>(null);

  // Constants
  const X = 15000;
  

  const calculateImprovedShelter = () => {
    const numericTotalHouseholds = Number(totalHouseholds);
    if (numericTotalHouseholds > 0) {
      const numericDurableHouseholds = Number(durableHouseholds);
      const improvedwater =
        (numericDurableHouseholds / numericTotalHouseholds);

      // Calculate Standardized Improved Shelter (S)
      let standardizedImprovedWater =
      100 * (1-Math.abs((improvedwater - X) / X))

      // Cap at 100 if it exceeds, or set to 0 if it's below 0
      if (standardizedImprovedWater > 100) {
        standardizedImprovedWater = 100;
      } else if (standardizedImprovedWater < 0) {
        standardizedImprovedWater = 0;
      }

      setImprovedWaterS(standardizedImprovedWater);
      setResult(improvedwater.toFixed(2));

      // Determine decision message
      if (improvedwater == X) {
        setDecision("Perfect");
      } else if (improvedwater > 0 && improvedwater < 2*X) {
        setDecision("good");
      } else {
        setDecision("Bad");
      }
    } else {
      alert("Urban area must be greater than zero.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-5 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Calculate Population Density:
      </h1>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          City population
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="number"
            value={durableHouseholds}
            onChange={(e) => setDurableHouseholds(e.target.value)}
            required
          />
        </label>
      </div>
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Urban area:
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="number"
            value={totalHouseholds}
            onChange={(e) => setTotalHouseholds(e.target.value)}
            required
          />
        </label>
      </div>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        onClick={calculateImprovedShelter}
      >
        Calculate
      </button>
      {result !== null && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p className="text-lg">Population Density: {result}</p>
          <p className="text-sm text-gray-600">Population Density (S):</p>
          <ul className="list-disc pl-5">
            <li>Population Density Standardized: {improvedWaterS?.toFixed(2)}%</li>
          </ul>
          {decision && (
            <p
              className={`mt-4 p-2 text-center font-bold text-white rounded-md ${
                decision === "Perfect"
                  ? "bg-green-500"
                  : decision === "Bad"
                  ?  "bg-red-500"
                  : "bg-red-500"
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

export default ImprovedWaterForm;