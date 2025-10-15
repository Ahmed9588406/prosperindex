"use client";
import React, { useState, useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { useCity } from '../../../../context/CityContext';
import toast from 'react-hot-toast';

function PublicTransportForm() {
  const { user, isLoaded } = useUser();
  const { city, country, cityName } = useCity();
  const [tripsInPTModes, setTripsInPTModes] = useState<string>("");
  const [totalMotorizedTrips, setTotalMotorizedTrips] = useState<string>("");
  const [usePTRatio, setUsePTRatio] = useState<number | null>(null);
  const [standardizedPTRatio, setStandardizedPTRatio] = useState<number | null>(null);
  const [decision, setDecision] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

  // Constants
  const MIN = 5.95; // Minimum value from benchmark
  const MAX = 62.16; // Maximum value from benchmark

  // Add getComment function for evaluation
  const getComment = (score: number) => {
    if (score >= 80) return "VERY SOLID";
    else if (score >= 70) return "SOLID";
    else if (score >= 60) return "MODERATELY SOLID";
    else if (score >= 50) return "MODERATELY WEAK";
    else if (score >= 40) return "WEAK";
    else return "VERY WEAK";
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

    const numericTotalTrips = Number(totalMotorizedTrips);
    if (numericTotalTrips <= 0) {
      toast.error("Total motorized trips must be greater than zero.");
      return;
    }
    const numericTripsInPTModes = Number(tripsInPTModes);
    if (isNaN(numericTripsInPTModes) || isNaN(numericTotalTrips)) {
      toast.error("Please enter valid numbers for both fields.");
      return;
    }

    // Calculate Use of Public Transport Ratio
    const calculatedPTRatio = (numericTripsInPTModes / numericTotalTrips) * 100;
    setUsePTRatio(calculatedPTRatio);

    // Standardized PT Ratio Calculation
    let standardizedPTRatioValue: number;
    if (calculatedPTRatio >= MAX) {
      standardizedPTRatioValue = 100;
    } else if (calculatedPTRatio < MIN) {
      standardizedPTRatioValue = 0;
    } else {
      standardizedPTRatioValue =
        100 * ((calculatedPTRatio - MIN) / (MAX - MIN));
    }
    setStandardizedPTRatio(standardizedPTRatioValue);

    // Evaluate the decision based on the standardized score
    const evaluationComment = getComment(standardizedPTRatioValue);
    setDecision(evaluationComment);

    // Prepare data to send
    const postData = {
      city,
      country,
      use_of_public_transport: calculatedPTRatio,
      use_of_public_transport_comment: evaluationComment, // Renamed for consistency
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

  // Load saved inputs on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTripsInPTModes = localStorage.getItem("tripsInPTModes");
      const savedTotalMotorizedTrips = localStorage.getItem("totalMotorizedTrips");

      if (savedTripsInPTModes) setTripsInPTModes(savedTripsInPTModes);
      if (savedTotalMotorizedTrips) setTotalMotorizedTrips(savedTotalMotorizedTrips);
    }
  }, []);

  // Save inputs to localStorage on change
  const handleTripsInPTModesChange = (value: string) => {
    setTripsInPTModes(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("tripsInPTModes", value);
    }
  };

  const handleTotalMotorizedTripsChange = (value: string) => {
    setTotalMotorizedTrips(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("totalMotorizedTrips", value);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-5 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Calculate Use of Public Transport
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

      {!city || !country && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ Please select a city from the cities page first
          </p>
        </div>
      )}

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Number of Trips in Public Transport Modes:
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="number"
            value={tripsInPTModes}
            onChange={(e) => handleTripsInPTModesChange(e.target.value)}
            required
          />
        </label>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Total Motorized Trips:
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="number"
            value={totalMotorizedTrips}
            onChange={(e) => handleTotalMotorizedTripsChange(e.target.value)}
            required
          />
        </label>
      </div>
      <button
        onClick={calculateAndSave}
        disabled={isSubmitting || !city || !country}
        className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isSubmitting ? 'Calculating and Saving...' : 'Calculate'}
      </button>
      {usePTRatio !== null && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p className="text-lg">Use of Public Transport Ratio: {usePTRatio.toFixed(2)}%</p>
          <p className="text-sm text-gray-600">Standardized PT Ratio (S):</p>
          <ul className="list-disc pl-5">
            <li>Standardized PT Ratio: {standardizedPTRatio?.toFixed(2)}%</li>
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

export default PublicTransportForm;