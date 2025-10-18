"use client";

import React, { useState, useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { useCity } from "../../../../context/CityContext";
import toast from "react-hot-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PM25Concentration: React.FC = () => {
  const { user, isLoaded } = useUser();
  const { city, country, cityName } = useCity();
  const [pm25Concentration, setPm25Concentration] = useState<number | string>("");
  const [comment, setComment] = useState<string | null>(null);
  const [score, setScore] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const BENCHMARK = 10;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPm25 = localStorage.getItem("pm25Concentration");
      if (savedPm25) setPm25Concentration(savedPm25);
    }
  }, []);

  const handlePm25Change = (value: string) => {
    setPm25Concentration(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("pm25Concentration", value);
    }
  };

  const getComment = (score: number) => {
    if (score >= 80) return "VERY SOLID";
    else if (score >= 70) return "SOLID";
    else if (score >= 60) return "MODERATELY SOLID";
    else if (score >= 50) return "MODERATELY WEAK";
    else if (score >= 40) return "WEAK";
    else return "VERY WEAK";
  };

  const calculatePM25Score = () => {
    if (!pm25Concentration || parseFloat(pm25Concentration.toString()) < 0) {
      toast.error("Please enter a valid PM2.5 concentration (greater than or equal to 0).");
      return null;
    }

    const pm25Value = parseFloat(pm25Concentration.toString());

    let standardizedValue = 0;

    if (pm25Value >= 20) {
      standardizedValue = 0;
    } else if (pm25Value >= 10 && pm25Value < 20) {
      standardizedValue = 100 * (1 - (pm25Value - BENCHMARK) / 10); // simplified without absolute value
    } else if (pm25Value <= 10) {
      standardizedValue = 100;
    }

    const scoreNum = standardizedValue.toFixed(2);
    const calculatedComment = getComment(parseFloat(scoreNum));
    setComment(calculatedComment);
    setScore(scoreNum);
    return { scoreNum, calculatedComment };
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

    const calculationResult = calculatePM25Score();
    if (calculationResult === null) return;

    const { scoreNum, calculatedComment } = calculationResult;
    const pm25Value = parseFloat(pm25Concentration.toString());

    try {
      setIsSubmitting(true);

      const postData = {
        city,
        country,
        pm25_concentration: pm25Value,
        pm25_concentration_standardized: parseFloat(scoreNum), // Add the standardized score
        pm25_concentration_comment: calculatedComment,
        userId: user.id,
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

      const result = await response.json();
      toast.success("Data calculated and saved successfully!");
      console.log('Result:', result);
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
            🌫️ PM2.5 Concentration Evaluation
          </h2>
          <p className="mt-2 text-blue-100">Assess and save your city&apos;s PM2.5 concentration data</p>
        </div>

        <div className="p-8">
          {/* Summary Section */}
          <div className="mb-6 p-4 bg-green-100 border-l-4 border-green-400 rounded-r-lg">
            <h3 className="text-lg font-semibold mb-2">About the PM2.5 Concentration Index</h3>
            <p className="text-sm text-gray-700 mb-1">
              This index provides a simplified environmental score based on your city&apos;s PM2.5 concentration (μg/m³). It assigns a score from 0 to 100, where 100 indicates excellent air quality (≤10 μg/m³), and lower scores indicate poorer air quality.
            </p>
            <p className="text-sm text-gray-700 mb-2">
              The scoring uses recognized benchmark thresholds consistent with major air quality guidelines. Concentrations above 20 μg/m³ receive a score of zero, highlighting high pollution levels.
            </p>
            <p className="text-sm text-gray-700 mb-2">
              Please enter your city’s average PM2.5 concentration accurately for meaningful results.
            </p>
            <p className="text-sm text-gray-700">
              This index is a custom tool designed for easy user interpretation and awareness, not a replacement for official air quality indices.
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
            <label htmlFor="pm25Concentration" className="block mb-3 font-semibold text-gray-700 flex items-center">
              📊 PM2.5 Concentration (μg/m³):
            </label>
            <input
              id="pm25Concentration"
              type="number"
              value={pm25Concentration}
              onChange={(e) => handlePm25Change(e.target.value)}
              className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Enter PM2.5 concentration"
              aria-label="Enter PM2.5 concentration"
              min="0"
            />
          </div>

          <button
            onClick={handleCalculateAndSave}
            disabled={isSubmitting || !city || !country}
            className={`w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-green-600 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center`}
            aria-label="Calculate and Save"
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
              <p className="text-center font-semibold text-gray-800 mb-2">PM2.5 Concentration: {pm25Concentration} μg/m³</p>
              <p className="text-center font-semibold text-gray-800 mb-4">Standardized Score: {score}%</p>
              <div className="mb-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[{ name: 'PM2.5 Score', score: parseFloat(score) }]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="score" fill="#FF9800" />
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

export default PM25Concentration;
