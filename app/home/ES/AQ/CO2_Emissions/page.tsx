"use client";
import React, { useState, useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { useCity } from "../../../../context/CityContext";
import toast from "react-hot-toast";

const CO2Emissions: React.FC = () => {
  const { user, isLoaded } = useUser();
  const { city, country, cityName } = useCity();
  const [co2Emissions, setCo2Emissions] = useState<number | string>(""); // Input: CO2 emissions
  const [standardizedScore, setStandardizedScore] = useState<string | null>(null); // Standardized score
  const [comment, setComment] = useState<string | null>(null); // Comment based on score
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state
  const BENCHMARK = 0.39; // Benchmark value for CO2 emissions
  const CRITICAL = 2.09; // Critical threshold for CO2 emissions

  // Load saved inputs on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCo2 = localStorage.getItem("co2Emissions");
      if (savedCo2) setCo2Emissions(savedCo2);
    }
  }, []);

  // Save inputs to localStorage on change
  const handleCo2Change = (value: string) => {
    setCo2Emissions(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("co2Emissions", value);
    }
  };

  // Function to calculate CO2 Score
  const calculateCO2Score = () => {
    if (!co2Emissions || parseFloat(co2Emissions.toString()) < 0) {
      toast.error("Please enter a valid CO₂ emissions value (greater than or equal to 0).");
      return null;
    }
    const co2Value = parseFloat(co2Emissions.toString());
    const fifthRootEmissions = Math.pow(co2Value, 1 / 5); // Calculate the fifth root
    let standardizedValue = 0;

    if (fifthRootEmissions >= CRITICAL) {
      standardizedValue = 0;
    } else if (fifthRootEmissions > BENCHMARK && fifthRootEmissions < CRITICAL) {
      standardizedValue =
        100 *
        (1 - Math.abs((fifthRootEmissions - BENCHMARK) / (CRITICAL - BENCHMARK)));
    } else if (fifthRootEmissions <= BENCHMARK) {
      standardizedValue = 100;
    }

    const scoreNum = standardizedValue.toFixed(2);
    setStandardizedScore(scoreNum);
    const calculatedComment = getComment(parseFloat(scoreNum));
    setComment(calculatedComment); // Set comment immediately after calculating score
    console.log('Calculated Score:', scoreNum, 'Calculated Comment:', calculatedComment);
    return { scoreNum, calculatedComment };
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

  // Function to handle calculation and posting data
  const handleCalculateAndSave = async () => {
    if (!user) {
      toast.error("Please sign in to save calculations.");
      return;
    }

    if (!city || !country) {
      toast.error("Please select a city from the cities page first.");
      return;
    }

    const calculationResult = calculateCO2Score();
    if (calculationResult === null) return; // Exit if calculation fails

    const { scoreNum, calculatedComment } = calculationResult;
    const co2Value = parseFloat(co2Emissions.toString());

    try {
      setIsSubmitting(true);

      console.log('Before Posting:', 'Score:', scoreNum, 'Comment:', calculatedComment);

      const postData = {
        city,
        country,
        co2_emissions: co2Value,
        co2_emissions_comment: calculatedComment, // Use the calculated comment
        userId: user.id
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
    } catch (error) {
      console.error('Error saving data:', error);
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
      <h2 className="text-2xl font-bold mb-4">CO₂ Emissions Evaluation</h2>

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
        <label className="block mb-2 font-semibold">CO₂ Emissions (metric tonnes):</label>
        <input
          type="number"
          value={co2Emissions}
          onChange={(e) => handleCo2Change(e.target.value)}
          className="border rounded p-2 w-full"
          placeholder="Enter CO₂ emissions"
        />
      </div>
      <button
        onClick={handleCalculateAndSave}
        disabled={isSubmitting || !city || !country}
        className={`p-2 bg-blue-500 text-white rounded w-full hover:bg-blue-600 transition mb-4 ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isSubmitting ? 'Calculating and Saving...' : 'Calculate and Save'}
      </button>
      {standardizedScore !== null && (
        <div className="mt-4">
          <h3 className="text-lg">
            Standardized Score: {standardizedScore}
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
        </div>
      )}
    </div>
  );
};

export default CO2Emissions;