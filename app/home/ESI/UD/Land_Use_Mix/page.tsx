"use client";
import React, { useState, useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { useCity } from "../../../../context/CityContext";
import toast from "react-hot-toast";
import { useTranslations } from 'next-intl';

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

const LandUseMix: React.FC = () => {
  const { user, isLoaded } = useUser();
  const { city, country, cityName } = useCity();
  const [landUseData, setLandUseData] = useState<number[][]>([]);
  const [numCategories, setNumCategories] = useState<string>("5");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [averageIndex, setAverageIndex] = useState<number | null>(null);
  const [comment, setComment] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actualLandUseMix, setActualLandUseMix] = useState<string | null>(null);
  const [standardizedScore, setStandardizedScore] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const tCommon = useTranslations('common');
  const tMix = useTranslations('landUseMix');

  // Function to get comment based on standardized score
  const getComment = (score: number) => {
    if (score >= 80) return "VERY HIGH DIVERSITY";
    else if (score >= 70) return "HIGH DIVERSITY";
    else if (score >= 60) return "MODERATE-HIGH DIVERSITY";
    else if (score >= 50) return "MODERATE DIVERSITY";
    else if (score >= 40) return "MODERATE-LOW DIVERSITY";
    else if (score >= 30) return "LOW DIVERSITY";
    else return "VERY LOW DIVERSITY";
  };

  // Function to calculate Shannon-Wiener Diversity Index
  const calculateShannonWienerIndex = (piValues: number[]) => {
    // Filter out zero or negative values to avoid ln(0) or ln(negative)
    const validValues = piValues.filter((pi) => pi > 0);
    
    if (validValues.length === 0) return 0;
    
    // Shannon-Wiener Diversity Index: H = -Σ(pi * ln(pi))
    return -validValues.reduce((sum, pi) => sum + pi * Math.log(pi), 0);
  };

  // Validate input data
  const validateLandUseData = (data: number[][]): string[] => {
    const errors: string[] = [];
    
    if (data.length === 0) {
      errors.push("No land use data provided");
      return errors;
    }

    data.forEach((cell, index) => {
      // Check if cell has values
      if (cell.length === 0 || cell.every(val => isNaN(val))) {
        errors.push(`Cell ${index + 1}: No valid values`);
        return;
      }

      // Check for negative values
      if (cell.some(val => val < 0)) {
        errors.push(`Cell ${index + 1}: Contains negative values`);
      }

      // Check if proportions sum to approximately 1 (with tolerance for rounding)
      const sum = cell.reduce((acc, val) => acc + val, 0);
      if (Math.abs(sum - 1.0) > 0.01) {
        errors.push(`Cell ${index + 1}: Proportions sum to ${sum.toFixed(3)}, should sum to 1.0`);
      }

      // Check if any value exceeds 1
      if (cell.some(val => val > 1)) {
        errors.push(`Cell ${index + 1}: Contains values greater than 1`);
      }
    });

    return errors;
  };

  // Function to calculate standardized land use mix score
  const calculateStandardizedLandUseMix = () => {
    const numCategoriesValue = parseInt(numCategories, 10);
    
    if (isNaN(numCategoriesValue) || numCategoriesValue <= 0) {
      toast.error("Please enter a valid number of land use categories (must be > 0)");
      return null;
    }

    if (landUseData.length === 0) {
      toast.error("Please enter land use data");
      return null;
    }

    // Validate data
    const errors = validateLandUseData(landUseData);
    if (errors.length > 0) {
      setValidationErrors(errors);
      toast.error("Please fix validation errors before calculating");
      return null;
    }
    
    setValidationErrors([]);

    // Calculate maximum possible diversity for the given number of categories
    const MAX_INDEX = Math.log(numCategoriesValue);

    // Calculate Shannon-Wiener Diversity Index for each cell
    const indices = landUseData.map((cellAreas) => calculateShannonWienerIndex(cellAreas));

    // Calculate average index across all cells
    const average = indices.reduce((sum, index) => sum + index, 0) / indices.length;
    setAverageIndex(average);

    // Standardize to 0-100 scale: (H / Hmax) * 100
    const standardizedValue = (average / MAX_INDEX) * 100;

    // Ensure standardized value doesn't exceed 100 due to rounding
    const finalStandardizedValue = Math.min(standardizedValue, 100);

    console.log('Average Shannon-Wiener Index:', average.toFixed(4));
    console.log('Maximum Possible Index:', MAX_INDEX.toFixed(4));
    console.log('Standardized Score:', finalStandardizedValue.toFixed(2));
    
    const calculatedComment = getComment(parseFloat(finalStandardizedValue.toFixed(2)));
    setComment(calculatedComment);

    // Set display values
    setActualLandUseMix(average.toFixed(4));
    setStandardizedScore(finalStandardizedValue.toFixed(2));

    return { average, standardizedValue: finalStandardizedValue, calculatedComment, maxIndex: MAX_INDEX };
  };

  // Load saved inputs on component mount
  useEffect(() => {
    const savedLandUse = localStorage.getItem("landUseData");
    const savedNumCategories = localStorage.getItem("numCategories");
    const savedActual = localStorage.getItem("actualLandUseMix");
    const savedStandardized = localStorage.getItem("standardizedScore");
    const savedComment = localStorage.getItem("comment");

    if (savedLandUse) {
      try {
        setLandUseData(JSON.parse(savedLandUse));
      } catch (e) {
        console.error("Error parsing saved land use data:", e);
      }
    }
    if (savedNumCategories) setNumCategories(savedNumCategories);
    if (savedActual) setActualLandUseMix(savedActual);
    if (savedStandardized) setStandardizedScore(savedStandardized);
    if (savedComment) setComment(savedComment);
  }, []);

  // Save inputs to memory on change
  const handleLandUseChange = (data: number[][]) => {
    setLandUseData(data);
    localStorage.setItem("landUseData", JSON.stringify(data));
  };

  const handleNumCategoriesChange = (value: string) => {
    setNumCategories(value);
    localStorage.setItem("numCategories", value);
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

    const calculationResult = calculateStandardizedLandUseMix();
    if (calculationResult === null) return;

    const { average, standardizedValue, calculatedComment } = calculationResult;

    // Save to localStorage
    localStorage.setItem("actualLandUseMix", average.toFixed(4));
    localStorage.setItem("standardizedScore", standardizedValue.toFixed(2));
    localStorage.setItem("comment", calculatedComment);

    try {
      setIsSubmitting(true);
      console.log("Submitting data...");

      const postData = {
        city,
        country,
        land_use_mix: average,
        land_use_mix_standardized: parseFloat(standardizedValue.toFixed(2)),
        land_use_mix_comment: calculatedComment,
        userId: user.id,
      };

      console.log("Post Data:", postData);

      const response = await fetch('/api/calculation-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      console.log("Response Status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Result:", result);

      toast.success("Data calculated and saved successfully!");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Error saving data:', errorMessage);
      toast.error("Failed to save data. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Prepare pie data
  const standardizedValue = standardizedScore ? parseFloat(standardizedScore) : 0;
  const pieData = [
    { name: 'Diversity Score', value: Number(standardizedValue.toFixed(2)) },
    { name: 'Remaining', value: Number((100 - standardizedValue).toFixed(2)) }
  ];

  if (!isLoaded) {
    return <div>{tCommon('loading')}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full bg-white shadow-2xl rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-green-600 p-6 text-white">
          <h2 className="text-3xl font-bold flex items-center">
            🏙️ {tMix('title')}
          </h2>
          <p className="mt-2 text-blue-100">{tMix('subtitle')}</p>
        </div>
        
        <div className="p-8">
          {/* Summary section */}
          <div className="mb-6">
            <button
              onClick={() => setShowSummary(!showSummary)}
              className="text-left w-full p-3 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition flex justify-between items-center"
              aria-expanded={showSummary}
              aria-controls="summary-panel"
            >
              <span className="font-semibold">📖 What is the Shannon-Wiener Diversity Index?</span>
              <span className="text-sm text-gray-600">{showSummary ? '▲ Hide' : '▼ Show'}</span>
            </button>

            {showSummary && (
              <div id="summary-panel" className="mt-3 p-4 bg-blue-50 border border-blue-100 rounded-md text-sm text-gray-700">
                <h4 className="font-semibold mb-2">About This Index</h4>
                <p className="mb-3">
                  The Shannon-Wiener Diversity Index (also called Shannon Entropy) measures the diversity of land uses in urban areas. 
                  It&apos;s widely used in urban planning to assess how mixed or diverse land uses are within a given area.
                </p>

                <h4 className="font-semibold mb-2">Formula</h4>
                <p className="font-mono bg-white p-2 rounded mb-3">
                  H = -Σ(p<sub>i</sub> × ln(p<sub>i</sub>))
                </p>
                <p className="mb-3">
                  Where p<sub>i</sub> is the proportion of each land use category, and the sum is over all categories with p<sub>i</sub> &gt; 0.
                </p>

                <h4 className="font-semibold mb-2">Standardization</h4>
                <p className="mb-3">
                  The raw index is standardized to a 0-100 scale using: <span className="font-mono">(H / H<sub>max</sub>) × 100</span><br/>
                  Where H<sub>max</sub> = ln(number of categories)
                </p>

                <h4 className="font-semibold mb-2">How to Use</h4>
                <ul className="list-disc list-inside mb-3 space-y-1">
                  <li>Enter the number of land use categories (e.g., 5 for: residential, commercial, industrial, recreational, institutional)</li>
                  <li>For each cell/grid unit, enter proportions separated by commas (e.g., 0.2,0.3,0.3,0.1,0.1)</li>
                  <li>Each cell&apos;s proportions must sum to 1.0</li>
                  <li>Use one line per cell</li>
                  <li>The calculator will compute the average diversity across all cells</li>
                </ul>

                <h4 className="font-semibold mb-2">Example</h4>
                <div className="bg-white p-3 rounded border">
                  <p className="mb-1"><strong>Number of categories:</strong> 5</p>
                  <p className="mb-1"><strong>Cell data:</strong></p>
                  <pre className="text-xs">0.2,0.2,0.2,0.2,0.2  (perfectly mixed)
0.6,0.1,0.1,0.1,0.1  (residential dominant)
0.3,0.3,0.2,0.1,0.1  (moderate mix)</pre>
                </div>
              </div>
            )}
          </div>

          {/* Display selected city */}
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

          {/* Validation errors */}
          {validationErrors.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
              <p className="font-semibold text-red-800 mb-2">❌ Validation Errors:</p>
              <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                {validationErrors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Number of categories input */}
          <div className="mb-6">
            <label className="block mb-3 font-semibold text-gray-700 flex items-center">
              🔢 {tMix('numCategoriesLabel')}
            </label>
            <input
              type="number"
              min="2"
              value={numCategories}
              onChange={(e) => handleNumCategoriesChange(e.target.value)}
              className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="e.g., 5 for residential, commercial, industrial, recreational, institutional"
            />
            <p className="text-xs text-gray-500 mt-1">
              Common values: 5 (basic categories), 8 (EPA standard), or custom based on your data
            </p>
          </div>

          {/* Land use data input */}
          <div className="mb-6">
            <label className="block mb-3 font-semibold text-gray-700 flex items-center">
              📊 {tMix('inputLabel')}
            </label>
            <textarea
              rows={6}
              className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition font-mono text-sm"
              onChange={(e) => {
                const lines = e.target.value.split("\n").filter(line => line.trim());
                const data = lines.map((line) =>
                  line.split(",").map((val) => parseFloat(val.trim())).filter(val => !isNaN(val))
                );
                handleLandUseChange(data);
              }}
              placeholder="Enter one cell per line, comma-separated proportions&#10;Example:&#10;0.2,0.2,0.2,0.2,0.2&#10;0.4,0.3,0.2,0.05,0.05&#10;0.3,0.3,0.2,0.1,0.1"
            />
            <p className="text-xs text-gray-500 mt-1">
              ⚠️ Each line represents one cell. Proportions must sum to 1.0 per cell.
            </p>
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
                {tMix('calculatingAndSaving')}
              </>
            ) : (
              <>🚀 {tMix('calculateAndSave')}</>
            )}
          </button>
          
          {/* Results display */}
          {comment && actualLandUseMix && standardizedScore && (
            <div className="mt-8 p-6 bg-gray-50 rounded-lg border">
              <h3 className="text-xl font-bold mb-4 text-gray-800">📈 Calculation Results</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="text-sm text-gray-600 mb-1">Shannon-Wiener Index</h4>
                    <p className="text-2xl font-bold text-blue-600">
                      {actualLandUseMix}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Raw diversity score
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="text-sm text-gray-600 mb-1">Standardized Score</h4>
                    <p className="text-2xl font-bold text-green-600">
                      {standardizedScore}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      0-100 scale
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="text-sm text-gray-600 mb-1">Max Possible</h4>
                    <p className="text-2xl font-bold text-gray-600">
                      {Math.log(parseInt(numCategories)).toFixed(4)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      ln({numCategories}) categories
                    </p>
                  </div>
                </div>

                <div className={`p-4 text-center font-bold text-white rounded-lg text-lg ${
                  parseFloat(standardizedScore) >= 70
                    ? "bg-gradient-to-r from-green-500 to-green-600"
                    : parseFloat(standardizedScore) >= 50
                    ? "bg-gradient-to-r from-yellow-500 to-yellow-600"
                    : "bg-gradient-to-r from-orange-500 to-red-600"
                }`}>
                  {comment}
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="w-full h-64">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 text-center">Standardized Score</h4>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Your Score', value: parseFloat(standardizedScore) }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill={COLORS[0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="w-full h-64">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 text-center">Diversity Distribution</h4>
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

export default LandUseMix;