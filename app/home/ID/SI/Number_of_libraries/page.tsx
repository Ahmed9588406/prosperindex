"use client";
import React, { useState } from "react";
import { useUser } from '@clerk/nextjs';

const PublicLibrariesForm: React.FC = () => {
  const { user, isLoaded } = useUser();
  const [numLibraries, setNumLibraries] = useState<string>("");
  const [totalPopulation, setTotalPopulation] = useState<string>("");
  const [librariesDensity, setLibrariesDensity] = useState<string | null>(null);
  const [standardizedLibraries, setStandardizedLibraries] = useState<number | null>(null);
  const [evaluation, setEvaluation] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

  // Constants for standardization
  const MIN = 1; // Minimum benchmark for libraries density
  const MAX = 7; // Maximum benchmark for libraries density

  // Function to get comment based on standardized score
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
      alert("User not authenticated. Please log in.");
      return;
    }

    const numericPopulation = Number(totalPopulation);
    if (numericPopulation <= 0) {
      alert("Total population must be greater than zero.");
      return;
    }
    const numericLibraries = Number(numLibraries);
    if (isNaN(numericLibraries) || isNaN(numericPopulation)) {
      alert("Please enter valid numbers for both fields.");
      return;
    }

    const density = (numericLibraries / numericPopulation) * 100000;
    setLibrariesDensity(density.toFixed(2));

    let standardizedDensity = 100000 * ((density - MIN) / (MAX - MIN));
    if (standardizedDensity > 100) {
      standardizedDensity = 100;
    } else if (standardizedDensity < 0) {
      standardizedDensity = 0;
    }
    setStandardizedLibraries(standardizedDensity);

    // Decision logic using getComment function
    const evaluationComment: string = getComment(standardizedDensity);

    setEvaluation(evaluationComment);

    // Prepare data to send
    const postData = {
      number_of_public_libraries: density,
      number_of_public_libraries_comment: evaluationComment,
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
      alert("Data calculated and saved successfully!");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Error saving data:', errorMessage);
      alert("Failed to save data. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-5 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Calculate Public Libraries Density
      </h1>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Number of Public Libraries:
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="number"
            value={numLibraries}
            onChange={(e) => setNumLibraries(e.target.value)}
            required
          />
        </label>
      </div>
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Total Population:
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="number"
            value={totalPopulation}
            onChange={(e) => setTotalPopulation(e.target.value)}
            required
          />
        </label>
      </div>
      <button
        onClick={calculateAndSave}
        disabled={isSubmitting}
        className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isSubmitting ? 'Calculating and Saving...' : 'Calculate'}
      </button>
      {librariesDensity !== null && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p className="text-lg">
            Public Libraries Density: {librariesDensity} per 100,000 people
          </p>
          <p className="text-sm text-gray-600">Standardized Libraries Density:</p>
          <ul className="list-disc pl-5">
            <li>Standardized Score: {standardizedLibraries?.toFixed(2)}%</li>
          </ul>
          {evaluation && (
            <p
              className={`mt-4 p-2 text-center font-bold text-white rounded-md ${
                evaluation === "VERY SOLID" ? "bg-green-500" :
                evaluation === "SOLID" ? "bg-yellow-500" :
                evaluation === "MODERATELY SOLID" ? "bg-yellow-500" :
                evaluation === "MODERATELY WEAK" ? "bg-orange-500" :
                evaluation === "WEAK" ? "bg-red-500" :
                "bg-red-500"
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

export default PublicLibrariesForm;