"use client";
import React, { useState, useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { useCity } from "../../../../context/CityContext";
import toast from "react-hot-toast";

const EquitableSecondarySchoolEnrollment: React.FC = () => {
  const { user, isLoaded } = useUser();
  const { city, country, cityName } = useCity();
  const [femaleEnrollment, setFemaleEnrollment] = useState<string>(""); // Input: Female enrollment in secondary school
  const [femaleAgeRange, setFemaleAgeRange] = useState<string>(""); // Input: Female secondary education age range
  const [maleEnrollment, setMaleEnrollment] = useState<string>(""); // Input: Male enrollment in secondary school
  const [maleAgeRange, setMaleAgeRange] = useState<string>(""); // Input: Male secondary education age range
  const [standardizedRate, setStandardizedRate] = useState<string | null>(null); // Standardized rate
  const [comment, setComment] = useState<string | null>(null); // Comment based on score
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

  // Load saved inputs on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedFemaleEnroll = localStorage.getItem("femaleEnrollment");
      const savedFemaleAge = localStorage.getItem("femaleAgeRange");
      const savedMaleEnroll = localStorage.getItem("maleEnrollment");
      const savedMaleAge = localStorage.getItem("maleAgeRange");

      if (savedFemaleEnroll) setFemaleEnrollment(savedFemaleEnroll);
      if (savedFemaleAge) setFemaleAgeRange(savedFemaleAge);
      if (savedMaleEnroll) setMaleEnrollment(savedMaleEnroll);
      if (savedMaleAge) setMaleAgeRange(savedMaleAge);
    }
  }, []);

  // Save inputs to localStorage on change
  const handleFemaleEnrollChange = (value: string) => {
    setFemaleEnrollment(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("femaleEnrollment", value);
    }
  };

  const handleFemaleAgeChange = (value: string) => {
    setFemaleAgeRange(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("femaleAgeRange", value);
    }
  };

  const handleMaleEnrollChange = (value: string) => {
    setMaleEnrollment(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("maleEnrollment", value);
    }
  };

  const handleMaleAgeChange = (value: string) => {
    setMaleAgeRange(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("maleAgeRange", value);
    }
  };

  // Benchmark
  const BENCHMARK = 1; // X* = 1

  // Function to get comment based on standardized score
  const getComment = (score: number) => {
    if (score >= 80) return "VERY SOLID";
    else if (score >= 70) return "SOLID";
    else if (score >= 60) return "MODERATELY SOLID";
    else if (score >= 50) return "MODERATELY WEAK";
    else if (score >= 40) return "WEAK";
    else return "VERY WEAK";
  };

  // Function to calculate standardized equitable secondary school enrollment
  const calculateStandardizedEnrollment = () => {
    // Convert inputs to numbers
    const femaleEnrollmentNum = parseFloat(femaleEnrollment);
    const femaleAgeRangeNum = parseFloat(femaleAgeRange);
    const maleEnrollmentNum = parseFloat(maleEnrollment);
    const maleAgeRangeNum = parseFloat(maleAgeRange);

    // Validate inputs
    if (
      isNaN(femaleEnrollmentNum) ||
      isNaN(femaleAgeRangeNum) ||
      isNaN(maleEnrollmentNum) ||
      isNaN(maleAgeRangeNum)
    ) {
      toast.error("All inputs must be valid numbers.");
      return null;
    }
    if (femaleAgeRangeNum <= 0 || maleAgeRangeNum <= 0) {
      toast.error("Age range values must be greater than zero.");
      return null;
    }

    // Equitable Secondary School Enrollment formula
    const equitableEnrollment =
      (femaleEnrollmentNum / femaleAgeRangeNum) /
      (maleEnrollmentNum / maleAgeRangeNum);

    // Standardized formula with absolute value
    const standardizedEnrollment =
      100 * (1 - Math.abs((equitableEnrollment - BENCHMARK) / BENCHMARK));

    // Decision logic
    let standardizedRateValue: number = 0;

    if (equitableEnrollment === 0 || equitableEnrollment >= 2 * BENCHMARK) {
      standardizedRateValue = 0;
    } else if (equitableEnrollment > 0 && equitableEnrollment < 2 * BENCHMARK) {
      standardizedRateValue = standardizedEnrollment;
    } else if (equitableEnrollment === BENCHMARK) {
      standardizedRateValue = 100;
    }

    const scoreNum = standardizedRateValue.toFixed(2); // Limit to 2 decimal places
    setStandardizedRate(scoreNum);
    const calculatedComment = getComment(parseFloat(scoreNum));
    setComment(calculatedComment); // Set comment based on score
    console.log('Calculated Score:', scoreNum, 'Calculated Comment:', calculatedComment);
    return { equitableEnrollment, scoreNum, calculatedComment };
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

    const calculationResult = calculateStandardizedEnrollment();
    if (calculationResult === null) return; // Exit if calculation fails

    const { equitableEnrollment, calculatedComment } = calculationResult;

    try {
      setIsSubmitting(true); // Start loading
      console.log("Submitting data...");

      const postData = {
        city,
        country,
        equitable_secondary_school_enrollment: equitableEnrollment, // Post the equitable enrollment value
        equitable_secondary_school_enrollment_comment: calculatedComment, // Use the calculated comment
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
      <h2 className="text-2xl font-bold mb-4">Equitable Secondary School Enrollment</h2>

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
          Female Enrollment in Secondary School:
        </label>
        <input
          type="number"
          value={femaleEnrollment}
          onChange={(e) => handleFemaleEnrollChange(e.target.value)}
          className="border rounded p-2 w-full"
          placeholder="Enter female enrollment"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2 font-semibold">Female Age Range (Secondary Education):</label>
        <input
          type="number"
          value={femaleAgeRange}
          onChange={(e) => handleFemaleAgeChange(e.target.value)}
          className="border rounded p-2 w-full"
          placeholder="Enter female age range"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2 font-semibold">
          Male Enrollment in Secondary School:
        </label>
        <input
          type="number"
          value={maleEnrollment}
          onChange={(e) => handleMaleEnrollChange(e.target.value)}
          className="border rounded p-2 w-full"
          placeholder="Enter male enrollment"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2 font-semibold">Male Age Range (Secondary Education):</label>
        <input
          type="number"
          value={maleAgeRange}
          onChange={(e) => handleMaleAgeChange(e.target.value)}
          className="border rounded p-2 w-full"
          placeholder="Enter male age range"
        />
      </div>

      <button
        onClick={handleCalculateAndSave}
        disabled={isSubmitting || !city || !country}
        className={`p-2 bg-blue-500 text-white rounded w-full hover:bg-blue-600 transition ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isSubmitting ? 'Calculating and Saving...' : 'Calculate Standardized Rate'}
      </button>

      {standardizedRate !== null && comment !== null && (
        <div className="mt-4">
          <h3 className="text-lg">
            Standardized Equitable Secondary Enrollment: <span className="font-bold">{standardizedRate}%</span>
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

export default EquitableSecondarySchoolEnrollment;