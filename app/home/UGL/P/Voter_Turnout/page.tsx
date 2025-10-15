"use client";
import React, { useState, useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { useCity } from "../../../../context/CityContext";
import toast from "react-hot-toast";

const VoterTurnout: React.FC = () => {
  const { user, isLoaded } = useUser();
  const { city, country, cityName } = useCity();
  const [votersWhoCastBallot, setVotersWhoCastBallot] = useState<number | string>(""); // Input for voters who cast a ballot
  const [eligibleVoters, setEligibleVoters] = useState<number | string>(""); // Input for number of eligible voters
  const [voterTurnout, setVoterTurnout] = useState<number | null>(null);
  const [turnoutLevel, setTurnoutLevel] = useState<string | null>(null); // Qualitative evaluation
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

  // Load saved inputs on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCast = localStorage.getItem("votersWhoCastBallot");
      const savedEligible = localStorage.getItem("eligibleVoters");

      if (savedCast) setVotersWhoCastBallot(savedCast);
      if (savedEligible) setEligibleVoters(savedEligible);
    }
  }, []);

  // Save inputs to localStorage on change
  const handleCastChange = (value: string) => {
    setVotersWhoCastBallot(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("votersWhoCastBallot", value);
    }
  };

  const handleEligibleChange = (value: string) => {
    setEligibleVoters(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("eligibleVoters", value);
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

    const castBallot = parseFloat(votersWhoCastBallot.toString());
    const eligible = parseFloat(eligibleVoters.toString());

    if (isNaN(castBallot) || isNaN(eligible) || eligible <= 0 || castBallot < 0 || castBallot > eligible) {
      toast.error("Please provide valid inputs for both fields.");
      return;
    }

    // Calculate voter turnout
    const turnout = (castBallot / eligible) * 100;
    setVoterTurnout(turnout);

    // Evaluate the decision based on the standardized score
    const evaluationComment = getComment(turnout);
    setTurnoutLevel(evaluationComment);

    // Prepare data to send - now includes city and country
    const postData = {
      city,
      country,
      voter_turnout: turnout,
      voter_turnout_comment: evaluationComment, // Renamed for consistency
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
      <h1 className="text-2xl font-bold mb-6 text-center">Voter Turnout Calculator</h1>

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
          Voters Who Cast a Ballot:
        </label>
        <input
          type="number"
          value={votersWhoCastBallot}
          onChange={(e) => handleCastChange(e.target.value)}
          className="border rounded p-2 w-full"
          placeholder="Enter number of voters who cast a ballot"
        />
      </div>
      <div className="mb-6">
        <label className="block mb-3 text-lg font-semibold">
          Number of Eligible Voters:
        </label>
        <input
          type="number"
          value={eligibleVoters}
          onChange={(e) => handleEligibleChange(e.target.value)}
          className="border rounded p-2 w-full"
          placeholder="Enter number of eligible voters"
        />
      </div>
      <button
        onClick={calculateAndSave}
        disabled={isSubmitting || !city || !country}
        className={`p-4 bg-blue-600 text-white rounded-lg w-full text-xl hover:bg-blue-700 transition ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isSubmitting ? 'Calculating and Saving...' : 'Calculate Voter Turnout'}
      </button>
      {voterTurnout !== null && (
        <div className="mt-8 p-6 bg-gray-100 rounded-lg shadow-inner">
          <h2 className="text-xl font-semibold mb-4">
            Voter Turnout: {voterTurnout.toFixed(2)}%
          </h2>
          {turnoutLevel && (
            <p
              className={`mt-4 p-2 text-center font-bold text-white rounded-md ${
                turnoutLevel === "VERY SOLID"
                  ? "bg-green-500"
                  : turnoutLevel === "SOLID"
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
            >
              {turnoutLevel}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default VoterTurnout;