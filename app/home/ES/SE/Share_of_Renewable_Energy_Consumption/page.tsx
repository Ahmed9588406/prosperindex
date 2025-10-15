"use client";

import React, { useState, useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { useCity } from "../../../../context/CityContext";
import toast from "react-hot-toast";

const ShareOfRenewableEnergy: React.FC = () => {
  const { user, isLoaded } = useUser();
  const { city, country, cityName } = useCity();
  const [shareOfRenewableEnergy, setShareOfRenewableEnergy] = useState<number | string>(""); // Input for SRE
  const [standardizedScore, setStandardizedScore] = useState<string | null>(null); // Final standardized score
  const [comment, setComment] = useState<string | null>(null); // Comment based on score
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

  // Load saved inputs on component mount
  useEffect(() => {
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

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-5 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Share of Renewable Energy (SRE)</h2>

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
        <label htmlFor="shareOfRenewableEnergy" className="block mb-2 font-semibold">
          Share of Renewable Energy (SRE) [%]:
        </label>
        <input
          id="shareOfRenewableEnergy"
          type="number"
          value={shareOfRenewableEnergy}
          onChange={(e) => handleSREChange(e.target.value)}
          className="border rounded p-2 w-full"
          placeholder="Enter SRE percentage"
          aria-label="Enter Share of Renewable Energy percentage"
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

      {standardizedScore !== null && comment !== null && (
        <div className="mt-4">
          <h3 className="text-lg">
            Standardized Score: <span className="font-bold">{standardizedScore}%</span>
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

export default ShareOfRenewableEnergy;