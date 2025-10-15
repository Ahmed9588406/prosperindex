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
    <div className="max-w-4xl mx-auto p-5 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Life Expectancy Calculator</h1>

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

      <table className="w-full mb-4 border-collapse border border-gray-400">
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
                  className="border rounded p-2 w-full"
                  placeholder="Age"
                />
              </td>
              <td className="border border-gray-400 px-4 py-2">
                <input
                  type="number"
                  value={row.lx}
                  onChange={(e) => updateRow(index, "lx", e.target.value)}
                  className="border rounded p-2 w-full"
                  placeholder="l_x"
                />
              </td>
              <td className="border border-gray-400 px-4 py-2">
                <input
                  type="number"
                  value={row.tx}
                  onChange={(e) => updateRow(index, "tx", e.target.value)}
                  className="border rounded p-2 w-full"
                  placeholder="T_x"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mb-4">
        <button
          onClick={addRow}
          className="mr-2 p-2 bg-blue-500 text-white rounded"
        >
          Add Age Band
        </button>
        <button
          onClick={removeRow}
          className="p-2 bg-red-500 text-white rounded"
        >
          Remove Age Band
        </button>
      </div>
      <button
        onClick={calculateLifeExpectancy}
        disabled={isSubmitting || !city || !country}
        className={`p-2 bg-green-500 text-white rounded w-full hover:bg-green-600 transition ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isSubmitting ? 'Calculating and Saving...' : 'Calculate Life Expectancy'}
      </button>
      {lifeExpectancy !== null && (
        <div className="mt-4">
          <p className="text-xl font-bold">
            Life Expectancy at Birth (\( e_0 \)): {lifeExpectancy.toFixed(2)} years
          </p>
          <p className="text-lg font-semibold mt-2">
            Standardized Score: {standardizedScore?.toFixed(2)}%
          </p>
          {decision && (
            <p className="text-lg font-bold mt-2">
              Decision:{" "}
              <span
                className={`${
                  decision === "VERY SOLID"
                    ? "text-green-600"
                    : decision === "SOLID"
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {decision}
              </span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default LifeExpectancyCalculator;