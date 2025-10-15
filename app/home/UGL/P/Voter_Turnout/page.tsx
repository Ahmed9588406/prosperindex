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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white shadow-2xl rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-green-600 p-6 text-white">
          <h2 className="text-3xl font-bold flex items-center">
            🗳️ Voter Turnout
          </h2>
          <p className="mt-2 text-blue-100">Assess and save your city&apos;s voter turnout data</p>
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
            <label className="block mb-3 font-semibold text-gray-700 flex items-center">
              🗳️ Voters Who Cast a Ballot:
            </label>
            <input
              type="number"
              value={votersWhoCastBallot}
              onChange={(e) => handleCastChange(e.target.value)}
              className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Enter number of voters who cast a ballot"
            />
          </div>

          <div className="mb-6">
            <label className="block mb-3 font-semibold text-gray-700 flex items-center">
              👥 Number of Eligible Voters:
            </label>
            <input
              type="number"
              value={eligibleVoters}
              onChange={(e) => handleEligibleChange(e.target.value)}
              className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Enter number of eligible voters"
            />
          </div>
          
          <button
            onClick={calculateAndSave}
            disabled={isSubmitting || !city || !country}
            className={`w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-green-600 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center`}
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
          
          {turnoutLevel && (
            <div className="mt-8 p-6 bg-gray-50 rounded-lg border">
              <div className={`p-4 text-center font-bold text-white rounded-lg transition ${
                turnoutLevel === "VERY SOLID"
                  ? "bg-gradient-to-r from-green-400 to-green-600"
                  : turnoutLevel === "SOLID"
                  ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                  : "bg-gradient-to-r from-red-400 to-red-600"
              }`}>
                {turnoutLevel}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoterTurnout;