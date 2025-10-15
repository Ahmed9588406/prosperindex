"use client";

import React, { useState, useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { useCity } from "../../../../context/CityContext";
import toast from "react-hot-toast";

const SolidWasteCollection: React.FC = () => {
  const { user, isLoaded } = useUser();
  const { city, country, cityName } = useCity();
  const [wasteCollected, setWasteCollected] = useState<number | string>(""); // Volume of waste collected
  const [wasteGenerated, setWasteGenerated] = useState<number | string>(""); // Total volume of waste generated
  const [collectionScore, setCollectionScore] = useState<string | null>(null); // Final score
  const [comment, setComment] = useState<string | null>(null); // Comment based on score
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

  // Load saved inputs on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCollected = localStorage.getItem("wasteCollected");
      const savedGenerated = localStorage.getItem("wasteGenerated");

      if (savedCollected) setWasteCollected(savedCollected);
      if (savedGenerated) setWasteGenerated(savedGenerated);
    }
  }, []);

  // Save inputs to localStorage on change
  const handleCollectedChange = (value: string) => {
    setWasteCollected(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("wasteCollected", value);
    }
  };

  const handleGeneratedChange = (value: string) => {
    setWasteGenerated(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("wasteGenerated", value);
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

  // Function to calculate solid waste collection score
  const calculateSolidWasteCollection = () => {
    if (!wasteCollected || !wasteGenerated) {
      toast.error("Please enter both the waste collected and waste generated values.");
      return null;
    }

    const collected = parseFloat(wasteCollected.toString());
    const generated = parseFloat(wasteGenerated.toString());

    if (collected < 0 || generated <= 0) {
      toast.error("Please ensure waste collected is >= 0 and waste generated is > 0.");
      return null;
    }

    if (collected > generated) {
      toast.error("Waste collected cannot exceed waste generated.");
      return null;
    }

    // Formula: Solid waste collection (%) = (Volume of waste collected / Total volume of waste generated) * 100
    const score = (collected / generated) * 100;
    const scoreNum = score.toFixed(2); // Limit to 2 decimal places
    setCollectionScore(scoreNum);
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

    const calculationResult = calculateSolidWasteCollection();
    if (calculationResult === null) return; // Exit if calculation fails

    const { scoreNum, calculatedComment } = calculationResult;

    try {
      setIsSubmitting(true);

      console.log('Before Posting:', 'Score:', scoreNum, 'Comment:', calculatedComment);

      const postData = {
        city,
        country,
        solid_waste_collection: parseFloat(scoreNum), // Post the calculated score
        solid_waste_collection_comment: calculatedComment, // Use the calculated comment
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
      <h2 className="text-2xl font-bold mb-4">Solid Waste Collection Evaluation</h2>

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
        <label htmlFor="wasteCollected" className="block mb-2 font-semibold">
          Volume of Waste Collected (units):
        </label>
        <input
          id="wasteCollected"
          type="number"
          value={wasteCollected}
          onChange={(e) => handleCollectedChange(e.target.value)}
          className="border rounded p-2 w-full"
          placeholder="Enter waste collected"
          aria-label="Enter volume of waste collected"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="wasteGenerated" className="block mb-2 font-semibold">
          Total Volume of Waste Generated (units):
        </label>
        <input
          id="wasteGenerated"
          type="number"
          value={wasteGenerated}
          onChange={(e) => handleGeneratedChange(e.target.value)}
          className="border rounded p-2 w-full"
          placeholder="Enter waste generated"
          aria-label="Enter total volume of waste generated"
        />
      </div>

      <button
        onClick={handleCalculateAndSave}
        disabled={isSubmitting || !city || !country}
        className={`p-2 bg-green-500 text-white rounded w-full hover:bg-green-600 transition ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        aria-label="Calculate and Save"
      >
        {isSubmitting ? 'Calculating and Saving...' : 'Calculate and Save'}
      </button>

      {collectionScore !== null && comment !== null && (
        <div className="mt-4">
          <h3 className="text-lg">
            Solid Waste Collection Score: <span className="font-bold">{collectionScore}%</span>
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

export default SolidWasteCollection;