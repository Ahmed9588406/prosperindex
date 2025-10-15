"use client";
import React, { useState, useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { useCity } from "../../../../context/CityContext";
import toast from "react-hot-toast"; // Import the toast function

const InformalEmploymentCalculator: React.FC = () => {
  const { user, isLoaded } = useUser();
  const { city, country, cityName } = useCity();
  const [informalEmployees, setInformalEmployees] = useState<number | undefined>();
  const [totalEmployedPersons, setTotalEmployedPersons] = useState<number | undefined>();
  const [informalEmployment, setInformalEmployment] = useState<number>(0); // Informal Employment Ratio
  const [standardizedInformalEmployment, setStandardizedInformalEmployment] = useState<number>(0); // Standardized Informal Employment
  const [decision, setDecision] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

  // Constants
  const min = 11; // Minimum benchmark
  const max = 75; // Maximum benchmark

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
      const savedInformalEmployees = localStorage.getItem("informalEmployees");
      const savedTotalEmployedPersons = localStorage.getItem("totalEmployedPersons");

      if (savedInformalEmployees) setInformalEmployees(Number(savedInformalEmployees));
      if (savedTotalEmployedPersons) setTotalEmployedPersons(Number(savedTotalEmployedPersons));
    }
  }, []);

  // Save inputs to localStorage on change
  const handleInformalEmployeesChange = (value: number | undefined) => {
    setInformalEmployees(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("informalEmployees", value?.toString() || "");
    }
  };

  const handleTotalEmployedPersonsChange = (value: number | undefined) => {
    setTotalEmployedPersons(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("totalEmployedPersons", value?.toString() || "");
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

    if (!totalEmployedPersons || totalEmployedPersons === 0) {
      toast.error("Total number of employed persons cannot be zero.");
      return;
    }
    if (!informalEmployees || informalEmployees < 0) {
      toast.error("Please enter a valid number of informal employees.");
      return;
    }

    // Calculate Informal Employment Ratio
    const ratio = (informalEmployees / totalEmployedPersons) * 100;
    setInformalEmployment(ratio);

    // Standardized Informal Employment Formula
    let standardized = 100 * (1 - (Math.pow(ratio, 0.25) - Math.pow(min, 0.25)) / (Math.pow(max, 0.25) - Math.pow(min, 0.25)));
    if (standardized > 100) {
      standardized = 100;
    } else if (standardized < 0) {
      standardized = 0;
    }
    setStandardizedInformalEmployment(standardized);

    // Evaluate the decision based on the standardized score
    const evaluationComment = getComment(standardized);
    setDecision(evaluationComment);

    // Prepare data to send - now includes city and country
    const postData = {
      city,
      country,
      informal_employment: ratio,
      informal_employment_comment: evaluationComment,
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
      <h1 className="text-3xl font-bold mb-6 text-center">
        Informal Employment Calculator
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

      <div className="mb-6">
        <label className="block mb-3 text-lg font-semibold">
          Number of Informal Employees:
        </label>
        <input
          type="number"
          value={informalEmployees !== undefined ? informalEmployees : ""}
          onChange={(e) => handleInformalEmployeesChange(Number(e.target.value) || undefined)}
          className="border rounded-lg p-4 w-full text-lg"
          placeholder="Enter number of informal employees"
        />
      </div>
      <div className="mb-6">
        <label className="block mb-3 text-lg font-semibold">
          Total Number of Employed Persons:
        </label>
        <input
          type="number"
          value={totalEmployedPersons !== undefined ? totalEmployedPersons : ""}
          onChange={(e) => handleTotalEmployedPersonsChange(Number(e.target.value) || undefined)}
          className="border rounded-lg p-4 w-full text-lg"
          placeholder="Enter total number of employed persons"
        />
      </div>
      <button
        onClick={calculateAndSave}
        disabled={isSubmitting || !city || !country}
        className={`p-4 bg-blue-600 text-white rounded-lg w-full text-xl hover:bg-blue-700 transition ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isSubmitting ? 'Calculating and Saving...' : 'Calculate Informal Employment'}
      </button>
      {decision && (
        <div className="mt-8 p-6 bg-gray-100 rounded-lg shadow-inner">
          <h2 className="text-xl font-semibold mb-4">
            Informal Employment Ratio: {informalEmployment.toFixed(2)}%
          </h2>
          <h2 className="text-xl font-semibold mb-4">
            Standardized Informal Employment: {standardizedInformalEmployment.toFixed(2)}
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

export default InformalEmploymentCalculator;