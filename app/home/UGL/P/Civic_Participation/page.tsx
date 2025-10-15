"use client";
import React, { useState, useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { useCity } from "../../../../context/CityContext";
import toast from "react-hot-toast";

const CivicParticipation: React.FC = () => {
  const { user, isLoaded } = useUser();
  const { city, country, cityName } = useCity();
  const [engagedPeople, setEngagedPeople] = useState<number | string>("");
  const [adultPeople, setAdultPeople] = useState<number | string>("");
  const [participationRate, setParticipationRate] = useState<number | null>(null);
  const [engagementLevel, setEngagementLevel] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

  // Load saved inputs on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedEngaged = localStorage.getItem("engagedPeople");
      const savedAdult = localStorage.getItem("adultPeople");

      if (savedEngaged) setEngagedPeople(savedEngaged);
      if (savedAdult) setAdultPeople(savedAdult);
    }
  }, []);

  // Save inputs to localStorage on change
  const handleEngagedChange = (value: string) => {
    setEngagedPeople(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("engagedPeople", value);
    }
  };

  const handleAdultChange = (value: string) => {
    setAdultPeople(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("adultPeople", value);
    }
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

    const engaged = parseFloat(engagedPeople.toString());
    const adults = parseFloat(adultPeople.toString());

    if (isNaN(engaged) || isNaN(adults) || adults <= 0) {
      toast.error("Please provide valid inputs for both fields.");
      return;
    }

    // Calculate participation rate
    const rate = (engaged / adults) * 100;
    setParticipationRate(rate);

    // Evaluate the decision based on the standardized score
    const evaluationComment = getComment(rate);
    setEngagementLevel(evaluationComment);

    // Prepare data to send - now includes city and country
    const postData = {
      city,
      country,
      civic_participation: rate,
      civic_participation_comment: evaluationComment, // Renamed for consistency
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
      <h1 className="text-2xl font-bold mb-6 text-center">Civic Participation Indicator</h1>

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

      <div className="mb-6">
        <label className="block mb-3 text-lg font-semibold">
          People Engaged in Civic Associations:
        </label>
        <input
          type="number"
          value={engagedPeople}
          onChange={(e) => handleEngagedChange(e.target.value)}
          className="border rounded p-2 w-full"
          placeholder="Enter the number of engaged people"
        />
      </div>
      <div className="mb-6">
        <label className="block mb-3 text-lg font-semibold">
          Total Adult Population in the City:
        </label>
        <input
          type="number"
          value={adultPeople}
          onChange={(e) => handleAdultChange(e.target.value)}
          className="border rounded p-2 w-full"
          placeholder="Enter the total adult population"
        />
      </div>
      <button
        onClick={calculateAndSave}
        disabled={isSubmitting || !city || !country}
        className={`p-4 bg-blue-600 text-white rounded-lg w-full text-xl hover:bg-blue-700 transition ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isSubmitting ? 'Calculating and Saving...' : 'Calculate Civic Participation'}
      </button>
      {participationRate !== null && (
        <div className="mt-8 p-6 bg-gray-100 rounded-lg shadow-inner">
          <h2 className="text-xl font-semibold mb-4">
            Civic Participation Rate: {participationRate.toFixed(2)}%
          </h2>
          {engagementLevel && (
            <p
              className={`mt-4 p-2 text-center font-bold text-white rounded-md ${
                engagementLevel === "VERY SOLID"
                  ? "bg-green-500"
                  : engagementLevel === "SOLID"
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
            >
              {engagementLevel}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CivicParticipation;