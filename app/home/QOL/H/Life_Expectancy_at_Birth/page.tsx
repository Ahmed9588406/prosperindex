"use client";
import React, { useState, useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { useCity } from '../../../../context/CityContext';
import toast from 'react-hot-toast';

interface LifeTableRow {
  age: string;
  lx: string;
  tx: string;
}

function LifeExpectancyCalculator() {
  const { user, isLoaded } = useUser();
  const { city, country, cityName } = useCity();
  const [data, setData] = useState<LifeTableRow[]>([{ age: "", lx: "", tx: "" }]);
  const [lifeExpectancy, setLifeExpectancy] = useState<number | null>(null);
  const [standardizedScore, setStandardizedScore] = useState<number | null>(null);
  const [decision, setDecision] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

  const MIN_LIFE_EXPECTANCY = 49; // Minimum benchmark
  const MAX_LIFE_EXPECTANCY = 83.48; // Maximum benchmark

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
      const savedData = localStorage.getItem("lifeExpectancyData");
      if (savedData) {
        setData(JSON.parse(savedData));
      }
    }
  }, []);

  // Function to update data for each row
  const updateRow = (index: number, field: keyof LifeTableRow, value: string) => {
    const newData = [...data];
    newData[index][field] = value;
    setData(newData);
    if (typeof window !== "undefined") {
      localStorage.setItem("lifeExpectancyData", JSON.stringify(newData));
    }
  };

  // Add a new row for additional age band data
  const addRow = () => {
    setData([...data, { age: "", lx: "", tx: "" }]);
  };

  // Remove the last row
  const removeRow = () => {
    if (data.length > 1) {
      setData(data.slice(0, -1));
    }
  };

  // Function to calculate life expectancy at birth
  const calculateLifeExpectancy = async () => {
    if (!isLoaded || !user) {
      toast.error("User not authenticated. Please log in.");
      return;
    }

    if (!city || !country) {
      toast.error("Please select a city from the cities page first.");
      return;
    }

    let t0 = 0; // Total years lived
    let l0 = 0; // Number of people alive at age 0

    for (const row of data) {
      const lx = parseFloat(row.lx);
      const tx = parseFloat(row.tx);

      if (isNaN(lx) || isNaN(tx)) {
        toast.error("Please ensure all fields are filled with valid numbers.");
        return;
      }

      t0 += tx; // Accumulate total years lived
      if (l0 === 0) l0 = lx; // Set l0 from the first row (age 0)
    }

    if (l0 <= 0) {
      toast.error("The number of people alive at age 0 (l0) must be greater than zero.");
      return;
    }

    const e0 = t0 / l0; // Calculate life expectancy
    setLifeExpectancy(e0);

    // Standardize the life expectancy score
    const standardized =
      Math.min(
        100,
        Math.max(
          0,
          ((e0 - MIN_LIFE_EXPECTANCY) / (MAX_LIFE_EXPECTANCY - MIN_LIFE_EXPECTANCY)) * 100
        )
      );
    setStandardizedScore(standardized);

    // Evaluate the decision based on the standardized score
    const evaluationComment = getComment(standardized);
    setDecision(evaluationComment);

    // Prepare data to send
    const postData = {
      city,
      country,
      life_expectancy_at_birth: e0,
      life_expectancy_at_birth_comment: evaluationComment, // Renamed for consistency
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
      <div className="max-w-4xl w-full bg-white shadow-2xl rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-green-600 p-6 text-white">
          <h2 className="text-3xl font-bold flex items-center">
            🧬 Life Expectancy at Birth
          </h2>
          <p className="mt-2 text-blue-100">Assess and save your city's life expectancy data</p>
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
            <table className="w-full border-collapse border border-gray-400">
              <thead>
                <tr>
                  <th className="border border-gray-400 px-4 py-2">Age</th>
                  <th className="border border-gray-400 px-4 py-2">\( l_x \) (Number of people alive at start)</th>
                  <th className="border border-gray-400 px-4 py-2">\( T_x \) (Total years lived)</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr key={index}>
                    <td className="border border-gray-400 px-4 py-2">
                      <input
                        type="number"
                        value={row.age}
                        onChange={(e) => updateRow(index, "age", e.target.value)}
                        className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="Age"
                      />
                    </td>
                    <td className="border border-gray-400 px-4 py-2">
                      <input
                        type="number"
                        value={row.lx}
                        onChange={(e) => updateRow(index, "lx", e.target.value)}
                        className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="l_x"
                      />
                    </td>
                    <td className="border border-gray-400 px-4 py-2">
                      <input
                        type="number"
                        value={row.tx}
                        onChange={(e) => updateRow(index, "tx", e.target.value)}
                        className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="T_x"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mb-6 flex gap-2">
            <button
              onClick={addRow}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Add Age Band
            </button>
            <button
              onClick={removeRow}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Remove Age Band
            </button>
          </div>
          
          <button
            onClick={calculateLifeExpectancy}
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
}

export default LifeExpectancyCalculator;