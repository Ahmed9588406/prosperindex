"use client";
import React, { useState, useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { useCity } from "../../../../context/CityContext";
import toast from "react-hot-toast";

function BroadbandSpeedCalculator() {
  const { user, isLoaded } = useUser();
  const { city, country, cityName } = useCity();
  const [speeds, setSpeeds] = useState<string>(""); // Input: comma-separated broadband speeds
  const [averageSpeed, setAverageSpeed] = useState<number | null>(null); // Average broadband speed
  const [standardizedSpeed, setStandardizedSpeed] = useState<string | null>(null); // Standardized speed
  const [comment, setComment] = useState<string | null>(null); // Comment based on score
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

  // Load saved inputs on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSpeeds = localStorage.getItem("speeds");
      if (savedSpeeds) setSpeeds(savedSpeeds);
    }
  }, []);

  // Save inputs to localStorage on change
  const handleSpeedsChange = (value: string) => {
    setSpeeds(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("speeds", value);
    }
  };

  // Constants for benchmarks
  const MIN_SPEED = 470 / 8; // Convert Kbps to Mbps
  const MAX_SPEED = 87088 / 8; // Convert Kbps to Mbps

  // Function to get comment based on standardized score
  const getComment = (score: number) => {
    if (score >= 80) return "VERY SOLID";
    else if (score >= 70) return "SOLID";
    else if (score >= 60) return "MODERATELY SOLID";
    else if (score >= 50) return "MODERATELY WEAK";
    else if (score >= 40) return "WEAK";
    else return "VERY WEAK";
  };

  // Function to calculate standardized broadband speed
  const calculateStandardizedBroadbandSpeed = () => {
    const speedArray = speeds.split(",").map(Number).filter((speed) => !isNaN(speed));
    if (speedArray.length === 0) {
      toast.error("Please enter valid broadband speeds.");
      return null;
    }

    // Calculate Average Speed
    const totalSpeed = speedArray.reduce((acc, speed) => acc + speed, 0);
    const avgSpeed = totalSpeed / speedArray.length;
    setAverageSpeed(avgSpeed);

    // Standardized formula with cube root
    const cubeRootAvgSpeed = Math.cbrt(avgSpeed);
    const standardizedValue =
      100 *
      (1 -
        (cubeRootAvgSpeed - Math.cbrt(MIN_SPEED)) /
          (Math.cbrt(MAX_SPEED) - Math.cbrt(MIN_SPEED)));

    const scoreNum = standardizedValue.toFixed(2); // Limit to 2 decimal places
    setStandardizedSpeed(scoreNum);
    const calculatedComment = getComment(parseFloat(scoreNum));
    setComment(calculatedComment); // Set comment based on score
    console.log('Calculated Score:', scoreNum, 'Calculated Comment:', calculatedComment);
    return { avgSpeed, scoreNum, calculatedComment };
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

    const calculationResult = calculateStandardizedBroadbandSpeed();
    if (calculationResult === null) return; // Exit if calculation fails

    const { avgSpeed, calculatedComment } = calculationResult;

    try {
      setIsSubmitting(true); // Start loading
      console.log("Submitting data...");

      const postData = {
        city,
        country,
        average_broadband_speed: avgSpeed, // Post the average broadband speed
        average_broadband_speed_comment: calculatedComment, // Use the calculated comment
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
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Calculate Average and Standardized Broadband Speed
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
          Enter Broadband Speeds (Mbps) for the Month (comma-separated):
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="text"
            value={speeds}
            onChange={(e) => handleSpeedsChange(e.target.value)}
            placeholder="50, 55, 53, 52, 54"
            required
          />
        </label>
      </div>

      <button
        onClick={handleCalculateAndSave}
        disabled={isSubmitting || !city || !country}
        className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isSubmitting ? 'Calculating and Saving...' : 'Calculate'}
      </button>

      {averageSpeed !== null && standardizedSpeed !== null && comment !== null && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p className="text-lg">
            Average Speed: <span className="font-bold">{averageSpeed.toFixed(2)} Mbps</span>
          </p>
          <p className="text-lg">
            Standardized Speed: <span className="font-bold">{standardizedSpeed}%</span>
          </p>
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
}

export default BroadbandSpeedCalculator;