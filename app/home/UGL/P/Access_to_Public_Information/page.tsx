"use client";
import React, { useState, useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { useCity } from "../../../../context/CityContext";
import toast from "react-hot-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ["#6ee7b7", "#e6e6e6"];

const AccessToPublicInfo: React.FC = () => {
  const { user, isLoaded } = useUser();
  const { city, country, cityName } = useCity();
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const totalElements = 10; // Total number of elements to check
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [accessScore, setAccessScore] = useState<number | null>(null);
  const [transparencyLevel, setTransparencyLevel] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

  // New states for raw access score and standardized score (for display and charts)
  const [actualAccess, setActualAccess] = useState<string | null>(null);
  const [standardizedScore, setStandardizedScore] = useState<string | null>(null);

  // New state to toggle the summary/help panel
  const [showSummary, setShowSummary] = useState(false);

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

    // Set new states for display and charts
    setActualAccess(score.toFixed(2));
    setStandardizedScore(score.toFixed(2)); // Since it's already 0-100, use as is

    // Prepare data to send - now includes city and country
    const postData = {
      city,
      country,
      access_to_public_information: score,
      access_to_public_information_standardized: parseFloat(score.toFixed(2)),
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

  // Prepare pie data (standardized value + remainder)
  const standardizedValue = standardizedScore ? parseFloat(standardizedScore) : 0;
  const pieData = [
    { name: 'Standardized', value: Number(standardizedValue.toFixed(2)) },
    { name: 'Remaining', value: Number((100 - standardizedValue).toFixed(2)) }
  ];

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-white shadow-2xl rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-green-600 p-6 text-white">
          <h2 className="text-3xl font-bold flex items-center">
            📄 Access to Public Information
          </h2>
          <p className="mt-2 text-blue-100">Assess and save your city&apos;s public information access data</p>
        </div>
        
        <div className="p-8">
          {/* Summary / About this index section (collapsible) */}
          <div className="mb-4">
            <button
              onClick={() => setShowSummary(!showSummary)}
              className="text-left w-full p-3 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition flex justify-between items-center"
              aria-expanded={showSummary}
              aria-controls="summary-panel"
            >
              <span className="font-semibold">What is this index?</span>
              <span className="text-sm text-gray-600">{showSummary ? 'Hide' : 'Show'}</span>
            </button>

            {showSummary && (
              <div id="summary-panel" className="mt-3 p-4 bg-blue-50 border border-blue-100 rounded-md text-sm text-gray-700">
                <p className="mb-2">
                  Access to Public Information measures the availability of key government data on the e-government website.
                  This tool calculates the raw access score from the checkboxes you select and converts it into a standardized 0–100 score.
                </p>
                <p className="font-mono mb-2">Access Score (raw) = (Selected Elements / Total Elements) * 100%</p>
                <p className="mb-2">
                  Standardized score is the same as raw score (0–100) so higher access → higher score.
                </p>

                <h4 className="font-semibold mt-2 mb-1">What to enter</h4>
                <ul className="list-disc list-inside mb-2">
                  <li>Check all elements present on the city&apos;s e-government website.</li>
                  <li>There are 10 elements in total.</li>
                  <li>All selections are optional.</li>
                </ul>

                <h4 className="font-semibold mt-2 mb-1">Tips for meaningful results</h4>
                <ul className="list-disc list-inside">
                  <li>Visit the official city website to verify availability.</li>
                  <li>For comparisons, use the same website version or time.</li>
                  <li>You can save the result to your calculation history (requires sign in and selected city).</li>
                </ul>
              </div>
            )}
          </div>

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
            <p className="mb-4">
              Does the E-government website possess the following elements? Select all that apply:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
              ].map((element: string, index: number) => (
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
          
          {transparencyLevel && actualAccess && standardizedScore && (
            <div className="mt-8 p-6 bg-gray-50 rounded-lg border">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg">Actual Access Score</h3>
                    <p className="text-2xl font-bold text-gray-800">
                      {actualAccess}%
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg">Standardized Access Score</h3>
                    <p className="text-2xl font-bold text-gray-800">
                      {standardizedScore}%
                    </p>
                  </div>
                </div>

                <div className={`p-4 text-center font-bold text-white rounded-lg transition ${
                  transparencyLevel === "VERY SOLID"
                    ? "bg-gradient-to-r from-green-400 to-green-600"
                    : transparencyLevel === "SOLID"
                    ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                    : "bg-gradient-to-r from-red-400 to-red-600"
                }`}>
                  {transparencyLevel}
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Standardized', value: parseFloat(standardizedScore) }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill={COLORS[0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="w-full h-64 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                          label={(entry) => `${entry.name}: ${entry.value}%`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccessToPublicInfo;