"use client";
import React, { useState, useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { useCity } from '../../../../context/CityContext';
import toast from 'react-hot-toast';

function AverageDailyTravelTimeForm() {
  const { user, isLoaded } = useUser();
  const { city, country, cityName } = useCity();
  const [averageTravelTime, setAverageTravelTime] = useState<string>("");
  const [result, setResult] = useState<string | null>(null);
  const [standardizedTime, setStandardizedTime] = useState<number | null>(null);
  const [decision, setDecision] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

  // Constants
  const X = 30; // Benchmark average travel time in minutes

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
      const savedAverageTravelTime = localStorage.getItem("averageTravelTime");
      if (savedAverageTravelTime) setAverageTravelTime(savedAverageTravelTime);
    }
  }, []);

  // Save inputs to localStorage on change
  const handleAverageTravelTimeChange = (value: string) => {
    setAverageTravelTime(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("averageTravelTime", value);
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

    const numericAverageTravelTime = Number(averageTravelTime);
    if (isNaN(numericAverageTravelTime)) {
      toast.error("Please enter a valid number for average travel time.");
      return;
    }
    if (numericAverageTravelTime < 0) {
      toast.error("Average travel time must be a non-negative number.");
      return;
    }

    // Standardized Travel Time (S) Calculation
    let standardizedTravelTime: number;
    if (numericAverageTravelTime >= 2 * X) {
      standardizedTravelTime = 0; // If travel time >= 2 * X
    } else if (numericAverageTravelTime > X) {
      standardizedTravelTime =
        100 * (1 - (numericAverageTravelTime - X) / (X));
    } else {
      standardizedTravelTime = 100; // If travel time <= X
    }
    setStandardizedTime(standardizedTravelTime);
    setResult(numericAverageTravelTime.toFixed(2));

    // Evaluate the decision based on the standardized score
    const evaluationComment = getComment(standardizedTravelTime);
    setDecision(evaluationComment);

    // Prepare data to send
    const postData = {
      city,
      country,
      average_daily_travel_time: numericAverageTravelTime,
      average_daily_travel_time_comment: evaluationComment, // Renamed for consistency
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
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Calculate Average Daily Travel Time
      </h1>

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
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Average Daily Travel Time (in minutes):
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="number"
            value={averageTravelTime}
            onChange={(e) => handleAverageTravelTimeChange(e.target.value)}
            required
          />
        </label>
      </div>
      <button
        onClick={calculateAndSave}
        disabled={isSubmitting || !city || !country}
        className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isSubmitting ? 'Calculating and Saving...' : 'Calculate'}
      </button>
      {result !== null && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p className="text-lg">Average Daily Travel Time: {result} minutes</p>
          <p className="text-sm text-gray-600">Standardized Travel Time (S):</p>
          <ul className="list-disc pl-5">
            <li>{standardizedTime?.toFixed(2)}%</li>
          </ul>
          {decision && (
            <p
              className={`mt-4 p-2 text-center font-bold text-white rounded-md ${
                decision === "VERY SOLID"
                  ? "bg-green-500"
                  : decision === "SOLID"
                  ? "bg-yellow-500"
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

export default AverageDailyTravelTimeForm;