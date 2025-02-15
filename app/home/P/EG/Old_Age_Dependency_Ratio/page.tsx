"use client";
import React, { useState } from "react";
import { useUser } from '@clerk/nextjs';

const OldAgeDependencyCalculator: React.FC = () => {
  const { user, isLoaded } = useUser();
  const [peopleOver65, setPeopleOver65] = useState<number | undefined>();
  const [peopleAged15to64, setPeopleAged15to64] = useState<number | undefined>();
  const [oldAgeDependencyRatio, setOldAgeDependencyRatio] = useState<number>(0);
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

  const calculateAndSave = async () => {
    if (!isLoaded || !user) {
      alert("User not authenticated. Please log in.");
      return;
    }
    if (!peopleAged15to64 || peopleAged15to64 === 0) {
      alert("The number of people aged 15 to 64 cannot be zero.");
      return;
    }
    if (!peopleOver65 || peopleOver65 < 0) {
      alert("Please enter a valid number of people aged 65 and over.");
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

    // Prepare data to send
    const postData = {
      old_age_dependency_ratio: dependencyRatio,
      old_age_dependency_ratio_comment: evaluationComment, // Renamed for consistency
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
    <div className="max-w-md mx-auto p-5 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Old Age Dependency Ratio Calculator</h1>

      <div className="mb-4">
        <label className="block mb-2 font-semibold">People aged 65 and over:</label>
        <input
          type="number"
          value={peopleOver65 !== undefined ? peopleOver65 : ""}
          onChange={(e) => setPeopleOver65(Number(e.target.value) || undefined)}
          className="border rounded p-2 w-full"
          placeholder="Enter number of people aged 65 and over"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2 font-semibold">People aged 15 to 64:</label>
        <input
          type="number"
          value={peopleAged15to64 !== undefined ? peopleAged15to64 : ""}
          onChange={(e) => setPeopleAged15to64(Number(e.target.value) || undefined)}
          className="border rounded p-2 w-full"
          placeholder="Enter number of people aged 15 to 64"
        />
      </div>
      <button
        onClick={calculateAndSave}
        disabled={isSubmitting}
        className={`p-2 bg-blue-500 text-white rounded w-full hover:bg-blue-600 transition ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isSubmitting ? 'Calculating and Saving...' : 'Calculate Dependency Ratio'}
      </button>
      {decision && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold">
            Old Age Dependency Ratio: {oldAgeDependencyRatio.toFixed(2)}
          </h2>
          <h2 className="text-lg font-semibold">
            Standardized Ratio: {standardizedRatio.toFixed(2)}
          </h2>
          <h2 className="text-lg font-semibold">
            Decision:{" "}
            <span
              className={`font-bold ${
                decision === "VERY SOLID"
                  ? "text-green-600"
                  : decision === "SOLID"
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            >
              {decision}
            </span>
          </h2>
        </div>
      )}
    </div>
  );
};

export default OldAgeDependencyCalculator;