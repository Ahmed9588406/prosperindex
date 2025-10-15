"use client";
import React, { useState, useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { useCity } from "../../../../context/CityContext";
import toast from "react-hot-toast"; // Import the toast function

const EconomicDensityCalculator: React.FC = () => {
  const { user, isLoaded } = useUser();
  const { city, country, cityName } = useCity();
  const [cityProduct, setCityProduct] = useState<number | undefined>();
  const [cityArea, setCityArea] = useState<number | undefined>();
  const [economicDensity, setEconomicDensity] = useState<number>(0); // Economic Density
  const [standardizedEconomicDensity, setStandardizedEconomicDensity] = useState<number>(0); // Standardized Economic Density
  const [decision, setDecision] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

  // Constants
  const benchmark = 857.37; // X* benchmark in million PPP/km²

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
      const savedCityProduct = localStorage.getItem("cityProduct");
      const savedCityArea = localStorage.getItem("cityArea");

      if (savedCityProduct) setCityProduct(Number(savedCityProduct));
      if (savedCityArea) setCityArea(Number(savedCityArea));
    }
  }, []);

  // Save inputs to localStorage on change
  const handleCityProductChange = (value: number | undefined) => {
    setCityProduct(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("cityProduct", value?.toString() || "");
    }
  };

  const handleCityAreaChange = (value: number | undefined) => {
    setCityArea(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("cityArea", value?.toString() || "");
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

    if (!cityArea || cityArea === 0) {
      toast.error("City area cannot be zero.");
      return;
    }
    if (!cityProduct || cityProduct < 0) {
      toast.error("Please enter a valid city product.");
      return;
    }

    // Calculate Economic Density
    const density = cityProduct / cityArea;
    setEconomicDensity(density);

    // Standardized Economic Density Formula
    let standardized = 100 * (1 - Math.abs((density - benchmark) / benchmark));
    if (standardized > 100) {
      standardized = 100;
    } else if (standardized < 0) {
      standardized = 0;
    }
    setStandardizedEconomicDensity(standardized);

    // Evaluate the decision based on the standardized score
    const evaluationComment = getComment(standardized);
    setDecision(evaluationComment);

    // Prepare data to send - now includes city and country
    const postData = {
      city,
      country,
      economic_density: density,
      economic_density_comment: evaluationComment,
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
    <div className="max-w-lg mx-auto p-10 bg-white shadow-lg rounded-2xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Economic Density Calculator</h1>

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

      <div className="mb-6">
        <label className="block mb-3 text-lg font-semibold">
          City Product (in million PPP):
        </label>
        <input
          type="number"
          value={cityProduct !== undefined ? cityProduct : ""}
          onChange={(e) => handleCityProductChange(Number(e.target.value) || undefined)}
          className="border rounded-lg p-4 w-full text-lg"
          placeholder="Enter the city product"
        />
      </div>
      <div className="mb-6">
        <label className="block mb-3 text-lg font-semibold">
          City Area (in square kilometers):
        </label>
        <input
          type="number"
          value={cityArea !== undefined ? cityArea : ""}
          onChange={(e) => handleCityAreaChange(Number(e.target.value) || undefined)}
          className="border rounded-lg p-4 w-full text-lg"
          placeholder="Enter the city area"
        />
      </div>
      <button
        onClick={calculateAndSave}
        disabled={isSubmitting || !city || !country}
        className={`p-4 bg-blue-600 text-white rounded-lg w-full text-xl hover:bg-blue-700 transition ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isSubmitting ? 'Calculating and Saving...' : 'Calculate Economic Density'}
      </button>
      {decision && (
        <div className="mt-8 p-6 bg-gray-100 rounded-lg shadow-inner">
          <h2 className="text-xl font-semibold mb-4">
            Economic Density: {economicDensity.toFixed(2)} (million PPP/km²)
          </h2>
          <h2 className="text-xl font-semibold mb-4">
            Standardized Economic Density: {standardizedEconomicDensity.toFixed(2)}
          </h2>
          <h2 className="text-xl font-semibold">
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

export default EconomicDensityCalculator;