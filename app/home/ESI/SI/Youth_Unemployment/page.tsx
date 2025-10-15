"use client";
import React, { useState, useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { useCity } from "../../../../context/CityContext";
import toast from "react-hot-toast";

const YouthUnemploymentStandardization: React.FC = () => {
  const { user, isLoaded } = useUser();
  const { city, country, cityName } = useCity();
  const [unemployedYouth, setUnemployedYouth] = useState<number>(0); // Input: Number of unemployed youth
  const [youthLaborForce, setYouthLaborForce] = useState<number>(0); // Input: Total youth labor force
  const [standardizedRate, setStandardizedRate] = useState<string | null>(null); // Standardized rate
  const [comment, setComment] = useState<string | null>(null); // Comment based on score
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

  // Load saved inputs on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUnemployed = localStorage.getItem("unemployedYouth");
      const savedLabor = localStorage.getItem("youthLaborForce");

      if (savedUnemployed) setUnemployedYouth(parseFloat(savedUnemployed));
      if (savedLabor) setYouthLaborForce(parseFloat(savedLabor));
    }
  }, []);

  // Save inputs to localStorage on change
  const handleUnemployedChange = (value: number) => {
    setUnemployedYouth(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("unemployedYouth", value.toString());
    }
  };

  const handleLaborChange = (value: number) => {
    setYouthLaborForce(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("youthLaborForce", value.toString());
    }
  };

  // Constants for benchmarks and thresholds
  const MIN = 2.7; // Min = 2.7%
  const MAX = 62.8; // Max = 62.8%
  const THRESHOLD_LOW = 1.28;
  const THRESHOLD_HIGH = 2.82;

  // Function to get comment based on standardized score
  const getComment = (score: number) => {
    if (score >= 80) return "VERY SOLID";
    else if (score >= 70) return "SOLID";
    else if (score >= 60) return "MODERATELY SOLID";
    else if (score >= 50) return "MODERATELY WEAK";
    else if (score >= 40) return "WEAK";
    else return "VERY WEAK";
  };

  // Function to calculate standardized youth unemployment rate
  const calculateStandardizedUnemployment = () => {
    // Validate inputs
    if (youthLaborForce <= 0) {
      toast.error("Youth labor force must be greater than zero.");
      return null;
    }

    // Youth Unemployment calculation
    const unemploymentRate = 100 * (unemployedYouth / youthLaborForce);

    // Fourth root of unemployment rate
    const fourthRootUnemployment = Math.pow(unemploymentRate, 1 / 4);

    // Standardized formula
    const standardizedValue =
      100 *
      (1 -
        (fourthRootUnemployment - Math.pow(MIN, 1 / 4)) /
          (Math.pow(MAX, 1 / 4) - Math.pow(MIN, 1 / 4)));

    // Decision logic
    let standardizedRateValue: number;

    if (fourthRootUnemployment >= Math.pow(THRESHOLD_HIGH, 1 / 4)) {
      standardizedRateValue = 0;
    } else if (
      fourthRootUnemployment > Math.pow(THRESHOLD_LOW, 1 / 4) &&
      fourthRootUnemployment < Math.pow(THRESHOLD_HIGH, 1 / 4)
    ) {
      standardizedRateValue = standardizedValue;
    } else {
      standardizedRateValue = 100;
    }

    const scoreNum = standardizedRateValue.toFixed(2); // Limit to 2 decimal places
    setStandardizedRate(scoreNum);
    const calculatedComment = getComment(parseFloat(scoreNum));
    setComment(calculatedComment); // Set comment based on score
    console.log('Calculated Score:', scoreNum, 'Calculated Comment:', calculatedComment);
    return { unemploymentRate, scoreNum, calculatedComment };
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

    const calculationResult = calculateStandardizedUnemployment();
    if (calculationResult === null) return; // Exit if calculation fails

    const { unemploymentRate, calculatedComment } = calculationResult;

    try {
      setIsSubmitting(true); // Start loading
      console.log("Submitting data...");

      const postData = {
        city,
        country,
        youth_unemployment: unemploymentRate, // Post the unemployment rate
        youth_unemployment_comment: calculatedComment, // Use the calculated comment
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

  return (
    <div className="max-w-4xl mx-auto p-5 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Youth Unemployment Standardization</h2>

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
        <label className="block mb-2 font-semibold">
          Number of Unemployed Youth:
        </label>
        <input
          type="number"
          value={unemployedYouth}
          onChange={(e) => handleUnemployedChange(parseFloat(e.target.value))}
          className="border rounded p-2 w-full"
          placeholder="Enter number of unemployed youth"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2 font-semibold">Youth Labor Force:</label>
        <input
          type="number"
          value={youthLaborForce}
          onChange={(e) => handleLaborChange(parseFloat(e.target.value))}
          className="border rounded p-2 w-full"
          placeholder="Enter total youth labor force"
        />
      </div>

      <button
        onClick={handleCalculateAndSave}
        disabled={isSubmitting || !city || !country}
        className={`p-2 bg-blue-500 text-white rounded w-full hover:bg-blue-600 transition ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isSubmitting ? 'Calculating and Saving...' : 'Calculate Standardized Rate'}
      </button>

      {standardizedRate !== null && comment !== null && (
        <div className="mt-4">
          <h3 className="text-lg">
            Standardized Youth Unemployment Rate: <span className="font-bold">{standardizedRate}%</span>
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

export default YouthUnemploymentStandardization;