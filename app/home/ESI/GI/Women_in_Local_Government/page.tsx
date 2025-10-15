"use client";
import React, { useState, useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { useCity } from "../../../../context/CityContext";
import toast from "react-hot-toast";

const WomenInLocalGovernment: React.FC = () => {
  const { user, isLoaded } = useUser();
  const { city, country, cityName } = useCity();
  const [womenInGovJobs, setWomenInGovJobs] = useState<number | string>(""); // Number of women in government jobs
  const [totalGovJobs, setTotalGovJobs] = useState<number | string>(""); // Total government jobs
  const [standardizedRate, setStandardizedRate] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<string | null>(null); // Decision evaluation
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

  // Benchmark
  const BENCHMARK = 50; // X* = 50%

  // Function to get comment based on standardized score
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
      const savedWomen = localStorage.getItem("womenInGovJobs");
      const savedTotal = localStorage.getItem("totalGovJobs");

      if (savedWomen) setWomenInGovJobs(savedWomen);
      if (savedTotal) setTotalGovJobs(savedTotal);
    }
  }, []);

  // Save inputs to localStorage on change
  const handleWomenChange = (value: string) => {
    setWomenInGovJobs(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("womenInGovJobs", value);
    }
  };

  const handleTotalChange = (value: string) => {
    setTotalGovJobs(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("totalGovJobs", value);
    }
  };

  const calculateAndSave = async () => {
    if (!user) {
      toast.error("Please sign in to save calculations.");
      return;
    }

    if (!city || !country) {
      toast.error("Please select a city from the cities page first.");
      return;
    }

    // Convert inputs to numbers
    const womenInGovJobsNum = parseFloat(womenInGovJobs.toString());
    const totalGovJobsNum = parseFloat(totalGovJobs.toString());

    // Validate inputs
    if (isNaN(womenInGovJobsNum) || isNaN(totalGovJobsNum)) {
      toast.error("All inputs must be valid numbers.");
      return;
    }
    if (totalGovJobsNum <= 0) {
      toast.error("Total government jobs must be greater than zero.");
      return;
    }

    // Women in the local government formula
    const womenInLocalGov = (womenInGovJobsNum / totalGovJobsNum) * 100;

    // Standardized formula with absolute value
    const standardizedValue =
      100 * (1 - Math.abs((womenInLocalGov - BENCHMARK) / BENCHMARK));

    // Get the comment based on the standardized value
    const evaluationComment = getComment(standardizedValue);

    setStandardizedRate(standardizedValue.toFixed(2));
    setEvaluation(evaluationComment);

    // Prepare data to send - now includes city and country
    const postData = {
      city,
      country,
      women_in_local_government: womenInLocalGov,
      women_in_local_government_comment: evaluationComment,
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

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-5 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Women in the Local Government</h2>

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
        <label className="block mb-2 font-semibold">
          Number of Women in Government Jobs:
        </label>
        <input
          type="number"
          value={womenInGovJobs}
          onChange={(e) => handleWomenChange(e.target.value)}
          className="border rounded p-2 w-full"
          placeholder="Enter number of women in government jobs"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2 font-semibold">Total Government Jobs:</label>
        <input
          type="number"
          value={totalGovJobs}
          onChange={(e) => handleTotalChange(e.target.value)}
          className="border rounded p-2 w-full"
          placeholder="Enter total government jobs"
        />
      </div>
      <button
        onClick={calculateAndSave}
        disabled={isSubmitting || !city || !country}
        className={`p-2 bg-blue-500 text-white rounded w-full hover:bg-blue-600 transition ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isSubmitting ? 'Calculating and Saving...' : 'Calculate Standardized Rate'}
      </button>
      {standardizedRate !== null && (
        <div className="mt-4">
          <h3 className="text-lg">
            Standardized Women in Local Government: {standardizedRate}%
          </h3>
          {evaluation && (
            <p
              className={`mt-4 p-2 text-center font-bold text-white rounded-md ${
                evaluation === "VERY SOLID"
                  ? "bg-green-500"
                  : evaluation === "SOLID"
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
            >
              {evaluation}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default WomenInLocalGovernment;