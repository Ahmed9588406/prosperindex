"use client";
import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useCity } from "../../../../context/CityContext";
import toast from "react-hot-toast"; // Import the toast function

function ImprovedSanitationForm() {
  const { user, isLoaded } = useUser();
  const { city, country, cityName } = useCity();
  const [improvedSanitationHouseholds, setImprovedSanitationHouseholds] = useState("");
  const [totalHouseholds, setTotalHouseholds] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [improvedSanitationS, setImprovedSanitationS] = useState<number | null>(null);
  const [decision, setDecision] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Constants
  const MIN = 15;
  const MAX = 100;

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
      const savedImproved = localStorage.getItem("improvedSanitationHouseholds");
      const savedTotal = localStorage.getItem("totalHouseholds");

      if (savedImproved) setImprovedSanitationHouseholds(savedImproved);
      if (savedTotal) setTotalHouseholds(savedTotal);
    }
  }, []);

  // Save inputs to localStorage on change
  const handleImprovedSanitationChange = (value: string) => {
    setImprovedSanitationHouseholds(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("improvedSanitationHouseholds", value);
    }
  };

  const handleTotalChange = (value: string) => {
    setTotalHouseholds(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("totalHouseholds", value);
    }
  };

  const calculateImprovedSanitation = async () => {
    if (!user) {
      toast.error("Please sign in to save calculations.");
      return;
    }

    if (!city || !country) {
      toast.error("Please select a city from the cities page first.");
      return;
    }

    const numericTotalHouseholds = Number(totalHouseholds);
    if (numericTotalHouseholds > 0) {
      const numericImprovedHouseholds = Number(improvedSanitationHouseholds);
      const improvedSanitation = (numericImprovedHouseholds / numericTotalHouseholds) * 100;
      let standardizedImprovedSanitation = 100 * ((improvedSanitation - MIN) / (MAX - MIN));
      standardizedImprovedSanitation = Math.min(Math.max(standardizedImprovedSanitation, 0), 100);

      // Update state with results
      setImprovedSanitationS(standardizedImprovedSanitation);
      setResult(improvedSanitation.toFixed(2));

      // Evaluate the decision based on the standardized score
      const evaluationComment = getComment(standardizedImprovedSanitation);
      setDecision(evaluationComment);

      // Prepare data to send - now includes city and country
      const postData = {
        city,
        country,
        improved_sanitation: improvedSanitation,
        improved_sanitation_comment: evaluationComment,
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
    } else {
      toast.error("Total households must be greater than zero.");
    }
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-5 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Calculate Improved Sanitation
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

      {!city || (!country && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ Please select a city from the cities page first
          </p>
        </div>
      ))}

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Number Of Households With Improved Sanitation:
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="number"
            value={improvedSanitationHouseholds}
            onChange={(e) => handleImprovedSanitationChange(e.target.value)}
            required
          />
        </label>
      </div>
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Total Households:
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="number"
            value={totalHouseholds}
            onChange={(e) => handleTotalChange(e.target.value)}
            required
          />
        </label>
      </div>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-400"
        onClick={calculateImprovedSanitation}
        disabled={isSubmitting || !city || !country}
      >
        {isSubmitting ? 'Saving...' : 'Calculate'}
      </button>
      {result !== null && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p className="text-lg">Improved Sanitation: {result}%</p>
          <p className="text-sm text-gray-600">Improved Sanitation (S):</p>
          <ul className="list-disc pl-5">
            <li>Improved Sanitation Standardized: {improvedSanitationS?.toFixed(2)}%</li>
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

export default ImprovedSanitationForm;