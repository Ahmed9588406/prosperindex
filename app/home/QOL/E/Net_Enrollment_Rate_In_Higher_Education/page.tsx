"use client";
import React, { useState } from "react";
import { useUser } from '@clerk/nextjs';

function HigherEducationEnrollmentCalculator() {
  const { user, isLoaded } = useUser();
  const [enrolledPopulation, setEnrolledPopulation] = useState<string>(""); // Population enrolled in tertiary education
  const [tertiaryAgePopulation, setTertiaryAgePopulation] = useState<string>(""); // People in the tertiary education age range
  const [enrollmentRate, setEnrollmentRate] = useState<number | null>(null); // Enrollment rate as a number
  const [standardizedRate, setStandardizedRate] = useState<number | null>(null); // Standardized enrollment rate
  const [decision, setDecision] = useState<string | null>(null); // Qualitative decision
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

  const minBenchmark = 10; // Minimum benchmark
  const maxBenchmark = 80; // Maximum benchmark

  // Add getComment function for evaluation
  const getComment = (score: number) => {
    if (score >= 80) return "VERY SOLID";
    else if (score >= 70) return "SOLID";
    else if (score >= 60) return "MODERATELY SOLID";
    else if (score >= 50) return "MODERATELY WEAK";
    else if (score >= 40) return "WEAK";
    else return "VERY WEAK";
  };

  // Function to calculate the enrollment rate
  const calculateEnrollmentRate = async () => {
    if (!isLoaded || !user) {
      alert("User not authenticated. Please log in.");
      return;
    }
    const enrolled = parseFloat(enrolledPopulation);
    const ageRangePopulation = parseFloat(tertiaryAgePopulation);

    if (isNaN(enrolled) || isNaN(ageRangePopulation) || ageRangePopulation <= 0) {
      alert("Please provide valid inputs for the calculation.");
      return;
    }

    // Calculate enrollment rate
    let rate = (enrolled / ageRangePopulation) * 100;

    // Ensure the value is within the range of 0–100%
    if (rate > 100) {
      rate = 100;
    } else if (rate < 0) {
      rate = 0;
    }
    setEnrollmentRate(rate);

    // Standardize enrollment rate
    let standardized;
    if (rate >= maxBenchmark) {
      standardized = 100;
    } else if (rate <= minBenchmark) {
      standardized = 0;
    } else {
      standardized = 100 * ((rate - minBenchmark) / (maxBenchmark - minBenchmark));
    }
    setStandardizedRate(standardized);

    // Evaluate the decision based on the standardized score
    const evaluationComment = getComment(standardized);
    setDecision(evaluationComment);

    // Prepare data to send
    const postData = {
      net_enrollment_rate_in_higher_education: rate,
      net_enrollment_rate_in_higher_education_comment: evaluationComment, // Renamed for consistency
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
      <h1 className="text-2xl font-bold mb-4">
        Net Enrollment Rate in Higher Education
      </h1>
      <div className="mb-4">
        <label className="block mb-2 font-semibold">
          Population enrolled in tertiary education:
        </label>
        <input
          type="number"
          value={enrolledPopulation}
          onChange={(e) => setEnrolledPopulation(e.target.value)}
          className="border rounded p-2 w-full"
          placeholder="Enter number of enrolled people"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2 font-semibold">
          People that belong to the tertiary education age range:
        </label>
        <input
          type="number"
          value={tertiaryAgePopulation}
          onChange={(e) => setTertiaryAgePopulation(e.target.value)}
          className="border rounded p-2 w-full"
          placeholder="Enter number of people in the age range"
        />
      </div>
      <button
        onClick={calculateEnrollmentRate}
        disabled={isSubmitting}
        className={`p-2 bg-blue-500 text-white rounded w-full hover:bg-blue-600 transition ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isSubmitting ? 'Calculating and Saving...' : 'Calculate Enrollment Rate'}
      </button>
      {enrollmentRate !== null && (
        <div className="mt-4">
          <p className="text-xl font-bold">Enrollment Rate: {enrollmentRate.toFixed(2)}%</p>
          <p className="text-xl font-bold">Standardized Rate: {standardizedRate?.toFixed(2)}</p>
          {decision && (
            <p className="text-xl font-bold">
              Decision:{" "}
              <span
                className={`${
                  decision === "VERY SOLID"
                    ? "text-green-600"
                    : decision === "SOLID"
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {decision}
              </span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default HigherEducationEnrollmentCalculator;