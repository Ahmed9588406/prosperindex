"use client";

import React, { useState, useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { useCity } from "../../../../context/CityContext";
import toast from "react-hot-toast";

const WastewaterTreatment: React.FC = () => {
  const { user, isLoaded } = useUser();
  const { city, country, cityName } = useCity();
  const [sewageTreated, setSewageTreated] = useState<number | string>(""); // Volume of sewage treated
  const [sewageProduced, setSewageProduced] = useState<number | string>(""); // Total volume of sewage produced
  const [treatmentScore, setTreatmentScore] = useState<string | null>(null); // Final score
  const [comment, setComment] = useState<string | null>(null); // Comment based on score
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

  // Load saved inputs on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTreated = localStorage.getItem("sewageTreated");
      const savedProduced = localStorage.getItem("sewageProduced");

      if (savedTreated) setSewageTreated(savedTreated);
      if (savedProduced) setSewageProduced(savedProduced);
    }
  }, []);

  // Save inputs to localStorage on change
  const handleTreatedChange = (value: string) => {
    setSewageTreated(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("sewageTreated", value);
    }
  };

  const handleProducedChange = (value: string) => {
    setSewageProduced(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("sewageProduced", value);
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

  // Function to calculate wastewater treatment score
  const calculateWastewaterTreatment = () => {
    if (!sewageTreated || !sewageProduced) {
      toast.error("Please enter both the sewage treated and sewage produced values.");
      return null;
    }

    const treated = parseFloat(sewageTreated.toString());
    const produced = parseFloat(sewageProduced.toString());

    if (treated < 0 || produced <= 0) {
      toast.error("Please ensure sewage treated is >= 0 and sewage produced is > 0.");
      return null;
    }

    if (treated > produced) {
      toast.error("Sewage treated cannot exceed sewage produced.");
      return null;
    }

    // Formula: Wastewater treatment (%) = (sewage treated / sewage produced) * 100
    const score = (treated / produced) * 100;
    const scoreNum = score.toFixed(2); // Limit to 2 decimal places
    setTreatmentScore(scoreNum);
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

    const calculationResult = calculateWastewaterTreatment();
    if (calculationResult === null) return; // Exit if calculation fails

    const { scoreNum, calculatedComment } = calculationResult;

    try {
      setIsSubmitting(true); // Start loading
      console.log("Submitting data...");

      const postData = {
        city,
        country,
        waste_water_treatment: parseFloat(scoreNum), // Post the wastewater treatment score
        waste_water_treatment_comment: calculatedComment, // Use the calculated comment
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
      <h2 className="text-2xl font-bold mb-4">Wastewater Treatment Evaluation</h2>

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
        <label htmlFor="sewageTreated" className="block mb-2 font-semibold">
          Sewage Treated (m³/year):
        </label>
        <input
          id="sewageTreated"
          type="number"
          value={sewageTreated}
          onChange={(e) => handleTreatedChange(e.target.value)}
          className="border rounded p-2 w-full"
          placeholder="Enter sewage treated"
          aria-label="Enter volume of sewage treated"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="sewageProduced" className="block mb-2 font-semibold">
          Sewage Produced (m³/year):
        </label>
        <input
          id="sewageProduced"
          type="number"
          value={sewageProduced}
          onChange={(e) => handleProducedChange(e.target.value)}
          className="border rounded p-2 w-full"
          placeholder="Enter sewage produced"
          aria-label="Enter total volume of sewage produced"
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

      {treatmentScore !== null && comment !== null && (
        <div className="mt-4">
          <h3 className="text-lg">
            Wastewater Treatment Score: <span className="font-bold">{treatmentScore}%</span>
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

export default WastewaterTreatment;