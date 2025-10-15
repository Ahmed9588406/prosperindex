"use client";

import React, { useState, useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { useCity } from "../../../../context/CityContext";
import toast from "react-hot-toast";

const SolidWasteRecyclingShare: React.FC = () => {
  const { user, isLoaded } = useUser();
  const { city, country, cityName } = useCity();
  const [wasteRecycled, setWasteRecycled] = useState<number | string>(""); // Volume of waste recycled
  const [wasteCollected, setWasteCollected] = useState<number | string>(""); // Total volume of waste collected
  const [recyclingScore, setRecyclingScore] = useState<string | null>(null); // Final score
  const [comment, setComment] = useState<string | null>(null); // Comment based on score
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

  // Load saved inputs on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedRecycled = localStorage.getItem("wasteRecycled");
      const savedCollected = localStorage.getItem("wasteCollected");

      if (savedRecycled) setWasteRecycled(savedRecycled);
      if (savedCollected) setWasteCollected(savedCollected);
    }
  }, []);

  // Save inputs to localStorage on change
  const handleRecycledChange = (value: string) => {
    setWasteRecycled(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("wasteRecycled", value);
    }
  };

  const handleCollectedChange = (value: string) => {
    setWasteCollected(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("wasteCollected", value);
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

  // Function to calculate recycling share
  const calculateRecyclingShare = () => {
    if (!wasteRecycled || !wasteCollected) {
      toast.error("Please enter both the volume of waste recycled and waste collected.");
      return null;
    }

    const recycled = parseFloat(wasteRecycled.toString());
    const collected = parseFloat(wasteCollected.toString());

    if (recycled < 0 || collected <= 0) {
      toast.error("Please ensure waste recycled is >= 0 and waste collected is > 0.");
      return null;
    }

    if (recycled > collected) {
      toast.error("Waste recycled cannot exceed waste collected.");
      return null;
    }

    // Calculate the initial recycling share percentage
    const initialShare = (recycled / collected) * 100;

    let standardScore: number;

    // Apply the standardization formula
    if (initialShare >= 50) {
      standardScore = 100;
    } else {
      standardScore = 100 * (1 - Math.abs(initialShare - 50) / 50);
    }

    const scoreNum = standardScore.toFixed(2); // Limit to 2 decimal places
    setRecyclingScore(scoreNum);
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

    const calculationResult = calculateRecyclingShare();
    if (calculationResult === null) return; // Exit if calculation fails

    const { scoreNum, calculatedComment } = calculationResult;

    try {
      setIsSubmitting(true); // Start loading
      console.log("Submitting data...");

      const postData = {
        city,
        country,
        solid_waste_recycling_share: parseFloat(scoreNum), // Post the standardized score
        solid_waste_recycling_share_comment: calculatedComment, // Use the calculated comment
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
      <h2 className="text-2xl font-bold mb-4">Solid Waste Recycling Share</h2>

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
        <label htmlFor="wasteRecycled" className="block mb-2 font-semibold">
          Volume of Waste Recycled (tons):
        </label>
        <input
          id="wasteRecycled"
          type="number"
          value={wasteRecycled}
          onChange={(e) => handleRecycledChange(e.target.value)}
          className="border rounded p-2 w-full"
          placeholder="Enter waste recycled"
          aria-label="Enter volume of waste recycled"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="wasteCollected" className="block mb-2 font-semibold">
          Total Volume of Waste Collected (tons):
        </label>
        <input
          id="wasteCollected"
          type="number"
          value={wasteCollected}
          onChange={(e) => handleCollectedChange(e.target.value)}
          className="border rounded p-2 w-full"
          placeholder="Enter waste collected"
          aria-label="Enter total volume of waste collected"
        />
      </div>

      <button
        onClick={handleCalculateAndSave}
        disabled={isSubmitting || !city || !country}
        className={`p-2 bg-blue-500 text-white rounded w-full hover:bg-blue-600 transition ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        aria-label="Calculate and Save"
      >
        {isSubmitting ? 'Calculating and Saving...' : 'Calculate and Save'}
      </button>

      {recyclingScore !== null && comment !== null && (
        <div className="mt-4">
          <h3 className="text-lg">
            Solid Waste Recycling Share: <span className="font-bold">{recyclingScore}%</span>
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

export default SolidWasteRecyclingShare;