"use client";
import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useCity } from "../../../../context/CityContext";
import toast from "react-hot-toast"; // Import the toast function

function PopulationDensityForm() {
  const { user, isLoaded } = useUser();
  const { city, country, cityName } = useCity();
  const [cityPopulation, setCityPopulation] = useState("");
  const [urbanArea, setUrbanArea] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [populationDensityS, setPopulationDensityS] = useState<number | null>(null);
  const [decision, setDecision] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Constants
  const X = 15000;

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
      const savedPopulation = localStorage.getItem("cityPopulation");
      const savedArea = localStorage.getItem("urbanArea");

      if (savedPopulation) setCityPopulation(savedPopulation);
      if (savedArea) setUrbanArea(savedArea);
    }
  }, []);

  // Save inputs to localStorage on change
  const handleCityPopulationChange = (value: string) => {
    setCityPopulation(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("cityPopulation", value);
    }
  };

  const handleUrbanAreaChange = (value: string) => {
    setUrbanArea(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("urbanArea", value);
    }
  };

  const calculatePopulationDensity = async () => {
    if (!user) {
      toast.error("Please sign in to save calculations.");
      return;
    }

    if (!city || !country) {
      toast.error("Please select a city from the cities page first.");
      return;
    }

    const numericUrbanArea = Number(urbanArea);
    if (numericUrbanArea > 0) {
      const numericPopulation = Number(cityPopulation);
      const populationDensity = numericPopulation / numericUrbanArea;
      let standardizedDensity = 100 * (1 - Math.abs((populationDensity - X) / X));
      standardizedDensity = Math.min(Math.max(standardizedDensity, 0), 100);

      // Update state with results
      setPopulationDensityS(standardizedDensity);
      setResult(populationDensity.toFixed(2));

      // Evaluate the decision based on the standardized score
      const evaluationComment = getComment(standardizedDensity);
      setDecision(evaluationComment);

      // Prepare data to send - now includes city and country
      const postData = {
        city,
        country,
        population: populationDensity,
        population_comment: evaluationComment,
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
      toast.error("Urban area must be greater than zero.");
    }
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-5 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Calculate Population Density
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
          City Population:
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="number"
            value={cityPopulation}
            onChange={(e) => handleCityPopulationChange(e.target.value)}
            required
          />
        </label>
      </div>
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Urban Area (km²):
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="number"
            value={urbanArea}
            onChange={(e) => handleUrbanAreaChange(e.target.value)}
            required
          />
        </label>
      </div>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-400"
        onClick={calculatePopulationDensity}
        disabled={isSubmitting || !city || !country}
      >
        {isSubmitting ? 'Saving...' : 'Calculate'}
      </button>
      {result !== null && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p className="text-lg">Population Density: {result} people/km²</p>
          <p className="text-sm text-gray-600">Population Density (S):</p>
          <ul className="list-disc pl-5">
            <li>Population Density Standardized: {populationDensityS?.toFixed(2)}%</li>
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

export default PopulationDensityForm;