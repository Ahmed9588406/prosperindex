"use client";
import React, { useState, useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { useCity } from "../../../../context/CityContext";
import toast from "react-hot-toast";

const AccessToPublicInfo: React.FC = () => {
  const { user, isLoaded } = useUser();
  const { city, country, cityName } = useCity();
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const totalElements = 10; // Total number of elements to check
  const [accessScore, setAccessScore] = useState<number | null>(null);
  const [transparencyLevel, setTransparencyLevel] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

  // Load saved inputs on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSelected = localStorage.getItem("selectedElements");
      if (savedSelected) setSelectedElements(JSON.parse(savedSelected));
    }
  }, []);

  // Save inputs to localStorage on change
  const handleCheckboxChange = (element: string) => {
    setSelectedElements((prev) => {
      const newSelected = prev.includes(element)
        ? prev.filter((item) => item !== element)
        : [...prev, element];
      if (typeof window !== "undefined") {
        localStorage.setItem("selectedElements", JSON.stringify(newSelected));
      }
      return newSelected;
    });
  };

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
    if (!user) {
      toast.error("Please sign in to save calculations.");
      return;
    }

    if (!city || !country) {
      toast.error("Please select a city from the cities page first.");
      return;
    }

    const numberOfSelected = selectedElements.length;
    const score = (numberOfSelected / totalElements) * 100;
    setAccessScore(score);

    // Evaluate the decision based on the standardized score
    const evaluationComment = getComment(score);
    setTransparencyLevel(evaluationComment);

    // Prepare data to send - now includes city and country
    const postData = {
      city,
      country,
      access_to_public_information: score,
      access_to_public_information_comment: evaluationComment, // Renamed for consistency
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
      <h2 className="text-2xl font-bold mb-4">Access to Local Public Information</h2>

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

      <p className="mb-4">
        Does the E-government website possess the following elements? Select all that apply:
      </p>
      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-2">
        {[
          "Budgets and spending",
          "Senior salaries",
          "Organizational chart",
          "Copies of contracts and tenders",
          "Access to statistics",
          "Posting public notices on meetings, resolution, etc.",
          "Local reporting complaints, concerns, and emergencies",
          "Results of local elections",
          "Tax information",
          "Open tendering procedures",
        ].map((element, index) => (
          <label key={index} className="flex items-center">
            <input
              type="checkbox"
              checked={selectedElements.includes(element)}
              onChange={() => handleCheckboxChange(element)}
              className="mr-2"
            />
            {element}
          </label>
        ))}
      </div>
      <button
        onClick={calculateAndSave}
        disabled={isSubmitting || !city || !country}
        className={`p-4 bg-blue-600 text-white rounded-lg w-full text-xl hover:bg-blue-700 transition ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isSubmitting ? 'Calculating and Saving...' : 'Calculate Access Score'}
      </button>
      {accessScore !== null && (
        <div className="mt-8 p-6 bg-gray-100 rounded-lg shadow-inner">
          <h2 className="text-xl font-semibold mb-4">
            Access Score: {accessScore.toFixed(2)}%
          </h2>
          {transparencyLevel && (
            <p
              className={`mt-4 p-2 text-center font-bold text-white rounded-md ${
                transparencyLevel === "VERY SOLID"
                  ? "bg-green-500"
                  : transparencyLevel === "SOLID"
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
            >
              {transparencyLevel}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default AccessToPublicInfo;