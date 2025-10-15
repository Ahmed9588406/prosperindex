"use client";
import React, { useState, useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { useCity } from "../../../../context/CityContext";
import toast from "react-hot-toast"; // Import the toast function

const MeanHouseholdIncomeApp: React.FC = () => {
  const { user, isLoaded } = useUser();
  const { city, country, cityName } = useCity();
  const [householdIncome, setHouseholdIncome] = useState<number | undefined>(); // Allow undefined for no fixed zero value
  const [standardizedIncome, setStandardizedIncome] = useState<number>(0);
  const [decision, setDecision] = useState<string>("");
  const [economicStrength, setEconomicStrength] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

  const minIncome = 6315; // Minimum income
  const maxIncome = 44773; // Maximum income

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
      const savedHouseholdIncome = localStorage.getItem("householdIncome");
      if (savedHouseholdIncome) setHouseholdIncome(Number(savedHouseholdIncome));
    }
  }, []);

  // Save inputs to localStorage on change
  const handleHouseholdIncomeChange = (value: number | undefined) => {
    setHouseholdIncome(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("householdIncome", value?.toString() || "");
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

    if (!householdIncome || householdIncome <= 0) {
      toast.error("Please enter a valid household income greater than zero.");
      return;
    }

    // Standardization formula
    const standardized =
      100 *
      ((Math.log(householdIncome) - Math.log(minIncome)) /
        (Math.log(maxIncome) - Math.log(minIncome)));
    setStandardizedIncome(standardized);

    // Evaluate the decision based on the standardized score
    const evaluationComment = getComment(standardized);
    setDecision(evaluationComment);

    // Prepare data to send - now includes city and country
    const postData = {
      city,
      country,
      mean_household_income: householdIncome,
      mean_household_income_comment: evaluationComment,
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

  useEffect(() => {
    // Fetch the values from localStorage and calculate the economic strength
    const cityProductPerCapita = parseFloat(localStorage.getItem("cityProductPerCapita") || "0");
    const oldAgeDependencyRatio = parseFloat(localStorage.getItem("oldAgeDependencyRatio") || "0");
    const values = [cityProductPerCapita, oldAgeDependencyRatio, householdIncome ?? 0].filter(
      (value): value is number => value > 0
    );
    const average = values.reduce((acc: number, value: number) => acc + value, 0) / values.length;
    setEconomicStrength(average);
  }, [householdIncome]);

  return (
    <div className="max-w-md mx-auto p-5 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Mean Household Income Calculator</h1>

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
        <label className="block mb-2 font-semibold">
          Enter Mean Household Income (US$):
        </label>
        <input
          type="number"
          value={householdIncome !== undefined ? householdIncome : ""}
          onChange={(e) => handleHouseholdIncomeChange(Number(e.target.value) || undefined)}
          className="border rounded p-2 w-full"
          placeholder="Enter household income"
        />
      </div>
      <button
        onClick={calculateAndSave}
        disabled={isSubmitting || !city || !country}
        className={`p-2 bg-blue-500 text-white rounded w-full hover:bg-blue-600 transition ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isSubmitting ? 'Calculating and Saving...' : 'Calculate Standardized Income'}
      </button>
      {decision && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold">
            Standardized Income: {standardizedIncome.toFixed(2)}
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
          <h2 className="text-lg font-semibold">Economic Strength: {economicStrength.toFixed(2)}</h2>
        </div>
      )}
    </div>
  );
};

export default MeanHouseholdIncomeApp;