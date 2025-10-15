"use client";
import React, { useState, useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { useCity } from "../../../../context/CityContext";
import toast from "react-hot-toast"; // Import the toast function

const CityProductPerCapitaPage: React.FC = () => {
  const { user, isLoaded } = useUser();
  const { city, country, cityName } = useCity();
  const [nationalProduct, setNationalProduct] = useState<number[]>(Array(7).fill(0));
  const [nationalEmployment, setNationalEmployment] = useState<number[]>(Array(7).fill(0));
  const [cityEmployment, setCityEmployment] = useState<number[]>(Array(7).fill(0));
  const [cityPopulation, setCityPopulation] = useState<number>(0);
  const [pppExchangeRate, setPppExchangeRate] = useState<number>(1);
  const [cityProductPerCapita, setCityProductPerCapita] = useState<number | null>(null);
  const [standardizedValue, setStandardizedValue] = useState<number | null>(null);
  const [decision, setDecision] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

  const sectors = [
    'Agriculture and mining',
    'Manufacturing, utilities, construction',
    'Wholesale and retail trade, transport and communication',
    'Finance, insurance, real estate and business services',
    'Community, personal and other services',
    'Government',
    'Other',
  ];

  // Add getComment function for evaluation
  const getComment = (score: number) => {
    if (score >= 80) return "VERY SOLID";
    else if (score >= 70) return "SOLID";
    else if (score >= 60) return "MODERATELY SOLID";
    else if (score >= 50) return "MODERATELY WEAK";
    else if (score >= 40) return "WEAK";
    else return "VERY WEAK";
  };

  // Load saved inputs on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedNationalProduct = localStorage.getItem("nationalProduct");
      const savedNationalEmployment = localStorage.getItem("nationalEmployment");
      const savedCityEmployment = localStorage.getItem("cityEmployment");
      const savedCityPopulation = localStorage.getItem("cityPopulation");
      const savedPppExchangeRate = localStorage.getItem("pppExchangeRate");

      if (savedNationalProduct) setNationalProduct(JSON.parse(savedNationalProduct));
      if (savedNationalEmployment) setNationalEmployment(JSON.parse(savedNationalEmployment));
      if (savedCityEmployment) setCityEmployment(JSON.parse(savedCityEmployment));
      if (savedCityPopulation) setCityPopulation(parseFloat(savedCityPopulation));
      if (savedPppExchangeRate) setPppExchangeRate(parseFloat(savedPppExchangeRate));
    }
  }, []);

  const calculateAndSave = async () => {
    if (!isLoaded || !user) {
      toast.error("User not authenticated. Please log in.");
      return;
    }

    if (!city || !country) {
      toast.error("Please select a city from the cities page first.");
      return;
    }

    if (cityPopulation <= 0) {
      toast.error("City population must be greater than zero.");
      return;
    }
    let totalCityProduct = 0;
    for (let i = 0; i < sectors.length; i++) {
      if (nationalEmployment[i] <= 0) {
        toast.error(`National employment for sector "${sectors[i]}" must be greater than zero.`);
        return;
      }
      const employmentRatio = cityEmployment[i] / nationalEmployment[i];
      const citySectorProduct = nationalProduct[i] * employmentRatio;
      totalCityProduct += citySectorProduct;
    }
    const cityProductPerCapitaValue = (totalCityProduct / cityPopulation) * pppExchangeRate;
    setCityProductPerCapita(cityProductPerCapitaValue);

    // Standardization
    const min = 714.64;
    const max = 108818.96;
    const lnCityProduct = Math.log(cityProductPerCapitaValue);
    const lnMin = Math.log(min);
    const lnMax = Math.log(max);
    let standardizedValue = 0;
    if (lnCityProduct >= 11.60) {
      standardizedValue = 100;
    } else if (lnCityProduct > 6.57 && lnCityProduct < 11.60) {
      standardizedValue = ((lnCityProduct - lnMin) / (lnMax - lnMin)) * 100;
    } else if (lnCityProduct <= 6.57) {
      standardizedValue = 0;
    }
    setStandardizedValue(standardizedValue);

    // Evaluate the decision based on the standardized score
    const evaluationComment = getComment(standardizedValue);
    setDecision(evaluationComment);

    // Prepare data to send - now includes city and country
    const postData = {
      city,
      country,
      city_product_per_capita: cityProductPerCapitaValue,
      city_product_per_capita_comment: evaluationComment,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full bg-white shadow-2xl rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-green-600 p-6 text-white">
          <h2 className="text-3xl font-bold flex items-center">
            💰 City Product Per Capita
          </h2>
          <p className="mt-2 text-blue-100">Assess and save your city's product per capita data</p>
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
            <h2 className="text-2xl font-semibold mb-4">Input Data</h2>
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-300 p-2">Sector</th>
                  <th className="border border-gray-300 p-2">National Product</th>
                  <th className="border border-gray-300 p-2">National Employment</th>
                  <th className="border border-gray-300 p-2">City Employment</th>
                </tr>
              </thead>
              <tbody>
                {sectors.map((sector, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 p-2">{sector}</td>
                    <td className="border border-gray-300 p-2">
                      <input
                        type="number"
                        value={nationalProduct[index]}
                        onChange={(e) => {
                          const newNationalProduct = [...nationalProduct];
                          newNationalProduct[index] = parseFloat(e.target.value);
                          setNationalProduct(newNationalProduct);
                          if (typeof window !== "undefined") {
                            localStorage.setItem("nationalProduct", JSON.stringify(newNationalProduct));
                          }
                        }}
                        className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <input
                        type="number"
                        value={nationalEmployment[index]}
                        onChange={(e) => {
                          const newNationalEmployment = [...nationalEmployment];
                          newNationalEmployment[index] = parseFloat(e.target.value);
                          setNationalEmployment(newNationalEmployment);
                          if (typeof window !== "undefined") {
                            localStorage.setItem("nationalEmployment", JSON.stringify(newNationalEmployment));
                          }
                        }}
                        className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <input
                        type="number"
                        value={cityEmployment[index]}
                        onChange={(e) => {
                          const newCityEmployment = [...cityEmployment];
                          newCityEmployment[index] = parseFloat(e.target.value);
                          setCityEmployment(newCityEmployment);
                          if (typeof window !== "undefined") {
                            localStorage.setItem("cityEmployment", JSON.stringify(newCityEmployment));
                          }
                        }}
                        className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mb-6">
            <label className="block mb-3 font-semibold text-gray-700 flex items-center">
              👥 City Population:
            </label>
            <input
              type="number"
              value={cityPopulation}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                setCityPopulation(value);
                if (typeof window !== "undefined") {
                  localStorage.setItem("cityPopulation", value.toString());
                }
              }}
              className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div className="mb-6">
            <label className="block mb-3 font-semibold text-gray-700 flex items-center">
              💱 PPP Exchange Rate:
            </label>
            <input
              type="number"
              value={pppExchangeRate}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                setPppExchangeRate(value);
                if (typeof window !== "undefined") {
                  localStorage.setItem("pppExchangeRate", value.toString());
                }
              }}
              className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
          
          <button
            onClick={calculateAndSave}
            disabled={isSubmitting || !city || !country}
            className={`w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-green-600 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center:justify-center`}
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
          
          {decision && (
            <div className="mt-8 p-6 bg-gray-50 rounded-lg border">
              <div className={`p-4 text-center font-bold text-white rounded-lg transition ${
                decision === "VERY SOLID"
                  ? "bg-gradient-to-r from-green-400 to-green-600"
                  : decision === "SOLID"
                  ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                  : "bg-gradient-to-r from-red-400 to-red-600"
              }`}>
                {decision}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CityProductPerCapitaPage;