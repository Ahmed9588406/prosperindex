"use client";
import React, { useState, useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { useCity } from "../../../../context/CityContext";
import toast from "react-hot-toast"; // Import the toast function

const OldAgeDependencyCalculator: React.FC = () => {
  const { user, isLoaded } = useUser();
  const { city, country, cityName } = useCity();
  const [peopleOver65, setPeopleOver65] = useState<number | undefined>();
  const [peopleAged15to64, setPeopleAged15to64] = useState<number | undefined>();
  const [oldAgeDependencyRatio, setOldAgeDependencyRatio] = useState<number>(0);
  const [standardizedRatio, setStandardizedRatio] = useState<number>(0);
  const [decision, setDecision] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

  const minLogValue = Math.log(2.92); // Minimum log value
  const maxLogValue = Math.log(40.53); // Maximum log value

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
      const savedPeopleOver65 = localStorage.getItem("peopleOver65");
      const savedPeopleAged15to64 = localStorage.getItem("peopleAged15to64");

      if (savedPeopleOver65) setPeopleOver65(Number(savedPeopleOver65));
      if (savedPeopleAged15to64) setPeopleAged15to64(Number(savedPeopleAged15to64));
    }
  }, []);

  // Save inputs to localStorage on change
  const handlePeopleOver65Change = (value: number | undefined) => {
    setPeopleOver65(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("peopleOver65", value?.toString() || "");
    }
  };

  const handlePeopleAged15to64Change = (value: number | undefined) => {
    setPeopleAged15to64(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("peopleAged15to64", value?.toString() || "");
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

    if (!peopleAged15to64 || peopleAged15to64 === 0) {
      toast.error("The number of people aged 15 to 64 cannot be zero.");
      return;
    }
    if (!peopleOver65 || peopleOver65 < 0) {
      toast.error("Please enter a valid number of people aged 65 and over.");
      return;
    }

    // Calculate Old Age Dependency Ratio
    const dependencyRatio = (peopleOver65 / peopleAged15to64) * 100;
    setOldAgeDependencyRatio(dependencyRatio);

    // Standardized Ratio
    const lnRatio = Math.log(dependencyRatio);
    const standardized = 100 * (1 - (lnRatio - minLogValue) / (maxLogValue - minLogValue));
    setStandardizedRatio(standardized);

    // Evaluate the decision based on the standardized score
    const evaluationComment = getComment(standardized);
    setDecision(evaluationComment);

    // Prepare data to send - now includes city and country
    const postData = {
      city,
      country,
      old_age_dependency_ratio: dependencyRatio,
      old_age_dependency_ratio_comment: evaluationComment,
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
    <div className="max-w-md mx-auto p-5 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Old Age Dependency Ratio Calculator</h1>

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
        <label className="block mb-2 font-semibold">People aged 65 and over:</label>
        <input
          type="number"
          value={peopleOver65 !== undefined ? peopleOver65 : ""}
          onChange={(e) => handlePeopleOver65Change(Number(e.target.value) || undefined)}
          className="border rounded p-2 w-full"
          placeholder="Enter number of people aged 65 and over"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2 font-semibold">People aged 15 to 64:</label>
        <input
          type="number"
          value={peopleAged15to64 !== undefined ? peopleAged15to64 : ""}
          onChange={(e) => handlePeopleAged15to64Change(Number(e.target.value) || undefined)}
          className="border rounded p-2 w-full"
          placeholder="Enter number of people aged 15 to 64"
        />
      </div>
      <button
        onClick={calculateAndSave}
        disabled={isSubmitting || !city || !country}
        className={`p-2 bg-blue-500 text-white rounded w-full hover:bg-blue-600 transition ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isSubmitting ? 'Calculating and Saving...' : 'Calculate Dependency Ratio'}
      </button>
      {decision && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold">
            Old Age Dependency Ratio: {oldAgeDependencyRatio.toFixed(2)}
          </h2>
          <h2 className="text-lg font-semibold">
            Standardized Ratio: {standardizedRatio.toFixed(2)}
          </h2>
          <h2 className="text-lg font-semibold">
            Decision:{" "}
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
          </h2>
        </div>
      )}
    </div>
  );
};

export default OldAgeDependencyCalculator;