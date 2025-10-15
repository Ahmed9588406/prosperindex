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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [oldAgeDependencyRatio, setOldAgeDependencyRatio] = useState<number>(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white shadow-2xl rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-green-600 p-6 text-white">
          <h2 className="text-3xl font-bold flex items-center">
            👴 Old Age Dependency Ratio
          </h2>
          <p className="mt-2 text-blue-100">Assess and save your city&apos;s dependency ratio data</p>
        </div>
        
        <div className="p-8">
          {/* Display selected city and country */}
          {city && country && (
            <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
              <p className="text-sm text-gray-600 flex items-center">
                📍 Calculating for:
              </p>
              <p className="text-lg font-semibold text-blue-800">
                {cityName || `${city}, ${country}`}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                City: {city} | Country: {country}
              </p>
            </div>
          )}

          {!city || !country && (
            <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg">
              <p className="text-sm text-yellow-800 flex items-center">
                ⚠️ Please select a city from the cities page first
              </p>
            </div>
          )}

          <div className="mb-6">
            <label className="block mb-3 font-semibold text-gray-700 flex items-center">
              👴 People aged 65 and over:
            </label>
            <input
              type="number"
              value={peopleOver65 !== undefined ? peopleOver65 : ""}
              onChange={(e) => handlePeopleOver65Change(Number(e.target.value) || undefined)}
              className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Enter number of people aged 65 and over"
            />
          </div>

          <div className="mb-6">
            <label className="block mb-3 font-semibold text-gray-700 flex items-center">
              👥 People aged 15 to 64:
            </label>
            <input
              type="number"
              value={peopleAged15to64 !== undefined ? peopleAged15to64 : ""}
              onChange={(e) => handlePeopleAged15to64Change(Number(e.target.value) || undefined)}
              className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Enter number of people aged 15 to 64"
            />
          </div>
          
          <button
            onClick={calculateAndSave}
            disabled={isSubmitting || !city || !country}
            className={`w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-green-600 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Calculating and Saving...
              </>
            ) : (
              <>🚀 Calculate and Save</>
            )}
          </button>
          
          {decision && (
            <div className="mt-8 p-6 bg-gray-50 rounded-lg border">
              <div className={`p-4 text-center font-bold text-white rounded-lg transition ${
                decision === "VERY SOLID"
                  ? "bg-gradient-to-r from-green-400 to-green-600"
                  : decision === "SOLID"
                  ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                  : "bg-gradient-to-r from-red-400 to-red-600"
              }`}>
                {decision}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OldAgeDependencyCalculator;