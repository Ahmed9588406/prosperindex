"use client";

import React, { useState, useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { useCity } from "../../../../context/CityContext";
import toast from "react-hot-toast";

const PM10MonitoringStations: React.FC = () => {
  const { user, isLoaded } = useUser();
  const { city, country, cityName } = useCity();
  const [population, setPopulation] = useState<number | string>(""); // Input: Population
  const [pm10Level, setPm10Level] = useState<string>(""); // Input: PM10 Level
  const [numStations, setNumStations] = useState<number | string>(""); // Input: Number of monitoring stations
  const [comment, setComment] = useState<string | null>(null); // Comment based on score
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

  // Load saved inputs on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPopulation = localStorage.getItem("population");
      const savedPm10 = localStorage.getItem("pm10Level");
      const savedStations = localStorage.getItem("numStations");

      if (savedPopulation) setPopulation(savedPopulation);
      if (savedPm10) setPm10Level(savedPm10);
      if (savedStations) setNumStations(savedStations);
    }
  }, []);

  // Save inputs to localStorage on change
  const handlePopulationChange = (value: string) => {
    setPopulation(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("population", value);
    }
  };

  const handlePm10Change = (value: string) => {
    setPm10Level(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("pm10Level", value);
    }
  };

  const handleStationsChange = (value: string) => {
    setNumStations(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("numStations", value);
    }
  };

  // Validate inputs
  const validateInputs = () => {
    if (!population || !pm10Level || !numStations) {
      alert("Please fill in all fields.");
      return false;
    }

    const populationNum = parseFloat(population.toString());
    const stationsNum = parseFloat(numStations.toString());

    if (isNaN(populationNum) || isNaN(stationsNum)) {
      alert("Invalid input. Please enter valid numbers.");
      return false;
    }

    if (populationNum <= 0 || stationsNum < 0) {
      alert("Population must be greater than zero and monitoring stations cannot be negative.");
      return false;
    }

    if (!["greater_or_equal_48", "between_32_and_48", "less_than_32"].includes(pm10Level)) {
      alert("Invalid PM10 level selection.");
      return false;
    }

    return true;
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

  // Calculate standardized score
  const calculateMonitoringStations = () => {
    if (!validateInputs()) return null;

    const populationNum = parseFloat(population.toString());
    const stationsNum = parseFloat(numStations.toString());

    // Determine the maximum number of monitoring stations based on PM10 level
    let max = 0;

    switch (pm10Level) {
      case "greater_or_equal_48":
        max = populationNum / 125000;
        break;
      case "between_32_and_48":
        max = populationNum / 250000;
        break;
      case "less_than_32":
        max = populationNum / 500000;
        break;
      default:
        alert("Invalid PM10 level selection.");
        return null;
    }

    const min = 0; // Minimum benchmark is always 0

    // Calculate standardized score
    let standardizedValue = 0;

    if (stationsNum >= max) {
      standardizedValue = 100;
    } else if (stationsNum > min && stationsNum < max) {
      standardizedValue = (stationsNum / max) * 100;
    } else if (stationsNum === min) {
      standardizedValue = 0;
    }

    const scoreNum = standardizedValue.toFixed(2);
    console.log('Standardized Score:', scoreNum); // Log the score to the console
    const calculatedComment = getComment(parseFloat(scoreNum));
    setComment(calculatedComment); // Set comment immediately after calculating score
    console.log('Calculated Comment:', calculatedComment);
    return { scoreNum, calculatedComment };
  };

  // Handle calculation and saving data
  const handleCalculateAndSave = async () => {
    if (!user) {
      toast.error("Please sign in to save calculations.");
      return;
    }

    if (!city || !country) {
      toast.error("Please select a city from the cities page first.");
      return;
    }

    const calculationResult = calculateMonitoringStations();
    if (calculationResult === null) return;

    const {calculatedComment } = calculationResult;
    const stationsNum = parseFloat(numStations.toString());

    try {
      setIsSubmitting(true);

      const postData = {
        city,
        country,
        number_of_monitoring_stations: stationsNum || 0,
        number_of_monitoring_stations_comment: calculatedComment || "",
        userId: user.id
      };

      // Validate postData before sending
      if (!postData.userId || postData.number_of_monitoring_stations === null) {
        throw new Error("Invalid data for submission");
      }

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
    } catch (error) {
      console.error('Error saving data:', error);
      toast.error("Failed to save data. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white shadow-2xl rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-green-600 p-6 text-white">
          <h2 className="text-3xl font-bold flex items-center">
            📡 PM10 Monitoring Stations Evaluation
          </h2>
          <p className="mt-2 text-blue-100">Assess and save your city&#39;s monitoring stations data</p>
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
            <label htmlFor="population" className="block mb-3 font-semibold text-gray-700 flex items-center">
              👥 Population:
            </label>
            <input
              id="population"
              type="number"
              value={population}
              onChange={(e) => handlePopulationChange(e.target.value)}
              className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Enter population"
              aria-label="Enter population"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="pm10Level" className="block mb-3 font-semibold text-gray-700 flex items-center">
              🌫️ PM10 Level:
            </label>
            <select
              id="pm10Level"
              value={pm10Level}
              onChange={(e) => handlePm10Change(e.target.value)}
              className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              aria-label="Select PM10 Level"
            >
              <option value="">Select PM10 Level</option>
              <option value="greater_or_equal_48">≥ 48 μg/m³</option>
              <option value="between_32_and_48">≥ 32 μg/m³ and &lt; 48 μg/m³</option>
              <option value="less_than_32">{`< 32 μg/m³`}</option>
            </select>
          </div>

          <div className="mb-6">
            <label htmlFor="numStations" className="block mb-3 font-semibold text-gray-700 flex items-center">
              📊 Number of Monitoring Stations:
            </label>
            <input
              id="numStations"
              type="number"
              value={numStations}
              onChange={(e) => handleStationsChange(e.target.value)}
              className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Enter number of monitoring stations"
              aria-label="Enter number of monitoring stations"
            />
          </div>
          
          <button
            onClick={handleCalculateAndSave}
            disabled={isSubmitting || !city || !country}
            className={`w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-green-600 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center`}
            aria-label="Calculate and Save"
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
          
          {comment && (
            <div className="mt-8 p-6 bg-gray-50 rounded-lg border">
              <div className={`p-4 text-center font-bold text-white rounded-lg transition ${
                comment === "VERY SOLID"
                  ? "bg-gradient-to-r from-green-400 to-green-600"
                  : comment === "SOLID"
                  ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                  : "bg-gradient-to-r from-red-400 to-red-600"
              }`}>
                {comment}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PM10MonitoringStations;