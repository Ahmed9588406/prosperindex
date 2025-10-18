"use client";
import React, { useState, useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { useCity } from "../../../../context/CityContext";
import toast from "react-hot-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CO2Emissions: React.FC = () => {
  const { user, isLoaded } = useUser();
  const { city, country, cityName } = useCity();
  const [co2Emissions, setCo2Emissions] = useState<number | string>("");
  const [comment, setComment] = useState<string | null>(null);
  const [score, setScore] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const BENCHMARK = 0.39;
  const CRITICAL = 2.09;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCo2 = localStorage.getItem("co2Emissions");
      if (savedCo2) setCo2Emissions(savedCo2);
    }
  }, []);

  const handleCo2Change = (value: string) => {
    setCo2Emissions(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("co2Emissions", value);
    }
  };

  const calculateCO2Score = () => {
    if (!co2Emissions || parseFloat(co2Emissions.toString()) < 0) {
      toast.error("Please enter a valid CO₂ emissions value (greater than or equal to 0).");
      return null;
    }
    const co2Value = parseFloat(co2Emissions.toString());
    const fifthRootEmissions = Math.pow(co2Value, 1 / 5);
    let standardizedValue = 0;

    if (fifthRootEmissions >= CRITICAL) {
      standardizedValue = 0;
    } else if (fifthRootEmissions > BENCHMARK && fifthRootEmissions < CRITICAL) {
      standardizedValue =
        100 *
        (1 - Math.abs((fifthRootEmissions - BENCHMARK) / (CRITICAL - BENCHMARK)));
    } else if (fifthRootEmissions <= BENCHMARK) {
      standardizedValue = 100;
    }

    const scoreNum = standardizedValue.toFixed(2);
    const calculatedComment = getComment(parseFloat(scoreNum));
    setComment(calculatedComment);
    setScore(scoreNum);
    return { scoreNum, calculatedComment };
  };

  const getComment = (score: number) => {
    if (score >= 80) return "VERY SOLID";
    else if (score >= 70) return "SOLID";
    else if (score >= 60) return "MODERATELY SOLID";
    else if (score >= 50) return "MODERATELY WEAK";
    else if (score >= 40) return "WEAK";
    else return "VERY WEAK";
  };

  const handleCalculateAndSave = async () => {
    if (!user) {
      toast.error("Please sign in to save calculations.");
      return;
    }

    if (!city || !country) {
      toast.error("Please select a city from the cities page first.");
      return;
    }

    const calculationResult = calculateCO2Score();
    if (calculationResult === null) return;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { scoreNum, calculatedComment } = calculationResult;
    const co2Value = parseFloat(co2Emissions.toString());

    try {
      setIsSubmitting(true);
      const postData = {
        city,
        country,
        co2_emissions: co2Value, // Post the raw CO2 emissions
        co2_emissions_standardized: parseFloat(scoreNum), // Post the standardized score
        co2_emissions_comment: calculatedComment, // Use the calculated comment
        userId: user.id
      };
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const result = await response.json();
      toast.success("Data calculated and saved successfully!");
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
            🌿 CO₂ Emissions Evaluation
          </h2>
          <p className="mt-2 text-blue-100">Assess and save your city&apos;s CO₂ emissions data</p>
        </div>

        <div className="p-8">
          {/* Summary Section */}
          <div className="mb-6 p-4 bg-green-100 border-l-4 border-green-400 rounded-r-lg">
            <h3 className="text-lg font-semibold mb-2">About the CO₂ Emissions Index</h3>
            <p className="text-sm text-gray-700 mb-1">
              This index provides a simplified environmental performance score based on the total CO₂ emissions input for your city. It uses a scaled mathematical transformation to assign a score from 0 (high emissions) to 100 (low emissions), helping highlight relative air quality impact.
            </p>
            <p className="text-sm text-gray-700 mb-3">
              Official carbon intensity indices often normalize emissions relative to economic activity for detailed analysis. This index is a custom tool intended for easy interpretation and awareness.
            </p>
            <p className="text-sm text-gray-700 mb-2">
              Enter your city&apos;s total CO₂ emissions in metric tonnes. The score reflects environmental performance, where higher scores mean better air quality.
            </p>
            <p className="text-sm text-gray-700">
              Please enter a valid, non-negative number for accurate results.
            </p>
          </div>

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
              📊 CO₂ Emissions (metric tonnes):
            </label>
            <input
              type="number"
              value={co2Emissions}
              onChange={(e) => handleCo2Change(e.target.value)}
              className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Enter CO₂ emissions"
              min="0"
            />
          </div>

          <button
            onClick={handleCalculateAndSave}
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

          {comment && score && (
            <div className="mt-8 p-6 bg-gray-50 rounded-lg border">
              <p className="text-center font-semibold text-gray-800 mb-2">CO₂ Emissions: {co2Emissions} metric tonnes</p>
              <p className="text-center font-semibold text-gray-800 mb-4">Standardized Score: {score}%</p>
              <div className="mb-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[{ name: 'CO₂ Score', score: parseFloat(score) }]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="score" fill="#4CAF50" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
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

export default CO2Emissions;
