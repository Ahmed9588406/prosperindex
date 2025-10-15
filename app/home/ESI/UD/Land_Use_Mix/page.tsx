"use client";
import React, { useState, useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { useCity } from "../../../../context/CityContext";
import toast from "react-hot-toast";

const LandUseMix: React.FC = () => {
  const { user, isLoaded } = useUser();
  const { city, country, cityName } = useCity();
  const [landUseData, setLandUseData] = useState<number[][]>([]); // Array of p_i values for each cell
  const [numCells, setNumCells] = useState<string>(""); // Total number of cells as a string to allow empty input
  const [averageIndex, setAverageIndex] = useState<number | null>(null); // Average Land Use Mix index
  const [standardizedScore, setStandardizedScore] = useState<string | null>(null); // Standardized score
  const [comment, setComment] = useState<string | null>(null); // Comment based on score
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

  // Constants
  const MAX_INDEX = 1.61; // ln(5) for 5 categories
  //const MIN_INDEX = 0;

  // Function to get comment based on standardized score
  const getComment = (score: number) => {
    if (score >= 80) return "VERY SOLID";
    else if (score >= 70) return "SOLID";
    else if (score >= 60) return "MODERATELY SOLID";
    else if (score >= 50) return "MODERATELY WEAK";
    else if (score >= 40) return "WEAK";
    else return "VERY WEAK";
  };

  // Function to calculate Shannon-Wiener Diversity Index
  const calculateShannonWienerIndex = (piValues: number[]) => {
    // Shannon-Wiener Diversity Index formula: -Σ (p_i * ln(p_i))
    return -piValues
      .filter((pi) => pi > 0) // Avoid ln(0)
      .reduce((sum, pi) => sum + pi * Math.log(pi), 0);
  };

  // Function to calculate standardized land use mix score
  const calculateStandardizedLandUseMix = () => {
    const numCellsValue = parseInt(numCells, 10);
    if (isNaN(numCellsValue) || numCellsValue <= 0 || landUseData.length === 0) {
      toast.error("Ensure that land use data and a valid number of cells are provided.");
      return null;
    }

    // Calculate Shannon-Wiener Diversity Index for each cell
    const indices = landUseData.map((cellAreas) => calculateShannonWienerIndex(cellAreas));

    // Calculate average index
    const average =
      indices.reduce((sum, index) => sum + index, 0) / indices.length;
    setAverageIndex(average);

    // Standardized formula
    const standardizedValue = 100 * (average / MAX_INDEX);

    const scoreNum = standardizedValue.toFixed(2); // Limit to 2 decimal places
    setStandardizedScore(scoreNum);
    const calculatedComment = getComment(parseFloat(scoreNum));
    setComment(calculatedComment); // Set comment based on score
    console.log('Calculated Score:', scoreNum, 'Calculated Comment:', calculatedComment);
    return { average, scoreNum, calculatedComment };
  };

  // Load saved inputs on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLandUse = localStorage.getItem("landUseData");
      const savedNumCells = localStorage.getItem("numCells");

      if (savedLandUse) setLandUseData(JSON.parse(savedLandUse));
      if (savedNumCells) setNumCells(savedNumCells);
    }
  }, []);

  // Save inputs to localStorage on change
  const handleLandUseChange = (data: number[][]) => {
    setLandUseData(data);
    if (typeof window !== "undefined") {
      localStorage.setItem("landUseData", JSON.stringify(data));
    }
  };

  const handleNumCellsChange = (value: string) => {
    setNumCells(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("numCells", value);
    }
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

    const calculationResult = calculateStandardizedLandUseMix();
    if (calculationResult === null) return; // Exit if calculation fails

    const { average, calculatedComment } = calculationResult;

    try {
      setIsSubmitting(true); // Start loading
      console.log("Submitting data...");

      const postData = {
        city,
        country,
        land_use_mix: average, // Post the average land use mix index
        land_use_mix_comment: calculatedComment, // Use the calculated comment
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
      <h2 className="text-2xl font-bold mb-4">Land Use Mix</h2>

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
          Enter Land Use Data for Each Cell (comma-separated p_i values for each cell):
        </label>
        <textarea
          rows={5}
          className="border rounded p-2 w-full"
          onChange={(e) =>
            handleLandUseChange(
              e.target.value.split("\n").map((line) =>
                line.split(",").map((val) => parseFloat(val.trim()))
              )
            )
          }
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2 font-semibold">Total Number of Cells:</label>
        <input
          type="text"
          value={numCells}
          onChange={(e) => handleNumCellsChange(e.target.value)}
          className="border rounded p-2 w-full"
          placeholder="Enter a valid number"
        />
      </div>

      <button
        onClick={handleCalculateAndSave}
        disabled={isSubmitting || !city || !country}
        className={`p-2 bg-blue-500 text-white rounded w-full hover:bg-blue-600 transition ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isSubmitting ? 'Calculating and Saving...' : 'Calculate Land Use Mix'}
      </button>

      {averageIndex !== null && standardizedScore !== null && comment !== null && (
        <div className="mt-4">
          <h3 className="text-lg">
            Average Land Use Mix Index: <span className="font-bold">{averageIndex.toFixed(2)}</span>
          </h3>
          <h3 className="text-lg">
            Standardized Score: <span className="font-bold">{standardizedScore}%</span>
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

export default LandUseMix;